# FHWA-ECAT MODEL

## Setting up the Python environment

with the Conda environment already installed, at the command prompt type:


    conda env create -f ECAT_Conda_env.yml

once the environment is created, activate the environment by typeing:

    activate ecat_env


## Necessary Input Data

ACS
HPMS 
Dispersion gradient curve (from AERMOD output)
Emission rates for vehicles (from MOVES)
Health incidence elasticity, baseline, monetization rate (from COBRA user manual)
States Data (name, FIPS, UTM)


## Folder and File Structure
root
----Input_Data
--------ACS_2019
------------ACS_2019_5YR_BG_33_NEW_HAMPSHIRE.gdb
------------...
--------state_shp_2016_simplified
------------NewHampshire.shp
------------...
--------State_median_housing_values.csv
--------FIPS_names.csv
--------concentrations_ex.csv
--------States_Data.txt
----Output_Data
--------state_shp_air_cost


## Running ECAT

    python equity_of_highway_emissions.py


## Resulting Output Data

state_air_dmg.shp  (for each state run)
Equity_long_air.csv
Equity_county_air.csv
Equity_census_air.csv



