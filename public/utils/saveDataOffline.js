export function saveDataOffline(key, data) {
  const list = JSON.parse(localStorage.getItem(key)) || []
  list.push(data)
  localStorage.setItem(key, JSON.stringify(list))
}