// ========================================================
//                     Region: Imports
// ========================================================
import esriConfig from '../../node_modules/@arcgis/core/config'
import Basemap from '../../node_modules/@arcgis/core/Basemap'
import BasemapGallery from '../../node_modules/@arcgis/core/widgets/BasemapGallery'
import Map from '../../node_modules/@arcgis/core/Map'
import MapView from '../../node_modules/@arcgis/core/views/MapView'
import LayerList from '../../node_modules/@arcgis/core/widgets/LayerList'
import Search from '../../node_modules/@arcgis/core/widgets/Search'
import Legend from '../../node_modules/@arcgis/core/widgets/Legend'
import Slider from '../../node_modules/@arcgis/core/widgets/Slider'
import * as promiseUtils from '../../node_modules/@arcgis/core/core/promiseUtils'
import * as reactiveUtils from '../../node_modules/@arcgis/core/core/reactiveUtils'
import * as webMercatorUtils from '../../node_modules/@arcgis/core/geometry/support/webMercatorUtils'

import apiKey from '../config/apiKey.json'
import settings from '../config/settings.json'
import {
    farsLayer,
    damageLayer,
    equityLayer,
    // airDamageLayer,
    // airEquityLayer,
    acsLayer,
    statesLayer,
    urbanLayer,
    landcoverLayer,
    simpleLineSymbol,
    acsRendererNonWhite,
    acsRendererWhite,
    acsRendererBlack,
    acsRendererAsian,
    acsRendererNative,
    acsRendererPacific,
    acsRendererOther,
    acsRendererNonPoverty,
    acsRendererPoverty,
    equityRendererNonWhite,
    equityRendererWhite,
    equityRendererBlack,
    equityRendererAsian,
    equityRendererNative,
    equityRendererPacific,
    equityRendererOther,
    equityRendererNonPoverty,
    equityRendererPoverty
} from './layers'

//#endregion

// ========================================================
//                Region: Global Variables
// ========================================================

esriConfig.apiKey = apiKey.esriApiKey

export let activeActionId = null

// used by reset to set everyting back to how it was at startup
let defaultCheckBoxState = {}
let defaultSliderState = {}
let defaultLayerVisibility = {}

let layerList
// layerviews (in most cases)
let farsLayerView
let damageLayerView
let equityLayerView
let airDamageLayerView
let airEquityLayerView
let acsLayerView
let statesLayerView
let urbanLayerView

// for dc
const defaultZoomLevel = 10
const defaultCenterPoint = [-76.84, 39.121]

// for testing
// const defaultZoomLevel = 13
// const defaultCenterPoint = [-100.518, 33.835]

// for 48 states
//const defaultZoomLevel = 5
//const defaultCenterPoint = [-96.5, 38]

// work around based on https://community.esri.com/t5/arcgis-api-for-javascript/performance-issue-with-layer-list/m-p/259583
let arrListItemCreated = []

// view related events are verbose
let updatesRelatedToUpdatedViewComplete = false

let streetViewCursorText

//#endregion

// ========================================================
//                   Region: CORE SETUP
// ========================================================

function setUpMap() {
    // top in this list will be on the bottom
    const map = new Map({
        basemap: 'osm',
        layers: [
            landcoverLayer,
            urbanLayer,
            acsLayer,
            equityLayer,
            damageLayer,
            // airDamageLayer,
            // airEquityLayer,
            statesLayer,
            farsLayer
        ]
    })

    const view = new MapView({
        container: 'viewDiv',
        map: map,
        center: defaultCenterPoint,
        zoom: defaultZoomLevel
    })

    view.ui.move('zoom', 'bottom-right')

    return view
}

