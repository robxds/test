import { createService } from '../utils/request.js'
import { URL_GASTOS } from '../config.js'
import { nav } from '../components/nav.js'
import { table } from '../components/table.js'
import { crudForm } from '../components/form.js'
import { crearTR } from '../components/tableTr.js'
import { saveDataOffline } from '../utils/saveDataOffline.js'

const gastosService = createService(URL_GASTOS)

export function render() {
  return `
  <div className="container">
    ${nav("Gastos")}
    <div class="row p-4 text-center">
      ${table()}
      ${crudForm("Nuevo Gasto")}
    </div>
  </div>`
}

export async function init() {
  renderGastos()

  const form = document.querySelector("form")
  form.addEventListener('submit', procesarFormulario)
}

async function renderGastos() {
  const gastos = await gastosService.getAll()
  console.log(gastos)

  const tbody = document.getElementById("registros")

  tbody.innerHTML = gastos.length 
    ? gastos.map(crearTR).join('') + createGastosOffline()
    : '<tr><td colspan="3">No hay nada para mostrar</td></tr>'
}

function createGastosOffline() {
  const gastosOffline = JSON.parse(localStorage.getItem('gastos_offline')) || []
  return gastosOffline.map(g => crearTR({...g, class:'offlineRow'}) ).join('')
}

async function procesarFormulario(e) {
  e.preventDefault()
  const form = e.target
  const fd = new FormData(form)

  const nuevoGasto = { 
    description: fd.get('description'), 
    amount: parseFloat(fd.get('amount'))
  }

  if(navigator.onLine) {
    const respuestaJson = await gastosService.post(nuevoGasto)
    console.log(respuestaJson)
  }
  else{
    saveDataOffline('gastos_offline', nuevoGasto)
  }
  
  renderGastos()
  form.reset()
}
