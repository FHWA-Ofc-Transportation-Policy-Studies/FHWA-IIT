// ============================================================================
//#region     IMPORTS
// ============================================================================

import esriConfig from '@arcgis/core/config'
import Basemap from '@arcgis/core/Basemap'
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import LayerList from '@arcgis/core/widgets/LayerList'
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter'
import FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView'
import Search from '@arcgis/core/widgets/Search'
import Legend from '@arcgis/core/widgets/Legend'
import * as promiseUtils from '@arcgis/core/core/promiseUtils'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils'
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils'

import settings from './config/settings.json'
import start_locations from './config/start_locations.json'

import {
    farsLayer,
    noiseCostLayer,
    noiseEquityLayer,
    airCostLayer,
    airEquityLayer,
    acsLayer,
    statesLayer,
    urbanLayer,
    landcoverLayer,
    publicSchoolsLayer,
    universitiesLayer,
    redliningLayer,
    pm25Layer
} from './layers'

import {
    acsRendererNonWhite,
    acsRendererWhite,
    acsRendererBlack,
    acsRendererAsian,
    acsRendererNative,
    acsRendererPacific,
    acsRendererOther,
    acsRendererNonPoverty,
    acsRendererPoverty,
    noiseEquityRendererNonWhite,
    noiseEquityRendererWhite,
    noiseEquityRendererBlack,
    noiseEquityRendererAsian,
    noiseEquityRendererNative,
    noiseEquityRendererPacific,
    noiseEquityRendererOther,
    noiseEquityRendererNonPoverty,
    noiseEquityRendererPoverty,
    airEquityRendererNonWhite,
    airEquityRendererWhite,
    airEquityRendererBlack,
    airEquityRendererAsian,
    airEquityRendererNative,
    airEquityRendererPacific,
    airEquityRendererOther,
    airEquityRendererNonPoverty,
    airEquityRendererPoverty
} from './renderers'

import { setAssetPath } from '@esri/calcite-components/dist/components'
setAssetPath('https://js.arcgis.com/calcite-components/2.8.0/assets')

import '@esri/calcite-components/dist/components/calcite-action'
import '@esri/calcite-components/dist/components/calcite-action-bar'
import '@esri/calcite-components/dist/components/calcite-action-group'
import '@esri/calcite-components/dist/components/calcite-block'
import '@esri/calcite-components/dist/components/calcite-button'
import '@esri/calcite-components/dist/components/calcite-checkbox'
import '@esri/calcite-components/dist/components/calcite-chip'
import '@esri/calcite-components/dist/components/calcite-icon'
import '@esri/calcite-components/dist/components/calcite-input'
import '@esri/calcite-components/dist/components/calcite-input-text'
import '@esri/calcite-components/dist/components/calcite-label'
import '@esri/calcite-components/dist/components/calcite-link'
import '@esri/calcite-components/dist/components/calcite-list'
import '@esri/calcite-components/dist/components/calcite-list-item'
import '@esri/calcite-components/dist/components/calcite-loader'
import '@esri/calcite-components/dist/components/calcite-modal'
import '@esri/calcite-components/dist/components/calcite-option'
import '@esri/calcite-components/dist/components/calcite-panel'
import '@esri/calcite-components/dist/components/calcite-select'
import '@esri/calcite-components/dist/components/calcite-shell'
import '@esri/calcite-components/dist/components/calcite-shell-panel'
import '@esri/calcite-components/dist/components/calcite-slider'
import '@esri/calcite-components/dist/components/calcite-segmented-control'
import '@esri/calcite-components/dist/components/calcite-segmented-control-item'
import '@esri/calcite-components/dist/components/calcite-stepper'
import '@esri/calcite-components/dist/components/calcite-stepper-item'
import '@esri/calcite-components/dist/components/calcite-text-area'
import '@esri/calcite-components/dist/components/calcite-tip'
import '@esri/calcite-components/dist/components/calcite-tooltip'
import '@esri/calcite-components/dist/components/calcite-tree'
import '@esri/calcite-components/dist/components/calcite-tree-item'

import '@arcgis/core/assets/esri/themes/light/main.css'
import '@esri/calcite-components/dist/calcite/calcite.css'
// import './iitTool.css'

import Point from '@arcgis/core/geometry/Point'
import Layer from '@arcgis/core/layers/Layer'
import ListItem from '@arcgis/core/widgets/LayerList/ListItem'
import Query from '@arcgis/core/rest/support/Query'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'

//#endregion

// ============================================================================
//#region     GLOBAL VARIABLES
// ============================================================================

let view: MapView

let currentAction: string | null

let abortController

// used by reset to set everyting back to how it was at startup
let defaultCheckBoxState: { [key: string]: boolean } = {}
let defaultSliderState: { [key: string]: [number | undefined, number | undefined] } = {}
let defaultLayerVisibility: { [key: string]: boolean } = {}

type selectorType = {
    name: string
    fieldName: string
    fieldType: string
    fieldLabel: string
}

// used to rename field names when showing the filter present on a layer
// order matters, as later these will replace filter.where's sequentially
let all_selectors: selectorType[] = []
settings.layers.forEach((layer) => {
    if (Object.hasOwn(layer, 'selectors')) {
        layer.selectors?.forEach((sel) => {
            all_selectors.push(sel)
        })
    }
})
// console.log(all_selectors)

let layerList: LayerList
let layersWithSymbology: string[] = ['acs', 'noiseEquity', 'airEquity'] // use shortnames here

// layerviews (in most cases)
let farsLayerView: FeatureLayerView
let noiseCostLayerView: FeatureLayerView
let noiseEquityLayerView: FeatureLayerView
let airCostLayerView: FeatureLayerView
let airEquityLayerView: FeatureLayerView
let acsLayerView: FeatureLayerView
let statesLayerView: FeatureLayerView
let urbanLayerView: FeatureLayerView
let publicSchoolsLayerView: FeatureLayerView
let universitiesLayerView: FeatureLayerView
let redliningLayerView: FeatureLayerView

// application start location
const start_location = start_locations[settings['START_LOCATION']]
export const defaultZoomLevel: number = start_location.zoom
export const defaultCenterPoint = new Point({ x: start_location.longitude, y: start_location.latitude })

// view related events are verbose
let updatesRelatedToUpdatedViewComplete = false

let streetViewCursorDiv: HTMLElement

//#endregion

// ============================================================================
//#region     SETUP FUNCTIONS
// ============================================================================

/**
 * this is pretty much where it all starts
 */
function setUpMap() {
    // top in this list will be on the bottom
    const map = new Map({
        basemap: 'gray-vector',
        layers: [
            landcoverLayer,
            urbanLayer,
            acsLayer,
            redliningLayer,
            pm25Layer,
            noiseEquityLayer,
            airEquityLayer,
            airCostLayer,
            noiseCostLayer,
            publicSchoolsLayer,
            universitiesLayer,
            farsLayer,
            statesLayer
        ]
    })

    const mv = new MapView({
        container: 'viewDiv',
        map: map,
        center: defaultCenterPoint,
        zoom: defaultZoomLevel,
        constraints: {
            rotationEnabled: false, // Disables map rotation
            minZoom: 3,
            maxZoom: 16
        }
    })

    mv.ui.move('zoom', 'bottom-right')

    return mv
}

/**
 * this is called once the view is ready (i.e. after setUpMap)
 */
