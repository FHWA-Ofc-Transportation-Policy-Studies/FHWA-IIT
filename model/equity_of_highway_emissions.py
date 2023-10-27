
# TODO change change all occurence of DMG and DAMAGE to COST

# --------------------------------------------------------------------------------------------------
# CONFIG
# --------------------------------------------------------------------------------------------------

# The root directory must be set.  Everything is relative (below) this path.

# TODO (GMB) ideally root would be in a separate config file so that the code doesn't need to be modified

# Thors's environment
# ROOT = r"C:\Users\thor.dodson\AppData\Local\anaconda3\envs\python_ECAT\Scripts\VOLPE_Review"

# Volpe's environment
ROOT = r"D:\projects\FHWA_ECAT\repo\model"

TEST_MODE = True


# --------------------------------------------------------------------------------------------------
# IMPORTS
# --------------------------------------------------------------------------------------------------

import os
import sys
from pyproj import CRS
import numpy as np
import utm
import math
import warnings
import geopy.distance
import gc
from math import log10
import pandas
from time import time
import re

# note the following environment variable address the following geopandas DeprecationWarning:
# Shapely 2.0 is # installed, but because PyGEOS is also installed, GeoPandas still uses PyGEOS
# by default.   However, starting with version 0.14, the default will switch to Shapely. To force to
# use Shapely # 2.0 now, you can either uninstall PyGEOS or set the environment variable USE_PYGEOS=0.
os.environ['USE_PYGEOS'] = '0'
import geopandas as gpd

#this is not in the default env and has to be installed using 'conda install psutil'
if TEST_MODE:
    import psutil

# --------------------------------------------------------------------------------------------------
# HARDCODED CONSTANTS
# --------------------------------------------------------------------------------------------------

METERS_PER_FOOT = .3048

METERS_PER_MILE = 1609.34

AGES = ('0-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75-84', '85+')

# Only use some of the concentration distances to save calculation time. These were chosen based on
# the rate of change in concentration
CONCENTRATION_DISTANCES = (25, 50, 75, 100, 150, 200, 300)

WRITE_ROAD_RESULTS_SHAPEFILE = True

# --------------------------------------------------------------------------------------------------
# FUNCTIONS
# --------------------------------------------------------------------------------------------------

def write_shapefile(dataframe, name):

    """
    write geopandas dataframe to a shapefile named name.
    this is mostly for debugging.  while writing can be a oneline, meaning this function
    wouldn't be needed, writing to a shapefile is noisy so this supresses that noise
    """

    warnings.filterwarnings('ignore')
    dataframe.to_file(os.path.join(root_output, name))
    warnings.resetwarnings()

# --------------------------------------------------------------------------------------------------

def pool(beta, std):

    """
    pooled standard error weighting
    """

    return (sum(beta/std) / sum(1/std))

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

def make_health_dictionary():

    """
    Create dictionary for health impacts of air pollutant exposure
    health dictionary will contain
    impact: the % change in incidence rate per PM2.5 concentration increase (unit is ug/m^3)
    baseline: the yearly incidence rate per 100 people    [*note require divide by 100 when applied to population]
    value: $ value per incidence
    dmg per road segment distance will be calculated by:
    concentration * population affected * impact * baseline *  value
    """

    # COBRA Health Impact Parameters

    cols = ['Beta', 'Std']
    # health incidence response parameters obtained from COBRA user manual
    # fixed pooling method used for categories with multiple estimates
    # https://www.epa.gov/system/files/documents/2021-11/cobra-user-manual-nov-2021_4.1_0.pdf

    # mortality
    mort_data = pandas.DataFrame([[.005827, .000963], [.013103, .003347]], columns=cols)
    mort = pool(mort_data['Beta'], mort_data['Std'])

    # infant mortality (not currently used)
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


    health = {}

    for age in AGES:
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
        health['mrad'+age]['baseline'] = 7.8 * 100
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
        health['ae'+age]['baseline'] = 24.46 + 13.51 + 27.74
        health['ae'+age]['value'] = 65


    health['mort' +AGES[0]]['baseline'] = .593 / 18 + .019 * 17 / 18
    health['mort' +AGES[1]]['baseline'] = .078
    health['mort' +AGES[2]]['baseline'] = .106
    health['mort' +AGES[3]]['baseline'] = .172
    health['mort' +AGES[4]]['baseline'] = .405
    health['mort' +AGES[5]]['baseline'] = .861
    health['mort' +AGES[6]]['baseline'] = 1.796
    health['mort' +AGES[7]]['baseline'] = 4.628
    health['mort' +AGES[8]]['baseline'] = 13.58

    health['nfha' +AGES[0]]['baseline'] = 0
    health['nfha' +AGES[1]]['baseline'] = 0
    health['nfha' +AGES[2]]['baseline'] = .002
    health['nfha' +AGES[3]]['baseline'] = .010
    health['nfha' +AGES[4]]['baseline'] = .068
    health['nfha' +AGES[5]]['baseline'] = .202
    health['nfha' +AGES[6]]['baseline'] = .380
    health['nfha' +AGES[7]]['baseline'] = .575
    health['nfha' +AGES[8]]['baseline'] = .921

    # TODO: parens never hurt :)
    health['haar' + AGES[0]]['baseline'] = 2.387 * 2/18 + .363 * 16 / 18 + .217 * 2 / 18 + .147 * 16 / 18 + .226 * 2/18 +.151 * 16 / 18
    health['haar' + AGES[1]]['baseline'] = .166 + .036 + .041
    health['haar' + AGES[2]]['baseline'] = .212 + .048 + .056
    health['haar' + AGES[3]]['baseline'] = (.212 + .340) / 2 + (.048 + .076) / 2 + (.056 + .105) / 2
    health['haar' + AGES[4]]['baseline'] = .340 + .076 + .105
    health['haar' + AGES[5]]['baseline'] = .737 + .123 + .281
    health['haar' + AGES[6]]['baseline'] = 1.297 + .136 + .496
    health['haar' + AGES[7]]['baseline'] = 2.292 + .157 + .837
    health['haar' + AGES[8]]['baseline'] = 4.151 + .218 + 1.276

    health['hac' + AGES[0]]['baseline'] = .044 * 2 / 18 + .017 * 16 / 18
    health['hac' + AGES[1]]['baseline'] = .061
    health['hac' + AGES[2]]['baseline'] = .138
    health['hac' + AGES[3]]['baseline'] = (.138 + .377) / 2
    health['hac' + AGES[4]]['baseline'] = .377
    health['hac' + AGES[5]]['baseline'] = .914
    health['hac' + AGES[6]]['baseline'] = 1.747
    health['hac' + AGES[7]]['baseline'] = 3.131
    health['hac' + AGES[8]]['baseline'] = 5.886

    health['erva' +AGES[0]]['baseline'] = .959
    health['erva' +AGES[1]]['baseline'] = .601
    health['erva' +AGES[2]]['baseline'] = .556
    health['erva' +AGES[3]]['baseline'] = .538
    health['erva' +AGES[4]]['baseline'] = .552
    health['erva' +AGES[5]]['baseline'] = .408
    health['erva' +AGES[6]]['baseline'] = .331
    health['erva' +AGES[7]]['baseline'] = .368
    health['erva' +AGES[8]]['baseline'] = .350

    health['wld'+AGES[0]]['baseline'] = 0

    for age in AGES:
        health['mort' + age]['value'] = 9480981
        health['haar' + age]['value'] = (37316 + 17582 + 23200) / 3
        health['hac'  + age]['value'] = (47480 + 44524) / 2
        health['erva' + age]['value'] = (547 + 457) / 2

    health['nfha' + AGES[0]]['value'] = (39174 + 192048) / 2
    health['nfha' + AGES[1]]['value'] = (39174 + 192048) / 2
    health['nfha' + AGES[2]]['value'] = (52999 + 205873) / 2
    health['nfha' + AGES[3]]['value'] = (52999 + 205873) / 2
    health['nfha' + AGES[4]]['value'] = (59550 + 212424) / 2
    health['nfha' + AGES[5]]['value'] = (156951 + 309825) / 2
    health['nfha' + AGES[6]]['value'] = (39174 + 192048) / 2
    health['nfha' + AGES[7]]['value'] = (39174 + 192048) / 2
    health['nfha' + AGES[8]]['value'] = (39174 + 192048) / 2

    return health

