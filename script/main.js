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

const toggleCameraBtn = document.getElementById('toggle-camera-btn');
const measurementBtn = document.getElementById('take-measurement-btn');

let mediaStream = null; // Store media stream reference
let isCameraOn = false; // Boolean to track camera state

toggleCameraBtn.addEventListener('click', async () => {
  if (isCameraOn) {
    
    videoElement.srcObject = null; // Stop video source
    videoElement.style.display = 'none';
    mediaStream.getTracks().forEach(track => track.stop()); // Stop media tracks
    isCameraOn = false;
    toggleCameraBtn.textContent = 'Open Camera';
  } else {
    try {
      //Loving this: https://upload.wikimedia.org/wikipedia/commons/0/0c/Vector_Video_Standards8.svg
      //Potentially scalable to SQFHD 1920*1920
      const constraints = {
        video: {
          facingMode: "environment",
          height: { min: 1080, ideal: 1080, max: 1080 }, // Instagram square format
          width: { min: 1080, ideal: 1080, max: 1080 }, //
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
    setTimeout(()=>{
      //alert(`vW: ${document.querySelector("video").videoWidth}  &  vH: ${document.querySelector("video").videoHeight}`);
    }, 500);
  }
});

measurementBtn.addEventListener('click', async () => {
  console.time('Total time');
  const xSize = videoElement.videoWidth;
  const ySize = videoElement.videoHeight;
  const offscreen = new OffscreenCanvas(xSize, ySize);
  const context = offscreen.getContext('2d');

  if (isCameraOn && videoElement.readyState >= 2) {
    console.time('Draw Image');
    context.drawImage(videoElement, 0, 0, xSize, ySize);
    console.timeEnd('Draw Image');

    console.time('Get ImageData');
    const imageData = context.getImageData(0, 0, xSize, ySize);
    const data = imageData.data;
    console.timeEnd('Get ImageData');

    console.time('Array Copy');
    var flatData = data.slice();//Consider removing it entirely!!! Maybe we don't need a copy.
    console.timeEnd('Array Copy');
    //console.log(flatData);

    console.time('Modify ImageData');
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(data[i] + 30, 255);     // R
      data[i + 1] = Math.min(data[i + 1] + 30, 255); // G
      data[i + 2] = Math.min(data[i + 2] + 30, 255); // B
      // Alpha channel remains the same (data[i + 3])
    }
    console.timeEnd('Modify ImageData');

    console.time('Put ImageData');
    context.putImageData(imageData, 0, 0);
    console.timeEnd('Put ImageData');

    console.time('Convert to Blob');
    const blob = await offscreen.convertToBlob();
    console.timeEnd('Convert to Blob');

    console.time('Create Image');
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    document.getElementById("newImages").replaceChildren(img) ; //appendChild(img); //Correct??? yeah, maybe,hopefully
    console.timeEnd('Create Image');

    //Blobs are... dangerous 
    //(I oppened the image url on another page, then zoomed in, and when I came back to the page... the image had scaled up too!!!)
  }
  console.timeEnd('Total time');
});
