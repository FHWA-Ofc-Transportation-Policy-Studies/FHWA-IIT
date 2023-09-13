
# The root directory must be set.  Everything is relative (below) this path.

# TODO ideally root would be in a separate config file so that the code doesn't need to be modified

# Thors's environment
# root = r"C:\Users\thor.dodson\AppData\Local\anaconda3\envs\python_ECAT\Scripts\VOLPE_Review"

# Volpe's environment
root = r"D:\projects\FHWA_ECAT\repo\model"

# --------------------------------------------------------------------------------------------------
# IMPORTS
# --------------------------------------------------------------------------------------------------

from pyproj import CRS
import numpy as np
import utm
import math
import warnings
import geopy.distance
import os
import gc
from math import log10
import pandas
from time import time

# note the following environment variable address the following geopandas DeprecationWarning:
# Shapely 2.0 is # installed, but because PyGEOS is also installed, GeoPandas still uses PyGEOS
# by default.   However, starting with version 0.14, the default will switch to Shapely. To force to
# use Shapely # 2.0 now, you can either uninstall PyGEOS or set the environment variable USE_PYGEOS=0.
os.environ['USE_PYGEOS'] = '0'
import geopandas as gpd

# --------------------------------------------------------------------------------------------------
# DATA SETUP
# --------------------------------------------------------------------------------------------------

# this is set to 'ignore' due to a section with frequent pandas merging that draws a warning
warnings.filterwarnings('ignore')

root_input = os.path.join(root, "Input_Data")
root_acs = os.path.join(root_input, "ACS_2019")
root_road = os.path.join(root_input, "state_shp_2016_simplified")

root_output = os.path.join(root, "Output_Data")

root_cost = os.path.join(root_output, "state_shp_air_cost")

if not os.path.exists(root_cost):
    os.mkdir(root_cost)

# Read inputs for housing_value, county_names, and concentration_gradient ###
files = os.listdir(root_acs)

house_value = pandas.read_csv(os.path.join(root_input, "State_median_housing_values.csv"))
county_names = pandas.read_csv(os.path.join(root_input, "FIPS_names.csv"))

county_names['county_FIPS'] = county_names.apply(lambda row: str(row['county_FIPS']), axis=1)

county_names['county_FIPS'] = county_names.apply(lambda row: '0'+row['county_FIPS']
                                                 if len(row['county_FIPS']) < 5
                                                 else row['county_FIPS'], axis=1)

concentration_gradient = pandas.read_csv(os.path.join(root_input, "concentrations_ex.csv"))

# Only use some of the concentration distances to save calculation time
# these were chosen based on the rate of change in concentration
dist = [25, 50, 75, 100, 150, 200, 300]
concentration_gradient = concentration_gradient[concentration_gradient['Distance'].isin(dist)]
concentration_gradient = concentration_gradient.reset_index()

# For each distance the population density has to account for the width
dist_width_adj = {25: 1/12.192}
for i in range(1, len(concentration_gradient)):
    dist_width_adj[concentration_gradient['Distance'][i]] = 1/12.192 * \
        (concentration_gradient['Distance'][i]-concentration_gradient['Distance'][i-1])/25


STATES_DATA = pandas.read_csv(os.path.join(root_input, "States_Data.txt"), header=None, dtype=str).values.tolist()

# Make an ACS key so easier to refer to
# TODO what is the purpose of the last two keys as they are not valid acs keys
# TODO this does't seem to be a full list and is used in some places and not others

ACS = {
    'white': 'B02001e2',
    'black': 'B02001e3',
    'native': 'B02001e4',
    'asian': 'B02001e5',
    'pacific': 'B02001e6',
    'other': 'B02001e7',
    'poverty': 'B17021e2',
    'nonwhite': 'nonwhite',
    'nonpoverty': 'nonpoverty'}

demos = list(ACS.keys())

# COBRA Health Impact Parameters


def pool(beta, std):
    return (sum(beta/std) / sum(1/std))


cols = ['Beta', 'Std']
# health incidence response parameters obtained from COBRA user manual
# fixed pooling method used for categories with multiple estimates
# https://www.epa.gov/system/files/documents/2021-11/cobra-user-manual-nov-2021_4.1_0.pdf

# mortality
mort_data = pandas.DataFrame([[.005827, .000963], [.013103, .003347]], columns=cols)
mort = pool(mort_data['Beta'], mort_data['Std'])

# infant mortality
imort = .003922

# non fatal heart attack
nfha_data = pandas.DataFrame([[.024121, .009285], [.00481, .001992], [.00198, .002241],
                             [.0053, .002213], [.00225, .000592]], columns=cols)

nfha = pool(nfha_data['Beta'], nfha_data['Std'])

# hospital admission, all respiratory
haar_data = pandas.DataFrame([[.00207, .00045], [.0007, .00096], [.002, .00434],
                             [.00332, .00104], [.0022, .00073]], columns=cols)

haar = pool(haar_data['Beta'], haar_data['Std'])

# hospital admission, cardiovascular (except heart attacks)
hac_data = pandas.DataFrame([[.00189, .00028], [.00071, .00013], [.00068, .00021],
                            [.0008, .00011], [.0014, .00034]], columns=cols)

hac = pool(hac_data['Beta'], hac_data['Std'])

# emergency room visits, asthma
erva_data = pandas.DataFrame([[.0056, .0021], [.0029, .0027], [.0039, .0028]], columns=cols)
erva = pool(erva_data['Beta'], erva_data['Std'])