# --------------------------------------------------------------------------------------------------

def make_emissions_dictionary():

    """"
    the rates are generated by MOVES
    these specific rates were stored in the ECAT excel tool
    """

    emissions = {}
    emissions['passenger'] = {
            'restricted': {
                25: .004672, 30: .005328, 35: .006827, 40: .00801, 45: .008716, 50: .00867,
                55: .007949, 60: .00749, 65: .007298, 70: .007321, 75: .007901
             },
            'unrestricted': {
                25: .005789, 30: .005346, 35: .005183, 40: .005085, 45: .005009, 50: .004945,
                55: .004881, 60: .004828, 65: .004912, 70: .005311, 75: .006259
             }
    }

    emissions['single'] = {
            'restricted': {
                25: .316352, 30: .292323, 35: .250339, 40: .233778, 45: .220615, 50: .203989,
                55: .187132, 60: .172165, 65: .164759, 70: .158621, 75: .154977
            },
            'unrestricted': {
                25: .310797, 30: .285404, 35: .238913, 40: .219432, 45: .204202, 50: .186974,
                55: .170558, 60: .156706, 65: .150904, 70: .146095, 75: .143557
            }
    }

    emissions['combination'] = {
            'restricted': {
                25: .453907, 30: .426852, 35: .340413, 40: .318589, 45: .301362, 50: .270297,
                55: .234949, 60: .21634, 65: .219503, 70: .221207, 75: .228796
            },
            'unrestricted': {
                25: .462724, 30: .433437, 35: .337631, 40: .310214, 45: .28889, 50: .253356,
                55: .214161, 60: .194444, 65: .198891, 70: .202703, 75: .212083
            }
    }

    return emissions

# --------------------------------------------------------------------------------------------------

def adj_speed( emissions_speeds, speed):

    """
    Match the speeds in HPMS to the closets speeds in the emissions dictionary
    """

    if speed in emissions_speeds:
        return speed
    else:
        dif = [abs(i-speed) for i in emissions_speeds]
        return speeds[dif.index(min(dif))]

# --------------------------------------------------------------------------------------------------