function onViewReady(view) {
    // while controled by layerview updates, this needs to be here when we start out
    document.getElementById('updating_spinner').style.display = 'block'

    //console.log("view constraints are", view.contraints)

    //console.log("map is set up, view is ready");

    //document.getElementById('updating_spinner').style.display = 'block'

    // now that the view is all set, store the visibility so the initial visability can be restored
    view.map.allLayers.forEach((l) => {
        // console.log('layer', l)
        defaultLayerVisibility[l.title] = l.visible
    })

    // this all only gets called the first time.
    let whenLayerViewsCreatedPromises = Promise.all([
        view.whenLayerView(farsLayer),
        view.whenLayerView(damageLayer),
        view.whenLayerView(equityLayer),
        // view.whenLayerView(airDamageLayer),
        // view.whenLayerView(airEquityLayer),
        view.whenLayerView(acsLayer),
        view.whenLayerView(statesLayer),
        view.whenLayerView(urbanLayer)
    ])

    let layerViewsDoneUpdatingPromise = whenLayerViewsCreatedPromises.then(
        ([
            tmpFarsLayerView,
            tmpDamageLayerView,
            tmpEquityLayerView,
            // tmpAirDamageLayerView,
            // tmpAirEquityLayerView,
            tmpAcsLayerView,
            tmpStatesLayerView,
            tmpUrbanLayerView
        ]) => {
            farsLayerView = tmpFarsLayerView
            damageLayerView = tmpDamageLayerView
            equityLayerView = tmpEquityLayerView
            // airDamageLayerView = tmpAirDamageLayerView
            // airEquityLayerView = tmpAirEquityLayerView
            acsLayerView = tmpAcsLayerView
            statesLayerView = tmpStatesLayerView
            urbanLayerView = tmpUrbanLayerView

            return Promise.all([
                reactiveUtils.whenOnce(() => !tmpFarsLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpDamageLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpEquityLayerView.updating),
                // reactiveUtils.whenOnce(() => !tmpAirDamageLayerView.updating),
                // reactiveUtils.whenOnce(() => !tmpAirEquityLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpAcsLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpStatesLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpUrbanLayerView.updating)

                // watchUtils.whenFalseOnce(tmpFarsLayerView, 'updating'),
                // watchUtils.whenFalseOnce(tmpDamageLayerView, 'updating'),
                // watchUtils.whenFalseOnce(tmpEquityLayerView, 'updating'),
                // watchUtils.whenFalseOnce(tmpAcsLayerView, 'updating'),
                // watchUtils.whenFalseOnce(tmpStatesLayerView, 'updating'),
                // watchUtils.whenFalseOnce(tmpUrbanLayerView, 'updating')
            ])
        }
    )

    // this is where most stuff gets set up and wired up once the layerviews are all set
    layerViewsDoneUpdatingPromise.then(() => {
        // these are layers that have a filter set to start
        // TODO, I think this may need to just be run for all the layers
        let layersToUpdateOnStartUp = ['fars', 'damage', 'equity', 'acs']
        layersToUpdateOnStartUp.forEach((layerToUpdateOnStartUp) => {
            updateFilterForStandardLayer(layerToUpdateOnStartUp)
        })

        initWidgets(view)

        initLeftActionBarEvents(view)

        // wire up the simple make summary buttons
        document.getElementById('simple-summary-btn').addEventListener('click', () => {
            onSimpleChartBtnClick(view)
        })

        // wire up filter events for "standard" layers
        filterSetup('fars')
        filterSetup('damage')
        filterSetup('equity')
        filterSetup('acs')
        // states is a bit special
        filterStatesSetup()

        // wire up streetview specific functionality
        view.on('click', function showCoordinates(evt) {
            let point = view.toMap({ x: evt.x, y: evt.y })
            let mp = webMercatorUtils.webMercatorToGeographic(point)
            //console.log(mp.y.toFixed(3), mp.x.toFixed(3) + ', zoom level ' + view.zoom) // lat lon
            if (activeActionId == 'streetview') {
                //let url = "https://maps.google.com?q=" + mp.y.toFixed(4) + "," + mp.x.toFixed(4)
                let url =
                    'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' +
                    mp.y.toFixed(4) +
                    ',' +
                    mp.x.toFixed(4)

                window.open(url, '_blank')

                // stree view is a one shot deal, set it to no longer be
                activeActionId = null
                document.querySelector('[data-action-id="streetview"]').active = false
                // TODO unselect button
            }
        })

        // set up custom cursor for stree view mode
        streetViewCursorText = document.createElement('div')
        streetViewCursorText.id = 'cursorText'
        streetViewCursorText.innerHTML = 'Click on a Road'
        streetViewCursorText.style.display = 'none'
        document.body.appendChild(streetViewCursorText)

        // handle street view mode cursor text
        view.on('pointer-move', function pointerMove(e) {
            if (activeActionId == 'streetview') {
                streetViewCursorText.style.left = e.x + 'px'
                streetViewCursorText.style.top = e.y + 'px'
                streetViewCursorText.style.display = 'block'
                view.popup.popupEnabled = false // no layer popups when in streetview mode
                //console.log(e.x, e.y);
            } else {
                streetViewCursorText.style.display = 'none'
                view.popup.popupEnabled = true
            }
        })

        view.on('pointer-leave', function pointerLeave(e) {
            streetViewCursorText.style.display = 'none'
        })

        // main code section related to view updating vs view done updating.
        reactiveUtils.watch(
            () => [
                view.stationary,
                statesLayerView.updating,
                farsLayerView.updating,
                damageLayerView.updating,
                equityLayerView.updating,
                // airDamageLayerView.updating,
                // airEquityLayerView.updating,
                acsLayerView.updating,
                urbanLayerView.updating
            ],
            ([stationary, statesU, farsU, noiseU, equityU, acsU, urbanU]) => {
                if (stationary && !statesU && !farsU && !noiseU && !equityU && !acsU && !urbanU) {
                    // no longer updating

                    if (!updatesRelatedToUpdatedViewComplete) {
                        //console.log('calling updates related to updated view')

                        document.getElementById('updating_spinner').style.display = 'none'

                        document.getElementById('simple-summary-btn').disabled = false

                        updatesRelatedToUpdatedViewComplete = true
                    }
                } else {
                    //console.log('updating view ...')
                    // updating

                    updatesRelatedToUpdatedViewComplete = false

                    document.getElementById('updating_spinner').style.display = 'block'

                    document.getElementById('simple-summary-btn').disabled = true

                    // if the simple summary is open
                    if (!document.querySelector("[data-panel-id='simpleChart']").hidden) {
                        document.getElementById('simple-summary-acs').innerHTML = '&nbsp;'
                        document.getElementById('simple-summary-farsfatals').innerHTML = '&nbsp;'
                        document.getElementById('simple-summary-damage').innerHTML = '&nbsp;'
                        document.getElementById('simple-summary-equity').innerHTML = '&nbsp;'

                        // $('#simple-summary-canvas-1').remove()
                        $('.simple-summary-canvas-container').html('')

                        // this event fires many times, only append this text once
                        var isEmpty = $('.simple-summary-canvas-container').html().trim() === ''
                        if (isEmpty) {
                            $('.simple-summary-canvas-container').append(
                                '<h3 style="font-weight:normal;padding: 0px; margin: 0px">A change has been made which has invalidated the summary statistics.  When ready please click the update button.</h3>'
                            )
                        }
                    }
                }
            }
        )

        // when the layers panel is dismissed collapse the expanded actions (I think only one layer
        // can have expanded actions but it's much cleaner to come back and have none expanded) as well
        // as it's transparency sliders
        document
            .querySelector("[data-panel-id='layers']")
            .addEventListener('calcitePanelDismissedChange', function (event) {
                if (event.target.dismissed === true) {
                    // console.log("layerlist in calcitepaneldismissedchange", layerList.operationalItems)
                    layerList.operationalItems.forEach((item) => {
                        item.actionsOpen = false
                        item.panel.open = false
                    })
                }
            })

        // what to do when the X in the upper right hand of the simple summary is pressed
        document
            .querySelector("[data-panel-id='simpleChart']")
            .addEventListener('calcitePanelDismissedChange', function (event) {
                if (event.target.dismissed === true) {
                    $('#simple-summary-canvas-1').remove()
                }
            })
    })
}

