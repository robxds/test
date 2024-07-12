import { router } from './utils/router.js'
import { URL_GASTOS, URL_INGRESOS } from './config.js'
import { createService, sendOfflineDataToServer } from './utils/request.js'

const gastosService = createService(URL_GASTOS)
const ingresosService = createService(URL_INGRESOS)


window.addEventListener('hashchange', router)
router()

window.addEventListener('online', () => {
  sendOfflineDataToServer('gastos_offline', gastosService)
  sendOfflineDataToServer('ingresos_offline', ingresosService)
})

if('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
    }
    catch(error) {
      console.error('ServiceWorker registration failed', error)
    }
  })
}
