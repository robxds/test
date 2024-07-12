import { createService } from '../utils/request.js'
import { URL_INGRESOS } from '../config.js'
import { nav } from '../components/nav.js'
import { table } from '../components/table.js'
import { crudForm } from '../components/form.js'
import { crearTR } from '../components/tableTr.js'
import { saveDataOffline } from '../utils/saveDataOffline.js'

const ingresosService = createService(URL_INGRESOS)

export function render() {
  return `
  <div className="container">
    ${nav("Ingresos")}
    <div class="row p-4 text-center">
      ${table()}
      ${crudForm("Nuevo ingreso")}
    </div>
  </div>`
}

export async function init() {
  renderIngresos()

  const form = document.querySelector("form")
  form.addEventListener('submit', procesarFormulario)
}

async function renderIngresos() {
  const ingresos = await ingresosService.getAll()
  console.log(ingresos)

  const tbody = document.getElementById("registros")

  tbody.innerHTML = ingresos.length 
    ? ingresos.map(crearTR).join('') + createIngresosOffline()
    : '<tr><td colspan="3">No hay nada para mostrar</td></tr>'
}

function createIngresosOffline() {
  const ingresosOffline = JSON.parse(localStorage.getItem('ingresos_offline')) || []
  return ingresosOffline.map(g => crearTR({...g, class:'offlineRow'}) ).join('')
}

async function procesarFormulario(e) {
  e.preventDefault()
  const form = e.target
  const fd = new FormData(form)

  const nuevoIngreso = { 
    description: fd.get('description'), 
    amount: parseFloat(fd.get('amount'))
  }

  if(navigator.onLine) {
    const respuestaJson = await ingresosService.post(nuevoIngreso)
    console.log(respuestaJson)
  }
  else{
    saveDataOffline('ingresos_offline', nuevoIngreso)
  }

  renderIngresos()
  form.reset()
}
