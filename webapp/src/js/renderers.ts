import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer'

// Use this site to choose colors, making value 1.0 the neutral color
// https://www.learnui.design/tools/data-color-picker.html#divergent
let noiseEquityStops = [
    { value: 0.8, color: '#4d4d4d' }, // grey
    { value: 0.9, color: '#989898' },
    { value: 1.0, color: '#ebebeb' },
    { value: 1.1, color: '#eac4a7' },
    { value: 1.2, color: '#e19f65' },
    { value: 1.4, color: '#d17a1d' } // orange
]

let airEquityStops = [
    { value: 0.8, color: '#4d4d4d' }, // grey
    { value: 0.9, color: '#989898' },
    { value: 1.0, color: '#ebebeb' },
    { value: 1.1, color: '#b9c5e0' },
    { value: 1.2, color: '#83a0d5' },
    { value: 1.4, color: '#3e7dc9' } // blue
]

let acsStops = [
    { value: 0.2, color: '#f2f0f7' }, // pale purple
    { value: 0.4, color: '#cbc9e2' },
    { value: 0.6, color: '#9e9ac8' },
    { value: 0.8, color: '#756bb1' },
    { value: 1.0, color: '#54278f' } // dark purple
]

let simpleLineSymbol = {
    type: 'simple-line',
    color: [80, 80, 80, 0.3],
    width: 0.1,
    style: 'solid'
}

let dottedLineSymbol = {
    type: 'simple-fill',
    outline: { color: [0, 0, 0, 1], width: 0.5, style: 'dash' }
}

export let farsRender = {
    type: 'simple',
    symbol: {
        type: 'simple-marker',
        size: 6,
        color: 'purple',
        outline: { width: 0.5, color: 'black' }
    }
}

export let urbanRender = {
    type: 'simple',
    symbol: {
        type: 'simple-fill',
        color: [119, 119, 119, 1.0],
        outline: { width: 0, color: 'white' }
    }
}

export let noiseRenderer = {
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

export let airRenderer = {
    type: 'unique-value',
    field: 'bin_dl',
    defaultSymbol: {
        type: 'simple-line',
        color: '#00CCFF',
        width: 1,
        style: 'solid'
    },
    uniqueValueInfos: [
        {
            value: '1',
            symbol: { type: 'simple-line', color: '#bfdfff', width: 0.5, style: 'solid' }
        },
        {
            value: '2',
            symbol: { type: 'simple-line', color: '#a0c2e2', width: 1, style: 'solid' }
        },
        {
            value: '3',
            symbol: { type: 'simple-line', color: '#83a6c6', width: 2, style: 'solid' }
        },
        {
            value: '4',
            symbol: { type: 'simple-line', color: '#658baa', width: 4, style: 'solid' }
        },
        {
            value: '5',
            symbol: { type: 'simple-line', color: '#48708f', width: 7, style: 'solid' }
        },
        {
            value: '6',
            symbol: { type: 'simple-line', color: '#2a5775', width: 11, style: 'solid' }
        },
        {
            value: '7',
            symbol: { type: 'simple-line', color: '#003f5c', width: 15, style: 'solid' }
        }
    ]
}

// ACS Renderers

export let acsRendererNonWhite = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'nonwhite',
            stops: acsStops
        } as __esri.VisualVariableProperties
    ] 
} as __esri.SimpleRendererProperties)

export let acsRendererWhite =  new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'white',
            stops: acsStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let acsRendererBlack = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'black',
            stops: acsStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let acsRendererAsian = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'asian',
            stops: acsStops
        } as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let acsRendererNative = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'native',
            stops: acsStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let acsRendererPacific = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'pacific',
            stops: acsStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let acsRendererOther = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'other',
            stops: acsStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let acsRendererNonPoverty = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'nonpoverty',
            stops: acsStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let acsRendererPoverty = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'poverty',
            stops: acsStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

// Equity Renderers
export let noiseEquityRendererNonWhite = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'nonwhite_n',
            stops: noiseEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererNonWhite = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'nonwhite_n',
            stops: airEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererWhite = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'white_ndp',
            stops: noiseEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererWhite = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'white_ndp',
            stops: airEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererBlack = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'black_ndp',
            stops: noiseEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererBlack = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'black_ndp',
            stops: airEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererAsian = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'asian_ndp',
            stops: noiseEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererAsian = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'asian_ndp',
            stops: airEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererNative = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'native_ndp',
            stops: noiseEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererNative = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'native_ndp',
            stops: airEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererPacific = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'pacific_nd',
            stops: noiseEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererPacific = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'pacific_nd',
            stops: airEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererOther = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'other_ndp',
            stops: noiseEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererOther = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'other_ndp',
            stops: airEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererNonPoverty = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'nonpoverty',
            stops: noiseEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererNonPoverty = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'nonpoverty',
            stops: airEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererPoverty = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'poverty_nd',
            stops: noiseEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererPoverty = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'poverty_nd',
            stops: airEquityStops
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)