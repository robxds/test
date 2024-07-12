export function table() {
  return `
    <div class="col p-4 align-items-center rounded-3 border shadow-lg">
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Descripción</th>
            <th scope="col">Monto</th>
          </tr>
        </thead>
        <tbody id="registros"></tbody>
      </table>
    </div>
  `
}