# minor restricted activity days
mrad = .00741

# acute bronchitis
ab = .027212

# work loss days
wld = .0046

# lower respiratory symptoms
lrs = .019012

# upper respiratory symptoms
urs = .0036

# asthma exacerbation
ae_data = pandas.DataFrame([[.000985, .000747], [.002565, .001335],
                           [.001942, .000803], [.01222, .013849]], columns=cols)

ae = pool(ae_data['Beta'], ae_data['Std'])

categories = ['mort', 'nfha', 'haar', 'hac', 'erva', 'mrad', 'ab', 'wld', 'lrs', 'urs', 'ae']

ages = ['0-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75-84', '85+']


# Create dictionary for health impacts of air pollutant exposure
# health dictionary will contain
# impact: the % change in incidence rate per PM2.5 concentration increase (unit is ug/m^3)
# baseline: the yearly incidence rate per 100 people    [*note require divide by 100 when applied to population]
# value: $ value per incidence
# dmg per road segment distance will be calculated by:
# concentration * population affected *
#    impact * baseline *  value
health = {}

for age in ages:
    health['mort'+age] = {}
    health['mort'+age]['impact'] = mort

    health['nfha'+age] = {}
    health['nfha'+age]['impact'] = nfha

    health['haar'+age] = {}
    health['haar'+age]['impact'] = haar

    health['hac'+age] = {}
    health['hac'+age]['impact'] = hac

    health['erva'+age] = {}
    health['erva'+age]['impact'] = erva

    health['mrad'+age] = {}
    health['mrad'+age]['impact'] = mrad
    health['mrad'+age]['baseline'] = 7.8*100
    health['mrad'+age]['value'] = 77

    health['ab'+age] = {}
    health['ab'+age]['impact'] = ab
    health['ab'+age]['baseline'] = 4.3
    health['ab'+age]['value'] = 550

    health['wld'+age] = {}
    health['wld'+age]['impact'] = wld
    health['wld'+age]['baseline'] = 217.2
    health['wld'+age]['value'] = 178

    health['lrs'+age] = {}
    health['lrs'+age]['impact'] = lrs
    health['lrs'+age]['baseline'] = 43.8
    health['lrs'+age]['value'] = 24

    health['urs'+age] = {}
    health['urs'+age]['impact'] = urs
    health['urs'+age]['baseline'] = 12479
    health['urs'+age]['value'] = 38

    health['ae'+age] = {}
    health['ae'+age]['impact'] = ae
    health['ae'+age]['baseline'] = 24.46+13.51+27.74
    health['ae'+age]['value'] = 65


health['mort'+ages[0]]['baseline'] = .593/18+.019*17/18
health['mort'+ages[1]]['baseline'] = .078
health['mort'+ages[2]]['baseline'] = .106
health['mort'+ages[3]]['baseline'] = .172
health['mort'+ages[4]]['baseline'] = .405
health['mort'+ages[5]]['baseline'] = .861
health['mort'+ages[6]]['baseline'] = 1.796
health['mort'+ages[7]]['baseline'] = 4.628
health['mort'+ages[8]]['baseline'] = 13.58

health['nfha'+ages[0]]['baseline'] = 0
health['nfha'+ages[1]]['baseline'] = 0
health['nfha'+ages[2]]['baseline'] = .002
health['nfha'+ages[3]]['baseline'] = .010
health['nfha'+ages[4]]['baseline'] = .068
health['nfha'+ages[5]]['baseline'] = .202
health['nfha'+ages[6]]['baseline'] = .380
health['nfha'+ages[7]]['baseline'] = .575
health['nfha'+ages[8]]['baseline'] = .921

health['haar'+ages[0]]['baseline'] = 2.387*2/18+.363*16/18 + .217*2/18+.147*16/18 + .226*2/18+.151*16/18
health['haar'+ages[1]]['baseline'] = .166 + .036 + .041
health['haar'+ages[2]]['baseline'] = .212 + .048 + .056
health['haar'+ages[3]]['baseline'] = (.212+.340)/2 + (.048+.076)/2 + (.056+.105)/2
health['haar'+ages[4]]['baseline'] = .340 + .076 + .105
health['haar'+ages[5]]['baseline'] = .737 + .123 + .281
health['haar'+ages[6]]['baseline'] = 1.297 + .136 + .496
health['haar'+ages[7]]['baseline'] = 2.292 + .157 + .837
health['haar'+ages[8]]['baseline'] = 4.151 + .218 + 1.276

health['hac'+ages[0]]['baseline'] = .044*2/18 + .017*16/18
health['hac'+ages[1]]['baseline'] = .061
health['hac'+ages[2]]['baseline'] = .138
health['hac'+ages[3]]['baseline'] = (.138+.377)/2
health['hac'+ages[4]]['baseline'] = .377
health['hac'+ages[5]]['baseline'] = .914
health['hac'+ages[6]]['baseline'] = 1.747
health['hac'+ages[7]]['baseline'] = 3.131
health['hac'+ages[8]]['baseline'] = 5.886

health['erva'+ages[0]]['baseline'] = .959
health['erva'+ages[1]]['baseline'] = .601
health['erva'+ages[2]]['baseline'] = .556
health['erva'+ages[3]]['baseline'] = .538
health['erva'+ages[4]]['baseline'] = .552
health['erva'+ages[5]]['baseline'] = .408
health['erva'+ages[6]]['baseline'] = .331
health['erva'+ages[7]]['baseline'] = .368
health['erva'+ages[8]]['baseline'] = .350

