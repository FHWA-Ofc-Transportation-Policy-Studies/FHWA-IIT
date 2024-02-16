
import os
import sys
import time
import arcpy
import pandas as pd
import numpy as np
import json

# --------------------------------------------------------------------------------------------------

VERSION = "b1p1"  # beta 1 point 1

BASE_DIR = r'D:\projects\FHWA_IIT\repo\webapp\prep_layers'

FARS_FIXES = r'D:\projects\FHWA_IIT\repo\webapp\prep_layers\fars_overrides.csv'

STATES_DATA = [
    ['01', 'AL', 'ALABAMA'],
    ['02', 'AK', 'ALASKA'],
    ['04', 'AZ', 'ARIZONA'],
    ['05', 'AR', 'ARKANSAS'],
    ['06', 'CA', 'CALIFORNIA'],
    ['08', 'CO', 'COLORADO'],
    ['09', 'CT', 'CONNECTICUT'],
    ['10', 'DE', 'DELAWARE'],
    ['11', 'DC', 'DISTRICT_OF_COLUMBIA'],
    ['12', 'FL', 'FLORIDA'],
    ['13', 'GA', 'GEORGIA'],
    ['15', 'HI', 'HAWAII'],
    ['16', 'ID', 'IDAHO'],
    ['17', 'IL', 'ILLINOIS'],
    ['18', 'IN', 'INDIANA'],
    ['19', 'IA', 'IOWA'],
    ['20', 'KS', 'KANSAS'],
    ['21', 'KY', 'KENTUCKY'],
    ['22', 'LA', 'LOUISIANA'],
    ['23', 'ME', 'MAINE'],
    ['24', 'MD', 'MARYLAND'],
    ['25', 'MA', 'MASSACHUSETTS'],
    ['26', 'MI', 'MICHIGAN'],
    ['27', 'MN', 'MINNESOTA'],
    ['28', 'MS', 'MISSISSIPPI'],
    ['29', 'MO', 'MISSOURI'],
    ['30', 'MT', 'MONTANA'],
    ['31', 'NE', 'NEBRASKA'],
    ['32', 'NV', 'NEVADA'],
    ['33', 'NH', 'NEW_HAMPSHIRE'],
    ['34', 'NJ', 'NEW_JERSEY'],
    ['35', 'NM', 'NEW_MEXICO'],
    ['36', 'NY', 'NEW_YORK'],
    ['37', 'NC', 'NORTH_CAROLINA'],
    ['38', 'ND', 'NORTH_DAKOTA'],
    ['39', 'OH', 'OHIO'],
    ['40', 'OK', 'OKLAHOMA'],
    ['41', 'OR', 'OREGON'],
    ['42', 'PA', 'PENNSYLVANIA'],
    ['72', 'PR', 'PUERTO_RICO'],
    ['44', 'RI', 'RHODE_ISLAND'],
    ['45', 'SC', 'SOUTH_CAROLINA'],
    ['46', 'SD', 'SOUTH_DAKOTA'],
    ['47', 'TN', 'TENNESSEE'],
    ['48', 'TX', 'TEXAS'],
    ['49', 'UT', 'UTAH'],
    ['50', 'VT', 'VERMONT'],
    ['51', 'VA', 'VIRGINIA'],
    ['53', 'WA', 'WASHINGTON'],
    ['54', 'WV', 'WEST_VIRGINIA'],
    ['55', 'WI', 'WISCONSIN'],
    ['56', 'WY', 'WYOMING']
]

WGS84 = arcpy.SpatialReference(4326)

WEBMERCATOR = arcpy.SpatialReference(3857)

# --------------------------------------------------------------------------------------------------

def get_state_abb_from_state_fips(input_fips):

    if not len(input_fips) in [1,2]:
        return None

    if len(input_fips) == 1:
        input_fips = '0' + input_fips

    return_value = 'XX'

    for state_data in STATES_DATA:
        if state_data[0] == input_fips:
           return_value = state_data[1]

    return return_value

# --------------------------------------------------------------------------------------------------

def del_if_exists(layer):

    if arcpy.Exists(layer):
        arcpy.Delete_management(layer)

# --------------------------------------------------------------------------------------------------

def remap_fars_race(row):

    if row['RACE'] == 1:
        return 'FTL_WHITE'
    elif row['RACE'] == 2:
        return 'FTL_BLACK'
    elif row['RACE'] == 3:
        return 'FTL_AMER_INDIAN'
    elif row['RACE'] == 99:
        return 'FTL_UNK_RACE'
    else:
        return "FTL_OTHER_RACE"

