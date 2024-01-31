import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer'
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol'
//import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js"


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
    { value: 0.35, color: '#cbc9e2' },
    { value: 0.5, color: '#9e9ac8' },
    { value: 0.65, color: '#756bb1' },
    { value: 0.8, color: '#54278f' } // dark purple
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

let universityMarkerSymbol = new CIMSymbol({
    data: {
        type: "CIMSymbolReference",
        symbol: {
            type: "CIMPointSymbol",
            symbolLayers: [
            {
                type: "CIMVectorMarker",
                enable: true,
                anchorPointUnits: "Relative",
                dominantSizeAxis3D: "Y",
                size: 10,
                billboardMode3D: "FaceNearPlane",
                frame: {
                xmin: 0,
                ymin: 0,
                xmax: 21,
                ymax: 21
                },
                markerGraphics: [
                {
                    type: "CIMMarkerGraphic",
                    geometry: {
                    rings: [
                        [
                        [
                            11,
                            16
                        ],
                        [
                            11,
                            14
                        ],
                        [
                            17,
                            14
                        ],
                        [
                            17,
                            4
                        ],
                        [
                            18,
                            4
                        ],
                        [
                            18,
                            3
                        ],
                        [
                            3,
                            3
                        ],
                        [
                            3,
                            4
                        ],
                        [
                            4,
                            4
                        ],
                        [
                            4,
                            14
                        ],
                        [
                            10,
                            14
                        ],
                        [
                            10,
                            19
                        ],
                        [
                            11,
                            19
                        ],
                        [
                            14,
                            17.5
                        ],
                        [
                            11,
                            16
                        ]
                        ],
                        [
                        [
                            13,
                            12
                        ],
                        [
                            13,
                            10
                        ],
                        [
                            16,
                            10
                        ],
                        [
                            16,
                            12
                        ],
                        [
                            13,
                            12
                        ]
                        ],
                        [
                        [
                            12,
                            10
                        ],
                        [
                            12,
                            12
                        ],
                        [
                            9,
                            12
                        ],
                        [
                            9,
                            10
                        ],
                        [
                            12,
                            10
                        ]
                        ],
                        [
                        [
                            8,
                            10
                        ],
                        [
                            8,
                            12
                        ],
                        [
                            5,
                            12
                        ],
                        [
                            5,
                            10
                        ],
                        [
                            8,
                            10
                        ]
                        ],
                        [
                        [
                            13,
                            8
                        ],
                        [
                            13,
                            6
                        ],
                        [
                            16,
                            6
                        ],
                        [
                            16,
                            8
                        ],
                        [
                            13,
                            8
                        ]
                        ],
                        [
                        [
                            12,
                            6
                        ],
                        [
                            12,
                            8
                        ],
                        [
                            9,
                            8
                        ],
                        [
                            9,
                            6
                        ],
                        [
                            12,
                            6
                        ]
                        ],
                        [
                        [
                            8,
                            6
                        ],
                        [
                            8,
                            8
                        ],
                        [
                            5,
                            8
                        ],
                        [
                            5,
                            6
                        ],
                        [
                            8,
                            6
                        ]
                        ]
                    ]
                    },
                    symbol: {
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                        {
                        type: "CIMSolidStroke",
                        enable: true,
                        capStyle: "Round",
                        joinStyle: "Round",
                        lineStyle3D: "Strip",
                        miterLimit: 10,
                        width: 0,
                        color: [
                            0,
                            0,
                            0,
                            255
                        ]
                        },
                        {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [
                            189,
                            15,
                            15,
                            255
                        ]
                        }
                    ]
                    }
                }
                ],
                scaleSymbolsProportionally: true,
                respectFrame: true,
                colorLocked: false
            },
            {
                type: "CIMVectorMarker",
                enable: true,
                anchorPoint: {
                x: 0,
                y: 0
                },
                anchorPointUnits: "Relative",
                dominantSizeAxis3D: "Y",
                size: 12,
                billboardMode3D: "FaceNearPlane",
                frame: {
                xmin: 0,
                ymin: 0,
                xmax: 17,
                ymax: 17
                },
                markerGraphics: [
                {
                    type: "CIMMarkerGraphic",
                    geometry: {
                    rings: [
                        [
                        [
                            8.5,
                            0
                        ],
                        [
                            7.02,
                            0.13
                        ],
                        [
                            5.59,
                            0.51
                        ],
                        [
                            4.25,
                            1.14
                        ],
                        [
                            3.04,
                            1.99
                        ],
                        [
                            1.99,
                            3.04
                        ],
                        [
                            1.14,
                            4.25
                        ],
                        [
                            0.51,
                            5.59
                        ],
                        [
                            0.13,
                            7.02
                        ],
                        [
                            0,
                            8.5
                        ],
                        [
                            0.13,
                            9.98
                        ],
                        [
                            0.51,
                            11.41
                        ],
                        [
                            1.14,
                            12.75
                        ],
                        [
                            1.99,
                            13.96
                        ],
                        [
                            3.04,
                            15.01
                        ],
                        [
                            4.25,
                            15.86
                        ],
                        [
                            5.59,
                            16.49
                        ],
                        [
                            7.02,
                            16.87
                        ],
                        [
                            8.5,
                            17
                        ],
                        [
                            9.98,
                            16.87
                        ],
                        [
                            11.41,
                            16.49
                        ],
                        [
                            12.75,
                            15.86
                        ],
                        [
                            13.96,
                            15.01
                        ],
                        [
                            15.01,
                            13.96
                        ],
                        [
                            15.86,
                            12.75
                        ],
                        [
                            16.49,
                            11.41
                        ],
                        [
                            16.87,
                            9.98
                        ],
                        [
                            17,
                            8.5
                        ],
                        [
                            16.87,
                            7.02
                        ],
                        [
                            16.49,
                            5.59
                        ],
                        [
                            15.86,
                            4.25
                        ],
                        [
                            15.01,
                            3.04
                        ],
                        [
                            13.96,
                            1.99
                        ],
                        [
                            12.75,
                            1.14
                        ],
                        [
                            11.41,
                            0.51
                        ],
                        [
                            9.98,
                            0.13
                        ],
                        [
                            8.5,
                            0
                        ]
                        ]
                    ]
                    },
                    symbol: {
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                        {
                        type: "CIMSolidStroke",
                        enable: true,
                        capStyle: "Round",
                        joinStyle: "Round",
                        lineStyle3D: "Strip",
                        miterLimit: 10,
                        width: 1,
                        color: [
                            221,
                            218,
                            218,
                            255
                        ]
                        },
                        {
                        type: "CIMSolidFill",
                        enable: true,
                        color: [
                            255,
                            255,
                            255,
                            255
                        ]
                        }
                    ]
                    }
                }
                ],
                scaleSymbolsProportionally: true,
                respectFrame: true,
                colorLocked: true
            }
            ]
        }
    }
})

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
    field: 'bin_cl',
    defaultSymbol: {
        type: 'simple-line',
        color: '#ffa200',
        width: 1,
        style: 'solid'
    },
    uniqueValueInfos: [
        {
            value: '7',
            symbol: { type: 'simple-line', color: '#7f2704', width: 15, style: 'solid' }
        },
        {
            value: '6',
            symbol: { type: 'simple-line', color: '#a63603', width: 11, style: 'solid' }
        },
        {
            value: '5',
            symbol: { type: 'simple-line', color: '#d94801', width: 7, style: 'solid' }
        },
        {
            value: '4',
            symbol: { type: 'simple-line', color: '#f16913', width: 4, style: 'solid' }
        },
        {
            value: '3',
            symbol: { type: 'simple-line', color: '#fd8d3c', width: 2, style: 'solid' }
        },
        {
            value: '2',
            symbol: { type: 'simple-line', color: '#fdae6b', width: 1, style: 'solid' }
        },
        {
            value: '1',
            symbol: { type: 'simple-line', color: '#fdd0a2', width: 0.5, style: 'solid' }
        }  
    ]
}
noiseRenderer.orderByClassesEnabled = true;

