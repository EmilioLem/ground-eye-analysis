if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')//('/ground-eye-analysis/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}





const videoElement = document.getElementById('camera-stream');
const canvasElement = document.getElementById('camera-canvas');
const toggleCameraBtn = document.getElementById('toggle-camera-btn');

let mediaStream = null; // Store media stream reference
let isCameraOn = false; // Boolean to track camera state

toggleCameraBtn.addEventListener('click', async () => {
  if (isCameraOn) {
    // Close camera
    videoElement.srcObject = null; // Stop video source
    videoElement.style.display = 'none';
    canvasElement.style.display = 'none';
    mediaStream.getTracks().forEach(track => track.stop()); // Stop media tracks
    isCameraOn = false;
    toggleCameraBtn.textContent = 'Open Camera';
  } else {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { min: 720, ideal: 720, max: 720 }, // Request 720px height
          height: { min: 1280, ideal: 1280, max: 1280 }, // Request 1280px width
        }
      };
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = mediaStream;
      videoElement.style.display = 'block';
      isCameraOn = true;
      toggleCameraBtn.textContent = 'Close Camera';
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }
});