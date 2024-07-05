if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/ground-eye-analysis/service-worker.js')
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
          width: { min: 1280, ideal: 1280, max: 1280 }, // Request 1280px width
          height: { min: 720, ideal: 720, max: 720 }, // Request 720px height
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






/*let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    if (e) {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.style.display = 'block'; // Show button if prompt exists
    } else {
      installBtn.style.display = 'none'; // Hide button if no prompt
    }
    ///////////// Didn't worked either

    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    });

});*/