def est_population(road, buffer_dist_meters, block_groups):

    """
    Estimate the population of each age group in a 1000ft buffer near the road
    It is for the entire HPMS dataset at once to reduce calculation time from the buffer generation
    """

    # Intersect road_x_buffer with ACS data
    # count area_proportionate total population
    # count area_proportionate populations for each age group
    # return populations for each age group as a dictionary

    road_buffer = gpd.GeoDataFrame(road.buffer(buffer_dist_meters, cap_style=2))
    road_buffer = road_buffer.rename(columns={0: 'geometry'})
    road_buffer = road_buffer.set_geometry('geometry')

    road_buffer['id'] = road['id']

    write_shapefile(road_buffer, "est_pop_1_road_buffer.shp")

    ol = gpd.overlay(road_buffer, block_groups, how='intersection')

    ol['int_area'] = ol['geometry'].area  # area of intersection in sq_m

    write_shapefile(ol, "est_pop_2_overlay.shp")


    # NOTE: c and c_ were not clear at all, rename ol and ol group by for overlay and overlay group by respectively

    # 'Area' is the area of the full CBG

    # Estimates the population for each age group based on the proportionate area  (assumes uniform pop.density throughout CBG)
    # Age groupings in ACS are not even, so must manually match to the COBRA health impact age groups

    ol['pct_area'] = ol['int_area'] / ol['Area']

    # male and female under 5 to 17
    ol[AGES[0]] = ol['pct_area'] * (ol['B01001e3']+ol['B01001e4']+ol['B01001e5']+ol['B01001e6']+ol['B01001e27']+ol['B01001e28']+ol['B01001e29']+ol['B01001e30'])

    # male and female 18 to 24
    ol[AGES[1]] = ol['pct_area'] * (ol['B01001e7']+ol['B01001e8']+ol['B01001e9']+ol['B01001e10']+ol['B01001e31']+ol['B01001e32']+ol['B01001e33']+ol['B01001e34'])

    # male and female 25 to 29
    ol[AGES[2]] = ol['pct_area'] * (ol['B01001e11']+ol['B01001e12']+ol['B01001e35']+ol['B01001e36'])

    # male and female 35 to 44
    ol[AGES[3]] = ol['pct_area'] * (ol['B01001e13']+ol['B01001e14']+ol['B01001e37']+ol['B01001e38'])

    # male and female 45 to 54
    ol[AGES[4]] = ol['pct_area'] * (ol['B01001e15']+ol['B01001e16']+ol['B01001e39']+ol['B01001e40'])

    # male and female 55 to 64
    ol[AGES[5]] = ol['pct_area'] * (ol['B01001e17']+ol['B01001e18']+ol['B01001e19']+ol['B01001e41']+ol['B01001e42']+ol['B01001e43'])

    # male and female 65 to 74
    ol[AGES[6]] = ol['pct_area'] * (ol['B01001e20']+ol['B01001e21']+ol['B01001e22']+ol['B01001e44']+ol['B01001e45']+ol['B01001e46'])

    # male and female 75 to 84
    ol[AGES[7]] = ol['pct_area'] * (ol['B01001e23']+ol['B01001e24']+ol['B01001e47']+ol['B01001e48'])

    # male and female 85 and older
    ol[AGES[8]] = ol['pct_area'] * (ol['B01001e25']+ol['B01001e49'])

    #pandas.options.display.float_format = '{:.5f}'.format
    #print(ol[['GEOID', 'id', 'Area', 'int_area', 'pct_area']])

    # ol has more observations than road as some road segments intersect multiple census block groups
    # so groupby 'Route_ID' summing populations, then merge with road by 'id'
    agg = {}

    for i in range(len(AGES)):
        agg[AGES[i]] = 'sum'

    olgb = ol.groupby(ol['id']).aggregate(agg)

    #print(olgb)

    # convert the 9 population fields into a dictionary  (this simplifies the function calls later)
    olgb['population'] = olgb.apply(lambda row: {AGES[0]: row[AGES[0]], AGES[1]: row[AGES[1]], AGES[2]: row[AGES[2]],
                                           AGES[3]: row[AGES[3]], AGES[4]: row[AGES[4]], AGES[5]: row[AGES[5]],
                                           AGES[6]: row[AGES[6]], AGES[7]: row[AGES[7]], AGES[8]: row[AGES[8]]}, axis=1)

    olgb = olgb[['population']]

    # merge with road so that road only gets the population dictionary
    road_with_pop = pandas.merge(road, olgb, how='left', on=['id'])

    write_shapefile(road_with_pop, "est_pop_3_road_pop.shp")

    return road_with_pop

# --------------------------------------------------------------------------------------------------

def calc_emissions(emissions_dict, AADT_PASSENGER, AADT_SINGL, AADT_COMBI, speed, length, width, restricted):

    """
    # TODO fix comment below
    Calculate emissions for road segment
    based on traffic counts, speed, road length and width
    TODO clear up comments on next two lines
    g/mile • miles_road • AADT • day/sec • 1/area_road  =  g/(s-m2)
    sum_vehtype(g/mile•AADT) * (miles_road•day/sec•1/area_road)
    """

    road_size_adjustment  = length / METERS_PER_MILE / 86400 / (length * width)
    emissions_passenger   = AADT_PASSENGER * emissions_dict['passenger'][restricted][speed]
    emissions_single      = AADT_SINGL * emissions_dict['single'][restricted][speed]
    emissions_combination = AADT_COMBI * emissions_dict['combination'][restricted][speed]

    emis = road_size_adjustment*(emissions_passenger+emissions_single+emissions_combination)

    return emis

# --------------------------------------------------------------------------------------------------

def calc_concentrations(concentration_gradient, emis):

    """
    Set of gradient curves stored in a dictionary
    Multiply appropriate gradient curve (based on previously assigned index) by road emissions
    return emission concentration at distances as a dictionary
    original concentration curve emission: 0.000001
    scaling factor: emis/.000001
    """

    concentration_adj = concentration_gradient['Concentration'] * emis / .000001

    concentration = {}

    for i in range(len(concentration_gradient)):
        concentration[concentration_gradient['Distance'][i]] = concentration_adj[i]

    return concentration

# --------------------------------------------------------------------------------------------------

def health_dmg(health_dict, dist_width_adj, concentration, population):

    """
    Calculate health incidence based on concentration at distance
    Multiply by monetization factor
    return health dmg at distance
    """

    dmg = 0

    for d in CONCENTRATION_DISTANCES:

        for category in ['mort', 'nfha', 'haar', 'hac', 'erva', 'mrad', 'ab', 'wld', 'lrs', 'urs', 'ae']:
            for age in AGES:

                # TODO would be good to break up parts and/or add parens
                dmg += concentration[d] * population[age] * dist_width_adj[d] * \
                       health_dict[category + age]['impact'] * (health_dict[category+age]['baseline']/100) \
                       * health_dict[category+age]['value']

    # concentration * population affected *
    #    % incidence rate increase * incidence rate per population *  monetization
    return dmg

# --------------------------------------------------------------------------------------------------

