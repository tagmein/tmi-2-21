const sandbox = ['downloads', 'forms', 'scripts']
 .map((x) => `allow-${x}`)
 .join(' ')

function attachFrameWithContent(attachTo, content) {
 const newFrame = document.createElement('iframe')
 newFrame.setAttribute('referrerpolicy', 'no-referrer')
 newFrame.setAttribute('credentialless', true)
 newFrame.setAttribute('sandbox', sandbox)
 newFrame.setAttribute('srcdoc', content)
 attachTo.appendChild(newFrame)
}

async function topicPage(pageElement, navigationDetail, topic) {
 sidebar.visit(`topic/${encodeURIComponent(topic)}`, topic)
 const topicCrumb = document.createElement('span')
 topicCrumb.innerText = topic
 navigationDetail.appendChild(topicCrumb)
 const title = document.createElement('h3')
 title.innerText = topic
 pageElement.appendChild(title)
 const writeModal = document.createElement('div')
 writeModal.innerHTML = `<form
 action="/topic/write"
 class="modal-form registered write-switch-view-content"
 enctype="multipart/form-data"
 id="write-form"
 method="post"
>
 <h3>Write</h3>
 <input id="write-topic" type="hidden" name="topic" />
 <input id="write-key" type="hidden" name="key" />
 <label>
  <div>Title</div>
  <input id="write-title" name="title" type="text" placeholder="" />
 </label>
 <label>
  <div class="switch-row">
   <a id="write-switch-content" class="write-switch-content">
    Content
   </a>
   <span class="write-switch-attachments">Attachments (<span id="write-attachment-count-1">0</span>)</span>
   <span class="write-switch-content">Content</span>
   <a class="write-switch-attachments" id="write-switch-attachments">
    Attachments (<span id="write-attachment-count-2">0</span>)
   </a>
  </div>
  <textarea name="content" class="content" placeholder=""></textarea>
  <div class="attachments collection" tabindex="1"></div>
 </label>
 <p>
  <input type="submit" value="Post" />
  <button id="write-cancel">Cancel</button>
 </p>
</form>`
 pageElement.appendChild(writeModal)
 const topicToolbar = document.createElement('p')
 topicToolbar.classList.add('registered')
 const writeButton = document.createElement('button')
 writeButton.innerText = 'Write'
 topicToolbar.appendChild(writeButton)
 const writeForm = document.getElementById('write-form')
 writeButton.addEventListener('click', function () {
  const isOpen = writeForm.style.display === 'block'
  writeForm.style.display = isOpen ? '' : 'block'
  if (!isOpen) {
   document.getElementById('write-title').focus()
  }
 })
 document
  .getElementById('write-cancel')
  .addEventListener('click', function (event) {
   event.preventDefault()
   writeForm.style.display = ''
  })
 document.getElementById('write-key').value = localStorage.getItem('key')
 document.getElementById('write-topic').value = topic
 pageElement.appendChild(writeModal)
 pageElement.appendChild(topicToolbar)

 // writeForm
 const [
  switchToContent,
  switchToAttachments,
  attachmentCount1,
  attachmentCount2,
 ] = [
  'write-switch-content',
  'write-switch-attachments',
  'write-attachment-count-1',
  'write-attachment-count-2',
 ].map((x) => document.getElementById(x))
 switchToContent.addEventListener('click', function () {
  writeForm.classList.remove('write-switch-view-attachments')
  writeForm.classList.add('write-switch-view-content')
 })
 switchToAttachments.addEventListener('click', function () {
  writeForm.classList.remove('write-switch-view-content')
  writeForm.classList.add('write-switch-view-attachments')
 })
 let totalPostCount = 0
 const maxPosts = 100

 function renderPost(epoch, post) {
  totalPostCount++
  const postElement = document.createElement('div')
  postElement.classList.add('post')
  const postTitle = document.createElement('h3')
  postTitle.innerText = post.title
  postElement.appendChild(postTitle)
  const postAuthor = document.createElement('p')
  postAuthor.classList.add('author')
  postAuthor.innerText =
   post.displayName +
   ' ' +
   new Date(post.timestamp).toLocaleString().replace(/:\d\d/, '')
  if (window.myProfile && post.accountId === window.myProfile.accountId) {
   const deleteLink = document.createElement('a')
   deleteLink.innerText = 'Delete'
   deleteLink.addEventListener('click', async function () {
    const shouldContinue = confirm(
     `Are you sure you want to delete the post ${JSON.stringify(post.title)}`
    )
    if (shouldContinue) {
     await fetch(
      `/topic/post/delete?topic=${encodeURIComponent(topic)}` +
       `&epoch=${epoch}&id=${post.id}`,
      {
       method: 'POST',
       headers: {
        'x-key': localStorage.getItem('key'),
       },
      }
     )
     postElement.parentElement.removeChild(postElement)
    }
   })
   postAuthor.appendChild(deleteLink)
  }
  postElement.appendChild(postAuthor)
  let isFirst = true
  if (post.content.startsWith('<!doctype html>')) {
   attachFrameWithContent(postElement, post.content)
  } else {
   for (const paragraph of post.content.trim().split('\n')) {
    if (isFirst) {
     isFirst = false
     if (paragraph.trim().length === 0) {
      continue
     }
    }
    const paragraphElement = document.createElement('p')
    paragraphElement.innerText = paragraph
    postElement.appendChild(paragraphElement)
   }
  }
  pageElement.appendChild(postElement)
 }

 const allEpochsResponse = await fetch(`/topics/${encodeURIComponent(topic)}`)
 const allEpochs = (await allEpochsResponse.json()).map((x) => x.name).sort()

 async function loadPostsForEpoch(epoch) {
  try {
   const epochResponse = await fetch(
    `/topics/${encodeURIComponent(topic)}/${epoch}`
   )
   if (epochResponse.ok) {
    const epochText = await epochResponse.text()
    const epochPosts = JSON.parse(`[${epochText}{}]`)
    epochPosts.pop()
    epochPosts.reverse()
    for (const [_1, post, _2] of epochPosts) {
     renderPost(epoch, post)
    }
   }
  } catch (e) {
   console.log(e)
  }
  if (totalPostCount < maxPosts && allEpochs.length > 0) {
   loadPostsForEpoch(allEpochs.shift())
  }
 }

 if (allEpochs.length > 0) {
  await loadPostsForEpoch(allEpochs.shift())
 }
 if (totalPostCount === 0) {
  const noPostsMessage = document.createElement('p')
  noPostsMessage.innerText = 'There are no posts to show'
  pageElement.appendChild(noPostsMessage)
 }
}
