import FeatureLayer from '../../node_modules/@arcgis/core/layers/FeatureLayer'
import ImageryLayer from '../../node_modules/@arcgis/core/layers/ImageryLayer'

// ################################################################
// #REGION: POPUP TEMPLATE CREATION

function noisePopupTemplateTitleFunction(feature) {
    return 'Noise Damage'
}
function airPopupTemplateTitleFunction(feature) {
    return 'Air Damage'
}

function damagePopupTemplateContentFunction(feature) {
    let dmgDescrip

    switch (feature.graphic.attributes.F_SYSTEM) {
        case 1:
            dmgDescrip = '1 (Interstate)'
            break
        case 2:
            dmgDescrip = '2 (Principal Arterial, Other Freewys and Expressways)'
            break
        case 3:
            dmgDescrip = '3 (Principal Arterial, Other)'
            break
        case 4:
            dmgDescrip = '4 (Minor Arterial)'
            break
        case 5:
            dmgDescrip = '5 (Major Collector)'
            break
        case 6:
            dmgDescrip = '6 (Minor Collector)'
            break
        case 7:
            dmgDescrip = '7 (Local)'
            break
        default:
            dmgDescrip = 'unknown fuction class'
    }

    const div = document.createElement('div')

    div.innerHTML =
        '<ul>' +
        '<li>State <b>' +
        feature.graphic.attributes.STATE_ABB +
        '</b></li>' +
        '<li>Route Number <b>' +
        feature.graphic.attributes.ROUTE_NUMB +
        '</b></li>' +
        '<li>Functional Class <b>' +
        dmgDescrip +
        '</b></li>' +
        '<li>Dmg Bin <b>' +
        feature.graphic.attributes.bin_dl +
        '</b></li>' +
        '</ul>'

    return div
}

let noisePopupTemplate = {
    title: noisePopupTemplateTitleFunction,
    content: damagePopupTemplateContentFunction,
    fieldInfos: [
        { fieldName: 'STATE_CODE' },
        { fieldName: 'STATE_ABB' },
        { fieldName: 'ROUTE_NUMB' },
        { fieldName: 'F_SYSTEM' },
        { fieldName: 'FACILITY_T' },
        { fieldName: 'bin_dl' }
    ]
}

let airPopupTemplate = {
    title: airPopupTemplateTitleFunction,
    content: damagePopupTemplateContentFunction,
    fieldInfos: [
        { fieldName: 'STATE_CODE' },
        { fieldName: 'STATE_ABB' },
        { fieldName: 'ROUTE_NUMB' },
        { fieldName: 'F_SYSTEM' },
        { fieldName: 'FACILITY_T' },
        { fieldName: 'bin_dl' }
    ]
}

// equityLayer
let noiseEquityPopupTemplate = {
    title: 'Noise Equity',
    overwriteActions: true,
    content: [
        {
            type: 'fields',
            fieldInfos: [
                { fieldName: 'STATE_ABB', label: 'State' },
                { fieldName: 'name', label: 'County' },
                { fieldName: 'GEOID', label: 'County FIPS' },
                {
                    fieldName: 'nonwhite_n',
                    label: 'Noise Equity Ratio: Nonwhite',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'white_ndp',
                    label: 'Noise Equity Ratio: White',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'black_ndp',
                    label: 'Noise Equity Ratio: Black',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'asian_ndp',
                    label: 'Noise Equity Ratio: Asian',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'native_ndp',
                    label: 'Noise Equity Ratio: Native',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'pacific_nd',
                    label: 'Noise Equity Ratio: Pacific',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'other_ndp',
                    label: 'Noise Equity Ratio: Other',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'poverty_nd',
                    label: 'Noise Equity Ratio: Poverty',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'nonpoverty',
                    label: 'Noise Equity Ratio: Nonpoverty',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'nonwhite_d',
                    label: 'Noise Damage Cost: Nonwhite',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'white_dmg',
                    label: 'Noise Damage Cost: White',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'black_dmg',
                    label: 'Noise Damage Cost: Black',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'asian_dmg',
                    label: 'Noise Damage Cost: Asian',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'native_dmg',
                    label: 'Noise Damage Cost: Native',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'pacific_dm',
                    label: 'Noise Damage Cost: Pacific',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'other_dmg',
                    label: 'Noise Damage Cost: Other',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'poverty_dm',
                    label: 'Noise Damage Cost: Poverty',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'nonpover_1',
                    label: 'Noise Damage Cost: Nonpoverty',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'nonwhite_p',
                    label: 'Population: Nonwhite',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'white_pop',
                    label: 'Population: White',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'black_pop',
                    label: 'Population: Black',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'asian_pop',
                    label: 'Population: Asian',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'native_pop',
                    label: 'Population: Native',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'pacific_po',
                    label: 'Population: Pacific',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'other_pop',
                    label: 'Population: Other',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'poverty_po',
                    label: 'Population: Poverty',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'nonpover_2',
                    label: 'Population: Nonpoverty',
                    format: { digitSeparator: true, places: 0 }
                }
            ]
        }
    ]
}

