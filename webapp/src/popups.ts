function noisePopupTemplateTitleFunction(feature: any) {
    return 'Noise Cost'
}

function airPopupTemplateTitleFunction(feature: any) {
    return 'Air Cost'
}

function costPopupTemplateContentFunction(feature: any) {
    let costDescrip
    let costBin

    switch (feature.graphic.attributes.F_SYSTEM) {
        case 1:
            costDescrip = '1 (Interstate)'
            break
        case 2:
            costDescrip = '2 (Principal Arterial, Other Freeways and Expressways)'
            break
        case 3:
            costDescrip = '3 (Principal Arterial, Other)'
            break
        case 4:
            costDescrip = '4 (Minor Arterial)'
            break
        case 5:
            costDescrip = '5 (Major Collector)'
            break
        case 6:
            costDescrip = '6 (Minor Collector)'
            break
        case 7:
            costDescrip = '7 (Local)'
            break
        default:
            costDescrip = 'unknown fuction class'
    }

    switch (feature.graphic.attributes.bin_dl) {
        case 1:
            costBin = '1 (<= $100)'
            break
        case 2:
            costBin = '2 ($100 < Cost <= $1,000)'
            break
        case 3:
            costBin = '3 ($1,000 < Cost <= $10,000)'
            break
        case 4:
            costBin = '4 ($10,000 < Cost <= $100,000)'
            break
        case 5:
            costBin = '5 ($100,000 < Cost <= $500,000)'
            break
        case 6:
            costBin = '6 ($500,000 < Cost <= $1,000,000)'
            break
        case 7:
            costBin = '7 (>= $1,000,000)'
            break
        default:
            costBin = 'unknown cost bin'
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
        costDescrip +
        '</b></li>' +
        '<li>Cost Bin <b>' +
        costBin +
        '</b></li>' +
        '</ul>'

    return div
}

export let noisePopupTemplate = {
    title: noisePopupTemplateTitleFunction,
    content: costPopupTemplateContentFunction,
    fieldInfos: [
        { fieldName: 'STATE_CODE' },
        { fieldName: 'STATE_ABB' },
        { fieldName: 'ROUTE_NUMB' },
        { fieldName: 'F_SYSTEM' },
        { fieldName: 'FACILITY_T' },
        { fieldName: 'bin_dl' }
    ]
}

export let airPopupTemplate = {
    title: airPopupTemplateTitleFunction,
    content: costPopupTemplateContentFunction,
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
export let noiseEquityPopupTemplate = {
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
                    label: 'Noise Cost: Nonwhite',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'white_dmg',
                    label: 'Noise Cost: White',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'black_dmg',
                    label: 'Noise Cost: Black',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'asian_dmg',
                    label: 'Noise Cost: Asian',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'native_dmg',
                    label: 'Noise Cost: Native',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'pacific_dm',
                    label: 'Noise Cost: Pacific',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'other_dmg',
                    label: 'Noise Cost: Other',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'poverty_dm',
                    label: 'Noise Cost: Poverty',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'nonpover_1',
                    label: 'Noise Cost: Nonpoverty',
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

export let airEquityPopupTemplate = {
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
                    label: 'Air Cost: Nonwhite',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'white_dmg',
                    label: 'Air Cost: White',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'black_dmg',
                    label: 'Air Cost: Black',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'asian_dmg',
                    label: 'Air Cost: Asian',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'native_dmg',
                    label: 'Air Cost: Native',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'pacific_dm',
                    label: 'Air Cost: Pacific',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'other_dmg',
                    label: 'Air Cost: Other',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'poverty_dm',
                    label: 'Air Cost: Poverty',
                    format: { digitSeparator: true, places: 0 }
                },
                {
                    fieldName: 'nonpover_1',
                    label: 'Air Cost: Nonpoverty',
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
export let acsPopupTemplate = {
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