function initWidgets(view) {
    // LAYER LIST (note that widgets return promises)
    layerList = new LayerList({
        view,
        selectionEnabled: true,
        container: 'layers-container',
        listItemCreatedFunction: onLayerListItemCreated
    })

    // WHEN THE LAYER LIST IS READY
    layerList.when(function () {
        // console.log("just after creating layerlist", layerList.operationalItems)
        wireUpOnLayerVisibilityChanges()

        // DEFINE WHAT HAPPENS FOR A LAYERLIST ITEM WHEN FILTER OR TABLE IS CLICKED
        layerList.on('trigger-action', function (event) {
            event.item.actionsOpen = false

            if (event.action.id === 'filter') {
                // iterate through all filter panels and hide all others and show the one of interest
                document.querySelectorAll('[id$=fltr-panel]').forEach((node) => {
                    // if any filter panel is open close is
                    document.querySelectorAll('[id$=symbology-panel]').forEach((node) => {
                        node.hidden = true
                        node.dismissed = true
                    })

                    if (
                        node.id ==
                        getShortNameForLayerFromFullName(event.item.layer.title) + '-fltr-panel'
                    ) {
                        if (node.hidden === true) {
                            node.hidden = false
                            node.dismissed = false
                        } else {
                            node.hidden = true
                            node.dismissed = true
                        }
                    } else {
                        node.hidden = true
                        node.dismissed = true
                    }
                })
            } else if (event.action.id === 'symbology') {
                // if any filter panel is open close is
                document.querySelectorAll('[id$=fltr-panel]').forEach((node) => {
                    node.hidden = true
                    node.dismissed = true
                })

                // let node = document.getElementById("acs-symbology-panel")

                // if (node.hidden === true) {
                //     node.hidden = false
                //     node.dismissed = false
                // } else {
                //     node.hidden = true
                //     node.dismissed = true
                // }

                // iterate through all filter panels and hide all others and show the one of interest
                document.querySelectorAll('[id$=symbology-panel]').forEach((node) => {
                    if (
                        node.id ==
                        getShortNameForLayerFromFullName(event.item.layer.title) +
                            '-symbology-panel'
                    ) {
                        if (node.hidden === true) {
                            node.hidden = false
                            node.dismissed = false
                        } else {
                            node.hidden = true
                            node.dismissed = true
                        }
                    } else {
                        node.hidden = true
                        node.dismissed = true
                    }
                })
            }
        })
    })

    // BASEMAPS
    // https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html#basemap
    const basemaps = new BasemapGallery({
        view,
        source: [
            Basemap.fromId('osm'),
            Basemap.fromId('hybrid'),
            Basemap.fromId('satellite'),
            Basemap.fromId('gray-vector'),
            Basemap.fromId('dark-gray-vector'),
            Basemap.fromId('terrain')
        ],
        container: 'basemaps-container'
    })

    // LEGEND
    let legend = new Legend({
        view,
        container: 'legend-container',
        layerInfos: [
            { layer: landcoverLayer },
            { layer: farsLayer },
            { layer: damageLayer },
            { layer: equityLayer },
            // { layer: airDamageLayer },
            // { layer: airEquityLayer },
            { layer: acsLayer },
            { layer: urbanLayer }
        ]
    })

    // SEARCH
    // TODO search is not currently cleared out on reset
    let searchWidget = new Search({
        view: view,
        includeDefaultSources: false,
        locationEnabled: false,
        allPlaceholder: 'Find Locations',

        sources: [
            {
                name: 'Addresses and Places',
                url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
                countryCode: 'US',
                singleLineFieldName: 'SingleLine',
                categories: ['Address', 'Populated Place'],
                placeholder: 'Address or Place',
                suggestionsEnabled: true,
                maxResults: 10,
                maxSuggestions: 10,
                minSuggestCharacters: 4
            },
            {
                name: 'Coordinates', // whatever you want to call it
                url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
                countryCode: 'US',
                singleLineFieldName: 'SingleLine',
                placeholder: 'Longitude, Latitude',
                suggestionsEnabled: true,
                categories: ['LatLong']
            }
        ]
    })

    searchWidget.on('select-result', function (event) {
        view.goTo({ scale: 250000 })
    })

    view.ui.add(searchWidget, { position: 'bottom-right' })

    // WIRE UP FILTER RESET
    document.querySelectorAll('[id$=-fltr-reset]').forEach((node) => {
        node.addEventListener('click', function (event) {
            let shortLayerName = event.target.id.split('-')[0]

            //console.log("reseting filter for", shortLayerName)

            // return check boxes to deafult state
            let elements = document.getElementsByTagName('calcite-checkbox')

            for (let i = 0; i < elements.length; i++) {
                if (elements[i].id.startsWith(shortLayerName)) {
                    //console.log("setting back to default", elements[i].id)
                    elements[i].checked = defaultCheckBoxState[elements[i].id]
                }
            }

            // return sliders to default state
            elements = document.getElementsByTagName('calcite-slider')
            for (let i = 0; i < elements.length; i++) {
                elements[i].minValue = defaultSliderState[elements[i].id][0]
                elements[i].maxValue = defaultSliderState[elements[i].id][1]
            }

            decisionChange(shortLayerName)
        })
    })

    // WIRE UP SHOW FILTER
    document.querySelectorAll('[id$=-show-fltr]').forEach((node) => {
        node.addEventListener('click', function (event) {
            let filterModal = document.getElementById('show-fltr-modal')
            let filterModalTitle = document.getElementById('show-fltr-modal-title')
            let filterModalContent = document.getElementById('show-fltr-modal-content')

            let shortLayerName = event.target.id.split('-')[0]

            filterModalTitle.innerHTML = shortLayerName + ' filter'

            let theLayerView = eval(shortLayerName + 'LayerView')

            if (!theLayerView.filter.where) {
                filterModalContent.innerHTML = 'no filter defined, showing all features'
            } else {
                filterModalContent.innerHTML = theLayerView.filter.where
            }

            filterModal.active = true
        })
    })

    // WIRE UP SIMPLE SUMMARY INFO MODAL
    document.getElementById('simple-summary-info').addEventListener('click', function (e) {
        document.getElementById('simple-summary-info-modal').active = true
    })

    // WIRE UP GLOBL RESET ON CLICKING THE YES BUTTON
    document.getElementById('reset-all-modal-yes-btn').addEventListener('click', function (e) {
        document.getElementById('reset-all-modal').active = false

        // reset extent
        // ------------
        view.center = defaultCenterPoint
        view.zoom = defaultZoomLevel

        // reset layer visibility
        // ----------------------------
        view.map.allLayers.forEach((l) => {
            l.visible = defaultLayerVisibility[l.title]
        })

        // reset filters
        // -------------
        settings['layers']
            .map((a) => a.shortName)
            .forEach(function (shortLayerName) {
                // console.log("resetting filters for", shortLayerName)

                let elements

                /// return check boxes to default state
                elements = document.getElementsByTagName('calcite-checkbox')
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].id.startsWith(shortLayerName)) {
                        // console.log("setting back to default", elements[i].id)
                        elements[i].checked = defaultCheckBoxState[elements[i].id]
                    }
                }

                // return sliders to default state
                elements = document.getElementsByTagName('calcite-slider')
                // console.log("opacity slider elements to reset", elements)
                for (let i = 0; i < elements.length; i++) {
                    elements[i].minValue = defaultSliderState[elements[i].id][0]
                    elements[i].maxValue = defaultSliderState[elements[i].id][1]
                }

                decisionChange(shortLayerName)
            })

        // if a filter is open then close it too
        document.querySelectorAll('[id$=fltr-panel]').forEach((node) => {
            node.hidden = true
            node.dismissed = true
        })

        // reset layer opacity
        urbanLayer.opacity = 0.75

        // reset the initial basemap
        view.map.basemap = 'osm'
    })

    // WIRE UP GLOBAL RESET ON CLICKING THE NO BUTTON
    document.getElementById('reset-all-modal-no-btn').addEventListener('click', function (e) {
        document.getElementById('reset-all-modal').active = false
    })

    // WIRE UP ACS SYMBOLOGY EVENT
    document
        .getElementById('acs-symbology-select')
        .addEventListener('calciteSelectChange', function (event) {
            switch (event.target.value) {
                case 'acsRendererNonWhite':
                    acsLayer.renderer = acsRendererNonWhite
                    break
                case 'acsRendererWhite':
                    acsLayer.renderer = acsRendererWhite
                    break
                case 'acsRendererBlack':
                    acsLayer.renderer = acsRendererBlack
                    break
                case 'acsRendererAsian':
                    acsLayer.renderer = acsRendererAsian
                    break
                case 'acsRendererNative':
                    acsLayer.renderer = acsRendererNative
                    break
                case 'acsRendererPacific':
                    acsLayer.renderer = acsRendererPacific
                    break
                case 'acsRendererOther':
                    acsLayer.renderer = acsRendererOther
                    break
                case 'acsRendererNonPoverty':
                    acsLayer.renderer = acsRendererNonPoverty
                    break
                case 'acsRendererPoverty':
                    acsLayer.renderer = acsRendererPoverty
                    break
                default:
                    acsLayer.renderer = acsRendererNonWhite
            }
        })

    // WIRE UP EQUITY SYMBOLOGY EVENT
    document
        .getElementById('equity-symbology-select')
        .addEventListener('calciteSelectChange', function (event) {
            switch (event.target.value) {
                case 'equityRendererNonWhite':
                    equityLayer.renderer = equityRendererNonWhite
                    break
                case 'equityRendererWhite':
                    equityLayer.renderer = equityRendererWhite
                    break
                case 'equityRendererBlack':
                    equityLayer.renderer = equityRendererBlack
                    break
                case 'equityRendererAsian':
                    equityLayer.renderer = equityRendererAsian
                    break
                case 'equityRendererNative':
                    equityLayer.renderer = equityRendererNative
                    break
                case 'equityRendererPacific':
                    equityLayer.renderer = equityRendererPacific
                    break
                case 'equityRendererOther':
                    equityLayer.renderer = equityRendererOther
                    break
                case 'equityRendererNonPoverty':
                    equityLayer.renderer = equityRendererNonPoverty
                    break
                case 'equityRendererPoverty':
                    equityLayer.renderer = equityRendererPoverty
                    break
                default:
                    equityLayer.renderer = equityRendererNonWhite
            }
        })

    document.querySelectorAll('[id$=-fltr-panel]').forEach((node) => {
        node.addEventListener('calcitePanelClose', function (event) {
            let shortLayerName = event.target.id.split('-')[0]

            //console.log("calcite panel close on ", shortLayerName)
        })
    })
}

