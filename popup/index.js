const recorderElement = document.getElementById('record')
let recorder = null

recorderElement.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: recordScreenAndAudio
  })
})

async function recordScreenAndAudio () {
  async function captureMediaDevices (
    mediaConstraints = {
      video: {
        width: 1280,
        height: 720
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    }
  ) {
    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)

    return stream
  }

  async function captureScreen (
    mediaConstraints = {
      video: {
        cursor: 'always',
        resizeMode: 'crop-and-scale'
      }
    }
  ) {
    const screenStream = await navigator.mediaDevices.getDisplayMedia(
      mediaConstraints
    )

    return screenStream
  }

  const screenStream = await captureScreen()
  const audioStream = await captureMediaDevices({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    },
    video: false
  })

  const stream = new MediaStream([
    ...screenStream.getTracks(),
    ...audioStream.getTracks()
  ])

  recorder = new MediaRecorder(stream)
  let chunks = []

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data)
    }
  }

  recorder.onstop = () => {
    const blob = new Blob(chunks, {
      type: 'video/webm'
    })

    chunks = []
    const blobUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobUrl
    a.download = 'video.webm'
    a.click()
  }

  recorder.start(200)

  window.setTimeout(() => {
    recorder.stream.getTracks().forEach((track) => track.stop())
  }, 5000)
}
