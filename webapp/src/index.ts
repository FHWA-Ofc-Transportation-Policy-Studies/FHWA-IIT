// ========================================================
//#region     IMPORTS

import settings from './config/settings.json'
import { setAssetPath } from '@esri/calcite-components/dist/components'
setAssetPath('https://js.arcgis.com/calcite-components/1.9.2/assets')
import '@esri/calcite-components/dist/components/calcite-button'
import '@esri/calcite-components/dist/calcite/calcite.css'

// ========================================================
//#region     MAIN EXECUTION

document.getElementById('version-div-name')!.innerHTML = settings.VERSION_NAME
document.getElementById('version-div-date')!.innerHTML = settings.VERSION_DATE

if (import.meta.env.MODE == 'development' || import.meta.env.MODE == 'staging') {
    let versionNameDiv = document.getElementById('version-div-name')
    versionNameDiv!.innerHTML = 'DEVELOPMENT'
    versionNameDiv!.style.color = 'orange'
    versionNameDiv!.style.fontWeight = 'bold'
    versionNameDiv!.style.fontSize = '18px'
    document.getElementById('version-div-date')!.innerHTML = settings.VERSION_DATE
}
else {
    document.getElementById('version-div-name')!.innerHTML = settings.VERSION_NAME
    document.getElementById('version-div-date')!.innerHTML = settings.VERSION_DATE
}

document.getElementById('open-map-btn')!.addEventListener('click', () => {
    window.location.replace('iitTool.html')
})

//#endregion