let airEquityPopupTemplate = {
    title: 'Air Equity',
    overwriteActions: true,
    content: [
        {
            type: 'fields',
            fieldInfos: [
                { fieldName: 'STATE_ABB', label: 'State' },
                { fieldName: 'name', label: 'County' },
                { fieldName: 'GEOID', label: 'County FIPS' },
                {
                    fieldName: 'nonwhite_n',
                    label: 'Air Equity Ratio: Nonwhite',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'white_ndp',
                    label: 'Air Equity Ratio: White',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'black_ndp',
                    label: 'Air Equity Ratio: Black',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'asian_ndp',
                    label: 'Air Equity Ratio: Asian',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'native_ndp',
                    label: 'Air Equity Ratio: Native',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'pacific_nd',
                    label: 'Air Equity Ratio: Pacific',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'other_ndp',
                    label: 'Air Equity Ratio: Other',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'poverty_nd',
                    label: 'Air Equity Ratio: Poverty',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'nonpoverty',
                    label: 'Air Equity Ratio: Nonpoverty',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'nonwhite_d',
                    label: 'Air Damage Cost: Nonwhite',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'white_dmg',
                    label: 'Air Damage Cost: White',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'black_dmg',
                    label: 'Air Damage Cost: Black',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'asian_dmg',
                    label: 'Air Damage Cost: Asian',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'native_dmg',
                    label: 'Air Damage Cost: Native',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'pacific_dm',
                    label: 'Air Damage Cost: Pacific',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'other_dmg',
                    label: 'Air Damage Cost: Other',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'poverty_dm',
                    label: 'Air Damage Cost: Poverty',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'nonpover_1',
                    label: 'Air Damage Cost: Nonpoverty',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'nonwhite_p',
                    label: 'Population: Nonwhite',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'white_pop',
                    label: 'Population: White',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'black_pop',
                    label: 'Population: Black',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'asian_pop',
                    label: 'Population: Asian',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'native_pop',
                    label: 'Population: Native',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'pacific_po',
                    label: 'Population: Pacific',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'other_pop',
                    label: 'Population: Other',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'poverty_po',
                    label: 'Population: Poverty',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'nonpover_2',
                    label: 'Population: Nonpoverty',
                    format: { digitSeparator: true, places: 0 }
                }
            ]
        }
    ]
}

// acsLayer
let acsPopupTemplate = {
    title: 'ACS Population Counts',
    overwriteActions: true,
    content: [
        {
            type: 'fields',
            fieldInfos: [
                { fieldName: 'STATE_ABB', label: 'State' },
                { fieldName: 'COUNTYFP', label: 'County FIPS' },
                { fieldName: 'TRACTCE', label: 'Census Tract FIPS' },
                { fieldName: 'GEOID', label: 'Census Block Group FIPS' },
                {
                    fieldName: 'population',
                    label: 'Total Population',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'nonwhite',
                    label: 'Nonwhite % Population',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'white',
                    label: 'White % Population',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'black',
                    label: 'Black % Population',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'asian',
                    label: 'Asian % Population',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'native',
                    label: 'Native % Population',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'pacific',
                    label: 'Pacific % Population',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'other',
                    label: 'Other % Population',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'poverty',
                    label: 'Poverty % Population',
                    format: { digitSeparator: true, places: 2 }
                },
                {
                    fieldName: 'nonpoverty',
                    label: 'Nonpoverty % Population',
                    format: { digitSeparator: true, places: 2 }
                }
            ]
        }
    ]
}

// #ENDREGION

// ################################################################
// #REGION: RENDERER CREATION

export let simpleLineSymbol = {
    type: 'simple-line',
    color: [80, 80, 80, 0.3],
    width: 0.1,
    style: 'solid'
}

let farsRender = {
    type: 'simple',
    symbol: {
        type: 'simple-marker',
        size: 6,
        color: 'purple',
        outline: { width: 0.5, color: 'black' }
    }
}

let urbanRender = {
    type: 'simple',
    symbol: {
        type: 'simple-fill',
        color: [119, 119, 119, 1.0],
        outline: { width: 0, color: 'white' }
    }
}

let noiseRenderer = {
    type: 'unique-value',
    field: 'bin_dl',
    defaultSymbol: {
        type: 'simple-line',
        color: '#ffa200',
        width: 1,
        style: 'solid'
    },
    uniqueValueInfos: [
        {
            value: '1',
            symbol: { type: 'simple-line', color: '#fdd0a2', width: 0.5, style: 'solid' }
        },
        {
            value: '2',
            symbol: { type: 'simple-line', color: '#fdae6b', width: 1, style: 'solid' }
        },
        {
            value: '3',
            symbol: { type: 'simple-line', color: '#fd8d3c', width: 2, style: 'solid' }
        },
        {
            value: '4',
            symbol: { type: 'simple-line', color: '#f16913', width: 4, style: 'solid' }
        },
        {
            value: '5',
            symbol: { type: 'simple-line', color: '#d94801', width: 7, style: 'solid' }
        },
        {
            value: '6',
            symbol: { type: 'simple-line', color: '#a63603', width: 11, style: 'solid' }
        },
        {
            value: '7',
            symbol: { type: 'simple-line', color: '#7f2704', width: 15, style: 'solid' }
        }
    ]
}