health['wld'+ages[0]]['baseline'] = 0

for age in ages:
    health['mort'+age]['value'] = 9480981
    health['haar'+age]['value'] = (37316+17582+23200)/3
    health['hac' + age]['value'] = (47480+44524)/2
    health['erva'+age]['value'] = (547+457)/2

health['nfha'+ages[0]]['value'] = (39174+192048)/2
health['nfha'+ages[1]]['value'] = (39174+192048)/2
health['nfha'+ages[2]]['value'] = (52999+205873)/2
health['nfha'+ages[3]]['value'] = (52999+205873)/2
health['nfha'+ages[4]]['value'] = (59550+212424)/2
health['nfha'+ages[5]]['value'] = (156951+309825)/2
health['nfha'+ages[6]]['value'] = (39174+192048)/2
health['nfha'+ages[7]]['value'] = (39174+192048)/2
health['nfha'+ages[8]]['value'] = (39174+192048)/2


# Make emissions dictionary
# the rates are generated by MOVES
# these specific rates were stored in the ECAT excel tool
emissions = {}
emissions['passenger'] = {'restricted': {25: .004672,
                                         30: .005328,
                                         35: .006827,
                                         40: .00801,
                                         45: .008716,
                                         50: .00867,
                                         55: .007949,
                                         60: .00749,
                                         65: .007298,
                                         70: .007321,
                                         75: .007901},
                          'unrestricted': {25: .005789,
                                           30: .005346,
                                           35: .005183,
                                           40: .005085,
                                           45: .005009,
                                           50: .004945,
                                           55: .004881,
                                           60: .004828,
                                           65: .004912,
                                           70: .005311,
                                           75: .006259}}

emissions['single'] = {'restricted': {25: .316352,
                                      30: .292323,
                                      35: .250339,
                                      40: .233778,
                                      45: .220615,
                                      50: .203989,
                                      55: .187132,
                                      60: .172165,
                                      65: .164759,
                                      70: .158621,
                                      75: .154977},
                       'unrestricted': {25: .310797,
                                        30: .285404,
                                        35: .238913,
                                        40: .219432,
                                        45: .204202,
                                        50: .186974,
                                        55: .170558,
                                        60: .156706,
                                        65: .150904,
                                        70: .146095,
                                        75: .143557}}

emissions['combination'] = {'restricted': {25: .453907,
                                           30: .426852,
                                           35: .340413,
                                           40: .318589,
                                           45: .301362,
                                           50: .270297,
                                           55: .234949,
                                           60: .21634,
                                           65: .219503,
                                           70: .221207,
                                           75: .228796},
                            'unrestricted': {25: .462724,
                                             30: .433437,
                                             35: .337631,
                                             40: .310214,
                                             45: .28889,
                                             50: .253356,
                                             55: .214161,
                                             60: .194444,
                                             65: .198891,
                                             70: .202703,
                                             75: .212083}}

# --------------------------------------------------------------------------------------------------
# FUNCTIONS
# --------------------------------------------------------------------------------------------------

def write_shapefile(geodataframe, output_dir, output_name):

    out_shp_file = os.path.join(output_dir, output_name)

    print(out_shp_file)

    # ignore warnings only for the shapefile write because it always complains a lot about
    # truncating field names at 10 characters
    warnings.filterwarnings('ignore')
    geodataframe.to_file(out_shp_file)
    warnings.resetwarnings()

# --------------------------------------------------------------------------------------------------

def div(x):
    """
    aggregation function for pandas groupby
    div is used to divide the noise damage cost between multiple CBG intersecting a roadway
    """
    return (sum(x)/len(x))

# --------------------------------------------------------------------------------------------------

def gath(x):
    """
    aggregation function for pandas groupby
    gath is used to store all of the CBG that intersect a roadway for when aggregating results to a higher regional level
    """
    return [i for i in set(x)]

# --------------------------------------------------------------------------------------------------

def adj_speed(speed):

    """
    Match the speeds in HPMS to the closets speeds in the emissions dictionary
    """
    speeds = list(emissions['passenger']['restricted'].keys())
    if speed in speeds:
        return speed
    else:
        dif = [abs(i-speed) for i in speeds]
        return speeds[dif.index(min(dif))]

# --------------------------------------------------------------------------------------------------