function onLayerListItemCreated(event) {
    
    // can access layer and layerview via event.layer and event.layerview

    // Fatality Analysis Reporting System (FARS)
    // -----------------------------------------------------------------
    if (event.item.title === 'FARS (number of crashes)') {
        const item = event.item

        const transparencySlider = new Slider({ min: 0, max: 1, precision: 2, values: [1] })

        transparencySlider.on('thumb-drag', (event) => {
            const { value } = event
            item.layer.opacity = value
        })

        item.panel = {
            content: transparencySlider,
            className: 'esri-icon-sliders-horizontal',
            title: 'Change layer transparency'
        }

        item.actionsSections = [[{ title: 'Filter', className: 'esri-icon-filter', id: 'filter' }]]
    }

    // Noise Damage
    // -----------------------------------------------------------------
    else if (event.item.title === 'Noise Damage') {
        const item = event.item

        const transparencySlider = new Slider({ min: 0, max: 1, precision: 2, values: [1] })

        transparencySlider.on('thumb-drag', (event) => {
            const { value } = event
            item.layer.opacity = value
        })

        item.panel = {
            content: transparencySlider,
            className: 'esri-icon-sliders-horizontal',
            title: 'Change layer transparency'
        }

        item.actionsSections = [[{ title: 'Filter', className: 'esri-icon-filter', id: 'filter' }]]
    }

    // Noise Equity
    // -----------------------------------------------------------------
    else if (event.item.title === 'Noise Equity') {
        const item = event.item

        const transparencySlider = new Slider({ min: 0, max: 1, precision: 2, values: [1] })

        transparencySlider.on('thumb-drag', (event) => {
            const { value } = event
            item.layer.opacity = value
        })

        item.panel = {
            content: transparencySlider,
            className: 'esri-icon-sliders-horizontal',
            title: 'Change layer transparency'
        }

        item.actionsSections = [
            [
                { title: 'Filter', className: 'esri-icon-filter', id: 'filter' },
                { title: 'Symbology', className: 'esri-icon-maps', id: 'symbology' }
            ]
        ]
    }

    // ACS Population
    // -----------------------------------------------------------------
    else if (event.item.title === 'ACS Population') {
        const item = event.item

        const transparencySlider = new Slider({ min: 0, max: 1, precision: 2, values: [1] })

        transparencySlider.on('thumb-drag', (event) => {
            const { value } = event
            item.layer.opacity = value
        })

        item.panel = {
            content: transparencySlider,
            className: 'esri-icon-sliders-horizontal',
            title: 'Change layer transparency'
        }

        // to change the symbol, choose from https://developers.arcgis.com/javascript/latest/esri-icon-font/
        item.actionsSections = [
            [
                { title: 'Filter', className: 'esri-icon-filter', id: 'filter' },
                { title: 'Symbology', className: 'esri-icon-maps', id: 'symbology' }
            ]
        ]
    }

    // States
    // -----------------------------------------------------------------
    else if (event.item.title === 'States') {
        const item = event.item

        const transparencySlider = new Slider({ min: 0, max: 1, precision: 2, values: [1] })

        transparencySlider.on('thumb-drag', (event) => {
            const { value } = event
            item.layer.opacity = value
        })

        item.panel = {
            content: transparencySlider,
            className: 'esri-icon-sliders-horizontal',
            title: 'Change layer transparency'
        }

        item.actionsSections = [[{ title: 'Filter', className: 'esri-icon-filter', id: 'filter' }]]
    }

    // Adjusted Urban Area Boundaries
    // -----------------------------------------------------------------
    else if (event.item.title === 'Adjusted Urban Area Boundaries') {
        const item = event.item

        const transparencySlider = new Slider({ min: 0, max: 1, precision: 2, values: [0.75] })

        transparencySlider.on('thumb-drag', (event) => {
            const { value } = event
            item.layer.opacity = value
        })

        item.panel = {
            content: transparencySlider,
            className: 'esri-icon-sliders-horizontal',
            title: 'Change layer transparency'
        }

        item.actionsSections = [[{ title: '', className: 'nonexistantclass', id: '' }]]
    }

    // Land Cover
    // -----------------------------------------------------------------
    else if (event.item.title === 'Land Cover') {
        const item = event.item

        const transparencySlider = new Slider({ min: 0, max: 1, precision: 2, values: [1] })

        transparencySlider.on('thumb-drag', (event) => {
            const { value } = event
            item.layer.opacity = value
        })

        item.panel = {
            content: transparencySlider,
            className: 'esri-icon-sliders-horizontal',
            title: 'Change layer transparency'
        }

        item.actionsSections = [[{ title: '', className: 'nonexistantclass', id: '' }]]
    }
}

