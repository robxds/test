export function crearTR(operacion) {
  return `<tr class="${operacion.class}">
    <td>26 Jun</td>
    <td>${operacion.description}</td>
    <td>$ ${operacion.amount}</td>
  </tr>`
}