def process_state(state_fips, state_name, state_abbrev, house_values, states_list, ACS, emissions_dict,
                  concentration_gradient, health_dict, dist_width_adj, demos, county_names,
                  state_results, county_results, census_results):

    """
    this is the main function applied to each state
    """

    ######################################################################
    # 0 - Setup

    print('processing {}'.format(state_name))

    t0 = time()

    acs_geodatabases = [i for i in os.listdir(root_acs) if re.match(r'ACS_2019_5YR_BG_{}_.*\.gdb'.format(state_fips), i)]

    if len(acs_geodatabases) != 1:
        raise Exception('could not find ACS filegeodatabase for state fips code {}'.format(state_fips_codes))

    # the ACS State nomenclature (space, no space, or _) is different than HPMS, so this method requires folders for all states be in ACS
    acs_fgdb = acs_geodatabases[0]

    # housevalues is being used here to get the squashed statename (e.g. newhampshire)
    # in order to get the hpms roads shapefile that does the same thing with names
    state = house_values.loc[states_list['FIPS'] == state_fips, 'State'].values[0]

    print('==={}'.format(state))

    state_utm_zone = states_list.loc[states_list['FIPS'] == state_fips, 'UTM_ZONE'].values[0]
    if not 4 <= state_utm_zone <= 19:
        raise Exception('utm zone for state does not appear to be valid')

    # to facilitate more accurate distances each State's coordinates are converted to a utm zone
    crs_utm = CRS.from_string('epsg:326' + str(state_utm_zone))

    ######################################################################
    # 1  - Prepare ACS data

    if TEST_MODE:
        print('\tstarting memory: {}'.format(psutil.virtual_memory().available >> 20 ))


    print("\treading ACS files ...")
    start = time()

    # full path to the acs file geodatabase
    fp_to_fgdb = os.path.join(root_acs, acs_fgdb)

    # the layer name is same as gdb name minus the '.gdb'
    block_groups = gpd.read_file(fp_to_fgdb, layer=acs_fgdb[:-4])

    # only keep the following columns
    block_groups = block_groups[['GEOID', 'GEOID_Data', 'geometry']]

    block_groups = block_groups.to_crs(crs_utm)

    block_groups['county_FIPS'] = block_groups.apply(lambda row: row['GEOID'][0:5], axis=1)
    block_groups['tract_FIPS'] = block_groups.apply(lambda row: row['GEOID'][2:-1], axis=1)

    #print(block_groups)

    age = gpd.read_file(fp_to_fgdb, layer="X01_Age_and_Sex")
    age = age[['GEOID', 'B01001e3', 'B01001e4', 'B01001e5', 'B01001e6', 'B01001e7', 'B01001e8',
               'B01001e9', 'B01001e10', 'B01001e11', 'B01001e12', 'B01001e13', 'B01001e14',
               'B01001e15', 'B01001e16', 'B01001e17', 'B01001e18', 'B01001e19', 'B01001e20',
               'B01001e21', 'B01001e22', 'B01001e23', 'B01001e24', 'B01001e25', 'B01001e27',
               'B01001e28', 'B01001e29', 'B01001e30', 'B01001e31', 'B01001e32', 'B01001e33',
               'B01001e34', 'B01001e35', 'B01001e36', 'B01001e37', 'B01001e38', 'B01001e39',
               'B01001e40', 'B01001e41', 'B01001e42', 'B01001e43', 'B01001e44', 'B01001e45',
               'B01001e46', 'B01001e47', 'B01001e48', 'B01001e49']]

    age.set_index("GEOID", inplace = True)
    #print(age)

    race = gpd.read_file(fp_to_fgdb, layer="X02_Race")
    race = race[['GEOID', 'B02001e1', 'B02001e2', 'B02001e3', 'B02001e4', 'B02001e5', 'B02001e6', 'B02001e7']]
    race.set_index("GEOID", inplace = True)
    #print(race)

    poverty  = gpd.read_file(fp_to_fgdb, layer="X17_Poverty")
    poverty  = poverty[['GEOID', 'B17021e2']]
    poverty.set_index("GEOID", inplace = True)
    #print(poverty)

    hispanic = gpd.read_file(fp_to_fgdb, layer="X03_Hispanic_or_Latino_Origin")
    hispanic = hispanic[['GEOID', 'B03002e13']]
    hispanic.set_index("GEOID", inplace = True)
    #print(hispanic)

    block_groups = pandas.merge(block_groups, age, how='inner', left_on="GEOID_Data", right_on='GEOID')
    block_groups = pandas.merge(block_groups, race, how='inner', left_on="GEOID_Data", right_on='GEOID')
    block_groups = pandas.merge(block_groups, poverty, how='inner', left_on="GEOID_Data", right_on='GEOID')
    block_groups = pandas.merge(block_groups, hispanic, how='inner', left_on="GEOID_Data", right_on='GEOID')

    #subtract hispanic/latino white from white alone
    block_groups[ACS['white']] = block_groups[ACS['white']] - block_groups['B03002e13']

    #total population minus white alone
    block_groups['nonwhite'] = block_groups['B02001e1'] - block_groups[ACS['white']]

    # total pop minus poverty
    block_groups['nonpoverty'] = block_groups['B02001e1'] - block_groups[ACS['poverty']]

    block_groups['Area'] = block_groups['geometry'].area

    #print(block_groups)

    # TODO this shapefile should be checked against the raw inputs
    if TEST_MODE:
        write_shapefile(block_groups, "s1_block_groups_{}.shp".format(state_abbrev))

    print('\t\tfinished in {:.1f} minutes'.format((time()-start)/60))


    ######################################################################
    # 2 - Prepare HPMS Data

    print("\treading HPMS file ...")
    start = time()

    # road file for the state
    gdb = os.path.join(root_road, state + ".shp")
    road = gpd.read_file(gdb)
    road = road[road['geometry'] != None]
    road['id'] = road.index
    renames = {i: i.upper() for i in road.columns}  # HPMS 2016 and 2017 use different naming conventions
    renames['geometry'] = 'geometry'


    # commented out next few lines becuase I belive they are not needed
    # route id is already a string field in the dataframe
    # and all the fields in the following for loop are already integer fields

    # some cleanup on column types
    #road['ROUTE_ID'] = road.apply(lambda row: str(row['ROUTE_ID']), axis=1)

    #for i in ['F_SYSTEM', 'AADT', 'AADT_SINGL', 'AADT_COMBI', 'SPEED_LIMI']:
        #road[i] = road[i].apply(int)

    road['AADT_PASSENGER'] = road['AADT'] - road['AADT_COMBI'] - road['AADT_SINGL']

    # sets speed limit for roads without entry. based on avg speed for these road types (calculated elsewhere)
    func_sys_speed = {0: 45, 1: 65, 2: 55, 3: 45, 4: 45, 5: 35, 6: 30, 7: 25}
    func_sys = list(set(road['F_SYSTEM']))
    func_sys.sort()

    road['SPEED_LIMI'] = road['SPEED_LIMI'].fillna(0)

    for i in func_sys:
        road.loc[(road['F_SYSTEM'] == i) & ((road['SPEED_LIMI'] == 0) | (road['SPEED_LIMI'] > 90)) , 'SPEED_LIMI'] = func_sys_speed[i]

    # emission rates are only estimated for certain speeds, replace speed with closest match
    emissions_speeds = list(emissions_dict['passenger']['restricted'].keys())
    road['SPEED_LIMI'] = road.apply(lambda row: adj_speed(emissions_speeds, row['SPEED_LIMI']), axis=1)

    # Estimate width based on through lanes
    # if no data then assume 2
    # assuming 12 foot lanes (10-12) and converting to meters
    road['THROUGH_LA'] = road['THROUGH_LA'].fillna(0)

    road['THROUGH_LA'].replace(to_replace = 0, value = 2, inplace=True)

    road['width'] = road['THROUGH_LA'] * 12 * METERS_PER_FOOT

    road['restricted'] = road.apply(lambda row: 'restricted' if row['ACCESS_CON'] == 1 else 'unrestricted', axis=1)

    road = road.to_crs(crs_utm)  # crs is in meters
    road['length'] = road.length
    #print(road)

    if TEST_MODE:
        write_shapefile(road, "s2_roads_{}.shp".format(state_abbrev))

    print('\t\tfinished in {:.1f} minutes'.format((time()-start)/60))


    ######################################################################
    # 3 - Estimate Population

    print("\testimating population ...")
    start = time()

    # Count the number of houses in each buffer strip from the road
    dist = [i*5 for i in range(1, 62)]  # in m, UTM is in m

    ## UPDATE ##
    # 1. estimate number of houses once for 1000ft buffer
    # 2. split houses into dist_buffer strips evenly proportional to width

    # what if you have an area missing a particular age group?
    # The method used below to replace NaN due to non-intersections is clunky, but several other methods were causing errors, not sure why
    # unfortunately numpy does not allow replacing with a dictionary
    # this brute force method insured the values were set to zero and didn't cause an error

    road = est_population(road, 1000 * METERS_PER_FOOT, block_groups)

    road['population'] = road['population'].replace(np.nan, 0)
    indexes_replace = road[road['population'] == 0].index

    for i in indexes_replace:
        road['population'][i] = {'0-17': 0, '18-24': 0, '25-34': 0, '35-44': 0,
                                 '45-54': 0, '55-64': 0, '65-74': 0, '75-84': 0, '85+': 0}

    if TEST_MODE:
        write_shapefile(road, "s3_roads_w_pop_{}.shp".format(state_abbrev))

    print('\t\tfinished in {:.1f} minutes'.format((time()-start)/60))


    ######################################################################
    # 4 - Estimate Air Pollutant Concentration

    print("\testimating air pollution ...")
    start = time()

    # iterates over road segments and calculate emissions for each segment
    road['emissions'] = road.apply(lambda row: calc_emissions(emissions_dict, row['AADT_PASSENGER'], row['AADT_SINGL'], row['AADT_COMBI'],
                                                              row['SPEED_LIMI'], row['length'], row['width'], row['restricted']), axis=1)

    # iterates over road segments and calculate the average emissions level at each distance
    road['concentration'] = road.apply(lambda row: calc_concentrations(concentration_gradient, row['emissions']), axis=1)


    if TEST_MODE:
        # note: can't write shapefile here due to dictionary in fields
        print(road.iloc[0:50])
        pass

    road.to_csv(os.path.join(root_output, "s4_roads_w_apc_{}.csv".format(state_abbrev)), sep='\t', index=False)

    print('\t\tfinished in {:.1f} minutes'.format((time()-start)/60))

    ######################################################################
    # 5 - Estimate Health Costs

    print("\testimating health costs ...")
    start = time()

    road['dmg'] = road.apply(lambda row: health_dmg(health_dict, dist_width_adj, row['concentration'], row['population']), axis=1)


    # NOTE: can't write this out either due to dictionaries being stored in fields
    #road.to_file(os.path.join(root_output, "s5_roads_w_hc_{}.shp".format(state_abbrev)))

    print('\t\tfinished in {:.1f} minutes'.format((time()-start)/60))

    ######################################################################
    # 6 - Attribute to Demographics

    print("\tattribute to demos ...")
    start = time()

    # attribute dmg to each demographic for intersecting census block groups
    # keep track of sum of dmg to each demographic
    # at end compare % of dmg received to population share

    road = gpd.GeoDataFrame(road)

    # NOTE This method of intersection doesn't account for census block group intersecting the buffer but not the road
    # TODO - Thor to look into using buffer instead of road
    # TODO - Thor to also add more comments to this section
    inte = gpd.sjoin(block_groups, road, predicate='intersects')

    # can't write the dictionary data in these columns to a shapefile
    if TEST_MODE:
        inte_to_write_to_shapefile = inte.drop(['population', 'concentration'], axis=1)
        write_shapefile(inte_to_write_to_shapefile, "inte.shp")

    agg_functions = {'B02001e1': 'sum',
                     'dmg': 'first',
                     'county_FIPS': gath,
                     'tract_FIPS': gath,
                      'GEOID': gath,
                     'URBAN_CODE': 'first'
                     }

    for demo in demos:
        agg_functions[ACS[demo]] = 'sum'

    inte_road = inte.groupby(inte['index_right']).aggregate(agg_functions)
    # this method ensures each road is counted once, while summing up the populations of the intersecting CBGs
    # essentially forming 'super CBGs' of all the CBGs intersecting a road in order the calculate the share of each demographic population
    # later, when aggregating over larger areas the dmg for each road segment is divided by the number of intersecting CBGs to ensure all dmg is only counted once

    inte_road = inte_road.fillna(0)

    # split the noise dmg for each road segment into demographics based on share of population
    for demo in demos:
        inte_road[demo +'_dmg'] = inte_road[ACS[demo]] / inte_road['B02001e1'] * inte_road['dmg']

    inte_road = inte_road.fillna(0)

    if TEST_MODE:
        pass
        # TODO write this to a csv for checking?

    print('\t\tfinished in {:.1f} minutes'.format((time()-start)/60))

    ######################################################################
    # 7 - Write road shapefile with noise damage estimates

    if WRITE_ROAD_RESULTS_SHAPEFILE:

        print("\twriting road shapefile with noise damage estimates ...")
        start = time()
    
        # subset to just key fields
        road_write = road[['STATE_CODE', 'ROUTE_ID', 'ROUTE_NUMB', 'F_SYSTEM', 'FACILITY_T', 'URBAN_CODE',
            'SPEED_LIMI', 'AADT_PASSENGER', 'AADT_SINGL', 'AADT_COMBI', 'length', 'geometry', 'dmg']]
    
        # NOTE this was giving a warning, replaced with the two lines after it as this is one
        # documented way to create a column from an index
        #road_write['index_right'] = road_write.index
        road_write = road_write.reset_index()
        road_write.rename(columns = {'index':'index_right'}, inplace = True)
    
        road_write = pandas.merge(inte_road, road_write, how='inner', on=['index_right'])
        road_write = gpd.GeoDataFrame(road_write)
        road_write['length'] = road_write['length'] / METERS_PER_MILE  # convert from meters to miles
    
        # TODO are the following three lines still needed?  did they become integers at some point, and
        # if so, track down where that is happening and try to prevent them from ever becoming numbers
        
        road_write['county_FIPS'] = road_write.apply(lambda row: str(row['county_FIPS']), axis=1)
        road_write['tract_FIPS'] = road_write.apply(lambda row: str(row['tract_FIPS']), axis=1)
        road_write['GEOID'] = road_write.apply(lambda row: str(row['GEOID']), axis=1)
    
        rname = {'B02001e1': 'total_pop', 'URBAN_CODE_y': 'URBAN_CODE'}
        for demo in demos:
            rname[ACS[demo]] = demo + '_pop'
    
        road_write = road_write.rename(columns=rname)
    
        road_write['dmg_length'] = road_write['dmg'] / road_write['length'] / 10  # dmg per 1/10 mile
        road_write['dmg_length'] = road_write.apply(lambda row: int(row['dmg_length']), axis=1)
    
        keep = ['STATE_CODE', 'county_FIPS', 'tract_FIPS', 'GEOID', 'URBAN_CODE', 'ROUTE_NUMB',
                'F_SYSTEM', 'FACILITY_T', 'AADT_PASSENGER', 'AADT_SINGL', 'AADT_COMBI', 'SPEED_LIMI',
                'dmg', 'dmg_length', 'length', 'total_pop', 'geometry']
    
        for demo in demos:
            keep.append(demo + "_pop")
            keep.append(demo + "_dmg")
    
        road_write = road_write[keep]
        road_write = road_write.to_crs("epsg:4326")
    
        # TODO will this overwrite if it already exists?
    
        # TODO many field names are over 10 characters.  A wanring is generated but even worse,
        # the fields are chopped at 10 leaving things like 'nonpoverty' where is should be appended with
        # _dmg or _pop.  Recommend reworking some demos eg, nonpoverty = npvrty
    
        write_shapefile(road_write, state + "_air_dmg.shp")
    
        print('\t\tfinished in {:.1f} minutes'.format((time()-start)/60))

    ######################################################################
    # 8 - TODO this section should be given a title

    result['state'].append(state)
    result['state_pop'].append(sum(block_groups['B02001e1']))
    result['state_dmg'].append(sum(inte_road['dmg']))

    for demo in demos:
        result[demo + "_pop"].append(sum(block_groups[ACS[demo]]))
        result[demo + '_dmg'].append(sum(inte_road[demo +'_dmg']))

    result['rural_dmg'].append(sum(inte_road[inte_road['URBAN_CODE'] == 99999]['dmg']))
    result['urban_dmg'].append(sum(inte_road[inte_road['URBAN_CODE'] != 99999]['dmg']))

    # This section prints out the noise-equity ratios for the state
    # TODO this should go to a file if it's an important check, it's also a bit verbose for the screen

