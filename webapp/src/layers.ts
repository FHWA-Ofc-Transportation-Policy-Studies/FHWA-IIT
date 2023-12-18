import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import ImageryLayer from '@arcgis/core/layers/ImageryLayer'
import {
    noisePopupTemplate,
    airPopupTemplate,
    noiseEquityPopupTemplate,
    airEquityPopupTemplate,
    acsPopupTemplate
} from './popups'

import {
    farsRender,
    noiseRenderer,
    airRenderer,
    noiseEquityRendererNonWhite,
    airEquityRendererNonWhite,
    acsRendererNonWhite,
    urbanRender,
    universityRenderer,
} from './renderers'

// ################################################################
// #REGION: LAYER CREATION

export const statesLayer = new FeatureLayer({
    title: 'States',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/TTET_States_vb1p1/FeatureServer/0',
    outFields: ['STUSPS', 'statefp', 'sq_miles_land', 'sq_miles_water'],
    visible: true
})

const farsClusterConfig = {
    type: 'cluster',
    clusterRadius: '100px',
    // {cluster_count} is an aggregate field containing
    // the number of features comprised by the cluster
    popupTemplate: {
        title: 'Cluster summary',
        content: 'This cluster represents {cluster_count} fatal crashes.',
        fieldInfos: [
            {
                fieldName: 'cluster_count',
                format: { places: 0, digitSeparator: true }
            }
        ]
    },
    clusterMinSize: '24px',
    clusterMaxSize: '55px',
    labelingInfo: [
        {
            deconflictionStrategy: 'none',
            labelExpressionInfo: {
                expression: "Text($feature.cluster_count, '#,###')"
            },
            symbol: {
                type: 'text',
                color: 'black',
                font: { weight: 'bold', family: 'Noto Sans', size: '12px' }
            },
            labelPlacement: 'center-center'
        }
    ]
}

export const farsLayer = new FeatureLayer({
    title: 'FARS (number of crashes)',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/TTET_FARS_vb1p1/FeatureServer',
    visible: false,
    outFields: ['*'],
    renderer: farsRender as __esri.RendererProperties,
    //definitionExpression: "fatals = 2",
    featureReduction: farsClusterConfig as __esri.FeatureReductionBinningProperties & { type: "binning"; },
    popupTemplate: {
        title: 'Fatal Crash ',
        content: [
            {
                type: 'fields',
                fieldInfos: [
                    { fieldName: 'fatals', label: 'Fatalities' },
                    { fieldName: 'year', label: 'Year' },
                    { fieldName: 'st_case', label: 'Unique Crash ID' }
                ]
            }
        ]
    }
})

export const noiseCostLayer = new FeatureLayer({
    title: 'Noise Cost',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_noise_dmg_bin_reduced_simplified_00005/FeatureServer/0',
    visible: true,
    outFields: ['*'],
    renderer: noiseRenderer as __esri.RendererProperties,
    popupTemplate: noisePopupTemplate
    //definitionExpression: "fclass = 1"
})

export const airCostLayer = new FeatureLayer({
    title: 'Air Cost',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_air_dmg/FeatureServer',
    visible: false,
    outFields: ['*'],
    renderer: airRenderer as __esri.RendererProperties,
    popupTemplate: airPopupTemplate
    //definitionExpression: "fclass = 1"
})

export const noiseEquityLayer = new FeatureLayer({
    title: 'Noise Equity',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_noise_dmg_equity_county/FeatureServer',
    visible: true,
    outFields: ['*'],
    renderer: noiseEquityRendererNonWhite as __esri.RendererProperties,
    popupTemplate: noiseEquityPopupTemplate
    //definitionExpression: "fclass = 1"
})

export const airEquityLayer = new FeatureLayer({
    title: 'Air Equity',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_air_dmg_equity_county/FeatureServer',
    visible: false,
    outFields: ['*'],
    renderer: airEquityRendererNonWhite as __esri.RendererProperties,
    popupTemplate: airEquityPopupTemplate
    //definitionExpression: "fclass = 1"
})

export const acsLayer = new FeatureLayer({
    title: 'ACS Population',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_ACS_pop_2019/FeatureServer',
    visible: false,
    outFields: ['*'],
    renderer: acsRendererNonWhite as __esri.RendererProperties,
    popupTemplate: acsPopupTemplate,
    definitionExpression: 'population > 0'
})

export const urbanLayer = new FeatureLayer({
    title: 'Adjusted Urban Area Boundaries',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/TTET_Adj_Urban_Bndry_vb1p1/FeatureServer/0',
    visible: false,
    outFields: ['GEOID', 'SQ_MILES', 'REGION_ID'],
    renderer: urbanRender as __esri.RendererProperties
})
urbanLayer.opacity = 0.75

export const landcoverLayer = new ImageryLayer({
    title: 'Land Cover',
    url: 'https://landscape10.arcgis.com/arcgis/rest/services/USA_NLCD_Land_Cover/ImageServer',
    format: 'jpgpng', // server exports in either jpg or png format
    visible: false
})

export const publicSchoolsLayer = new FeatureLayer({
    title: 'Public Schools',
    url: 'https://services1.arcgis.com/Ua5sjt3LWTPigjyD/arcgis/rest/services/Public_School_Location_201819/FeatureServer',
    visible: false,
    outFields: ['*'],
    popupTemplate: {
        title: 'Public School',
        content: [
            {
                type: 'fields',
                fieldInfos: [
                    { fieldName: 'NAME', label: 'Name of Public School' },
                ]
            }
        ]
    }
})

export const universitiesLayer = new FeatureLayer({
    title: 'Universities',
    url: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/Colleges_and_Universities_View/FeatureServer',
    visible: false,
    outFields: ['*'],
    renderer: universityRenderer as __esri.RendererProperties,
    popupTemplate: {
        title: 'University',
        content: [
            {
                type: 'fields',
                fieldInfos: [
                    { fieldName: 'NAME', label: 'Name of University' },
                    { fieldName: 'TOT_ENROLL', label: 'Total Enrollment' },
                ]
            }
        ]
    }
})

export const redliningLayer = new FeatureLayer({
    title: 'Redlined Neighborhoods',
    url: 'https://services.arcgis.com/ak2bo87wLfUpMrt1/arcgis/rest/services/HOLC_Redlining_Polygons_v1/FeatureServer',
    visible: false,
    outFields: ['*'],
    popupTemplate: {
        title: 'Redlined Neighborhood',
        content: [
            {
                type: 'fields',
                fieldInfos: [
                    { fieldName: 'holc_grade', label: 'HOLC Grade' },
                ]
            }
        ]
    }
})
// # ENDREGION
