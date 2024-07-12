export function crudForm(tituloFormulario) {
  return `
  <form class="mt-4 p-4 p-md-5 border rounded-3 bg-body-tertiary">
    <fieldset>
      <legend>${tituloFormulario}</legend>
      <div>
        <label for="desc" class="form-label mt-4">Descripción</label>
        <input type="text" class="form-control" id="desc" name="description">
      </div>
      <div>
        <label for="monto" class="form-label mt-4">Monto</label>
        <input type="text" class="form-control" id="monto" name="amount">
      </div>
      <button type="submit" class="btn btn-primary">Guardar</button>
    </fieldset>
  </form>
  `
}