def est_population(road, x, age_shp):

    """
    Estimate the population of each age group in a 1000ft buffer near the road
    It is for the entire HPMS dataset at once to reduce calculation time from the buffer generation
    """

    global c

    # Intersect road_x_buffer with ACS data
    # count area_proportionate total population
    # count area_proportionate populations for each age group
    # return populations for each age group as a dictionary

    dist = str(int(x/.3048))  # x is passed in meters, name converted to ft
    road_bufferX = gpd.GeoDataFrame(road.buffer(x, cap_style=2))
    road_bufferX = road_bufferX.rename(columns={0: 'geometry'})
    road_bufferX['id'] = road['id']
    road_bufferX = road_bufferX.set_geometry('geometry')

    c_ = gpd.overlay(road_bufferX, age_shp, how='intersection')
    c_['area'] = c_['geometry'].area  # area is in sq_m
    # 'area' is the area of the CBG intersecting the road buffer
    # 'Area' is the area of the CBG
    # Estimates the population for each age group based on the proportionate area  (assumes uniform pop.density throughout CBG)
    # Age groupings in ACS are not even, so must manually match to the COBRA health impact age groups
    c_[ages[0]] = c_['area']/c_['Area']*(c_['B01001e3']+c_['B01001e4']+c_['B01001e5'] +
                                         c_['B01001e6']+c_['B01001e27']+c_['B01001e28']+c_['B01001e29']+c_['B01001e30'])

    c_[ages[1]] = c_['area']/c_['Area']*(c_['B01001e7']+c_['B01001e8']+c_['B01001e9'] +
                                         c_['B01001e10']+c_['B01001e31']+c_['B01001e32']+c_['B01001e33']+c_['B01001e34'])

    c_[ages[2]] = c_['area']/c_['Area']*(c_['B01001e11']+c_['B01001e12']+c_['B01001e35']+c_['B01001e36'])

    c_[ages[3]] = c_['area']/c_['Area']*(c_['B01001e13']+c_['B01001e14']+c_['B01001e37']+c_['B01001e38'])

    c_[ages[4]] = c_['area']/c_['Area']*(c_['B01001e15']+c_['B01001e16']+c_['B01001e39']+c_['B01001e40'])

    c_[ages[5]] = c_['area']/c_['Area']*(c_['B01001e17']+c_['B01001e18'] +
                                         c_['B01001e19']+c_['B01001e41']+c_['B01001e42']+c_['B01001e43'])

    c_[ages[6]] = c_['area']/c_['Area']*(c_['B01001e20']+c_['B01001e21'] +
                                         c_['B01001e22']+c_['B01001e44']+c_['B01001e45']+c_['B01001e46'])

    c_[ages[7]] = c_['area']/c_['Area']*(c_['B01001e23']+c_['B01001e24']+c_['B01001e47']+c_['B01001e48'])

    c_[ages[8]] = c_['area']/c_['Area']*(c_['B01001e25']+c_['B01001e49'])

    # c_ has more observations than road as some road segments intersect multiple census block groups
    # so groupby 'Route_ID' summing populations, then merge with road by 'id'
    agg = {}
    for i in range(9):
        agg[ages[i]] = 'sum'

    # c = c_.groupby(c_['id']).aggregate({('age'+dist):'sum',('rb'+dist+'_area_m'):'first'})#,('ratio'+dist):'first'})
    c = c_.groupby(c_['id']).aggregate(agg)  # ,('ratio'+dist):'first'})

    # convert the 9 population fields into a dictionary  (this simplifies the function calls later)
    c['population'] = c.apply(lambda row: {ages[0]: row[ages[0]], ages[1]: row[ages[1]], ages[2]: row[ages[2]],
                                           ages[3]: row[ages[3]], ages[4]: row[ages[4]], ages[5]: row[ages[5]],
                                           ages[6]: row[ages[6]], ages[7]: row[ages[7]], ages[8]: row[ages[8]]}, axis=1)
    c = c[['population']]

    # merge with road so that road only gets the population dictionary
    road = pandas.merge(road, c, how='left', on=['id'])

    return (road)

# --------------------------------------------------------------------------------------------------

def calc_emissions(AADT_PASSENGER, AADT_SINGL, AADT_COMBI, speed, length, width, restricted):

    """
    Calculate emissions for road segment
    based on traffic counts, speed, road length and width
    TODO clear up comments on next two lines
    g/mile • miles_road • AADT • day/sec • 1/area_road  =  g/(s-m2)
    sum_vehtype(g/mile•AADT) * (miles_road•day/sec•1/area_road)
    """

    road_size_adjustment = length/1609.34/86400/(length*width)
    emissions_passenger = AADT_PASSENGER*emissions['passenger'][restricted][speed]
    emissions_single = AADT_SINGL*emissions['single'][restricted][speed]
    emissions_combination = AADT_COMBI*emissions['combination'][restricted][speed]

    emis = road_size_adjustment*(emissions_passenger+emissions_single+emissions_combination)

    return emis

# --------------------------------------------------------------------------------------------------

def calc_concentrations(emis):

    """
    Set of gradient curves stored in a dictionary
    Multiply appropriate gradient curve (based on previously assigned index) by road emissions
    return emission concentration at distances as a dictionary
    original concentration curve emission: 0.000001
    scaling factor: emis/.000001
    """

    concentration_adj = concentration_gradient['Concentration'] * emis/.000001
    concentration = {}
    for i in range(len(concentration_gradient)):
        concentration[concentration_gradient['Distance'][i]] = concentration_adj[i]

    return concentration

# --------------------------------------------------------------------------------------------------

def health_dmg(concentration, population):

    """
    Calculate health incidence based on concentration at distance
    Multiply by monetization factor
    return health dmg at distance
    """

    dmg = 0

    for d in dist:
        for category in categories:
            for age in ages:
                dmg += concentration[d]*population[age]*dist_width_adj[d]*health[category +
                                                                                 age]['impact']*health[category+age]['baseline']/100*health[category+age]['value']

    # concentration * population affected *
    #    % incidence rate increase * incidence rate per population *  monetization
    return dmg

# --------------------------------------------------------------------------------------------------

