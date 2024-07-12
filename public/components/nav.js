export function nav(titulo) {
  return `
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="/home">Home</a></li>
      <li class="breadcrumb-item active">${titulo}</li>
    </ol>
  `
}