#    print("\nState: ", state, " Time: ", round(time() - t0, 2), sep='')
#    print("-------------------")
#    print("White")
#    print(round(sum(inte_road['white_dmg']) / sum(inte_road['dmg']), 4), 'dmg')
#    print(round(sum(block_groups['B02001e2']) / sum(block_groups['B02001e1']), 4), 'pop')
#
#    print("Black")
#    print(round(sum(inte_road['black_dmg']) / sum(inte_road['dmg']), 4))
#    print(round(sum(block_groups['B02001e3']) / sum(block_groups['B02001e1']), 4))
#
#    print("Native")
#    print(round(sum(inte_road['native_dmg']) / sum(inte_road['dmg']), 4))
#    print(round(sum(block_groups['B02001e4']) / sum(block_groups['B02001e1']), 4))
#
#    print("Asian")
#    print(round(sum(inte_road['asian_dmg']) / sum(inte_road['dmg']), 4))
#    print(round(sum(block_groups['B02001e5']) / sum(block_groups['B02001e1']), 4))
#
#    print("Pacific")
#    print(round(sum(inte_road['pacific_dmg']) / sum(inte_road['dmg']), 4))
#    print(round(sum(block_groups['B02001e6']) / sum(block_groups['B02001e1']), 4))
#
#    print("Other")
#    print(round(sum(inte_road['other_dmg']) / sum(inte_road['dmg']), 4))
#    print(round(sum(block_groups['B02001e7']) / sum(block_groups['B02001e1']), 4))

    ######################################################################
    # 9 - Attribute to Demographics to County and Census Tract

    print("\taggregating to county ...")
    start = time()

    # below avoids multi-counting for roads that intersect multiple counties/census tracts,
    # dmg needs to be divided since the summation is across counties/census tracts when reaggregated
    # assumes dmg is split between intersecting counties/census tracts [in revision will split based on proportion of road intersecting]
    inte_road['dmg'] = inte_road['dmg'] / inte_road.apply(lambda row: len(row['GEOID']), axis=1)

    for demo in demos:
        inte_road[demo + '_dmg'] = inte_road[demo + '_dmg'] / inte_road.apply(lambda row: len(row['GEOID']), axis=1)

    inte_road['index_right'] = inte_road.index
    inte_road.index.name = 'id'
    inte_road = inte_road.rename(columns={'dmg': 'total_dmg'})  # to distinguish it for remerge
    keep = ['index_right', 'total_dmg']  # 'nonwhite_dmg'

    for demo in demos:
        # don't need 'road_block' population counts, those were used only for proportion of dmg allocation
        keep.append(demo +'_dmg')

    inte_road = inte_road[keep]

    keep_inte = ['county_FIPS', 'tract_FIPS', 'GEOID', 'index_right']
    inte = inte[keep_inte]  # to simplify dataframe for later steps
    inte_ = pandas.merge(inte, inte_road, how='inner', on=['index_right'])

    agg_functions = {'total_dmg': 'sum'}

    for demo in demos:
        agg_functions[demo +'_dmg'] = 'sum'

    inte_county = inte_.groupby(inte_['county_FIPS']).aggregate(agg_functions)
    inte_county['county_FIPS'] = inte_county.index
    inte_county.index.names = ['id']

    agg_pop = {'B02001e1': 'sum'}  # just to count the population groups

    for demo in demos:
        agg_pop[ACS[demo]] = 'sum'

    county_shp = block_groups.groupby(block_groups['county_FIPS']).aggregate(agg_pop)

    # inte_county has the correct damage for each, county_shp has the correct population
    inte_county = pandas.merge(inte_county, county_shp, how='inner', on=['county_FIPS'])

    rname = {'B02001e1': 'total_pop'}

    for demo in demos:
        rname[ACS[demo]] = demo +'_pop'

    inte_county = inte_county.rename(columns=rname)
    inte_county = inte_county.fillna(0)

    # calculate the noise-equity ratios (called ndp here for noise% divided by population%)
    for demo in demos:
        inte_county[demo + '_ndp'] = inte_county[demo +'_dmg'] / inte_county['total_dmg'] / \
            (inte_county[demo + '_pop'] / inte_county['total_pop'])

    inte_county = inte_county.fillna(0)

    keep = ['county_FIPS', 'name']  # ,'white_ndp','black_ndp','native_ndp','asian_ndp','pacific_ndp','other_ndp']

    for demo in demos:
        keep.append(demo +'_ndp')
        keep.append(demo +'_dmg')
        keep.append(demo +'_pop')

    # keep.append('nonwhite_ndp')
    inte_county = pandas.merge(inte_county, county_names, how='inner', on='county_FIPS')

    inte_county_ = inte_county[keep]

    # add county names

    inte_county2 = pandas.melt(inte_county_, id_vars=['county_FIPS', 'name'], var_name='metrics', value_name='values')
    inte_county2["Demographic"] = inte_county2.apply(lambda row: row['metrics'][:-4], axis=1)
    inte_county2['metrics'] = inte_county2.apply(lambda row: row['metrics'][-3:], axis=1)

    return


    # TODO - this is broken and I don't know what it's supposed to do
    if c == 0:
        county = pandas.DataFrame(columns=list(inte_county2.columns))

    county = pandas.concat([county, inte_county2])

    print('\t\tfinished in {:.1f} minutes'.format((time()-start)/60))

    ######################################################################
    # 10 - Aggregate to census tracts

    print("aggregating to census tract ...")
    inte_census = inte_road.groupby(inte_['tract_FIPS']).aggregate(agg_functions)
    inte_census['tract_FIPS'] = inte_census.index
    inte_census.index.names = ['id']

    census_shp = block_groups.groupby(block_groups['tract_FIPS']).aggregate(agg_pop)

    # inte_census has the correct damage for each, census_shp has the correct population
    inte_census = pandas.merge(inte_census, census_shp, how='inner', on=['tract_FIPS'])

    inte_census = inte_census.rename(columns=rname)
    inte_census = inte_census.fillna(0)

    for i in demos:
        inte_census[i+'_ndp'] = inte_census[i+'_dmg']/inte_census['total_dmg'] / \
            (inte_census[i+'_pop']/inte_census['total_pop'])

    inte_census = inte_census.fillna(0)

    keep = ['tract_FIPS']  # ,'white_ndp','black_ndp','native_ndp','asian_ndp','pacific_ndp','other_ndp']

    for demo in demos:
        keep.append(demo +'_ndp')
        keep.append(demo +'_dmg')
        keep.append(demo +'_pop')

    inte_census = inte_census[keep]

    inte_census_melt = pandas.melt(inte_census, id_vars=['tract_FIPS'], var_name='metrics', value_name='values')
    inte_census_melt["Demographic"] = inte_census_melt.apply(lambda row: row['metrics'][:-4], axis=1)
    inte_census_melt['metrics'] = inte_census_melt.apply(lambda row: row['metrics'][-3:], axis=1)

    if c == 0:
        census = pandas.DataFrame(columns=list(inte_census_melt.columns))

    census = pandas.concat([census, inte_census_melt])


    ######################################################################
    # 11 - State wrap up

    print('\t\tfinished in {:.1f} minutes'.format((time()-start)/60))

    print("\tTotal time for state:", round((time()-t0)/60, 1), "mins\n")