function onViewReady() {
    // console.log('onViewReady')

    // while controled by layerview updates, this needs to be here when we start out
    document.getElementById('updating_spinner')!.style.display = 'block'

    // now that the view is all set, store the visibility so the initial visability can be restored
    view.map.allLayers.forEach((l) => {
        // console.log('layer', l)
        defaultLayerVisibility[l.title] = l.visible
    })

    let whenLayerViewsCreatedPromises = Promise.all([
        view.whenLayerView(farsLayer),
        view.whenLayerView(noiseCostLayer),
        view.whenLayerView(noiseEquityLayer),
        view.whenLayerView(airCostLayer),
        view.whenLayerView(airEquityLayer),
        view.whenLayerView(acsLayer),
        view.whenLayerView(statesLayer),
        view.whenLayerView(urbanLayer),
        view.whenLayerView(publicSchoolsLayer),
        view.whenLayerView(universitiesLayer),
        view.whenLayerView(redliningLayer)
    ])

    let layerViewsDoneUpdatingPromise = whenLayerViewsCreatedPromises.then(
        ([
            tmpFarsLayerView,
            tmpNoiseCostLayerView,
            tmpNoiseEquityLayerView,
            tmpAirCostLayerView,
            tmpAirEquityLayerView,
            tmpAcsLayerView,
            tmpStatesLayerView,
            tmpUrbanLayerView,
            tmpPublicSchoolsLayerView,
            tmpUniversitiesLayerView,
            tmpRedliningLayerView
        ]) => {
            farsLayerView = tmpFarsLayerView
            noiseCostLayerView = tmpNoiseCostLayerView
            noiseEquityLayerView = tmpNoiseEquityLayerView
            airCostLayerView = tmpAirCostLayerView
            airEquityLayerView = tmpAirEquityLayerView
            acsLayerView = tmpAcsLayerView
            statesLayerView = tmpStatesLayerView
            urbanLayerView = tmpUrbanLayerView
            publicSchoolsLayerView = tmpPublicSchoolsLayerView
            universitiesLayerView = tmpUniversitiesLayerView
            redliningLayerView = tmpRedliningLayerView

            return Promise.all([
                reactiveUtils.whenOnce(() => !tmpFarsLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpNoiseCostLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpNoiseEquityLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpAirCostLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpAirEquityLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpAcsLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpStatesLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpUrbanLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpPublicSchoolsLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpUniversitiesLayerView.updating),
                reactiveUtils.whenOnce(() => !tmpRedliningLayerView.updating)
            ])
        }
    )

    // this is where most stuff gets set up and wired up once the layerviews are all set
    layerViewsDoneUpdatingPromise.then(() => {
        // these are layers that have a filter set to start
        // TODO: I think this may need to just be run for all the layers
        let layersToUpdateOnStartUp = [
            'publicSchools',
            'universities',
            'redlining',
            'fars',
            'noiseCost',
            'noiseEquity',
            'airCost',
            'airEquity',
            'acs'
        ]
        layersToUpdateOnStartUp.forEach((layerToUpdateOnStartUp) => {
            updateFilterForStandardLayer(layerToUpdateOnStartUp)
        })

        // LAYER LIST (note that widgets return promises)
        layerList = new LayerList({
            view,
            selectionMode: 'single',
            container: 'layers-container',
            listItemCreatedFunction: onLayerListItemCreated,
            dragEnabled: true,
            visibilityAppearance: 'checkbox'
        })

        // WHEN THE LAYER LIST IS READY
        layerList.when(() => {
            //console.log("just after creating layerlist", layerList.operationalItems)
            wireUpOnLayerVisibilityChanges()

            // wire up the actions sections (e.g. filter, opacity) that
            // were added in onLayerListItemCreated
            layerList.on('trigger-action', onLayerListTriggerAction)

            wireUpPresetButtonViews(view)
        })

        // BASEMAPS
        // https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html#basemap
        const basemaps = new BasemapGallery({
            view,
            source: [
                Basemap.fromId('gray-vector'),
                Basemap.fromId('osm'),
                Basemap.fromId('hybrid'),
                Basemap.fromId('satellite'),
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
                { layer: noiseCostLayer },
                { layer: noiseEquityLayer },
                { layer: airCostLayer },
                { layer: airEquityLayer },
                { layer: acsLayer },
                { layer: urbanLayer },
                { layer: publicSchoolsLayer },
                { layer: universitiesLayer },
                { layer: redliningLayer },
                { layer: pm25Layer }
            ]
        })

        //#region SEARCH
        // TODO: search is not currently cleared out on reset)

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
                } as __esri.SearchSourceProperties,
                {
                    name: 'Coordinates', // whatever you want to call it
                    url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
                    countryCode: 'US',
                    singleLineFieldName: 'SingleLine',
                    placeholder: 'Longitude, Latitude',
                    suggestionsEnabled: true,
                    categories: ['LatLong']
                } as __esri.SearchSourceProperties
            ]
        })

        async function onSearchComplete() {
            abortController?.abort()
            const { signal } = (abortController = new AbortController())
            //const view = mapEl.view;

            // When the popup is visible set focus on it.
            await reactiveUtils.whenOnce(() => view.popup.visible, signal)
            view.popup.focus()

            // And when the popup is closed move the focus back to the search wiget.
            await reactiveUtils.whenOnce(() => !view.popup.visible, signal)
            searchWidget.focus()
        }

        searchWidget.on('select-result', (event) => {
            view.goTo({ scale: 250000 })
        })

        searchWidget.on('search-complete', onSearchComplete)

        view.ui.add(searchWidget, { position: 'bottom-right' })

        //#endregion

        // WIRE UP FILTER RESET
        document.querySelectorAll('[id$=-fltr-reset]').forEach((node) => {
            node.addEventListener('click', (e) => {
                let shortLayerName = (e.target as Element).id.split('-')[0]

                //console.log("reseting filter for", shortLayerName)

                // return check boxes to deafult state
                let checkBoxElements = document.getElementsByTagName('calcite-checkbox')

                for (let i = 0; i < checkBoxElements.length; i++) {
                    if (checkBoxElements[i].id.startsWith(shortLayerName)) {
                        //console.log("setting back to default", elements[i].id)
                        checkBoxElements[i].checked = defaultCheckBoxState[checkBoxElements[i].id]
                    }
                }

                // return sliders to default state
                let sliderElements = document.getElementsByTagName('calcite-slider')
                for (let i = 0; i < sliderElements.length; i++) {
                    let sliderElem = sliderElements[i] as HTMLCalciteSliderElement
                    sliderElem.minValue = defaultSliderState[sliderElem.id][0] as number
                    sliderElem.maxValue = defaultSliderState[sliderElem.id][1] as number
                }

                decisionChange(shortLayerName)
            })
        })

        // WIRE UP SHOW FILTER
        document.querySelectorAll('[id$=-show-fltr]').forEach((node) => {
            node.addEventListener('click', (e) => {
                let filterModal = document.getElementById('show-fltr-modal') as HTMLCalciteModalElement
                let filterModalTitle = document.getElementById('show-fltr-modal-title')
                let filterModalContent = document.getElementById('show-fltr-modal-content')

                let shortLayerName = (e.target as Element).id.split('-')[0]

                filterModalTitle!.innerHTML = getFullNameForLayerFromShortName(shortLayerName) + ' filter'

                let theLayerView = getLayerViewFromShortName(shortLayerName)

                if (!theLayerView) return

                if (!theLayerView.filter.where) {
                    filterModalContent!.innerHTML = 'No filter defined, showing all features'
                } else {
                    let filterDescription: string = theLayerView.filter.where

                    //console.log(filterDescription)

                    all_selectors.forEach((sel) => {
                        // console.log("trying to replace", sel.fieldName, "with", sel.fieldLabel)
                        filterDescription = filterDescription.replaceAll(sel.fieldName, sel.fieldLabel)
                    })
                    filterModalContent!.innerHTML = filterDescription
                }

                filterModal!.open = true
            })
        })

        //#region GLOBAL RESET

        // GLOBAL RESET YES BUTTON
        document.getElementById('reset-all-modal-yes-btn')!.addEventListener('click', () => {
            ;(document.getElementById('reset-all-modal') as HTMLCalciteModalElement).open = false

            // reset extent
            // ------------
            view.center = defaultCenterPoint
            view.zoom = defaultZoomLevel

            // reset layer visibility and opacity
            // ----------------------------
            view.map.allLayers.forEach((l) => {
                l.visible = defaultLayerVisibility[l.title]

                if (l.title.endsWith(' Equity')) {
                    l.opacity = 0.66
                } else if (l.title === 'ACS Population') {
                    l.opacity = 0.8
                } else {
                    l.opacity = 1
                }
            })

            resetFilters()
            resetSymbology()

            // reset layer opacity
            urbanLayer.opacity = 0.75

            // reset the initial basemap
            view.map.basemap = Basemap.fromId('gray-vector')

            // make sure the button on the action bar is no longer highlighted
            document.querySelector('[data-action-id="home"]')!.active = false
        })

        // GLOBAL RESET YES BUTTON
        document.getElementById('reset-all-modal-no-btn')!.addEventListener('click', () => {
            let modal = document.getElementById('reset-all-modal') as HTMLCalciteModalElement
            modal.open = false

            // make sure the button on the action bar is no longer highlighted
            document.querySelector('[data-action-id="home"]')!.active = false
        })

        // GLOBAL RESET X OUT OF MODAL BUTTON
        document.getElementById('reset-all-modal')!.addEventListener('calciteModalClose', () => {
            document.querySelector('[data-action-id="home"]')!.active = false
        })

        //#endregion

        // WIRE UP ACS SYMBOLOGY EVENT
        document.getElementById('acs-symbology-select')!.addEventListener('calciteSelectChange', (e) => {
            let acsSymbologySelect = e.target as HTMLCalciteSelectElement
            switch (acsSymbologySelect.value) {
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

        //#region WIRE UP EQUITY SYMBOLOGY EVENTS
        let equityLayers = [noiseEquityLayer, airEquityLayer]
        let equitySymbologyElements = ['noiseEquity-symbology-select', 'airEquity-symbology-select']

        for (let i = 0; i < equityLayers.length; i++) {
            let equityLayer = equityLayers[i]
            let equitySymbologyEl = equitySymbologyElements[i]

            document.getElementById(equitySymbologyEl)!.addEventListener('calciteSelectChange', (e) => {
                let equitySymbologySelect = e.target as HTMLCalciteSelectElement
                switch (equitySymbologySelect.value) {
                    case 'noiseEquityRendererNonWhite':
                        equityLayer.renderer = noiseEquityRendererNonWhite
                        break
                    case 'noiseEquityRendererWhite':
                        equityLayer.renderer = noiseEquityRendererWhite
                        break
                    case 'noiseEquityRendererBlack':
                        equityLayer.renderer = noiseEquityRendererBlack
                        break
                    case 'noiseEquityRendererAsian':
                        equityLayer.renderer = noiseEquityRendererAsian
                        break
                    case 'noiseEquityRendererNative':
                        equityLayer.renderer = noiseEquityRendererNative
                        break
                    case 'noiseEquityRendererPacific':
                        equityLayer.renderer = noiseEquityRendererPacific
                        break
                    case 'noiseEquityRendererOther':
                        equityLayer.renderer = noiseEquityRendererOther
                        break
                    case 'noiseEquityRendererNonPoverty':
                        equityLayer.renderer = noiseEquityRendererNonPoverty
                        break
                    case 'noiseEquityRendererPoverty':
                        equityLayer.renderer = noiseEquityRendererPoverty
                        break
                    case 'airEquityRendererNonWhite':
                        equityLayer.renderer = airEquityRendererNonWhite
                        break
                    case 'airEquityRendererWhite':
                        equityLayer.renderer = airEquityRendererWhite
                        break
                    case 'airEquityRendererBlack':
                        equityLayer.renderer = airEquityRendererBlack
                        break
                    case 'airEquityRendererAsian':
                        equityLayer.renderer = airEquityRendererAsian
                        break
                    case 'airEquityRendererNative':
                        equityLayer.renderer = airEquityRendererNative
                        break
                    case 'airEquityRendererPacific':
                        equityLayer.renderer = airEquityRendererPacific
                        break
                    case 'airEquityRendererOther':
                        equityLayer.renderer = airEquityRendererOther
                        break
                    case 'airEquityRendererNonPoverty':
                        equityLayer.renderer = airEquityRendererNonPoverty
                        break
                    case 'airEquityRendererPoverty':
                        equityLayer.renderer = airEquityRendererPoverty
                        break
                    default:
                        equityLayer.renderer = airEquityRendererNonWhite
                }
            })
        }
        //#endregion

        // WHAT TO DO WHEN A FILTER PANEL IS CLOSING.  this will only pick up the panels on the right
        // (i.e. filter and symbology) and not the left panels associated with the action buttons
        document.querySelectorAll('[id$=-panel]').forEach((node) => {
            node.addEventListener('calcitePanelClose', (e) => {
                let panel = e.target as HTMLCalcitePanelElement
                panel.closed = true
                panel.active = false
                let shortLayerName = (e.target as Element).id.split('-')[0]
                //console.log(`calcite panel for ${shortLayerName} is closing`)

                // console.log('current action is:', currentAction)

                if (currentAction) {
                    document.querySelector(`[data-action-id=${currentAction}]`).setFocus()
                }
            })
        })

        // WIRE UP THE CLOSING OF PANELS THAT ARE RELATED TO ACTIONS (e.g. legend, layerlist, basemaps)
        const calciteActions = document.querySelectorAll('calcite-action[data-action-id]')
        for (let i = 0; i < calciteActions.length; i++) {
            let action = calciteActions[i] as HTMLCalciteActionElement
            let actionId = action.getAttribute('data-action-id')

            // home and street view will not have panels
            if (!['home', 'streetview'].includes(actionId)) {
                let panel = document.querySelector(`[data-panel-id=${actionId}]`) as HTMLCalcitePanelElement

                panel.addEventListener('calcitePanelClose', () => {
                    // reportActionAndPanelState(`pre ${actionId} panel close`)
                    action.setFocus()
                    action.active = false
                    //panel.hidden = true
                    panel.closed = true
                    currentAction = null
                    // reportActionAndPanelState(`post ${actionId} panel close`)
                })
            }
        }

        // WHAT TO DO WHEN LEFT ACTION BAR IS CLICKED
        document.querySelector('calcite-action-bar')!.addEventListener('click', onActionBarClick)

        // WIRE UP THE SIMPLE MAKE SUMMARY BUTTONS
        document.getElementById('simple-summary-btn')!.addEventListener('click', () => {
            onSimpleChartBtnClick(view)
        })

        // WIRE UP FILTER EVENTS FOR "STANDARD" LAYERS
        filterSetup('fars')
        filterSetup('noiseCost')
        filterSetup('noiseEquity')
        filterSetup('airCost')
        filterSetup('airEquity')
        filterSetup('acs')
        // states is a bit special
        filterStatesSetup()

        // WIRE UP STREETVIEW SPECIFIC FUNCTIONALITY
        view.on('click', (e) => {
            let point = view.toMap({ x: e.x, y: e.y })
            let mp = webMercatorUtils.webMercatorToGeographic(point) as Point
            //console.log(mp.y.toFixed(3), mp.x.toFixed(3) + ', zoom level ' + view.zoom) // lat lon
            if (currentAction == 'streetview') {
                let url = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + mp.y.toFixed(4) + ',' + mp.x.toFixed(4)
                window.open(url, '_blank')
                currentAction = null // streetview is a one shot deal, set it to no longer be
                let streetViewAction = document.querySelector('[data-action-id="streetview"]') as HTMLCalciteActionElement
                streetViewAction!.active = false

                // set focus back to the action bar
                document.querySelector('calcite-action-bar')?.setFocus()
            }
        })

        // SET UP CUSTOM CURSOR FOR STREET VIEW MODE
        streetViewCursorDiv = document.createElement('div')
        streetViewCursorDiv.id = 'cursorText'
        streetViewCursorDiv.innerHTML = 'Click on a Road'
        streetViewCursorDiv.style.display = 'none'
        document.body.appendChild(streetViewCursorDiv)

        // HANDLE STREET VIEW MODE CURSOR TEXT
        view.on('pointer-move', (e) => {
            if (currentAction == 'streetview') {
                streetViewCursorDiv.style.left = e.x + 'px'
                streetViewCursorDiv.style.top = e.y + 'px'
                streetViewCursorDiv.style.display = 'block'
                view.popupEnabled = false // no layer popups when in streetview mode
                //console.log(e.x, e.y);
            } else {
                streetViewCursorDiv.style.display = 'none'
                view.popupEnabled = true
            }
        })

        view.on('pointer-leave', () => {
            streetViewCursorDiv.style.display = 'none'
        })

        // MAIN CODE SECTION RELATED TO VIEW UPDATING
        reactiveUtils.watch(
            () => [
                view.stationary,
                statesLayerView.updating,
                farsLayerView.updating,
                noiseCostLayerView.updating,
                noiseEquityLayerView.updating,
                airCostLayerView.updating,
                airEquityLayerView.updating,
                acsLayerView.updating,
                urbanLayerView.updating,
                publicSchoolsLayerView.updating,
                universitiesLayerView.updating,
                redliningLayerView.updating
            ],
            ([stationary, statesU, farsU, noiseCostU, noiseEquityU, airCostU, airEquityU, acsU, urbanU, schoolsU, universitiesU, redliningU]) => {
                if (
                    stationary &&
                    !statesU &&
                    !farsU &&
                    !noiseCostU &&
                    !noiseEquityU &&
                    !airCostU &&
                    !airEquityU &&
                    !acsU &&
                    !urbanU &&
                    !schoolsU &&
                    !universitiesU &&
                    !redliningU
                ) {
                    // no longer updating

                    if (!updatesRelatedToUpdatedViewComplete) {
                        //console.log('calling updates related to updated view')

                        document.getElementById('updating_spinner')!.style.display = 'none'

                        let simpleSummaryButton = document.getElementById('simple-summary-btn') as HTMLCalciteButtonElement
                        simpleSummaryButton!.disabled = false

                        updatesRelatedToUpdatedViewComplete = true
                    }
                } else {
                    //console.log('updating view ...')
                    // updating

                    updatesRelatedToUpdatedViewComplete = false

                    document.getElementById('updating_spinner')!.style.display = 'block'

                    let simpleSummaryButton = document.getElementById('simple-summary-btn') as HTMLCalciteButtonElement
                    simpleSummaryButton!.disabled = true

                    // if the simple summary is open
                    let simpleChartPanel = document.querySelector("[data-panel-id='simpleChart']") as HTMLCalcitePanelElement

                    if (!simpleChartPanel!.closed) {
                        // dont call onSimpleChartBtnClick from here becasue it will update as navigating around the map

                        let ssAcs = document.getElementById('simple-summary-acs') as HTMLCalciteListItemElement
                        ssAcs.description = 'Requires Update'

                        let ssFars = document.getElementById('simple-summary-farsFatals') as HTMLCalciteListItemElement
                        ssFars.description = 'Requires Update'

                        let ssNoiseCost = document.getElementById('simple-summary-noiseCost') as HTMLCalciteListItemElement
                        ssNoiseCost.description = 'Requires Update'

                        let ssNoiseEquity = document.getElementById('simple-summary-noiseEquity') as HTMLCalciteListItemElement
                        ssNoiseEquity.description = 'Requires Update'

                        let ssAircost = document.getElementById('simple-summary-airCost') as HTMLCalciteListItemElement
                        ssAircost.description = 'Requires Update'

                        let ssAirEquity = document.getElementById('simple-summary-airEquity') as HTMLCalciteListItemElement
                        ssAirEquity.description = 'Requires Update'
                    }
                }
            }
        )
    })

    // various elements are initially set to hidden (see html) otherwise they appear in a weird way at page load
    // set them to not be hidden here once everything is initialized (this doesn't mean they are open)

    let m = document.getElementById('show-fltr-modal') as HTMLCalciteModalElement
    m.hidden = false

    m = document.getElementById('reset-all-modal') as HTMLCalciteModalElement
    m.hidden = false

    const panelEls = document.querySelectorAll('calcite-panel')
    for (let i = 0; i < panelEls.length; i++) {
        panelEls[i].hidden = false
    }

    // DON'T LET "POWERED BY ESRI" BE TABBED TO
    document.querySelector('.esri-attribution__link')!.removeAttribute('href')

    // START FOCUS AT THE ACTION BAR (OTHERWISE WOULD BE ON HYPERLINK IN THE TITLE)
    document.querySelector('calcite-action-bar')?.setFocus()

    // DISCLAIMER
    let disclaimerModal = document.getElementById('disclaimer-modal') as HTMLCalciteModalElement
    disclaimerModal.hidden = false
    disclaimerModal.escapeDisabled = true
    disclaimerModal.closeButtonDisabled = true

    document.getElementById('diclaimer-modal-ok-btn')!.addEventListener('click', () => {
        disclaimerModal.open = false
    })

    document.getElementById('disclaimer-label')!.addEventListener('click', () => {
        disclaimerModal.open = true
    })

    disclaimerModal.open = true
}