# --------------------------------------------------------------------------------------------------

def remap_fars_pertyp(row):

    if row['PER_TYP'] in [1, 2]:
        return 'FTL_MV_IN_TRANSPORT'
    elif row['PER_TYP'] == 5:
        return 'FTL_PEDESTRIAN'
    elif row['PER_TYP'] == 6:
        return 'FTL_BICYCLIST'
    else:
        return 'FTL_OTHER_PER_TYPE'

# --------------------------------------------------------------------------------------------------

def make_fars_layer():

    print('\nMaking FARS layer ...')

    del_if_exists("FARS_tmp1")
    arcpy.CreateFeatureclass_management(
        arcpy.env.workspace, "FARS_tmp1", "POINT", "", "", "", arcpy.SpatialReference("WGS 1984")
        )

    arcpy.AddField_management("FARS_tmp1", 'STATE_ABB', "TEXT", "", "", 2)
    arcpy.AddField_management("FARS_tmp1", 'COUNTY', "TEXT", "", "", 50)
    arcpy.AddField_management("FARS_tmp1", 'CITY', "TEXT", "", "", 50)
    arcpy.AddField_management("FARS_tmp1", 'TWAY_ID', "TEXT", "", "", 30)
    arcpy.AddField_management("FARS_tmp1", 'TWAY_ID2', "TEXT", "", "", 30)

    arcpy.AddField_management("FARS_tmp1", "ST_CASE", "TEXT", "", "", 6)
    arcpy.AddField_management("FARS_tmp1", "YEAR", 'short')
    arcpy.AddField_management("FARS_tmp1", "MONTH", 'short')
    arcpy.AddField_management("FARS_tmp1", "DAY_WEEK", 'short')

    arcpy.AddField_management("FARS_tmp1", 'FATALS', 'Short')

    arcpy.AddField_management("FARS_tmp1", "FTL_AMER_INDIAN", 'short')
    arcpy.AddField_management("FARS_tmp1", "FTL_BLACK", 'short')
    arcpy.AddField_management("FARS_tmp1", "FTL_OTHER_RACE", 'short')
    arcpy.AddField_management("FARS_tmp1", "FTL_UNK_RACE", 'short')
    arcpy.AddField_management("FARS_tmp1", "FTL_WHITE", 'short')
    arcpy.AddField_management("FARS_tmp1", "FTL_BICYCLIST", 'short')
    arcpy.AddField_management("FARS_tmp1", "FTL_MV_IN_TRANSPORT", 'short')
    arcpy.AddField_management("FARS_tmp1", "FTL_OTHER_PER_TYPE", 'short')
    arcpy.AddField_management("FARS_tmp1", "FTL_PEDESTRIAN", 'short')
    arcpy.AddField_management("FARS_tmp1", "LOCATION_OVERRIDE", 'short')

    insert_cursor_flds = ["SHAPE@XY", 'STATE_ABB', 'COUNTY', 'CITY', 'TWAY_ID', 'TWAY_ID2',
        "ST_CASE", "YEAR", "MONTH", "DAY_WEEK", 'FATALS', "FTL_AMER_INDIAN",
        "FTL_BLACK", "FTL_OTHER_RACE", "FTL_UNK_RACE", "FTL_WHITE", "FTL_BICYCLIST",
        "FTL_MV_IN_TRANSPORT", "FTL_OTHER_PER_TYPE", "FTL_PEDESTRIAN", "LOCATION_OVERRIDE"
    ]

    icursor = arcpy.da.InsertCursor("FARS_tmp1", insert_cursor_flds)

    # reading in volpe fars fixes.  this is about 50 lat long updates to move crashes that
    # were falling in the wrong state
    # ------------------------------------------------------------------------------------

    fp_to_fars_fixes = os.path.join(input_dir, 'fars', FARS_FIXES)
    df_lat_long_fixes = pd.read_csv(fp_to_fars_fixes, delimiter=',', low_memory=False)

    lat_long_fixes_dict = {}

    for index, row in df_lat_long_fixes.iterrows():
        lat_long_fixes_dict[(row['ST_CASE'], row['YEAR'])] = (row['LATITUDE'], row['LONGITUDE'])

    # ------------------------------------------------------------------------------------
    for year in range(2017, 2022):
    #for year in [2019]:

        print('\tprocessing {} ...'.format(year))

        # READ THE PERSON DATA
        # --------------------

        fp_to_person_data = os.path.join(input_dir, 'fars', 'FARS{}NationalCSV'.format(year), 'Person.CSV')

        # use st_case to merge to accident (one to many)
        # use st_case and veh_no to merge to vehicle level data (including parkwork)
        # use st_Case and per_no to merge with non-motorist person level data files

        if year >= 2019:
            person_cols = ['ST_CASE', 'VEH_NO', 'PER_NO', 'PER_TYP', 'DEATH_YR']
        else:
            person_cols = ['ST_CASE', 'VEH_NO', 'PER_NO', 'PER_TYP', 'DEATH_YR', 'RACE']

        df_person = pd.read_csv( fp_to_person_data, delimiter=',', low_memory=False,
                usecols=person_cols, encoding = "ISO-8859-1")

        df_person = df_person[df_person.DEATH_YR != 8888] # remove not fatals

        # the following leaves out the DEATH_YR col which was used above to remove non-fatals
        if year >= 2019:
            df_person = df_person[['ST_CASE', 'VEH_NO', 'PER_NO', 'PER_TYP']]
        else:
            df_person = df_person[['ST_CASE', 'VEH_NO', 'PER_NO', 'PER_TYP', 'RACE']]


        #print("\tperson df length = {}".format(len(df_person)))

        # READ THE RACE DATA FOR 2019 AND BEYOND
        # --------------------------------------

        if year >= 2019:

            fp_to_race_data = os.path.join(input_dir, 'fars', 'FARS{}NationalCSV'.format(year), 'Race.CSV')

            use_cols = ['ST_CASE', 'VEH_NO', 'PER_NO', 'RACE', 'ORDER', 'MULTRACE']

            df_race = pd.read_csv(fp_to_race_data, delimiter=',', low_memory=False, usecols=use_cols,
                    encoding = "ISO-8859-1")

            df_race = df_race[df_race.RACE != 0] # remove non fatals
            df_race = df_race[df_race.ORDER == 1] # take first race for backward compatability

            # no longer need multrace and order fields
            df_race = df_race[['ST_CASE', 'VEH_NO', 'PER_NO', 'RACE']]

            #print("\trace df length = {}".format(len(df_race)))

            # now join it back to person data
            # -------------------------------
            df_person = df_person.merge(
                    df_race,
                    how='left',
                    left_on=['ST_CASE', 'VEH_NO', 'PER_NO'],
                    right_on=['ST_CASE', 'VEH_NO', 'PER_NO']
            )

        #df_person = df_person.loc[df_person['ST_CASE'].between(250000, 259999, inclusive=True)]

        # NOW THAT YOU HAVE A CONSISTENT DF WITH RACE ACROSS YEARS, SUMMARIZE BY RACE AND BY PERSON TYPE
        # ----------------------------------------------------------------------------------------------

        # remap and pivot/summarize race
        df_person['RACE_TEXT'] = df_person.apply(lambda row: remap_fars_race(row), axis=1)
        df_race_summary = df_person[['ST_CASE', 'RACE_TEXT']].pivot_table(
                index='ST_CASE', columns='RACE_TEXT', aggfunc=len, fill_value=0)

        # remap and pivot/summarize person types
        df_person['PER_TYP_TEXT'] = df_person.apply(lambda row: remap_fars_pertyp(row), axis=1)
        df_per_typ_summary = df_person[['ST_CASE', 'PER_TYP_TEXT']].pivot_table(
            index='ST_CASE', columns='PER_TYP_TEXT', aggfunc=len, fill_value=0)

        # READ THE ACCIDENT DATA
        # ------------------------------------------------------------------------------------------

        fp_to_accident_data = os.path.join(
                input_dir, 'fars', 'FARS{}NationalCSV'.format(year), 'accident.CSV')

        if year >= 2016:  # this should now always be the case given we are running 2017 on

            accident_cols = ['STATE', 'COUNTYNAME', 'CITYNAME', 'TWAY_ID', 'TWAY_ID2', 'ST_CASE',
                    'YEAR', 'MONTH', 'DAY_WEEK', 'FATALS', 'LATITUDE', 'LONGITUD']

            df_accident = pd.read_csv(fp_to_accident_data, delimiter=',', low_memory=False,
                    usecols=accident_cols, encoding = "ISO-8859-1", dtype={'STATE':'str'})

            df_accident = df_accident.rename(columns={"COUNTYNAME": "COUNTY", "CITYNAME": "CITY"})
        else:

            accident_cols = ['STATE', 'COUNTY', 'CITY', 'TWAY_ID', 'TWAY_ID2', 'ST_CASE', 'YEAR',
                    'MONTH', 'DAY_WEEK', 'FATALS', 'LATITUDE', 'LONGITUD']

            df_accident = pd.read_csv(fp_to_accident_data, delimiter=',', low_memory=False,
                    usecols=accident_cols, encoding="ISO-8859-1", dtype={'STATE':'str'})


        # this will remove all the 777, 888, and 999's (unknown loc)
        df_accident = df_accident[df_accident.LONGITUD < 180]

        # merge on the race and person type summaries
        # -------------------------------------------

        df_race_merged = pd.merge(df_accident, df_race_summary, how='left', on=['ST_CASE'])
        df_race_merged = pd.merge(df_race_merged, df_per_typ_summary, how='left', on=['ST_CASE'])


        fars_dict = {}

        for index, row in df_race_merged.iterrows():

            key = (row['ST_CASE'], row['YEAR'])

            fars_dict[key] = [
                row['LATITUDE'],
                row['LONGITUD'],
                row['STATE'],
                row['COUNTY'],
                row['CITY'],
                row['TWAY_ID'],
                row['TWAY_ID2'],
                row['MONTH'],
                row['DAY_WEEK'],
                row['FATALS'],
                row['FTL_AMER_INDIAN'],
                row['FTL_BLACK'],
                row['FTL_OTHER_RACE'],
                row['FTL_UNK_RACE'],
                row['FTL_WHITE'],
                row['FTL_BICYCLIST'],
                row['FTL_MV_IN_TRANSPORT'],
                row['FTL_OTHER_PER_TYPE'],
                row['FTL_PEDESTRIAN']
            ]


        # NOTE: COMMENT OUT THE FOLLOWING TO NOT APPLY OVERRIDES
        # update the fars_dict with the lat_long_fixes_dict where there are entries
        for k, v in fars_dict.items():
            if k in lat_long_fixes_dict:
                fars_dict[k][0] = lat_long_fixes_dict[k][0]
                fars_dict[k][1] = lat_long_fixes_dict[k][1]


        # create layer
        #--------------------------------------------------------------------------------------------

        for k, v in fars_dict.items():

            state_case, year = k

            lat_long_override = 0
            if k in lat_long_fixes_dict:
                lat_long_override = 1

            latitude, longitude, state, county, city, tway_id, tway_id2, month, day_week, \
            fatals, ftl_amer_indian, ftl_black, ftl_other_race, ftl_unk_race, ftl_white, \
            ftl_bicyclist, ftl_mv_in_transport, ftl_other_per_type, ftl_pedestrian = v

            icursor.insertRow([
                (longitude, latitude),
                get_state_abb_from_state_fips(state),
                county,
                city,
                tway_id,
                tway_id2,
                state_case,
                year, month, day_week,
                fatals, ftl_amer_indian, ftl_black, ftl_other_race, ftl_unk_race, ftl_white,
                ftl_bicyclist, ftl_mv_in_transport, ftl_other_per_type, ftl_pedestrian, lat_long_override
            ])

    del icursor


    print('\tprojecting ...')
    arcpy.Project_management("FARS_tmp1", "FARS_2017_to_2021", WEBMERCATOR)

    del_if_exists("FARS_tmp1")


# --------------------------------------------------------------------------------------------------


def reinit_geodatabase():

    print('\nInitializing the geodatabase ...')

    if arcpy.Exists(fp_to_gdb):
        print('\tdeleting existing gdb ...')
        arcpy.Delete_management(fp_to_gdb)
        time.sleep(.5)

    arcpy.CreateFileGDB_management(output_dir, gdb_name)

# --------------------------------------------------------------------------------------------------

if __name__ == "__main__":

    os.system('cls')

    input_dir = os.path.join(BASE_DIR, 'input')
    output_dir = os.path.join(BASE_DIR, 'output')
    gdb_name = 'fars.gdb'.format(VERSION)
    fp_to_gdb = os.path.join(output_dir, gdb_name)

    reinit_geodatabase()

    arcpy.env.workspace = fp_to_gdb
    arcpy.env.overwriteOutput = True

    make_fars_layer()


    print('\ndone')