def equity(c):

    """
    Main Functionapplied to each state
    c is an index for the State number in an alphabetical list
    """

    global inte, inte_road, county, census, inte_census, inte_county, race_shp, road, road_write  # global for testing purposes
    global acs, c_shp  # these are global because est_houses uses them, could pass them to the function instead
    gc.collect()  # resolves memory issue, failure to overwrite road file for each State
    t0 = time()

    # the ACS State nomenclature (space, no space, or _) is different than HPMS, so this method requires folders for all states be in ACS
    acs = files[c]
    state = house_value['State'][c]  # get the state name as it is refered to in various places
    state_utm_zone = STATES_DATA[c][3]
    # to facilitate more accurate distances each State's coordinates are converted to a utm zone
    crs_utm = CRS.from_string('epsg:326' + state_utm_zone)

    ################################
    # 1. Preparing ACS and HPMS Data

    print(state, "\nreading ACS files", end=', ')
    # read in polygons of census block groups (cbg)
    gdb = os.path.join(root_acs, acs)
    c_shp = gpd.read_file(gdb, layer=acs[:-4])
    c_shp = c_shp.to_crs(crs_utm)

    # race and poverty demographics of cbg
    # load and merge with geometry in c_shp
    race = gpd.read_file(gdb, layer="X02_Race")
    race = race.drop('geometry', axis=1)
    poverty = gpd.read_file(gdb, layer="X17_Poverty")
    poverty = poverty.drop('geometry', axis=1)
    race = pandas.merge(race, poverty, how='inner', on='GEOID')
    hispanic = gpd.read_file(gdb, layer="X03_Hispanic_or_Latino_Origin")
    hispanic = hispanic.drop('geometry', axis=1)
    race = pandas.merge(race, hispanic, how='inner', on='GEOID')

    race[ACS['white']] = race[ACS['white']] - race['B03002e13']  # subtract hispanic/latino white from white alone
    race['nonwhite'] = race['B02001e1'] - race[ACS['white']]  # total population minus white alone
    race['nonpoverty'] = race['B02001e1'] - race[ACS['poverty']]  # could automate these non_steps depending on how many
    race = race.rename(columns={"GEOID": "GEOID_Data"})
    race_shp = pandas.merge(race, c_shp, how='inner', on=['GEOID_Data'])
    race_shp['county_FIPS'] = race_shp.apply(lambda row: row['GEOID'][0:5], axis=1)
    race_shp['tract_FIPS'] = race_shp.apply(lambda row: row['GEOID'][2:-1], axis=1)
    race_shp = gpd.GeoDataFrame(race_shp)

    age = gpd.read_file(gdb, layer="X01_Age_and_Sex")
    age = age.drop('geometry', axis=1)
    age = age.rename(columns={"GEOID": "GEOID_Data"})

    age_shp = pandas.merge(age, c_shp, how='inner', on=['GEOID_Data'])
    age_shp = gpd.GeoDataFrame(age_shp)
    age_shp['Area'] = age_shp['geometry'].area
    # age_shp = age_shp.set_geometry('geometry')

    print(round((time()-t0)/60, 1), "min", end=" | ")
    ta = time()

    print("reading HPMS file", end=", ")
    # road file for the state
    gdb = os.path.join(root_road, state+".shp")
    road = gpd.read_file(gdb)
    road = road[road['geometry'] != None]
    road['id'] = road.index
    renames = {i: i.upper() for i in road.columns}  # HPMS 2016 and 2017 use different naming conventions
    renames['geometry'] = 'geometry'

    # some cleanup on column types
    road['ROUTE_ID'] = road.apply(lambda row: str(row['ROUTE_ID']), axis=1)
    change = ['F_SYSTEM', 'AADT', 'AADT_SINGL', 'AADT_COMBI', 'SPEED_LIMI']

    for i in change:
        road[i] = road[i].apply(int)

    road['AADT_PASSENGER'] = road['AADT'] - road['AADT_COMBI'] - road['AADT_SINGL']

    # sets speed limit for roads without entry. based on avg speed for these road types (calculated elsewhere)
    typ_sp = {0: 45, 1: 65, 2: 55, 3: 45, 4: 45, 5: 35, 6: 30, 7: 25}
    typ = list(set(road['F_SYSTEM']))
    typ.sort()
    road['SPEED_LIMI'] = road['SPEED_LIMI'].fillna(0)

    for i in typ:
        road['SPEED_LIMI'][(road['F_SYSTEM'] == i) &
                           ((road['SPEED_LIMI'] == 0) | (road['SPEED_LIMI'] > 90))] = typ_sp[i]

    # emission rates are only estimated for certain speeds, replace speed with closest match
    road['SPEED_LIMI'] = road.apply(lambda row: adj_speed(row['SPEED_LIMI']), axis=1)

    # Estimate width based on through lanes
    # if no data then assume 2
    # assuming 12 foot lanes (10-12) and converting to meters
    road['THROUGH_LA'] = road['THROUGH_LA'].fillna(0)
    road['THROUGH_LA'][road['THROUGH_LA'] == 0] = 2
    road['width'] = road['THROUGH_LA']*12*.3048

    road['restricted'] = road.apply(lambda row: 'restricted' if row['ACCESS_CON'] == 1 else 'unrestricted', axis=1)

    road = road.to_crs(crs_utm)  # crs is in meters
    road['length'] = road.length  # /1609.34  #length is in miles and crs is in meters

    print(round((time()-ta)/60, 1), "min", end=" | ")
    ta = time()

    #########################
    # 2. Estimate Population

    print("estimating population", end=', ')

    # Count the number of houses in each buffer strip from the road
    dist = [i*5 for i in range(1, 62)]  # in m, UTM is in m

    ## UPDATE ##
    # 1. estimate number of houses once for 1000ft buffer
    # 2. split houses into dist_buffer strips evenly proportional to width
    # The method used below to replace NaN due to non-intersections is clunky, but several other methods were causing errors, not sure why
    # unfortunately numpy does not allow replacing with a dictionary
    # this brute force method insured the values were set to zero and didn't cause an error
    road = est_population(road, 1000*.3048, age_shp)
    road['population'] = road['population'].replace(np.nan, 0)
    indexes_replace = road[road['population'] == 0].index
    print("\n", indexes_replace)

    for i in indexes_replace:
        road['population'][i] = {'0-17': 0, '18-24': 0, '25-34': 0, '35-44': 0,
                                 '45-54': 0, '55-64': 0, '65-74': 0, '75-84': 0, '85+': 0}
    ta = time()

    #########################################
    # 3. Estimate Air Pollutant Concentration

    print("estimating air pollution", end=', ')

    # iterates over noise levels and calculates the max distance those levels affect given the traffic and speed
    # iterates over distances and calculates the average noise level at each distance
    road['emissions'] = road.apply(lambda row: calc_emissions(row['AADT_PASSENGER'], row['AADT_SINGL'], row['AADT_COMBI'],
                                                              row['SPEED_LIMI'], row['length'], row['width'], row['restricted']), axis=1)

    road['concentration'] = road.apply(lambda row: calc_concentrations(row['emissions']), axis=1)

    print(round((time()-ta)/60, 1), "min", end=" | ")
    ta = time()

    #########################
    # 4. Estimate Health Costs

    print("estimating health costs", end=', ')

    # for i in range(len(road)):
    # print(i, road['concentration'][i],road['population'][i])
    # health_dmg(road['concentration'][i],road['population'][i])
    # if i==8655:
    # input("Press Enter")
    road['dmg'] = road.apply(lambda row: health_dmg(row['concentration'], row['population']), axis=1)

    print(round((time()-ta)/60, 1), "min", end=" | ")
    ta = time()

    ##############################
    # 5. Attribute to Demographics

    print("attribute to demos", end=", ")
    # attribute dmg to each demographic for intersecting census block groups
    # keep track of sum of dmg to each demographic
    # at end compare % of dmg received to population share

    road = gpd.GeoDataFrame(road)

    # This method of intersection doesn't account for census block group intersecting the buffer but not the road
    inte = gpd.sjoin(race_shp, road, op='intersects')

    agg_functions = {'B02001e1': 'sum', 'dmg': 'first', 'county_FIPS': gath, 'tract_FIPS': gath, 'GEOID': gath,
                     'URBAN_CODE': 'first'}
    for i in demos:
        agg_functions[ACS[i]] = 'sum'

    inte_road = inte.groupby(inte['index_right']).aggregate(agg_functions)
    # this method ensures each road is counted once, while summing up the populations of the intersecting CBGs
    # essentially forming 'super CBGs' of all the CBGs intersecting a road in order the calculate the share of each demographic population
    # later, when aggregating over larger areas the dmg for each road segment is divided by the number of intersecting CBGs to ensure all dmg is only counted once

    inte_road = inte_road.fillna(0)

    # split the noise dmg for each road segment into demographics based on share of population
    for i in demos:
        inte_road[i+'_dmg'] = inte_road[ACS[i]] / inte_road['B02001e1'] * inte_road['dmg']

    inte_road = inte_road.fillna(0)

    print(round((time()-ta)/60, 1), "min", end=" | ")
    ta = time()

    ################### For writing road.shp with noise dmg estimates ###################

    print("writing shp file", end=", ")

    keep = ['STATE_CODE', 'ROUTE_ID', 'ROUTE_NUMB', 'F_SYSTEM', 'FACILITY_T', 'URBAN_CODE',
            'SPEED_LIMI', 'AADT_PASSENGER', 'AADT_SINGL', 'AADT_COMBI',
            'length', 'geometry']

    road_write = road[keep]
    road_write['index_right'] = road_write.index
    road_write = pandas.merge(inte_road, road_write, how='inner', on=['index_right'])
    road_write = gpd.GeoDataFrame(road_write)
    road_write['length'] = road_write['length']/1609.34  # convert from meters to miles
    road_write['county_FIPS'] = road_write.apply(lambda row: str(row['county_FIPS']), axis=1)
    road_write['tract_FIPS'] = road_write.apply(lambda row: str(row['tract_FIPS']), axis=1)
    road_write['GEOID'] = road_write.apply(lambda row: str(row['GEOID']), axis=1)
    rname = {'B02001e1': 'total_pop', 'URBAN_CODE_y': 'URBAN_CODE'}

    for i in demos:
        rname[ACS[i]] = i+'_pop'

    road_write = road_write.rename(columns=rname)

    road_write['dmg_length'] = road_write['dmg']/road_write['length']/10  # dmg per 1/10 mile
    road_write['dmg_length'] = road_write.apply(lambda row: int(row['dmg_length']), axis=1)

    keep = ['STATE_CODE', 'county_FIPS', 'tract_FIPS', 'GEOID', 'URBAN_CODE',
            'ROUTE_NUMB', 'F_SYSTEM', 'FACILITY_T',
            'AADT_PASSENGER', 'AADT_SINGL', 'AADT_COMBI', 'SPEED_LIMI',
            'dmg', 'dmg_length', 'length', 'total_pop', 'geometry']

    for i in demos:
        keep.append(i+"_pop")
        keep.append(i+"_dmg")

    road_write = road_write[keep]
    road_write = road_write.to_crs("epsg:4326")

    # TODO will this overwrite if it already exists?
    road_write.to_file(os.path.join(root_cost, state+"_air_dmg.shp"))

    print(round((time()-ta)/60, 1), "min", end=" | ")
    ta = time()

    ###################                                               ###################

    result['state'].append(state)
    result['state_pop'].append(sum(race_shp['B02001e1']))
    result['state_dmg'].append(sum(inte_road['dmg']))

    for i in demos:
        result[i+"_pop"].append(sum(race_shp[ACS[i]]))
        result[i+'_dmg'].append(sum(inte_road[i+'_dmg']))

    result['rural_dmg'].append(sum(inte_road[inte_road['URBAN_CODE'] == 99999]['dmg']))
    result['urban_dmg'].append(sum(inte_road[inte_road['URBAN_CODE'] != 99999]['dmg']))

    # This section prints out the noise-equity ratios for the state
    print("\nState: ", state, " Time: ", round(time() - t0, 2), sep='')
    print("-------------------")
    print("White")
    print(round(sum(inte_road['white_dmg']) / sum(inte_road['dmg']), 4), 'dmg')
    print(round(sum(race_shp['B02001e2']) / sum(race_shp['B02001e1']), 4), 'pop')

    print("Black")
    print(round(sum(inte_road['black_dmg']) / sum(inte_road['dmg']), 4))
    print(round(sum(race_shp['B02001e3']) / sum(race_shp['B02001e1']), 4))

    print("Native")
    print(round(sum(inte_road['native_dmg']) / sum(inte_road['dmg']), 4))
    print(round(sum(race_shp['B02001e4']) / sum(race_shp['B02001e1']), 4))

    print("Asian")
    print(round(sum(inte_road['asian_dmg']) / sum(inte_road['dmg']), 4))
    print(round(sum(race_shp['B02001e5']) / sum(race_shp['B02001e1']), 4))

    print("Pacific")
    print(round(sum(inte_road['pacific_dmg']) / sum(inte_road['dmg']), 4))
    print(round(sum(race_shp['B02001e6']) / sum(race_shp['B02001e1']), 4))

    print("Other")
    print(round(sum(inte_road['other_dmg']) / sum(inte_road['dmg']), 4))
    print(round(sum(race_shp['B02001e7']) / sum(race_shp['B02001e1']), 4))

    #############################
    # 5. Attribute to Demographics
    #    County and Census Tract

    print("aggregating to county", end=", ")

    # below avoids multi-counting for roads that intersect multiple counties/census tracts,
    # dmg needs to be divided since the summation is across counties/census tracts when reaggregated
    # assumes dmg is split between intersecting counties/census tracts [in revision will split based on proportion of road intersecting]
    inte_road['dmg'] = inte_road['dmg'] / inte_road.apply(lambda row: len(row['GEOID']), axis=1)

    for i in demos:
        inte_road[i+'_dmg'] = inte_road[i+'_dmg'] / inte_road.apply(lambda row: len(row['GEOID']), axis=1)

    inte_road['index_right'] = inte_road.index
    inte_road.index.name = 'id'
    inte_road = inte_road.rename(columns={'dmg': 'total_dmg'})  # to distinguish it for remerge
    keep = ['index_right', 'total_dmg']  # 'nonwhite_dmg'

    for i in demos:
        # don't need 'road_block' population counts, those were used only for proportion of dmg allocation
        keep.append(i+'_dmg')

    inte_road = inte_road[keep]

    ######  ** ##  # TODO  is this supposed to be a comment?
    keep_inte = ['county_FIPS', 'tract_FIPS', 'GEOID', 'index_right']
    inte = inte[keep_inte]  # to simplify dataframe for later steps
    inte_ = pandas.merge(inte, inte_road, how='inner', on=['index_right'])

    agg_functions = {'total_dmg': 'sum'}  # , 'nonwhite_dmg':'sum'} #just to count the damage groups

    for i in demos:
        agg_functions[i+'_dmg'] = 'sum'

    inte_county = inte_.groupby(inte_['county_FIPS']).aggregate(agg_functions)
    inte_county['county_FIPS'] = inte_county.index
    inte_county.index.names = ['id']

    agg_pop = {'B02001e1': 'sum'}  # just to count the population groups

    for i in demos:
        agg_pop[ACS[i]] = 'sum'

    county_shp = race_shp.groupby(race_shp['county_FIPS']).aggregate(agg_pop)

    # inte_county has the correct damage for each, county_shp has the correct population
    inte_county = pandas.merge(inte_county, county_shp, how='inner', on=['county_FIPS'])

    rname = {'B02001e1': 'total_pop'}

    for i in demos:
        rname[ACS[i]] = i+'_pop'

    inte_county = inte_county.rename(columns=rname)
    inte_county = inte_county.fillna(0)

    # calculate the noise-equity ratios (called ndp here for noise% divided by population%)
    for i in demos:
        inte_county[i+'_ndp'] = inte_county[i+'_dmg']/inte_county['total_dmg'] / \
            (inte_county[i+'_pop']/inte_county['total_pop'])

    inte_county = inte_county.fillna(0)

    keep = ['county_FIPS', 'name']  # ,'white_ndp','black_ndp','native_ndp','asian_ndp','pacific_ndp','other_ndp']

    for i in demos:
        keep.append(i+'_ndp')
        keep.append(i+'_dmg')
        keep.append(i+'_pop')

    # keep.append('nonwhite_ndp')
    inte_county = pandas.merge(inte_county, county_names, how='inner', on='county_FIPS')

    inte_county_ = inte_county[keep]

    # add county names

    inte_county2 = pandas.melt(inte_county_, id_vars=['county_FIPS', 'name'], var_name='metrics', value_name='values')
    inte_county2["Demographic"] = inte_county2.apply(lambda row: row['metrics'][:-4], axis=1)
    inte_county2['metrics'] = inte_county2.apply(lambda row: row['metrics'][-3:], axis=1)

    if c == 0:
        county = pandas.DataFrame(columns=list(inte_county2.columns))

    county = pandas.concat([county, inte_county2])

    print(round((time()-ta)/60, 1), "min", end=" | ")
    ta = time()

    ###################
    ##### Census  #####

    print("aggregating to census tract", end=", ")
    inte_census = inte_road.groupby(inte_['tract_FIPS']).aggregate(agg_functions)
    inte_census['tract_FIPS'] = inte_census.index
    inte_census.index.names = ['id']

    census_shp = race_shp.groupby(race_shp['tract_FIPS']).aggregate(agg_pop)

    # inte_census has the correct damage for each, census_shp has the correct population
    inte_census = pandas.merge(inte_census, census_shp, how='inner', on=['tract_FIPS'])

    inte_census = inte_census.rename(columns=rname)
    inte_census = inte_census.fillna(0)

    for i in demos:
        inte_census[i+'_ndp'] = inte_census[i+'_dmg']/inte_census['total_dmg'] / \
            (inte_census[i+'_pop']/inte_census['total_pop'])

    inte_census = inte_census.fillna(0)

    keep = ['tract_FIPS']  # ,'white_ndp','black_ndp','native_ndp','asian_ndp','pacific_ndp','other_ndp']

    for i in demos:
        keep.append(i+'_ndp')
        keep.append(i+'_dmg')
        keep.append(i+'_pop')

    inte_census_ = inte_census[keep]

    inte_census2 = pandas.melt(inte_census_, id_vars=['tract_FIPS'], var_name='metrics', value_name='values')
    inte_census2["Demographic"] = inte_census2.apply(lambda row: row['metrics'][:-4], axis=1)
    inte_census2['metrics'] = inte_census2.apply(lambda row: row['metrics'][-3:], axis=1)

    if c == 0:
        census = pandas.DataFrame(columns=list(inte_census2.columns))

    census = pandas.concat([census, inte_census2])

    print(round((time()-ta)/60, 1), "min")
    ta = time()

    print("Total time:", round((time()-t0)/60, 1), "mins\n")