function initLeftActionBarEvents(view) {
    // TODO - this needs to be cleaned up!

    // set up the events associated with the left action bar

    let allActions = ['home', 'layers', 'legend', 'basemaps', 'simpleChart', 'streetview']

    let complexActions = ['layers', 'legend', 'basemaps', 'simpleChart']

    // this is the function that is called when a left action bar button is clicked.
    function leftActionBarEvent(event) {
        // get the activeActionId (e.g. "layers")
        activeActionId = event.target.getAttribute('data-action-id')

        // if the table is open close it, otherwise the behaviour is weird (table resizes).
        //document.getElementById('table-shell').hidden = true

        // if any filter is open close it
        // commented out because it may be better to let left and right be open at same time
        // document.querySelectorAll('[id$=fltr-panel]').forEach((node) => {
        //         node.hidden = true
        //         node.dismissed = true
        // })

        // set all others to be left action bar actions to be inactive, for example you may have clicked
        // legend but were in streetview this will unhighlight the street view button.
        allActions.forEach((action) => {
            if (action != activeActionId) {
                document.querySelector('[data-action-id=' + action + ']').active = false
            }
        })

        if (activeActionId == 'home') {
            // if any of the other panels are open then close them (this could be refactored!!)
            for (let i = 0; i < complexActions.length; ++i) {
                let dataPanel = document.querySelector(`[data-panel-id=${complexActions[i]}]`)
                if (dataPanel.hidden !== true || dataPanel.dismissed !== true) {
                    dataPanel.hidden = true
                    dataPanel.dismissed = true
                }
            }

            // show the modal
            document.getElementById('reset-all-modal').active = true

            // don't set it to active since it's just a button and there is no notion of 'home' being active
            event.target.active = false
            activeActionId = null
        } else if (activeActionId == 'streetview') {
            // if any of the other panels are open then close them (this could be refactored!!)
            for (let i = 0; i < complexActions.length; ++i) {
                let dataPanel = document.querySelector(`[data-panel-id=${complexActions[i]}]`)
                if (dataPanel.hidden !== true || dataPanel.dismissed !== true) {
                    dataPanel.hidden = true
                    dataPanel.dismissed = true
                }
            }

            event.target.active = true
            streetViewCursorText.style.left = event.clientX + 50 + 'px'
            streetViewCursorText.style.top = event.clientY - 10 + 'px'

            // show the streetViewCursorText text in the view
            streetViewCursorText.style.display = 'block'
        } else {
            // complex actions

            for (let i = 0; i < complexActions.length; ++i) {
                let action = document.querySelector(`[data-action-id=${complexActions[i]}]`)
                let dataPanel = document.querySelector(`[data-panel-id=${complexActions[i]}]`)

                if (complexActions[i] == activeActionId) {
                    // if the data panel is hidden then show it
                    if (dataPanel.hidden === true) {
                        action.active = true
                        dataPanel.hidden = false
                        dataPanel.dismissed = false

                        // when the simple summary is opened update everything on it
                        if (activeActionId == 'simpleChart') {
                            simpleSummaryUpdateAcsStat(view.extent)
                            simpleSummaryUpdateStat(
                                farsLayerView,
                                view,
                                'FATALS',
                                'simple-summary-farsfatals'
                            )
                            simpleSummaryUpdateEquityStat(view.extent)
                            simpleSummaryUpdateDamageStat(view.extent)
                        }
                    } else {
                        // otherwise the datapanel is already open so close it
                        action.active = false
                        dataPanel.hidden = true
                        dataPanel.dismissed = true
                    }
                } else {
                    // this is not the action and data panel we are interested in.
                    // all other actions were already set to inactive above, just make sure it's hidden
                    if (dataPanel.hidden !== true || dataPanel.dismissed !== true) {
                        // console.log("data panel", complexActions[i], " is being set to hidden and dismissed");
                        dataPanel.hidden = true
                        dataPanel.dismissed = true
                    }
                }
            }
        }
    }

    // iterate through all of the left action bar actions and set up their events
    for (let i = 0; i < allActions.length; ++i) {
        document
            .querySelector(`[data-action-id=${allActions[i]}]`)
            .addEventListener('click', leftActionBarEvent)
    }
}

//#endregion


// ========================================================
//                 Region: OTHER FUNCTIONS
// ========================================================

function wireUpOnLayerVisibilityChanges() {
    // when layer visibility is changed enable or disable its filter, table, and transparency slider

    function updateLayerlistActionItems(layer) {
        // console.log('visibility change for', layer.title, ' it is now', layer.visible)

        layerList.operationalItems.forEach((oi) => {
            if (oi.title === layer.title) {
                if (layer.visible) {
                    // set the transparency slide to be collapsed and not visible
                    oi.panel.visible = true

                    // make the filter and table button visible
                    oi.actionsSections.forEach((as) => {
                        as.forEach((asItem) => {
                            asItem.visible = true
                        })
                    })
                } else {
                    //console.log("setting stuff to disabled for", layer.title)

                    // if the filter for the layer is open then close it
                    //because it'd be weird to be filtering but not seeing.
                    let shortName = getShortNameForLayerFromFullName(layer.title)

                    let filterPanelNode = document.getElementById(shortName + '-fltr-panel')
                    if (filterPanelNode) {
                        filterPanelNode.hidden = true
                        filterPanelNode.dismissed = true
                    }

                    let symbologyPanelNode = document.getElementById(shortName + '-symbology-panel')
                    if (symbologyPanelNode) {
                        symbologyPanelNode.hidden = true
                        symbologyPanelNode.dismissed = true
                    }

                    // set the transparency slide to be collapsed and not visible
                    oi.panel.visible = false
                    oi.panel.open = false

                    // close the actions section (with table and filter), and then make each not visible
                    oi.actionsOpen = false
                    oi.actionsSections.forEach((as) => {
                        as.forEach((asItem) => {
                            asItem.visible = false
                        })
                    })
                }
            }
        })
    }

    let layersToWatchForVizChanges = [
        statesLayer,
        damageLayer,
        equityLayer,
        // airDamageLayer,
        // airEquityLayer,
        acsLayer,
        farsLayer,
        urbanLayer,
        landcoverLayer
    ]

    // set up to react to changes in the visibility
    layersToWatchForVizChanges.forEach((l) => {
        l.watch('visible', () => updateLayerlistActionItems(l))
    })

    // actually call it the first time to initialize/set
    layersToWatchForVizChanges.forEach((l) => {
        updateLayerlistActionItems(l)
    })
}

function getShortNameForLayerFromFullName(fullName) {
    // short names are simple, lower case, and not have spaces or hypens
    // read the ayerSelectConfig json file and get the short name from the long name,
    // for example, pass in 'Fatality Analysis Reporting System (FARS)' get back 'fars'
    let selectedLayer = settings.layers.filter((l) => {
        return l.fullName === fullName
    })[0]

    return selectedLayer ? selectedLayer.shortName : null
}

function getFieldNameAndTypeForSelectId(shortName, selectorName) {
    // getFieldNameAndTypeForSelectId('nhs', 'lanes')  returns ['through_la', 'integer']

    //console.log("input to getShortNameForLayerFromFullName: ", shortName, selectorName);

    let fieldName = null
    let fieldType = null

    let selectedLayer = settings.layers.filter((l) => {
        return l.shortName === shortName
    })[0]

    if (selectedLayer) {
        let x = selectedLayer.selectors.filter((s) => {
            return s.name === selectorName
        })[0]
        if (x) {
            fieldName = x.fieldName
            fieldType = x.fieldType
        }
    }

    //console.log("return from getShortNameForLayerFromFullName: ", fieldName, fieldType)

    return [fieldName, fieldType]
}

//#endregion


// ========================================================
//                   Region: FILTERS
// ========================================================

function filterBlockClick(event) {
    // This function finds all caclite blocks within the same filter panel
    // as the calcite block id that was passed in and closes them, with
    // the exception of the one passed in. This is used so that no more than
    // one is expanded at any given time.  There is some extra complexity
    // here becuase the sel controls also fire the block change event

    // regardless of whether it's a block or a sel, we can get the name from
    // the event given the naming conventions
    let filterLayerShortName = event.target.id.split('-')[0]

    // if it's an actual block
    if (event.target.id.startsWith(filterLayerShortName + '-fltr-block-')) {
        // get all the blocks for this layer
        let filterBlockSelector = '[id^=' + CSS.escape(filterLayerShortName) + '-fltr-block-]'

        // if it's not the calling block then close it
        document.querySelectorAll(filterBlockSelector).forEach((aFilterBlock) => {
            if (aFilterBlock.id != event.target.id) {
                aFilterBlock.open = false
            }
        })
    }
}

