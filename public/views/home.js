import { navigate } from '../utils/router.js'
import { URL_INGRESOS, URL_GASTOS } from '../config.js'
import { createService } from '../utils/request.js'

const ingresosService = createService(URL_INGRESOS)
const gastosService = createService(URL_GASTOS)

export function render() {
  return `
  <div className="container">
    <div class="row p-4 text-center">
      <div class="col p-4 align-items-center rounded-3 border shadow-lg">
        <h1>$ 0</h1>
        <div class="d-grid gap-2">
          <button id="btnPage1" class="btn btn-lg btn-primary" type="button">Ingresos</button>
          <button id="btnPage2" class="btn btn-lg btn-primary" type="button">Gastos</button>
        </div>
      </div>
    </div>
  </div>
  `
}

export async function init() {
  const btn1 = document.getElementById("btnPage1")
  btn1.addEventListener("click", e =>navigate('/ingresos'))

  const btn2 = document.getElementById("btnPage2")
  btn2.addEventListener("click", e =>navigate('/gastos'))

  const ingresos = await ingresosService.getAll()
  const gastos = await gastosService.getAll()

  const sanatizar = v => parseFloat(v) || 0
  const totalIngresos = ingresos.reduce((total, ing) => total + sanatizar(ing.amount), 0)
  const totalGastos = gastos.reduce((total, gto) => total + sanatizar(gto.amount), 0)
  const saldo = document.querySelector('h1')
  saldo.innerHTML = '$ ' + (totalIngresos - totalGastos)
}