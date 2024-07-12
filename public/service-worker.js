// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
import { URL_GASTOS, URL_INGRESOS } from './config.js'

const FALLBACK = '/offline.html'
const BASIC_CACHE_NAME = 'basic-v3'
const BASIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/config.js',
  '/manifest.json',
  '/vendor/bootstrap.min.css',
  '/utils/request.js',
  '/utils/router.js',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  FALLBACK
]

const VIEW_CACHE_NAME = 'view-v2'
const VIEW_CACHE_FILES = [
  '/views/gastos.js',
  '/views/home.js',
  '/views/ingresos.js',
  '/views/not-found.js',
  '/components/form.js',
  '/components/nav.js',
  '/components/table.js',
  '/components/tableTr.js',
]

const DB_VERSION = 1;

// INSTALL ----------------------------

// cuando se instale el service-worker, guardar en cache
self.addEventListener('install', event => { 
  const todoCacheado = Promise.all([
    filesToCache(BASIC_CACHE_NAME, BASIC_CACHE_FILES), // guarda los archivos en cache
    filesToCache(VIEW_CACHE_NAME, VIEW_CACHE_FILES), // guarda los archivos en cache
    createStoresInIndexedDB(),
  ])
  event.waitUntil(todoCacheado)
})

async function filesToCache(cacheName, cacheFiles) {
  const cache = await caches.open(cacheName)
  const arrayPromesas = cacheFiles.map(async (file) => {
    try{
      await cache.add(file)
    }
    catch(error) {
      console.error(`Failed to cache ${file} in ${cacheName}: ${error}`)
    }
  })
  await Promise.all(arrayPromesas)
}

// ACTIVATE -----------------------------
// limpiar caches de sw antiguos
self.addEventListener('activate', event => {
  event.waitUntil(clearCachePreviousSW())
  self.clients.claim() // tomando el control de las peticiones de archivos
})

async function clearCachePreviousSW() {
  const currentCache = [BASIC_CACHE_NAME, VIEW_CACHE_NAME] // sw b1-v1 | sw b1-v2 | sw b2-v3
  const keys = await caches.keys()                         // b2-v3
  await Promise.all(keys.map(key => { 
    if(!currentCache.includes(key)){ // si no está incluido en las versiones actuales
      return caches.delete(key)
    }
  }))
}

// FETCH --------------------------------------
self.addEventListener('fetch', event => {

  const req = async () => {
    const url = new URL(event.request.url)
    try{

      if(url.href.includes(URL_INGRESOS)) return await handleApiRequest(event, 'ingresos')
      if(url.href.includes(URL_GASTOS)) return await handleApiRequest(event, 'gastos')

      if(BASIC_CACHE_FILES.includes(url.pathname)){
        return await cacheOrFetch(event, BASIC_CACHE_NAME)
      }

      if(VIEW_CACHE_FILES.includes(url.pathname)){
        return await cacheOrFetch(event, VIEW_CACHE_NAME)
      }

      const cacheResponse = await caches.match(event.request)
      return cacheResponse || await fetch(event.request)

    }
    catch(error){
      console.error(error)
      return await caches.match(FALLBACK)
    }
  }
  
  event.respondWith( req() )
})

async function handleApiRequest(event, storeName) {
  try {
    // Realiza la solicitud fetch a la API.
    const response = await fetch(event.request);

    // Clona la respuesta para poder usarla tanto para devolverla al cliente como para procesarla.
    const data = await response.clone().json();

    // Guarda los datos recibidos en IndexedDB.
    await saveDataToIndexedDB(storeName, data);

    // Devuelve la respuesta original al cliente.
    return response;
  } catch {
    // En caso de error, recupera los datos almacenados en IndexedDB.
    return await getDataFromIndexedDB(storeName);
  }
}

async function createStoresInIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('budgetDB', DB_VERSION)

    // la primera vez, o si la version de la BD aumentó...
    request.onupgradeneeded = event => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('ingresos')) {
        const store = db.createObjectStore('ingresos', { keyPath: 'id', autoIncrement:true }) // crea la tabla
        store.createIndex('by_id', 'id', { unique: true })
      }

      if (!db.objectStoreNames.contains('gastos')) {
        const store = db.createObjectStore('gastos', { keyPath: 'id', autoIncrement:true }) // crea la tabla
        store.createIndex('by_id', 'id', { unique: true })
      }

    }

    request.onsuccess = () => resolve()
    request.onerror = event => reject(event.target.error)
  })
}

async function getDataFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('budgetDB', DB_VERSION)
    request.onsuccess = event => {
      const db = event.target.result
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const getAllRequest = store.getAll()
      getAllRequest.onsuccess = () => {
        resolve(new Response(JSON.stringify(getAllRequest.result), {
          headers: { 'Content-Type': 'application/json'}
        }))
      }
      getAllRequest.onerror = () => reject(new Response('Error fetching data from IndexedDB', { status: 500 }))
    }
    request.onerror = event => reject(new Response('Error opening IndexedDB', { status: 500 }))
  })
}

async function saveDataToIndexedDB(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('budgetDB', DB_VERSION)

    request.onsuccess = event => {
      const db = event.target.result
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      
      if(Array.isArray(data)) {
        data.forEach(item => store.put(item))
      }
      else{
        store.put(data)
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = event => reject(event.target.error)
    }

    request.onerror = event => reject(event.target.error)
  })
}

async function cacheOrFetch(event, cacheName) {
  const cache = await caches.open(cacheName)
  const response = await cache.match(event.request) // existe este archivo solicitado en mi cache?
  if(response) return response

  const fetchResponse = await fetch(event.request)
  await cache.put(event.request, fetchResponse.clone()) // el stream solo se puede usar una vez, por eso clono para guardar en cache
  return fetchResponse
}