function getLayerFilter(shortLayerName) {
    // create the sql that is used to filter the layer.  Note that despite the name, this function also
    // updates the html text associated with the filter units (for the moment just on sliders)

    function getUnits(shortname, fieldname) {
        // get units from config file to add to filter.  units is optional, if it doesn't exist it will return null.
        // this function also adds a bit of additional formatting, namely space and ()
        let units = ''
        try {
            let unitsFromConfig = settings.layers
                .filter((item) => item.shortName === shortname)[0]
                .selectors.filter((item) => item.fieldName === fieldname)[0].units

            if (unitsFromConfig) {
                units = ' (' + unitsFromConfig + ')'
            }
        } catch {
            units = ''
        }

        return units
    }

    // Make a unique list of the selector groups,
    // Example result might look like ['popdensity', 'racewhite', 'raceblack']

    //console.log('====================================================================')
    //console.log("entering getLayerFilter for layer ", shortLayerName)

    /// For FARS will be a list like ['year', 'fatalities', 'fatalsafamer', 'fatalsamerind', ...]
    let uniqueFilterVariables = []

    let selector = '[id^=' + shortLayerName + '-fltr-sel-]'
    document.querySelectorAll(selector).forEach((node) => {
        let blockId = node.id.split('-')[3]
        if (!uniqueFilterVariables.includes(blockId)) {
            uniqueFilterVariables.push(blockId)
        }
    })

    //console.log("uniq sel ids", uniqueFilterVariables)

    // build up the layer query parts and process each selector group
    let queryParts = []

    uniqueFilterVariables.forEach((aFilterVariable) => {
        //console.log('-------------------------------------');
        //console.log('Building sub part query for filterVariable: ', aFilterVariable);

        const [fieldName, fieldType] = getFieldNameAndTypeForSelectId(
            shortLayerName,
            aFilterVariable
        )
        //console.log("fieldName = ", fieldName, "fieldType = ", fieldType);

        let sliderNodes = document.querySelectorAll(
            '[id^=' + shortLayerName + '-fltr-sel-' + aFilterVariable + '-slider]'
        )
        //console.log("slider nodes = ", sliderNodes)

        let checkBoxNodes = document.querySelectorAll(
            '[id^=' + shortLayerName + '-fltr-sel-' + aFilterVariable + '-cb]'
        )
        // console.log("checkbox nodes = ", checkBoxNodes)

        // SLIDERS
        // -------

        if (sliderNodes.length == 2) {
            // the node and the text for it

            // there just must be a better way to do this!
            let theSlider
            let theSliderLabel
            sliderNodes.forEach((n) => {
                if (n.id.endsWith('-slider')) {
                    theSlider = n
                } else if (n.id.endsWith('-label')) {
                    theSliderLabel = n
                }
            })

            let absoluteMin = theSlider.min // from doc: Minimum selectable value
            let currentMin = theSlider.minValue // from doc: Currently selected lower number (if multi-select)

            let currentMax = theSlider.maxValue // e.g. 20 (the outlier max value seen)  // from doc: Currently selected upper number (if multi-select)
            let absoluteMax = theSlider.max // e.g 5 (a more commonly seen value for fatalities)  // from doc: Maximum selectable value

            let atMin = absoluteMin === currentMin
            let atMax = absoluteMax === currentMax

            //console.log("\tabsMin:", absoluteMin, ", curMin:", currentMin, ", curMax:", currentMax, ", absMax:", absoluteMax, ", atMin:", atMin, ", atMax:", atMax)

            // if (atMin && atMax) then don't add the filter

            if (atMin && !atMax) {
                let subQuery = fieldName + ' <= ' + currentMax
                queryParts.push('(' + subQuery + ')')
                theSliderLabel.innerHTML =
                    ' <= ' + currentMax.toLocaleString() + getUnits(shortLayerName, fieldName)
            } else if (!atMin && atMax) {
                let subQuery = fieldName + ' >= ' + currentMin
                queryParts.push('(' + subQuery + ')')
                theSliderLabel.innerHTML =
                    ' >= ' + currentMin.toLocaleString() + getUnits(shortLayerName, fieldName)
            } else if (!atMin && !atMax) {
                let subQuery =
                    fieldName + ' >= ' + currentMin + ' and ' + fieldName + ' <= ' + currentMax
                queryParts.push('(' + subQuery + ')')
                theSliderLabel.innerHTML =
                    '>= ' +
                    currentMin.toLocaleString() +
                    ' and <= ' +
                    currentMax.toLocaleString() +
                    getUnits(shortLayerName, fieldName)
            } else {
                theSliderLabel.innerHTML = 'no filter set'
            }
        }

        // CHECKBOXES
        // ----------

        if (checkBoxNodes.length > 0) {
            let orParts = []
            let selectedVals = []

            let totalNodes = 0
            checkBoxNodes.forEach((node) => {
                if (!node.id.endsWith('-input')) {
                    // the ones that end with -input are just noise

                    totalNodes += 1

                    if (node.checked) {
                        if (node.value.startsWith('>=') || node.value.startsWith('<=')) {
                            // TODO
                            orParts.push(node.value)
                        } else {
                            if (fieldType == 'text') {
                                selectedVals.push("'" + node.value + "'")
                            } else if (fieldType == 'float') {
                                selectedVals.push(node.value.toFixed(2))
                            } else {
                                selectedVals.push(node.value)
                            }
                        }
                    }
                }
            })

            // don't add a query if they are all selected
            if (totalNodes != selectedVals.length + orParts.length) {
                let subQuery = fieldName + ' in (' + selectedVals.join() + ')'

                for (let i in orParts) {
                    subQuery = subQuery + ' or (' + fieldName + ' ' + orParts[i] + ')'
                }

                queryParts.push('(' + subQuery + ')')
            }
        }
    }) // for each Filter Variable

    // PULL THE FINAL QUERY TOGETHER WITH THE STATES FILTER
    // ----------------------------------------------------

    let layerFilter = queryParts.join(' and ')
    let stateFilter = getStatesFilter(shortLayerName)

    let finalFilter = null

    if (stateFilter && layerFilter) {
        finalFilter = layerFilter + ' and (' + stateFilter + ')'
    } else if (stateFilter && !layerFilter) {
        finalFilter = stateFilter
    } else if (!stateFilter && layerFilter) {
        finalFilter = layerFilter
    }

    return finalFilter
}

