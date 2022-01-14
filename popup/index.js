const recorderElement = document.getElementById('record')

recorderElement.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: recorder
  })
})

async function recorder () {
  const configuration = { audio: false, video: { width: 1280, height: 720 } }
  const stream = await navigator.mediaDevices.getDisplayMedia(configuration)
  const audio = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  })

  // needed for better browser support
  const mime = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
    ? 'video/webm; codecs=vp9'
    : 'video/webm'

  const mediaRecorder = new MediaRecorder(stream, { mimeType: mime })
  const audioRecorder = new MediaRecorder(audio, { mimeType: 'audio/webm' })

  const frames = []
  mediaRecorder.addEventListener('dataavailable', ({ data }) =>
    frames.push(data)
  )

  const tracks = []
  audioRecorder.addEventListener('dataavailable', ({ data }) =>
    tracks.push(data)
  )

  mediaRecorder.addEventListener('stop', () => {
    audioRecorder.stop()
    const blob = new Blob(frames, { type: frames[0].type })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'video.webm'
    a.click()
  })

  audioRecorder.addEventListener('stop', () => {
    const blob = new Blob(tracks, { type: tracks[0].type })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'audio.wav'
    a.click()
  })

  mediaRecorder.start()
  audioRecorder.start()
}
