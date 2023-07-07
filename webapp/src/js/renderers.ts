import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer'

let simpleLineSymbol = {
    type: 'simple-line',
    color: [80, 80, 80, 0.3],
    width: 0.1,
    style: 'solid'
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
            symbol: { type: 'simple-line', color: '#95CCEB', width: 0.5, style: 'solid' }
        },
        {
            value: '2',
            symbol: { type: 'simple-line', color: '#6395B2', width: 1, style: 'solid' }
        },
        {
            value: '3',
            symbol: { type: 'simple-line', color: '#497995', width: 2, style: 'solid' }
        },
        {
            value: '4',
            symbol: { type: 'simple-line', color: '#43697F', width: 4, style: 'solid' }
        },
        {
            value: '5',
            symbol: { type: 'simple-line', color: '#3B5573', width: 7, style: 'solid' }
        },
        {
            value: '6',
            symbol: { type: 'simple-line', color: '#2E3B57', width: 11, style: 'solid' }
        },
        {
            value: '7',
            symbol: { type: 'simple-line', color: '#2B3146', width: 15, style: 'solid' }
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
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
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
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
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
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
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
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
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
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
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
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
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
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
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
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
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
            stops: [
                { value: 0.2, color: '#f2f0f7' },
                { value: 0.4, color: '#cbc9e2' },
                { value: 0.6, color: '#9e9ac8' },
                { value: 0.8, color: '#756bb1' },
                { value: 1.0, color: '#54278f' }
            ]
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

// Equity Renderers

export let equityRendererNonWhite = new SimpleRenderer({
    // type: 'simple',
    symbol: {
        type: 'simple-fill',
        outline: { color: [0, 0, 0, 1], width: 0.5, style: 'dash' }
    } as __esri.SymbolProperties,
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
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let equityRendererWhite = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
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
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let equityRendererBlack = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
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
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let equityRendererAsian = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
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
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let equityRendererNative = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
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
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let equityRendererPacific = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
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
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let equityRendererOther = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
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
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let equityRendererNonPoverty = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
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
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let equityRendererPoverty = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
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
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)
