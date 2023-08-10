# FHWA-ECAT WEBAPP

# Requirements

Make sure your computer has Node.js installed. Free download is available at https://nodejs.org

# Running the Application

## Step 1

Upon cloning the repository, run `npm install` in the command line, making sure you are in the root folder of the webapp in the repository.

For example, if the repository is in `FHWA-ECAT`, make sure you are in `FHWA-ECAT/webapp` when running commands

## Step 2

Acquire an API Key to access this project's layers by either generating one through Esri, or 
requesting one from your organization leaders

## Step 3

create a new file in `webapp/` called `.env.local` and give it the following contents (note the double quotes and the capitalization):

```
VITE_API_KEY="<app_api_key_here>"
```

## Step 4

run `npm run dev` in the command line, making sure you are in the root folder of the webapp in the repository.

# Naming Conventions in the Codebase

The right shell panel, which contains the filters, uses the following conventions:
- calcite panels are named `{shortLayerName}-fltr-panel`
    - for example: `tracts-fltr-panel`
- Blocks under a panel are named `{shortLayerName}-filter-block-{block_name}` 
    - for example: `tracts-fltr-block-microtypes`
- Select control (checkboxes, sliders) are named `{shortLayerName}-fltr-sel-{uniqueGroupName}-{type.*}`
- Each filter select (i.e. `filtr-sel`) has 5 elements when split by "-"
    - for example: `tracts-fltr-sel-microtypes-cb1` or `tracts-fltr-sel-raceblack-slider`