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
  const canvas = document.getElementById("canvas");
  const xSize = canvas.width = videoElement.videoWidth;
  const ySize = canvas.height = videoElement.videoHeight;
  const context = canvas.getContext('2d');

  if (isCameraOn && videoElement.readyState >= 2) {
    console.time('Draw Image');
    context.drawImage(videoElement, 0, 0, xSize, ySize);
    console.timeEnd('Draw Image');

    console.time('Get ImageData');
    const imageData = context.getImageData(0, 0, xSize, ySize);
    const data = imageData.data;
    console.timeEnd('Get ImageData');

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


    drawSimpleBoundingBox(context, 0, 0, 130, 130, 15, "black");
    drawSimpleBoundingBox(context, 0, 150, 130, 130, 15, "white");

    canvas.style.display='block';
  }
  console.timeEnd('Total time');
});

function drawSimpleBoundingBox(ctx, x, y, width, height, lineWidth, color){
  ctx.fillStyle=color;
  
  ctx.fillRect(x, y, width, lineWidth); //Top bar
  ctx.fillRect(x, y+height-lineWidth, width, lineWidth); //Bottom bar
  
  ctx.fillRect(x, y, lineWidth, height); //Left bar
  ctx.fillRect(x+width-lineWidth, y, lineWidth, height); //Right bar
}
