const recorderElement = document.getElementById('record')

recorderElement.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor
  })
})

async function setPageBackgroundColor () {
  const configuration = { audio: true, video: { width: 1280, height: 720 } }
  const stream = await navigator.mediaDevices.getDisplayMedia(configuration)

  // needed for better browser support
  const mime = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
    ? 'video/webm; codecs=vp9'
    : 'video/webm'

  const mediaRecorder = new MediaRecorder(stream, { mimeType: mime })

  const frames = []
  mediaRecorder.addEventListener('dataavailable', ({ data }) =>
    frames.push(data)
  )

  mediaRecorder.addEventListener('stop', () => {
    const blob = new Blob(frames, { type: frames[0].type })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'video.webm'
    a.click()
  })

  mediaRecorder.start()
}
