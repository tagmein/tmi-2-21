async function profilePage(pageElement, navigationDetail) {
 const title = document.createElement('h3')
 title.innerText = 'My profile'
 pageElement.appendChild(title)
 const profileCrumb = document.createElement('span')
 profileCrumb.innerText = 'Profile'
 navigationDetail.appendChild(profileCrumb)
 const profileForm = document.createElement('form')
 profileForm.setAttribute('action', '/profile/update')
 profileForm.setAttribute('method', 'post')
 profileForm.setAttribute('enctype', 'multipart/form-data')
 const displayNameLabel = document.createElement('label')
 const displayNameLabelText = document.createElement('div')
 displayNameLabelText.innerText = 'Display name'
 displayNameLabel.appendChild(displayNameLabelText)
 profileForm.appendChild(displayNameLabel)
 const displayNameInput = document.createElement('input')
 displayNameInput.setAttribute('type', 'text')
 displayNameInput.setAttribute('maxlength', '100')
 displayNameInput.setAttribute('name', 'displayName')
 displayNameInput.value = window.myProfile.displayName ?? window.myProfile.email
 displayNameLabel.appendChild(displayNameInput)
 const hiddenKeyInput = document.createElement('input')
 hiddenKeyInput.setAttribute('type', 'hidden')
 hiddenKeyInput.setAttribute('name', 'key')
 hiddenKeyInput.value = localStorage.getItem('key')
 profileForm.appendChild(hiddenKeyInput)
 const buttons = document.createElement('p')
 const submit = document.createElement('input')
 submit.setAttribute('value', 'Save')
 submit.setAttribute('type', 'submit')
 buttons.appendChild(submit)
 profileForm.appendChild(buttons)
 pageElement.appendChild(profileForm)
 const inviteParagraph = document.createElement('p')
 inviteParagraph.innerHTML = `<a href="/#invite">Invite</a> a new user to join Tag Me In`
 pageElement.appendChild(inviteParagraph)
}