function getStatesFilter(shortLayerName) {
    // this is the case for all layers setup in prep layers.  but for external layers (e.g. disadvantaged)
    // it has to be handle separately
    let stateAbbrevField = 'stusps'

    if (shortLayerName === 'disadvantaged') {
        stateAbbrevField = 'st_abbr'
    }
    // 2ALL1901
    else if (shortLayerName === 'damage') {
        stateAbbrevField = 'STATE_ABB'
    } else if (shortLayerName === 'equity') {
        stateAbbrevField = 'STATE_ABB'
    } else if (shortLayerName === 'acs') {
        stateAbbrevField = 'STATE_ABB'
    }
    let statesQuery

    // whenever there is a decision change something is going to be updated and it's always
    // going to involve the currently selected states so always put this query together upfront
    // ----------------------------------------------------------------------------------------
    let selectedStates = []
    document.querySelectorAll('[id^=states-fltr-sel-stateabb-cb]').forEach((node) => {
        if (node.checked) {
            if (!selectedStates.includes(node.value)) {
                selectedStates.push(node.value)
            }
        }
    })

    if (selectedStates.length == 0) {
        statesQuery = stateAbbrevField + ' in ()'
    } else if (selectedStates.length == 51) {
        statesQuery = null
    } else {
        let selectedStatesString = selectedStates.map((selVal) => `'${selVal}'`).join(',')
        statesQuery = stateAbbrevField + ' in (' + selectedStatesString + ')'
    }

    // console.log(statesQuery);
    return statesQuery
}

function updateFilterForStandardLayer(layerToUpdate) {
    // console.log("====  updateFilterForStandardLayer ", layerToUpdate);
    let theQuery = getLayerFilter(layerToUpdate)
    // console.log('the query for ', layerToUpdate, 'is ', theQuery)
    let theLayerView = eval(layerToUpdate + 'LayerView')
    theLayerView.filter = { where: theQuery }
    // console.log("====  DONE updateFilterForStandardLayer ", layerToUpdate);
}

function decisionChange(shortLayerName) {
    // This method is what's called whenver any selection change happens (or selection changes at startup).
    // It is sometimes called directly, and other times called from decisionChangeFromEvent

    //console.log('decision change for ', shortLayerName)

    if (shortLayerName == 'states') {
        let statesFilter = getStatesFilter(shortLayerName)

        if (statesFilter) {
            statesLayerView.filter = { where: statesFilter }
        } else {
            statesLayerView.filter = null
        }

        let layersToUpdateWhenStateChanges = ['fars', 'urban', 'damage', 'equity', 'acs']

        layersToUpdateWhenStateChanges.forEach((layerToUpdateWhenStateChanges) => {
            updateFilterForStandardLayer(layerToUpdateWhenStateChanges)
        })
    } else {
        // only update the one layer's filter
        updateFilterForStandardLayer(shortLayerName)
    }
}

function decisionChangeFromEvent(event) {
    // this is called whenever a checkbox or slider is changed.

    let shortLayerName = event.target.id.split('-')[0]
    decisionChange(shortLayerName)
}

function filterSetup(layerShortName) {
    // The top call wires up events related to filter changes.  In the end they both call "decisionChangeFromEvent"
    // The bottom call wires up events related to expanding and collapsing the block events.
    // note that states is handled by a separate function.

    //console.log("filter setup for", layerShortName)

    document.querySelectorAll('[id^=' + layerShortName + '-fltr-sel-]').forEach((node) => {
        if (!node.id.endsWith('-input')) {
            if (node.tagName.endsWith('-CHECKBOX')) {
                node.addEventListener('click', decisionChangeFromEvent)
            } else if (node.tagName.endsWith('-SLIDER')) {
                // debounce gets used this way. think of it as a function
                let onFilterSlider = promiseUtils.debounce(decisionChangeFromEvent)

                node.addEventListener('calciteSliderChange', function (event) {
                    onFilterSlider(event).catch(function (err) {
                        if (!promiseUtils.isAbortError(err)) {
                            throw err
                        }
                    })
                })
            }
        }
    })

    document.querySelectorAll('[id^=' + layerShortName + '-fltr-block]').forEach((node) => {
        node.addEventListener('click', filterBlockClick)
    })
}

function filterStatesSetup() {
    // what to do when any single state checkbox changes
    document.querySelectorAll('[id^=states-fltr-sel-stateabb-cb]').forEach((node) => {
        node.addEventListener('calciteCheckboxChange', decisionChangeFromEvent)
    })

    // what to do when the "Select All" button is pressed on the states filter
    let selectAllBtn = document.querySelector('#states-fltr-stateabb-selectall-btn')
    selectAllBtn.addEventListener('click', function (event) {
        document.querySelectorAll('[id^=states-fltr-sel-stateabb-cb]').forEach((node) => {
            node.checked = true
        })
        decisionChangeFromEvent(event)
    })

    // what to do when the "Select None" button is pressed on the states filter
    let selectNoneBtn = document.querySelector('#states-fltr-stateabb-selectnone-btn')
    selectNoneBtn.addEventListener('click', function (event) {
        document.querySelectorAll('[id^=states-fltr-sel-stateabb-cb]').forEach((node) => {
            node.checked = false
        })
        decisionChangeFromEvent(event)
    })
}

//#endregion


// ========================================================
//              Region: Simple Summary Chart
// ========================================================

async function simpleSummaryUpdateStat(aLayerView, view, sumField, htmlTag) {
    // calculate and set one of the numbers on the simple summary data panel

    //console.log('simple summary update', sumField, htmlTag)

    if (!aLayerView.visible) {
        document.getElementById(htmlTag).innerHTML = '-'
        return
    } else {
        // something changed and it could take a while to update so blank it out
        document.getElementById(htmlTag).innerHTML = '&nbsp;'
    }

    let query
    if (aLayerView.filter) {
        query = aLayerView.filter.createQuery()
        query.extent = view.extent
    } else {
        query = aLayerView.createQuery()
        query.extent = view.extent
    }

    query.spatialRelationship = 'within'

    aLayerView
        .queryFeatures(query)
        .then(function (results) {
            //console.log("features = ", results.features.length)

            document.getElementById('simple-summary-main-div').style.display = 'block'

            let sum = 0

            results.features.forEach((result) => {
                if (sumField === 'SIMPLEFEATURE_COUNT') {
                    sum += 1
                } else {
                    //console.log(result.attributes[sumField])
                    sum += result.attributes[sumField]
                }
            })

            document.getElementById(htmlTag).innerHTML = Math.round(sum).toLocaleString('en-US')
        })
        .catch(function (error) {
            console.log('query failed: ', error)
        })
}

async function simpleSummaryUpdateAcsStat(extent) {
    // get from current ND field being used to symbolize this layer
    let demographicToUse = acsLayerView.layer.renderer.visualVariables[0].field.split('_')[0]

    //console.log("demographic to use for simple summary ACS stats: ", demographicToUse)

    if (!acsLayerView.visible) {
        document.getElementById('simple-summary-acs').innerHTML = '-'
        return
    } else {
        // something changed and it could take a while to update so blank it out
        document.getElementById('simple-summary-acs').innerHTML = '&nbsp;'
    }

    let query
    if (acsLayerView.filter) {
        query = acsLayerView.filter.createQuery()
        query.extent = extent
    } else {
        query = acsLayerView.createQuery()
        query.extent = extent
    }

    query.spatialRelationship = 'within'

    acsLayerView
        .queryFeatures(query)
        .then(function (results) {
            //console.log("features = ", results.features.length)

            // TODO not sure this is needed anymore
            document.getElementById('simple-summary-main-div').style.display = 'block'

            let sum = 0

            results.features.forEach((result) => {
                // for each block group multiply the population by the demographic percent to get the pop of this demographic
                sum += result.attributes[demographicToUse] * result.attributes['population']
            })

            document.getElementById('simple-summary-acs-text').innerHTML =
                'ACS Population (' + demographicToUse + ')'
            document.getElementById('simple-summary-acs').innerHTML =
                Math.round(sum).toLocaleString('en-US')
        })
        .catch(function (error) {
            console.log('query failed: ', error)
        })
}

