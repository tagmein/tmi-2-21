async function profile() {
 const profileElement = document.getElementById('profile')
 const key = localStorage.getItem('key')
 if (key) {
  try {
   const profileResponse = await fetch('/profile.json', {
    headers: { 'x-key': key },
   })
   window.myProfile = await profileResponse.json()
   if (window.myProfile) {
    Array.from(document.getElementsByClassName('key-input')).forEach((x) => {
     x.value = key
    })
    const profileName = document.createElement('span')
    profileName.innerText = myProfile.email
    profileElement.appendChild(profileName)
    document.body.classList.add('is-registered')
    const profileLink = document.createElement('a')
    profileLink.innerText = 'Profile'
    profileLink.setAttribute('href', `/#profile`)
    profileElement.appendChild(profileLink)
    const signOutLink = document.createElement('a')
    signOutLink.innerText = 'Sign out'
    profileElement.appendChild(signOutLink)
    signOutLink.addEventListener('click', function () {
     localStorage.removeItem('key')
     window.location.reload()
    })
    return
   }
  } catch (e) {
   console.error(e)
  }
  localStorage.removeItem('key')
 }
 function resetSignIn() {
  profileElement.innerHTML = ''
  const signInLink = document.createElement('a')
  signInLink.innerText = 'Sign in'
  profileElement.appendChild(signInLink)
  signInLink.addEventListener('click', function () {
   profileElement.innerHTML = `
   <form action="/signin" method="POST" enctype="multipart/form-data">
    <h3>Sign in</h3>
    <input type="hidden" name="redirect" value="${location.href}" />
    <label><div>Email</div>
    <input id="sign-in-email" type="text" name="email" placeholder="email@example.com" /></label>
    <label><div>Password</div>
    <input type="password" name="password" placeholder="••••••" /></label>
    <input type="submit" value="Sign in" />
    <button id="cancel-sign-in">Cancel</button>
   </form>
  `
   document.getElementById('sign-in-email').focus()
   document
    .getElementById('cancel-sign-in')
    .addEventListener('click', resetSignIn)
  })
 }
 resetSignIn()
 document.body.classList.add('is-unregistered')
}