// ACS Renderers

export let acsRendererNonWhite = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'nonwhite',
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }
    ]
}

export let acsRendererWhite = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'white',
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }
    ]
}

export let acsRendererBlack = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'black',
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }
    ]
}

export let acsRendererAsian = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'asian',
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }
    ]
}

export let acsRendererNative = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'native',
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }
    ]
}

export let acsRendererPacific = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'pacific',
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }
    ]
}

export let acsRendererOther = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'other',
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }
    ]
}

export let acsRendererNonPoverty = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'nonpoverty',
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }
    ]
}

export let acsRendererPoverty = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'poverty',
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }
    ]
}

// Equity Renderers

export let equityRendererNonWhite = {
    type: 'simple',
    symbol: {
        type: 'simple-fill',
        outline: { color: [0, 0, 0, 1], width: 0.5, style: 'dash' }
    },
    visualVariables: [
        {
            type: 'color',
            field: 'nonwhite_n',
            stops: [
                { value: 0.8, color: '#546b85' },
                { value: 0.9, color: '#bbc3bf' },
                { value: 1.0, color: '#fffee6' },
                { value: 1.1, color: '#e5c4ab' },
                { value: 1.2, color: '#bf6c52' },
                { value: 1.4, color: '#a53217' }
            ]
        }
    ]
}

export let equityRendererWhite = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'white_ndp',
            stops: [
                { value: 0.8, color: '#546b85' },
                { value: 0.9, color: '#bbc3bf' },
                { value: 1.0, color: '#fffee6' },
                { value: 1.1, color: '#e5c4ab' },
                { value: 1.2, color: '#bf6c52' },
                { value: 1.4, color: '#a53217' }
            ]
        }
    ]
}

export let equityRendererBlack = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'black_ndp',
            stops: [
                { value: 0.8, color: '#546b85' },
                { value: 0.9, color: '#bbc3bf' },
                { value: 1.0, color: '#fffee6' },
                { value: 1.1, color: '#e5c4ab' },
                { value: 1.2, color: '#bf6c52' },
                { value: 1.4, color: '#a53217' }
            ]
        }
    ]
}

export let equityRendererAsian = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'asian_ndp',
            stops: [
                { value: 0.8, color: '#546b85' },
                { value: 0.9, color: '#bbc3bf' },
                { value: 1.0, color: '#fffee6' },
                { value: 1.1, color: '#e5c4ab' },
                { value: 1.2, color: '#bf6c52' },
                { value: 1.4, color: '#a53217' }
            ]
        }
    ]
}

export let equityRendererNative = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'native_ndp',
            stops: [
                { value: 0.8, color: '#546b85' },
                { value: 0.9, color: '#bbc3bf' },
                { value: 1.0, color: '#fffee6' },
                { value: 1.1, color: '#e5c4ab' },
                { value: 1.2, color: '#bf6c52' },
                { value: 1.4, color: '#a53217' }
            ]
        }
    ]
}

export let equityRendererPacific = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'pacific_nd',
            stops: [
                { value: 0.8, color: '#546b85' },
                { value: 0.9, color: '#bbc3bf' },
                { value: 1.0, color: '#fffee6' },
                { value: 1.1, color: '#e5c4ab' },
                { value: 1.2, color: '#bf6c52' },
                { value: 1.4, color: '#a53217' }
            ]
        }
    ]
}

export let equityRendererOther = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'other_ndp',
            stops: [
                { value: 0.8, color: '#546b85' },
                { value: 0.9, color: '#bbc3bf' },
                { value: 1.0, color: '#fffee6' },
                { value: 1.1, color: '#e5c4ab' },
                { value: 1.2, color: '#bf6c52' },
                { value: 1.4, color: '#a53217' }
            ]
        }
    ]
}

export let equityRendererNonPoverty = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'nonpoverty',
            stops: [
                { value: 0.8, color: '#546b85' },
                { value: 0.9, color: '#bbc3bf' },
                { value: 1.0, color: '#fffee6' },
                { value: 1.1, color: '#e5c4ab' },
                { value: 1.2, color: '#bf6c52' },
                { value: 1.4, color: '#a53217' }
            ]
        }
    ]
}

export let equityRendererPoverty = {
    type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol },
    visualVariables: [
        {
            type: 'color',
            field: 'poverty_nd',
            stops: [
                { value: 0.8, color: '#546b85' },
                { value: 0.9, color: '#bbc3bf' },
                { value: 1.0, color: '#fffee6' },
                { value: 1.1, color: '#e5c4ab' },
                { value: 1.2, color: '#bf6c52' },
                { value: 1.4, color: '#a53217' }
            ]
        }
    ]
}

// #ENDREGION

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
    renderer: noiseRenderer,
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