# --------------------------------------------------------------------------------------------------

def main():


    # ----------------------------------------------------------------------------------------------
    # PREP SUPPORTING DATA
    # ----------------------------------------------------------------------------------------------

    house_values = pandas.read_csv(
        os.path.join(root_input, "State_median_housing_values.csv"),
        dtype={'FIPS':str}
    )

    county_names = pandas.read_csv(os.path.join(root_input, "FIPS_names.csv"))

    county_names['county_FIPS'] = county_names.apply(lambda row: str(row['county_FIPS']), axis=1)

    county_names['county_FIPS'] = county_names.apply(lambda row: '0'+row['county_FIPS'] if len(row['county_FIPS']) < 5
                                                     else row['county_FIPS'], axis=1)

    concentration_gradient = pandas.read_csv(os.path.join(root_input, "concentrations_ex.csv"))

    concentration_gradient = concentration_gradient[concentration_gradient['Distance'].isin(CONCENTRATION_DISTANCES)]
    concentration_gradient = concentration_gradient.reset_index(drop=True)

    # TODO the following comment could use more explaination.  In addition, please explain things like  1 / 12.192?)
    # For each distance the population density has to account for the width

    dist_width_adj = {25: 1 / 12.192}

    for i in range(1, len(concentration_gradient)):
        dist_width_adj[concentration_gradient['Distance'][i]] = (1 / 12.192) * (concentration_gradient['Distance'][i] - concentration_gradient['Distance'][i-1]) / 25

    states_list = pandas.read_csv( os.path.join(root_input, "States_Data.txt"), dtype={'FIPS': str})

    # Make an ACS key so easier to refer to
    # TODO demos should be decoupled from this ACS lookup.  it's weired becuase of the last two entries
    # but it's also weird because alot of census field names aren't decoded elsewhere

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

    health_dict = make_health_dictionary()

    emissions_dict = make_emissions_dictionary()

    # ----------------------------------------------------------------------------------------------
    # SET UP STORAGE OF RESULTS
    # ----------------------------------------------------------------------------------------------

    state_results = {'state': [], 'state_pop': []}

    for demo in demos:
        state_results[demo + '_pop'] = []

    state_results['state_dmg'] = []

    for demo in demos:
        state_results[demo +'_dmg'] = []

    state_results['rural_dmg'] = []
    state_results['urban_dmg'] = []

    county_results = pandas.DataFrame()
    census_results = pandas.DataFrame()

    # ----------------------------------------------------------------------------------------------
    # RUN STATES
    # ----------------------------------------------------------------------------------------------

    # NOTE: this has been changed to take the fips code of the state.  33 is new hampsire.
    # NOTE: fips  should always be string and not number, e.g. Alabama is 01 not 1

    for index, row in states_list.iterrows():
        if row['FIPS'] == '33':  # limit to only processing new hampshire for now

            process_state(row['FIPS'], row['NAME'], row['ABBREV'], house_values, states_list, ACS, emissions_dict,
                    concentration_gradient, health_dict, dist_width_adj, demos, county_names,
                    state_results, county_results, census_results)

    # ----------------------------------------------------------------------------------------------
    # SUMMARIZE RESULTS FROM ALL STATES
    # ----------------------------------------------------------------------------------------------

    # Writing of final results
    # note this is meant to be run after all states have been done

