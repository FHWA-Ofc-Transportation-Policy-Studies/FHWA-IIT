import FeatureLayer from '../../node_modules/@arcgis/core/layers/FeatureLayer'
import ImageryLayer from '../../node_modules/@arcgis/core/layers/ImageryLayer'
import {
    noisePopupTemplate,
    airPopupTemplate,
    noiseEquityPopupTemplate,
    airEquityPopupTemplate,
    acsPopupTemplate
} from './popups.js'

import {
    farsRender,
    noiseRenderer,
    airRenderer,
    equityRendererNonWhite,
    acsRendererNonWhite,
    urbanRender
} from './renderers.js'

// ################################################################
// #REGION: LAYER CREATION

export const statesLayer = new FeatureLayer({
    title: 'States',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/TTET_States_vb1p1/FeatureServer/0',
    outFields: ['stusps', 'statefp', 'sq_miles_land', 'sq_miles_water'],
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
    renderer: farsRender,
    //definitionExpression: "fatals = 2",
    featureReduction: farsClusterConfig,
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

export const noiseDamageLayer = new FeatureLayer({
    title: 'Noise Damage',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_noise_dmg_bin_reduced_simplified_00005/FeatureServer/0',
    visible: true,
    outFields: ['*'],
    renderer: noiseRenderer,
    popupTemplate: noisePopupTemplate
    //definitionExpression: "fclass = 1"
})

export const airDamageLayer = new FeatureLayer({
    title: 'Air Damage',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_air_dmg/FeatureServer',
    visible: true,
    outFields: ['*'],
    renderer: airRenderer,
    popupTemplate: airPopupTemplate
    //definitionExpression: "fclass = 1"
})

export const noiseEquityLayer = new FeatureLayer({
    title: 'Noise Equity',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_noise_dmg_equity_county/FeatureServer',
    visible: true,
    outFields: ['*'],
    renderer: equityRendererNonWhite,
    popupTemplate: noiseEquityPopupTemplate
    //definitionExpression: "fclass = 1"
})

export const airEquityLayer = new FeatureLayer({
    title: 'Air Equity',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_air_dmg_equity_county/FeatureServer',
    visible: true,
    outFields: ['*'],
    renderer: equityRendererNonWhite,
    popupTemplate: airEquityPopupTemplate
    //definitionExpression: "fclass = 1"
})

export const acsLayer = new FeatureLayer({
    title: 'ACS Population',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_ACS_pop_2019/FeatureServer',
    visible: false,
    outFields: ['*'],
    renderer: acsRendererNonWhite,
    popupTemplate: acsPopupTemplate,
    definitionExpression: 'population > 0'
})

export const urbanLayer = new FeatureLayer({
    title: 'Adjusted Urban Area Boundaries',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/TTET_Adj_Urban_Bndry_vb1p1/FeatureServer/0',
    visible: false,
    outFields: ['GEOID', 'SQ_MILES', 'REGION_ID'],
    renderer: urbanRender
})
urbanLayer.opacity = 0.75

export const landcoverLayer = new ImageryLayer({
    title: 'Land Cover',
    url: 'https://landscape10.arcgis.com/arcgis/rest/services/USA_NLCD_Land_Cover/ImageServer',
    format: 'jpgpng', // server exports in either jpg or png format
    visible: false
})

// # ENDREGION
