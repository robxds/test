const DEFAULT_VIEW = 'home'
const modoHash = true

export async function router() {
  const hash = window.location.hash
  const fileName = hash ? hash.replace('#/', '') : DEFAULT_VIEW
  const root = document.getElementById("root")

  let view
  try {
    view = await import(`../views/${fileName}.js`)
  }
  catch(error) {
    console.log(error)
    view = await import(`../views/not-found.js`)
  }

  root.innerHTML = view.render()

  if(typeof view.init === 'function'){
    view.init()
  }
 
  document.addEventListener('click', e => {
    const elemClick = e.target
    if(elemClick.tagName === 'A') {
      e.preventDefault()
      //const origin = window.location.origin
      //navigate(elemClick.href.replace(origin, '')) // http://localhost:5500/home
      navigate(elemClick.getAttribute('href'))
    }
  })
}

export function navigate(route) {
  window.location.hash = '#' + route
}