# --------------------------------------------------------------------------------------------------
# MAIN PROCESSING BLOCK
#---------------------------------------------------------------------------------------------------

if __name__ == "__main__":

    os.system('cls')

    # Set up storage of results
    # National/State results will be stored in result
    # County and Census Tract are stored separately
    result = {'state': [], 'state_pop': []}

    for i in demos:
        result[i+'_pop'] = []

    result['state_dmg'] = []

    for i in demos:
        result[i+'_dmg'] = []

    result['rural_dmg'] = []
    result['urban_dmg'] = []
    county = pandas.DataFrame()
    census = pandas.DataFrame()

    # TODO make more flexible, also this should ideally take the fips code for the state
    equity(29)  # this will run the program for New Hampshire

    # Writing of final results
    # note this is meant to be run after all states have been done

    results = pandas.DataFrame(result)

    ######## ***##################
    # add US row
    # first sum each column, store in list
    # add list as row to results
    ############### ***###########

    us = [i for i in results.loc[:, results.columns != 'state'].apply(lambda col: sum(col), axis=0)]
    us.insert(0, 'US')
    results.loc[len(results.index)] = us
    results['urban_pct'] = results['urban_dmg'] / (results['urban_dmg'] + results['rural_dmg'])
    results['rural_pct'] = results['rural_dmg'] / (results['urban_dmg'] + results['rural_dmg'])

    for i in demos:
        results[i+'_ndp'] = results[i+'_dmg']/results['state_dmg'] / (results[i+'_pop']/results['state_pop'])

    # 'white_ndp','black_ndp','native_ndp','asian_ndp','pacific_ndp','other_ndp']
    keep = ['state', 'urban_pct', 'rural_pct']

    for i in demos:
        keep.append(i+'_ndp')

    results_ = results[keep]
    results2 = pandas.melt(results_, id_vars=['state'], var_name='metrics', value_name='values')
    results2["Demographic"] = results2.apply(lambda row: row['metrics'][:-4], axis=1)
    results2['metrics'] = results2.apply(lambda row: row['metrics'][-3:], axis=1)

    # may want to include date in results name
    results2.to_csv(os.path.join(root_output, "Equity_long_air.csv"))
    county.to_csv(os.path.join(root_output, "Equity_county_air.csv"))
    census.to_csv(os.path.join(root_output, "Equity_census_air.csv"))

    print('Done')
    #input("Press enter when finished")