/**
 called at startup (for each layer) when the layer list is being created in onViewReady.
 this creates adds the actions sections which onLayerListTriggerAction responds to
 */
async function onLayerListItemCreated(event: any) {
    const { item } = event
    await item.layer.when()

    // States
    // -----------------------------------------------------------------
    if (item.title === 'States') {
        item.actionsSections = [
            [{ title: 'Filter', className: 'esri-icon-filter', id: 'filter' }],
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Noise Cost
    // -----------------------------------------------------------------
    else if (item.title === 'Noise Cost') {
        item.actionsSections = [
            [{ title: 'Filter', className: 'esri-icon-filter', id: 'filter' }],
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Noise Equity
    // -----------------------------------------------------------------
    else if (item.title === 'Noise Equity') {
        item.actionsSections = [
            [
                { title: 'Filter', className: 'esri-icon-filter', id: 'filter' },
                { title: 'Symbology', className: 'esri-icon-maps', id: 'symbology' }
            ],
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Fatality Analysis Reporting System (FARS)
    // -----------------------------------------------------------------
    else if (item.title === 'FARS (number of crashes)') {
        item.actionsSections = [
            [{ title: 'Filter', className: 'esri-icon-filter', id: 'filter' }],
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Air Cost
    // -----------------------------------------------------------------
    else if (item.title === 'Air Cost') {
        item.actionsSections = [
            [{ title: 'Filter', className: 'esri-icon-filter', id: 'filter' }],
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Air Equity
    // -----------------------------------------------------------------
    else if (item.title === 'Air Equity') {
        const item = event.item

        item.actionsSections = [
            [
                { title: 'Filter', className: 'esri-icon-filter', id: 'filter' },
                { title: 'Symbology', className: 'esri-icon-maps', id: 'symbology' }
            ],
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // ACS Population
    // -----------------------------------------------------------------
    else if (item.title === 'ACS Population') {
        // to change the symbol, choose from https://developers.arcgis.com/javascript/latest/esri-icon-font/
        item.actionsSections = [
            [
                { title: 'Filter', className: 'esri-icon-filter', id: 'filter' },
                { title: 'Symbology', className: 'esri-icon-maps', id: 'symbology' }
            ],
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Adjusted Urban Area Boundaries
    // -----------------------------------------------------------------
    else if (item.title === 'Adjusted Urban Area Boundaries') {
        item.actionsSections = [
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Land Cover
    // -----------------------------------------------------------------
    else if (item.title === 'Land Cover') {
        item.actionsSections = [
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Public Schools
    // -----------------------------------------------------------------
    else if (item.title === 'Public Schools') {
        item.actionsSections = [
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Universities
    // -----------------------------------------------------------------
    else if (item.title === 'Universities') {
        item.actionsSections = [
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Redlining Layer
    // -----------------------------------------------------------------
    else if (item.title === 'Redlined Neighborhoods') {
        item.actionsSections = [
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }

    // Particulate Matter - 2.5
    // -----------------------------------------------------------------
    else if (item.title === 'Particulate Matter - 2.5') {
        item.actionsSections = [
            [
                {
                    title: 'Increase opacity',
                    icon: 'chevron-up',
                    id: 'increase-opacity'
                },
                {
                    title: 'Decrease opacity',
                    icon: 'chevron-down',
                    id: 'decrease-opacity'
                }
            ]
        ]
    }
}

function wireUpOnLayerVisibilityChanges() {
    // when layer visibility is changed enable or disable its filter, table, and transparency slider

    function updateLayerlistActionItems(layer: Layer) {
        //console.log('visibility change for', layer.title, ' it is now', layer.visible)

        layerList.operationalItems.forEach((oi: ListItem) => {
            if (oi.title === layer.title) {
                if (layer.visible) {
                    //make the action sections  visible
                    oi.actionsSections.forEach((as) => {
                        as.forEach((asItem) => {
                            asItem.visible = true
                        })
                    })
                } else {
                    //console.log('setting stuff to disabled for', layer.title)

                    // if the filter for the layer is open then close it
                    //because it'd be weird to be filtering but not seeing.
                    let shortName = getShortNameForLayerFromFullName(layer.title)

                    let filterPanelNode = document.getElementById(shortName + '-fltr-panel') as HTMLCalcitePanelElement
                    if (filterPanelNode) {
                        filterPanelNode.closed = true
                    }

                    let symbologyPanelNode = document.getElementById(shortName + '-symbology-panel') as HTMLCalcitePanelElement
                    if (symbologyPanelNode) {
                        symbologyPanelNode.closed = true
                    }

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
        noiseCostLayer,
        noiseEquityLayer,
        airCostLayer,
        airEquityLayer,
        acsLayer,
        farsLayer,
        urbanLayer,
        landcoverLayer,
        publicSchoolsLayer,
        universitiesLayer,
        redliningLayer
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

/**
 * Wire up preset button views
 * Called from onViewReady
 */
function wireUpPresetButtonViews() {
    let presetButtons = document.getElementsByClassName('presetViewButton')
    for (let i = 0; i < presetButtons.length; i++) {
        let button = presetButtons[i]
        button.addEventListener('click', () => {
            // set layer visibility for this preset view
            // NOTE: If a layer is not given a defined preset value, it will be kept the same as before clicking a preset view
            // This is to keep the basemap, which can change, always visible
            let presetName: string = button.id.split('-')[0]
            let presetLayerVisibility = settings.presetViews[presetName]
            // set layer visibility
            view.map.allLayers.forEach((l) => {
                l.visible = presetLayerVisibility[l.title]

                if (l.title.endsWith(' Equity')) {
                    l.opacity = 0.66
                }
            })
            urbanLayer.opacity = 1

            // TODO: Reset opacity on layers after a reset like this?

            resetFilters()
            resetSymbology()

            // if simple summary is open, fire the update.
            let simpleSummaryPanel = document.querySelector('[data-panel-id="simpleChart"]') as HTMLCalcitePanelElement
            if (!simpleSummaryPanel.closed) {
                //onSimpleChartBtnClick()

                // ideally you could just update the air and cost elements but there's a weird
                // sequence going on related to maybe calling the overall map update (like during a pan).
                // just do this for now to get things workign.

                let ssAcs = document.getElementById('simple-summary-acs') as HTMLCalciteListItemElement
                ssAcs.description = 'Requires Update'

                let ssFars = document.getElementById('simple-summary-farsFatals') as HTMLCalciteListItemElement
                ssFars.description = 'Requires Update'

                let ssNoiseCost = document.getElementById('simple-summary-noiseCost') as HTMLCalciteListItemElement
                ssNoiseCost.description = 'Requires Update'

                let ssNoiseEquity = document.getElementById('simple-summary-noiseEquity') as HTMLCalciteListItemElement
                ssNoiseEquity.description = 'Requires Update'

                let ssAircost = document.getElementById('simple-summary-airCost') as HTMLCalciteListItemElement
                ssAircost.description = 'Requires Update'

                let ssAirEquity = document.getElementById('simple-summary-airEquity') as HTMLCalciteListItemElement
                ssAirEquity.description = 'Requires Update'
            }
        })
    }
}

//#endregion

// ============================================================================
//#region     HELPER FUNCTIONS
// ============================================================================

// this is the function that is called when a left action bar button is clicked.

function reportActionAndPanelStateDebugHelper(from) {
    console.log('-----------------------------------')
    console.log('from:', from)
    console.log('currentAction:', currentAction)

    if (currentAction) {
        let action = document.querySelector(`[data-action-id=${currentAction}]`) as HTMLCalciteActionElement
        let panel = document.querySelector(`[data-panel-id=${currentAction}]`) as HTMLCalcitePanelElement

        console.log('action.active: ', action.active)
        //console.log('panel.hidden: ', panel.hidden)
        console.log('panel.closed: ', panel.closed)
    }
}

/**
 * what happens when the user clicks a button on the left action bar
 */
function onActionBarClick(event: Event) {
    let elem = event.target as Element

    if (elem.tagName !== 'CALCITE-ACTION') return

    // set all actions to be inactive (not highlighted)
    const allCalciteActions = document.querySelectorAll('calcite-action[data-action-id]')
    for (let i = 0; i < allCalciteActions.length; i++) {
        let actionEl = allCalciteActions[i] as HTMLCalciteActionElement
        actionEl.active = false
    }

    currentAction = elem.dataset.actionId

    //console.log(`${currentAction} is the current action`)

    // close any other action related panels that might be open.
    // This handles the case where for example someone had the layerlist
    // open and then clicked directly on the legend.
    for (let i = 0; i < allCalciteActions.length; i++) {
        let actionEl = allCalciteActions[i] as HTMLCalciteActionElement
        let actionId = actionEl.getAttribute('data-action-id')

        // ignore the current one.  home and streetview don't have panels
        let actionsToIgnore = ['home', 'streetview', currentAction]

        if (!actionsToIgnore.includes(actionId)) {
            let panelEl = document.querySelector(`[data-panel-id=${actionId}]`) as HTMLCalcitePanelElement
            panelEl.closed = true
        }
    }

    // given the id names used, this query will only pick up the panels on the right (e.g. filter, query)
    document.querySelectorAll('[id$=-panel]').forEach((node) => {
        let panel = node as HTMLCalcitePanelElement
        panel.closed = true
    })

    if (currentAction === 'home') {
        let resetAllModal = document.getElementById('reset-all-modal') as HTMLCalciteModalElement
        resetAllModal.open = true
    } else if (currentAction === 'streetview') {
        const mouseEvent = event as MouseEvent
        streetViewCursorDiv.style.left = mouseEvent.clientX + 50 + 'px'
        streetViewCursorDiv.style.top = mouseEvent.clientY - 10 + 'px'
        // show the streetViewCursorDiv text in the view
        streetViewCursorDiv.style.display = 'block'
    } else {
        let actionEl = document.querySelector(`[data-action-id=${currentAction}]`) as HTMLCalciteActionElement
        let panelEl = document.querySelector(`[data-panel-id=${currentAction}]`) as HTMLCalcitePanelElement

        // if closed open, if open then close
        if (panelEl.closed == true) {
            actionEl.active = true
            panelEl.closed = false
            panelEl.setFocus()

            // fire this to update the chart when opening it
            if (currentAction === 'simpleChart') {
                onSimpleChartBtnClick()
            }
        } else {
            // otherwise the datapanel is already open so close it
            actionEl.active = false
            //panelEl.hidden = true
            panelEl.closed = true
        }
    }
}

/**
 * what happens when a user clicks on one of the options in the '...' list of a layer
 * this doesn't fire when the ... itself is clicked on.
 */
function onLayerListTriggerAction(e: any) {
    // console.log('onLayerListTriggerAction')

    let actionName = e.action.id
    let fullLayerName = e.item.layer.title

    //console.log(`${fullLayerName} visibility = ${e.item.layer.visible}`)

    let listItem = e.item as ListItem

    //console.log('layer list trigger action:', actionName, ' ', fullLayerName)

    //event.item.actionsOpen = false

    if (actionName === 'filter') {
        // iterate through all filter panels and hide all others and show the one of interest
        document.querySelectorAll('[id$=fltr-panel]').forEach((node) => {
            let filterPanel = node as HTMLCalcitePanelElement

            // if any symbology panel is open close it
            document.querySelectorAll('[id$=symbology-panel]').forEach((node) => {
                let symbologyPanel = node as HTMLCalcitePanelElement
                symbologyPanel.closed = true
            })

            if (filterPanel.id == getShortNameForLayerFromFullName(fullLayerName) + '-fltr-panel') {
                if (filterPanel.closed == true) {
                    // open the filter panel
                    filterPanel.closed = false
                    filterPanel.setFocus()

                    // close the layer list (leaving this open just causes focus complications)
                    let layerListPanel = document.querySelector("[data-panel-id='layers']") as HTMLCalcitePanelElement
                    layerListPanel.closed = true
                } else {
                    // close the filter panel
                    console.log('closing the filter panel from layer list actions')
                    filterPanel.closed = true
                }
            } else {
                // close other filter panels
                filterPanel.closed = true
            }
        })
    } else if (actionName === 'symbology') {
        //console.log('action is symbology')

        // iterate through all symbology panels and hide all others and show the one of interest
        document.querySelectorAll('[id$=symbology-panel]').forEach((node) => {
            let symbologyPanel = node as HTMLCalcitePanelElement

            // if any filter panels are open close them
            document.querySelectorAll('[id$=filter-panel]').forEach((fpel) => {
                let filterPanel = fpel as HTMLCalcitePanelElement
                filterPanel.closed = true
            })

            if (symbologyPanel.id == getShortNameForLayerFromFullName(fullLayerName) + '-symbology-panel') {
                if (symbologyPanel.closed == true) {
                    // open the filter panel
                    symbologyPanel.closed = false
                    symbologyPanel.setFocus()

                    // close the layer list (leaving this open just causes focus complications)
                    let layerListPanel = document.querySelector("[data-panel-id='layers']") as HTMLCalcitePanelElement
                    layerListPanel.closed = true
                } else {
                    // close the filter panel
                    console.log('closing the filter panel from layer list actions')
                    symbologyPanel.closed = true
                }
            } else {
                // close other filter panels
                symbologyPanel.closed = true
            }
        })
    } else if (actionName === 'increase-opacity') {
        listItem.layer.opacity < 1 && (listItem.layer.opacity += 0.2)
    } else if (actionName === 'decrease-opacity') {
        listItem.layer.opacity > 0 && (listItem.layer.opacity -= 0.2)
    }
}

/**
 * reset filters
 */
function resetFilters() {
    // reset filters
    // -------------
    settings['layers']
        .map((a) => a.shortName)
        .forEach((shortLayerName) => {
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
                elements[i].minValue = defaultSliderState[elements[i].id][0] as number
                elements[i].maxValue = defaultSliderState[elements[i].id][1] as number
            }

            decisionChange(shortLayerName)
        })

    // if a filter is open then close it too
    document.querySelectorAll('[id$=fltr-panel]').forEach((node) => {
        let filterPanel = node as HTMLCalcitePanelElement
        //filterPanel.hidden = true
        filterPanel.closed = true
    })
}

/**
 * reset symbology
 */
function resetSymbology() {
    // reset layer symbologies
    airEquityLayer.renderer = airEquityRendererNonWhite
    noiseEquityLayer.renderer = noiseEquityRendererNonWhite
    acsLayer.renderer = acsRendererNonWhite

    // reset symbology dropdowns
    for (let i = 0; i < layersWithSymbology.length; i++) {
        let selectElement = document.getElementById(layersWithSymbology[i] + '-symbology-select') as HTMLCalciteSelectElement
        selectElement.value = layersWithSymbology[i] + 'RendererNonWhite'
    }

    // if any symbology panel is open close it
    document.querySelectorAll('[id$=symbology-panel]').forEach((e) => {
        let symbologyPanel = e as HTMLCalcitePanelElement
        symbologyPanel.closed = true
        //symbologyPanel.hidden = true
    })
}

//#endregion

// ============================================================================
//#region     WORKING WITH NAMES AND FIELDS IN SETTINGS.JSON FUNCTIONS
// ============================================================================

/**
 * get short name for layer from full name
 */
function getShortNameForLayerFromFullName(fullName: string) {
    // short names are simple, lower case, and not have spaces or hypens
    // read the settings json file and get the short name from the long name,
    // for example, pass in 'Fatality Analysis Reporting System (FARS)' get back 'fars'
    let selectedLayer = settings.layers.filter((l) => {
        return l.fullName === fullName
    })[0]

    return selectedLayer ? selectedLayer.shortName : null
}

/**
 * get full name for layer from short name
 */
function getFullNameForLayerFromShortName(shortName: string) {
    // short names are simple, lower case, and not have spaces or hypens
    // read the settings json file and get the long name from the short name,
    // for example, pass in 'fars' and get back 'Fatality Analysis Reporting System (FARS)'
    let selectedLayer = settings.layers.filter((l) => {
        return l.shortName === shortName
    })[0]

    return selectedLayer ? selectedLayer.fullName : null
}

/**
 * get field name and type for select id  TODO: rename to make more sense
 */
function getFieldNameAndTypeForSelectId(shortName: string, selectorName: string) {
    // getFieldNameAndTypeForSelectId('nhs', 'lanes')  returns ['through_la', 'integer']

    //console.log("input to getShortNameForLayerFromFullName: ", shortName, selectorName);

    let fieldName: string | null = null
    let fieldType: string | null = null

    let selectedLayer = settings.layers.filter((l) => {
        return l.shortName === shortName
    })[0]

    if (selectedLayer) {
        let x = selectedLayer.selectors!.filter((s) => {
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

/**
 * get the layerview given the shortname
 */
function getLayerViewFromShortName(shortName: string): FeatureLayerView | null {
    switch (shortName) {
        case 'fars':
            return farsLayerView
        case 'acs':
            return acsLayerView
        case 'urban':
            return urbanLayerView
        case 'noiseCost':
            return noiseCostLayerView
        case 'noiseEquity':
            return noiseEquityLayerView
        case 'airCost':
            return airCostLayerView
        case 'airEquity':
            return airEquityLayerView
        case 'states':
            return statesLayerView
        case 'publicSchools':
            return publicSchoolsLayerView
        case 'universities':
            return universitiesLayerView
        case 'redlining':
            return redliningLayerView
        default:
            return null
    }
}

//#endregion

// ============================================================================
//#region     FILTER SPECIFIC FUNCTIONS
// ============================================================================

function filterBlockClick(event: Event) {
    // This function finds all caclite blocks within the same filter panel
    // as the calcite block id that was passed in and closes them, with
    // the exception of the one passed in. This is used so that no more than
    // one is expanded at any given time.  There is some extra complexity
    // here becuase the sel controls also fire the block change event

    // regardless of whether it's a block or a sel, we can get the name from
    // the event given the naming conventions
    let eventTargetId = (event.target as Element).id
    let filterLayerShortName = eventTargetId.split('-')[0]

    // if it's an actual block
    if (eventTargetId.startsWith(filterLayerShortName + '-fltr-block-')) {
        // get all the blocks for this layer
        let filterBlockSelector = '[id^=' + CSS.escape(filterLayerShortName) + '-fltr-block-]'

        // if it's not the calling block then close it
        document.querySelectorAll(filterBlockSelector).forEach((node) => {
            let aFilterBlock = node as HTMLCalciteBlockElement
            if (aFilterBlock.id != eventTargetId) {
                aFilterBlock.open = false
            }
        })
    }
}

function getLayerFilter(shortLayerName: string) {
    // create the sql that is used to filter the layer.  NOTE: that despite the name, this function also
    // updates the html text associated with the filter units (for the moment just on sliders)

    function getUnits(shortname: string, fieldname: string) {
        // get units from config file to add to filter.  units is optional, if it doesn't exist it will return null.
        // this function also adds a bit of additional formatting, namely space and ()
        let units = ''
        try {
            let unitsFromConfig = settings.layers
                .filter((item) => item.shortName === shortname)[0]
                .selectors.filter((item) => item.fieldName === fieldname)[0].units

            if (unitsFromConfig) {
                units = ' ' + unitsFromConfig
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
    let uniqueFilterVariables: string[] = []

    let selector = '[id^=' + shortLayerName + '-fltr-sel-]'
    document.querySelectorAll(selector).forEach((node) => {
        let blockId = node.id.split('-')[3]
        if (!uniqueFilterVariables.includes(blockId)) {
            uniqueFilterVariables.push(blockId)
        }
    })

    //console.log("uniq sel ids", uniqueFilterVariables)

    // build up the layer query parts and process each selector group
    let queryParts: string[] = []

    uniqueFilterVariables.forEach((aFilterVariable) => {
        //console.log('-------------------------------------');
        //console.log('Building sub part query for filterVariable: ', aFilterVariable);

        const [fieldName, fieldType] = getFieldNameAndTypeForSelectId(shortLayerName, aFilterVariable)
        //console.log("fieldName = ", fieldName, "fieldType = ", fieldType);

        let sliderNodes = document.querySelectorAll('[id^=' + shortLayerName + '-fltr-sel-' + aFilterVariable + '-slider]')
        //console.log("slider nodes = ", sliderNodes)

        let checkBoxNodes = document.querySelectorAll('[id^=' + shortLayerName + '-fltr-sel-' + aFilterVariable + '-cb]')
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

            let absoluteMin = theSlider!.min // from doc: Minimum selectable value
            let currentMin = theSlider!.minValue // from doc: Currently selected lower number (if multi-select)

            let currentMax = theSlider!.maxValue // e.g. 20 (the outlier max value seen)  // from doc: Currently selected upper number (if multi-select)
            let absoluteMax = theSlider!.max // e.g 5 (a more commonly seen value for fatalities)  // from doc: Maximum selectable value

            let atMin = absoluteMin === currentMin
            let atMax = absoluteMax === currentMax

            //console.log("\tabsMin:", absoluteMin, ", curMin:", currentMin, ", curMax:", currentMax, ", absMax:", absoluteMax, ", atMin:", atMin, ", atMax:", atMax)

            // if (atMin && atMax) then don't add the filter

            // avoid showing filter as > 1.000000001 and don't add .0 to integers
            Number.isInteger(currentMin) ? (currentMin = currentMin.toFixed(0)) : (currentMin = currentMin.toFixed(1))
            Number.isInteger(currentMax) ? (currentMax = currentMax.toFixed(0)) : (currentMax = currentMax.toFixed(1))

            if (atMin && !atMax) {
                let subQuery = fieldName + ' <= ' + currentMax
                queryParts.push('(' + subQuery + ')')
                theSliderLabel!.innerHTML = ' <= ' + currentMax.toLocaleString() + getUnits(shortLayerName, fieldName as string)
            } else if (!atMin && atMax) {
                let subQuery = fieldName + ' >= ' + currentMin
                queryParts.push('(' + subQuery + ')')
                theSliderLabel!.innerHTML = ' >= ' + currentMin.toLocaleString() + getUnits(shortLayerName, fieldName as string)
            } else if (!atMin && !atMax) {
                let subQuery = fieldName + ' >= ' + currentMin + ' and ' + fieldName + ' <= ' + currentMax
                queryParts.push('(' + subQuery + ')')
                theSliderLabel!.innerHTML =
                    '>= ' + currentMin.toLocaleString() + ' and <= ' + currentMax.toLocaleString() + getUnits(shortLayerName, fieldName as string)
            } else {
                theSliderLabel!.innerHTML = 'no filter set'
            }
        }

        // CHECKBOXES
        // ----------

        if (checkBoxNodes.length > 0) {
            let orParts: string[] = []
            let selectedVals: string[] = []

            let totalNodes = 0
            checkBoxNodes.forEach((node) => {
                let checkBoxNode = node as HTMLCalciteCheckboxElement
                if (!checkBoxNode.id.endsWith('-input')) {
                    // the ones that end with -input are just noise

                    totalNodes += 1

                    if (checkBoxNode.checked) {
                        if (checkBoxNode.value.startsWith('>=') || checkBoxNode.value.startsWith('<=')) {
                            // TODO:
                            orParts.push(checkBoxNode.value)
                        } else {
                            if (fieldType == 'text') {
                                selectedVals.push("'" + checkBoxNode.value + "'")
                            } else if (fieldType == 'float') {
                                selectedVals.push(checkBoxNode.value.toFixed(2))
                            } else {
                                selectedVals.push(checkBoxNode.value)
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

function getStatesFilter(shortLayerName: string) {
    // this is the case for all layers setup in prep layers.  but for external layers (e.g. disadvantaged)
    // it has to be handle separately
    let stateAbbrevField = 'STUSPS'

    if (shortLayerName === 'disadvantaged') stateAbbrevField = 'st_abbr'
    else if (shortLayerName === 'noiseCost') {
        stateAbbrevField = 'STATE_ABB'
    } else if (shortLayerName === 'airCost') {
        stateAbbrevField = 'STATE_ABB'
    } else if (shortLayerName === 'noiseEquity') {
        stateAbbrevField = 'STATE_ABB'
    } else if (shortLayerName === 'airEquity') {
        stateAbbrevField = 'STATE_ABB'
    } else if (shortLayerName === 'acs') {
        stateAbbrevField = 'STATE_ABB'
    } else if (shortLayerName === 'fars') {
        stateAbbrevField = 'STATE_ABB'
    }

    let statesQuery

    // whenever there is a decision change something is going to be updated and it's always
    // going to involve the currently selected states so always put this query together upfront
    // ----------------------------------------------------------------------------------------
    let selectedStates: string[] = []
    document.querySelectorAll('[id^=states-fltr-sel-stateabb-cb]').forEach((node) => {
        let cb = node as HTMLCalciteCheckboxElement
        if (cb.checked) {
            if (!selectedStates.includes(cb.value)) {
                selectedStates.push(cb.value)
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

    // console.log("statesQuery", statesQuery);
    return statesQuery
}

function updateFilterForStandardLayer(layerToUpdate: string) {
    // console.log("====  updateFilterForStandardLayer ", layerToUpdate);
    let theQuery = getLayerFilter(layerToUpdate)
    // console.log('the query for ', layerToUpdate, 'is ', theQuery)
    let theLayerView = getLayerViewFromShortName(layerToUpdate)
    if (!theLayerView) return
    theLayerView.filter = { where: theQuery }
    // console.log("====  DONE updateFilterForStandardLayer ", layerToUpdate);
}

function decisionChange(shortLayerName: string) {
    // This method is what's called whenver any selection change happens (or selection changes at startup).
    // It is sometimes called directly, and other times called from decisionChangeFromEvent

    // console.log('decision change for ', shortLayerName)

    if (shortLayerName == 'states') {
        let statesFilter = getStatesFilter(shortLayerName)

        if (statesFilter) {
            statesLayerView.filter = new FeatureFilter({ where: statesFilter })
        } else {
            statesLayerView.filter = null
        }

        let layersToUpdateWhenStateChanges = ['fars', 'urban', 'noiseCost', 'noiseEquity', 'airCost', 'airEquity', 'acs']

        layersToUpdateWhenStateChanges.forEach((layerToUpdateWhenStateChanges) => {
            updateFilterForStandardLayer(layerToUpdateWhenStateChanges)
        })
    } else {
        // only update the one layer's filter
        updateFilterForStandardLayer(shortLayerName)
    }
}

function decisionChangeFromEvent(event: Event) {
    // this is called whenever a checkbox or slider is changed.

    let shortLayerName = (event.target as Element).id.split('-')[0]
    decisionChange(shortLayerName)
}

function filterSetup(layerShortName: string) {
    // The top call wires up events related to filter changes.  In the end they both call "decisionChangeFromEvent"
    // The bottom call wires up events related to expanding and collapsing the block events.
    // note that states is handled by a separate function.

    document.querySelectorAll('[id^=' + layerShortName + '-fltr-sel-]').forEach((node) => {
        if (!node.id.endsWith('-input')) {
            if (node.tagName.endsWith('-CHECKBOX')) {
                node.addEventListener('calciteCheckboxChange', decisionChangeFromEvent)
            } else if (node.tagName.endsWith('-SLIDER')) {
                // debounce gets used this way. think of it as a function
                let onFilterSlider = promiseUtils.debounce(decisionChangeFromEvent)

                node.addEventListener('calciteSliderChange', (event) => {
                    onFilterSlider(event).catch((err: any) => {
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
    selectAllBtn!.addEventListener('click', (event) => {
        document.querySelectorAll('[id^=states-fltr-sel-stateabb-cb]').forEach((node) => {
            let checkBox = node as HTMLCalciteCheckboxElement
            checkBox.checked = true
        })
        decisionChangeFromEvent(event)
    })

    // what to do when the "Select None" button is pressed on the states filter
    let selectNoneBtn = document.querySelector('#states-fltr-stateabb-selectnone-btn')
    selectNoneBtn!.addEventListener('click', (event) => {
        document.querySelectorAll('[id^=states-fltr-sel-stateabb-cb]').forEach((node) => {
            ;(node as HTMLCalciteCheckboxElement).checked = false
        })
        decisionChangeFromEvent(event)
    })
}

//#endregion

// ============================================================================
//#region     SIMPLE SUMMARY CHART FUNCTIONS
// ============================================================================

async function simpleSummaryUpdateStat(aLayerView: FeatureLayerView, sumField: string, listItemId: string) {
    // calculate and set one of the numbers on the simple summary data panel

    //console.log('simple summary update', sumField, htmlTag)

    let ssListItem = document.getElementById(listItemId) as HTMLCalciteListItemElement

    if (!aLayerView.visible) {
        ssListItem.description = 'Layer Not Visible'
        return
    } else {
        ssListItem.description = 'Updating ...'
    }

    let query: Query
    if (aLayerView.filter) {
        query = aLayerView.filter.createQuery()
        query.geometry = view.extent
    } else {
        query = aLayerView.createQuery()
        query.geometry = view.extent
    }

    //query.spatialRelationship = 'within'

    aLayerView
        .queryFeatures(query)
        .then((results) => {
            //console.log("features = ", results.features.length)
            let sum = 0

            results.features.forEach((result) => {
                if (sumField === 'SIMPLEFEATURE_COUNT') {
                    sum += 1
                } else {
                    //console.log(result.attributes[sumField])
                    sum += result.attributes[sumField]
                }
            })

            ssListItem.description = Math.round(sum).toLocaleString('en-US')
        })
        .catch((error) => {
            console.log('query failed: ', error)
        })
}

async function simpleSummaryUpdateAcsStat(extent: __esri.Extent) {
    // get from current ND field being used to symbolize this layer
    let demographicToUseField = acsLayerView.layer.renderer.visualVariables[0].field //.split('_')[0]
    let demographicToUseTitle = acsLayerView.layer.renderer.visualVariables[0].field.split('_')[0]

    // console.log('demographic to use for simple summary ACS stats: ', demographicToUseField, demographicToUseTitle)

    let ssAcsListItem = document.getElementById('simple-summary-acs') as HTMLCalciteListItemElement

    if (!acsLayerView.visible) {
        ssAcsListItem.description = 'Layer Not Visible'
        return
    } else {
        ssAcsListItem.description = 'Updating ...'
    }

    // NOTE: typescript is upset about query.extent but any other property breaks functionality
    let query: Query
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
        .then((results) => {
            // console.log("features = ", results.features.length)

            let sum = 0

            results.features.forEach((result) => {
                // for each block group multiply the population by the demographic percent to get the pop of this demographic
                sum += (result.attributes[demographicToUseField] / 100.0) * result.attributes['population']
            })

            ssAcsListItem.label = 'ACS Population (' + demographicToUseTitle + ')'
            ssAcsListItem.description = Math.round(sum).toLocaleString('en-US')
        })
        .catch((error) => {
            console.log('query failed: ', error)
            ssAcsListItem.description = 'Not Available'
        })
}

async function simpleSummaryUpdateEquityStat(extent: __esri.Extent) {
    let equityViews = [noiseEquityLayerView, airEquityLayerView]
    let equitySummaryElements = ['simple-summary-noiseEquity', 'simple-summary-airEquity']
    let noiseOrAir = ['Noise', 'Air']

    for (let i = 0; i < equityViews.length; i++) {
        let equityView = equityViews[i]
        let equitySummaryElId = equitySummaryElements[i]
        let costType = noiseOrAir[i]

        // get from current ND field being used to symbolize this layer
        let demographicToUsePrefix = equityView.layer.renderer.visualVariables[0].field.split('_')[0]

        // get equity cost field.  This is a bit ugly due to non standard naming conventions on the fields

        let equityCostField: string

        switch (demographicToUsePrefix) {
            case 'pacific':
            case 'poverty':
                equityCostField = demographicToUsePrefix + '_cs'
                break
            case 'nonwhite':
                equityCostField = demographicToUsePrefix + '_c'
                break
            default:
                equityCostField = demographicToUsePrefix + '_cst'
        }

        // console.log(demographicToUsePrefix, equityCostField)

        let ssEquityListItem = document.getElementById(equitySummaryElId) as HTMLCalciteListItemElement

        if (!equityView.visible) {
            ssEquityListItem.description = 'Layer Not Visible'
            continue
        } else {
            ssEquityListItem.description = 'Updating ...'
        }

        // NOTE: typescript is upset about query.extent but any other property breaks functionality
        let query: Query
        if (equityView.filter) {
            query = equityView.filter.createQuery()
            query.extent = extent
        } else {
            query = equityView.createQuery()
            query.extent = extent
        }

        query.spatialRelationship = 'within'

        equityView
            .queryFeatures(query)
            .then((results) => {
                // console.log("features = ", results.features.length)

                // TODO: not sure this is needed anymore
                //document.getElementById('simple-summary-main-div')!.style.display = 'flex'

                let sum = 0

                results.features.forEach((result) => {
                    sum += result.attributes[equityCostField]
                })

                ssEquityListItem.label = 'Total ' + costType + ' Cost (' + demographicToUsePrefix + ')'
                ssEquityListItem.description = ' $ ' + Math.round(sum).toLocaleString('en-US')
            })
            .catch((error) => {
                console.log('query failed: ', error)
            })
    }
}

async function simpleSummaryUpdateCostStat(extent: __esri.Extent) {
    let costViews = [noiseCostLayerView, airCostLayerView]
    let costSummaryElements = ['simple-summary-noiseCost', 'simple-summary-airCost']

    for (let i = 0; i < costViews.length; i++) {
        let costView = costViews[i]
        let costSummaryElId = costSummaryElements[i]

        // console.log("updating costview", costView.layer.title, 'with visibility', costView.visible)

        let ssCostListItem = document.getElementById(costSummaryElId) as HTMLCalciteListItemElement

        if (!costView.visible) {
            ssCostListItem.description = 'Layer Not Visible'
            continue
        } else {
            ssCostListItem.description = 'Updating ...'
        }

        // NOTE: typescript is upset about query.extent but any other property breaks functionality
        let query: Query
        if (costView.filter) {
            query = costView.filter.createQuery()
            query.extent = extent
        } else {
            query = costView.createQuery()
            query.extent = extent
        }

        query.spatialRelationship = 'within'

        costView
            .queryFeatures(query)
            .then((results) => {
                // console.log("features = ", results.features.length)

                // TODO: not sure this is needed anymore
                //document.getElementById('simple-summary-main-div')!.style.display = 'flex'

                let totalLen = 0

                var sumLengthByBin: { [key: number]: number } = {}

                results.features.forEach((result) => {
                    let bin = result.attributes['bin_cl'] // cl = cost per length
                    let len = result.attributes['Shape__Length']

                    totalLen += len

                    if (sumLengthByBin[bin]) {
                        sumLengthByBin[bin] += len
                    } else {
                        sumLengthByBin[bin] = len
                    }

                    // console.log(bin, len)
                })

                // console.log(sumLengthByBin)

                let avgCost = 0.0

                for (const [bin, sumlen] of Object.entries(sumLengthByBin)) {
                    let contrib = bin * (sumlen / totalLen)
                    avgCost += contrib
                    //console.log(bin,  sumlen, contrib);
                }

                ssCostListItem.description = avgCost.toFixed(1)
            })
            .catch((error) => {
                console.log('query failed: ', error)
            })
    }
}

function onSimpleChartBtnClick() {
    simpleSummaryUpdateAcsStat(view.extent)
    simpleSummaryUpdateStat(farsLayerView, 'FATALS', 'simple-summary-farsFatals')
    simpleSummaryUpdateEquityStat(view.extent)
    simpleSummaryUpdateCostStat(view.extent)
}

//#endregion

// ============================================================================
//#region     MAIN
// ============================================================================

esriConfig.apiKey = import.meta.env.VITE_API_KEY

if (import.meta.env.MODE == 'development' || import.meta.env.MODE == 'staging') {
    let versionNameDiv = document.getElementById('version-div-name')
    versionNameDiv!.innerHTML = 'DEVELOPMENT'
    versionNameDiv!.style.color = 'orange'
    versionNameDiv!.style.fontWeight = 'bold'
    versionNameDiv!.style.fontSize = '18px'
    document.getElementById('version-div-date')!.innerHTML = settings.VERSION_DATE
} else {
    document.getElementById('version-div-name')!.innerHTML = settings.VERSION_NAME
    document.getElementById('version-div-date')!.innerHTML = settings.VERSION_DATE
}

// set up what's needed to return filter checkboxes to the default state
let checkboxElements: HTMLCollectionOf<HTMLCalciteCheckboxElement> = document.getElementsByTagName('calcite-checkbox')
for (let i = 0; i < checkboxElements.length; i++) {
    defaultCheckBoxState[checkboxElements[i].id] = checkboxElements[i].checked
}

// set up what's needed to return filter sliders to the default state
let sliderElements: HTMLCollectionOf<HTMLCalciteSliderElement> = document.getElementsByTagName('calcite-slider')
for (let i = 0; i < sliderElements.length; i++) {
    let sliderElem = sliderElements[i]
    if (sliderElem) {
        defaultSliderState[sliderElem.id] = [sliderElements[i].minValue, sliderElements[i].maxValue]
    }
}

window.addEventListener('load', () => {
    document.getElementById('header-content')!.style.display = 'flex'

    view = setUpMap()
    view.when(() => {
        // TODO:disable stuff until it's ready (e.g. action bar)
        onViewReady()
    })
})

//#endregion