async function simpleSummaryUpdateEquityStat(extent) {
    // get from current ND field being used to symbolize this layer
    let demographicToUse = equityLayerView.layer.renderer.visualVariables[0].field.split('_')[0]

    // get equity damage field.  This is a bit ugly due to non standard naming conventions on the fields

    let equityDamageField

    switch (demographicToUse) {
        case 'pacific':
        case 'poverty':
            equityDamageField = demographicToUse + '_dm'
            break
        case 'nonwhite':
            equityDamageField = demographicToUse + '_d'
            break
        case 'nonpoverty':
            equityDamageField = 'nonpover_1'
            break
        default:
            equityDamageField = demographicToUse + '_dmg'
    }

    //console.log(demographicToUse, equityDamageField)

    if (!equityLayerView.visible) {
        document.getElementById('simple-summary-equity').innerHTML = '-'
        return
    } else {
        // something changed and it could take a while to update so blank it out
        document.getElementById('simple-summary-equity').innerHTML = '&nbsp;'
    }

    let query
    if (equityLayerView.filter) {
        query = equityLayerView.filter.createQuery()
        query.extent = extent
    } else {
        query = equityLayerView.createQuery()
        query.extent = extent
    }

    query.spatialRelationship = 'within'

    equityLayerView
        .queryFeatures(query)
        .then(function (results) {
            //console.log("features = ", results.features.length)

            // TODO not sure this is needed anymore
            document.getElementById('simple-summary-main-div').style.display = 'block'

            let sum = 0

            results.features.forEach((result) => {
                sum += result.attributes[equityDamageField]
            })

            document.getElementById('simple-summary-noise-equity-text').innerHTML =
                'Total Noise Damage (' + demographicToUse + ')'

            document.getElementById('simple-summary-equity').innerHTML =
                ' $ ' + Math.round(sum).toLocaleString('en-US')
        })
        .catch(function (error) {
            console.log('query failed: ', error)
        })
}

async function simpleSummaryUpdateDamageStat(extent) {
    if (!damageLayerView.visible) {
        document.getElementById('simple-summary-damage').innerHTML = '-'
        return
    } else {
        // something changed and it could take a while to update so blank it out
        document.getElementById('simple-summary-damage').innerHTML = '&nbsp;'
    }

    let query
    if (damageLayerView.filter) {
        query = damageLayerView.filter.createQuery()
        query.extent = extent
    } else {
        query = damageLayerView.createQuery()
        query.extent = extent
    }

    query.spatialRelationship = 'within'

    damageLayerView
        .queryFeatures(query)
        .then(function (results) {
            //console.log("features = ", results.features.length)

            // TODO not sure this is needed anymore
            document.getElementById('simple-summary-main-div').style.display = 'block'

            let totalLen = 0

            var sumLengthByBin = {}

            results.features.forEach((result) => {
                let bin = result.attributes['bin_dl']
                let len = result.attributes['Shape__Length']

                totalLen += len

                if (sumLengthByBin[bin]) {
                    sumLengthByBin[bin] += len
                } else {
                    sumLengthByBin[bin] = len
                }

                //console.log(bin, len)
            })

            let avgDamage = 0.0

            for (const [bin, sumlen] of Object.entries(sumLengthByBin)) {
                let contrib = bin * (sumlen / totalLen)
                avgDamage += contrib
                //console.log(bin,  sumlen, contrib);
            }

            document.getElementById('simple-summary-damage').innerHTML = avgDamage.toFixed(1)
        })
        .catch(function (error) {
            console.log('query failed: ', error)
        })
}

function onSimpleChartBtnClick(view) {
    //console.log('on simple summary btn with view', view)

    simpleSummaryUpdateAcsStat(view.extent)
    simpleSummaryUpdateStat(farsLayerView, view, 'FATALS', 'simple-summary-farsfatals')
    simpleSummaryUpdateEquityStat(view.extent)
    simpleSummaryUpdateDamageStat(view.extent)

    $('.simple-summary-canvas-container').html('')
}

//#endregion


// ========================================================
//                      Region: MAIN
// ========================================================

// set up what's needed to return filter checkboxes to the default state
let elements = document.getElementsByTagName('calcite-checkbox')
for (let i = 0; i < elements.length; i++) {
    defaultCheckBoxState[elements[i].id] = elements[i].checked
}

// set up what's needed to return filter sliders to the default state
elements = document.getElementsByTagName('calcite-slider')
for (let i = 0; i < elements.length; i++) {
    defaultSliderState[elements[i].id] = [elements[i].minValue, elements[i].maxValue]
}

// DO THIS FOR DEV SO YOU GO RIGHT TO THE APPLICATION.  THIS WILL NOT ALLOW YOU TO GO BACK TO THE INTRO PAGE
// appPanel.style.display = 'block'
// entryPanel.style.display = 'none'
// let view = setUpMap()
// view.when(onViewReady(view))

//DO THIS FOR PRODUCTION SO YOU START ON THE MAIN PAGE
entryPanel.style.display = 'block'
appPanel.style.display = 'none'
document.getElementById('sign-in-btn').addEventListener('click', function () {
    appPanel.style.display = 'block'
    entryPanel.style.display = 'none'
    let mapview = setUpMap()
    mapview.when(onViewReady(mapview))
})

if (settings.app_mode.toLowerCase() === 'local_dev') {
    // document.getElementById("devMessageEntryPanel").innerHTML = "LOCAL DEV"
    // document.getElementById("devMessageAppPanel").innerHTML = "LOCAL DEV"
    document.getElementById('devMessageEntryPanel').innerHTML = 'DEVELOPMENT'
    document.getElementById('devMessageAppPanel').innerHTML = 'DEVELOPMENT'
}

if (settings.app_mode.toLowerCase() === 'deployed_dev') {
    document.getElementById('devMessageEntryPanel').innerHTML = 'DEVELOPMENT'
    document.getElementById('devMessageAppPanel').innerHTML = 'DEVELOPMENT'
}

if (
    settings.app_mode.toLowerCase() === 'local_dev' ||
    settings.app_mode.toLowerCase() === 'deployed_dev'
) {
    document.getElementById('devMessageEntryPanel').onclick = function () {
        document.getElementById('updatesModal').active = true
    }
}

document.querySelectorAll('[id=versionName]').forEach((node) => {
    node.innerHTML = settings.version
})

document.querySelectorAll('[id=versionDate]').forEach((node) => {
    node.innerHTML = settings.date
})

document.getElementById('updatesModalOkBtn').onclick = function () {
    document.getElementById('updatesModal').active = false
}