#    results = pandas.DataFrame(result)

    # add US row, first sum each column, store in list add list as row to results

#    us = [i for i in results.loc[:, results.columns != 'state'].apply(lambda col: sum(col), axis=0)]
#    us.insert(0, 'US')

#    results.loc[len(results.index)] = us
#    results['urban_pct'] = results['urban_dmg'] / (results['urban_dmg'] + results['rural_dmg'])
#
#    results['rural_pct'] = results['rural_dmg'] / (results['urban_dmg'] + results['rural_dmg'])
#
#    for i in demos:
#        results[i+'_ndp'] = results[i+'_dmg']/results['state_dmg'] / (results[i+'_pop']/results['state_pop'])
#
#    # 'white_ndp','black_ndp','native_ndp','asian_ndp','pacific_ndp','other_ndp']
#    keep = ['state', 'urban_pct', 'rural_pct']
#
#    for i in demos:
#        keep.append(i+'_ndp')
#
#    results_ = results[keep]
#    results2 = pandas.melt(results_, id_vars=['state'], var_name='metrics', value_name='values')
#    results2["Demographic"] = results2.apply(lambda row: row['metrics'][:-4], axis=1)
#    results2['metrics'] = results2.apply(lambda row: row['metrics'][-3:], axis=1)
#
#    # may want to include date in results name
#    results2.to_csv(os.path.join(root_output, "Equity_long_air.csv"))
#    county.to_csv(os.path.join(root_output, "Equity_county_air.csv"))
#    census.to_csv(os.path.join(root_output, "Equity_census_air.csv"))

    print('Done')
    #input("Press enter when finished")


# -------------------------------------------------------------------------------------------------

# by doing things this way everthing isn't global which is good when a program gets this
# large and complicated

if __name__ == "__main__":

    os.system('cls')

    # the following "root_" vairables will be available to all functions (i.e. globals)

    root_input = os.path.join(ROOT, "Input_Data")

    if TEST_MODE:
        print('IN TEST MODE, USING TEST DATASET')
        root_input = os.path.join(ROOT, "Input_Data_test_2_smaller")

    root_acs = os.path.join(root_input, "ACS_2019")

    root_road = os.path.join(root_input, "state_shp_2016_simplified")

    root_output = os.path.join(ROOT, "Output_Data")

    root_cost = os.path.join(root_output, "state_shp_air_cost")

    if not os.path.exists(root_cost):
        os.mkdir(root_cost)

    main()


