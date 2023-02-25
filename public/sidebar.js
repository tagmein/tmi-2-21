const sidebar = {
 async visit(path, title) {
  const key = localStorage.getItem('key')
  const updatedSidebarResponse = await fetch(
   `/sidebar?path=${encodeURIComponent(path)}&title=${encodeURIComponent(
    title
   )}`,
   {
    method: 'post',
    headers: { 'x-key': key },
   }
  )
  const updatedSidebar = await updatedSidebarResponse.json()
  sidebar.render(updatedSidebar)
 },
 render(sidebarContents) {
  const sidebarElement = document.getElementById('sidebar')
  sidebarElement.innerHTML = ''
  const currentPath = location.hash.substring(1)
  for (const item of sidebarContents) {
   const link = document.createElement('a')
   link.innerText = item.title
   link.setAttribute('href', `/#${item.path}`)
   sidebarElement.appendChild(link)
   if (item.path === currentPath) {
    link.classList.add('active')
    link.scrollIntoView()
   }
  }
 },
}