export let airRenderer = {
    type: 'unique-value',
    field: 'bin_cl',
    defaultSymbol: {
        type: 'simple-line',
        color: '#00CCFF',
        width: 1,
        style: 'solid'
    },
    uniqueValueInfos: [
        {
            value: '7',
            symbol: { type: 'simple-line', color: '#003f5c', width: 15, style: 'solid' }
        },
        {
            value: '6',
            symbol: { type: 'simple-line', color: '#2a5775', width: 11, style: 'solid' }
        },
        {
            value: '5',
            symbol: { type: 'simple-line', color: '#48708f', width: 7, style: 'solid' }
        },
        {
            value: '4',
            symbol: { type: 'simple-line', color: '#658baa', width: 4, style: 'solid' }
        },
        {
            value: '3',
            symbol: { type: 'simple-line', color: '#83a6c6', width: 2, style: 'solid' }
        },
        {
            value: '2',
            symbol: { type: 'simple-line', color: '#a0c2e2', width: 1, style: 'solid' }
        },
        {
            value: '1',
            symbol: { type: 'simple-line', color: '#bfdfff', width: 0.5, style: 'solid' }
        }
    ]
}
airRenderer.orderByClassesEnabled = true;

// ACS Renderers

export let acsRendererNonWhite = new SimpleRenderer({
    // type: 'simple',
    symbol: { type: 'simple-fill', outline: simpleLineSymbol } as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'nonwhite',
            stops: acsStops,
            legendOptions: { title: "% Population Nonwhite" }
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
            stops: acsStops,
            legendOptions: { title: "% Population White" }
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
            stops: acsStops,
            legendOptions: { title: "% Population Black" }
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
            stops: acsStops,
            legendOptions: { title: "% Population Asian" }
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
            stops: acsStops,
            legendOptions: { title: "% Population Native" }
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
            stops: acsStops,
            legendOptions: { title: "% Population Pacific" }
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
            stops: acsStops,
            legendOptions: { title: "% Population Other" }
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
            stops: acsStops,
            legendOptions: { title: "% Population Nonpoverty" }
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
            stops: acsStops,
            legendOptions: { title: "% Population Poverty" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

// Equity Renderers
export let noiseEquityRendererNonWhite = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'nonwhite_e',
            stops: noiseEquityStops,
            legendOptions: { title: "Noise Equity Ratio - Nonwhite" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererNonWhite = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'nonwhite_e',
            stops: airEquityStops,
            legendOptions: { title: "Air Equity Ratio - Nonwhite" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererWhite = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'white_eqr',
            stops: noiseEquityStops,
            legendOptions: { title: "Noise Equity Ratio - White" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererWhite = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'white_eqr',
            stops: airEquityStops,
            legendOptions: { title: "Air Equity Ratio - White" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererBlack = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'black_eqr',
            stops: noiseEquityStops,
            legendOptions: { title: "Noise Equity Ratio - Black" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererBlack = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'black_eqr',
            stops: airEquityStops,
            legendOptions: { title: "Air Equity Ratio - Black" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererAsian = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'asian_eqr',
            stops: noiseEquityStops,
            legendOptions: { title: "Noise Equity Ratio - Asian" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererAsian = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'asian_eqr',
            stops: airEquityStops,
            legendOptions: { title: "Air Equity Ratio - Asian" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererNative = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'native_eqr',
            stops: noiseEquityStops,
            legendOptions: { title: "Noise Equity Ratio - Native" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererNative = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'native_eqr',
            stops: airEquityStops,
            legendOptions: { title: "Air Equity Ratio - Native" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererPacific = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'pacific_eq',
            stops: noiseEquityStops,
            legendOptions: { title: "Noise Equity Ratio - Pacific" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererPacific = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'pacific_eq',
            stops: airEquityStops,
            legendOptions: { title: "Air Equity Ratio - Pacific" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererOther = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'other_eqr',
            stops: noiseEquityStops,
            legendOptions: { title: "Noise Equity Ratio - Other" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererOther = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'other_eqr',
            stops: airEquityStops,
            legendOptions: { title: "Air Equity Ratio - Other" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererNonPoverty = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'npvrty_eqr',
            stops: noiseEquityStops,
            legendOptions: { title: "Noise Equity Ratio - Nonpoverty" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererNonPoverty = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'npvrty_eqr',
            stops: airEquityStops,
            legendOptions: { title: "Air Equity Ratio - Nonpoverty" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let noiseEquityRendererPoverty = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'poverty_eq',
            stops: noiseEquityStops,
            legendOptions: { title: "Noise Equity Ratio - Poverty" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let airEquityRendererPoverty = new SimpleRenderer({
    symbol: dottedLineSymbol as __esri.SymbolProperties,
    visualVariables: [
        {
            type: 'color',
            field: 'poverty_eq',
            stops: airEquityStops,
            legendOptions: { title: "Air Equity Ratio - Poverty" }
        }  as __esri.VisualVariableProperties
    ]
} as __esri.SimpleRendererProperties)

export let schoolsRenderer = new SimpleRenderer({} as __esri.SimpleRendererProperties)

export let universityRenderer = new SimpleRenderer({
    symbol: universityMarkerSymbol,
} as __esri.SimpleRendererProperties)