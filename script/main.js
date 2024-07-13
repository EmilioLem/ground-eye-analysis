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


    //drawBicolorDashedRect(context, 1030, 1030, 50, 50, 'white', 'black', 20);
    //drawHollowRect(context, 0, 0, 200, 300, 'grey', 15);
    //drawHollowRect(context, 0, 0, 190, 290, 'white', 5);
    drawSimpleBoundingBox(context, 3, 3, 200, 200, 15, "blue");

    console.time('Convert to Blob');
    const blob = await offscreen.convertToBlob();
    console.timeEnd('Convert to Blob');

    console.time('Create Image');
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    document.getElementById("newImages").replaceChildren(img) ; //appendChild(img); //Correct??? yeah, maybe,hopefully
    console.timeEnd('Create Image');

    //Blobs are... dangerous 
    //Or maybe not... 
    //(I oppened the image url on another page, then zoomed in, and when I came back to the page... the image had scaled up too!!!)
    //But apparently the blob-image was not responsive to the page size.
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

/*function drawHollowRect(ctx, x, y, width, height, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, width, height);
}

function drawBicolorDashedRect(ctx, x, y, width, height, color1, color2, dashLength) {
  ctx.lineWidth = 5;

  // Function to draw a single dash
  function drawDash(startX, startY, endX, endY, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // Helper function to draw dashes along a side
  function drawSide(startX, startY, endX, endY, length, horizontal) {
    let distance = horizontal ? Math.abs(endX - startX) : Math.abs(endY - startY);
    for (let i = 0; i < distance; i += dashLength * 2) {
      let dashStartX = horizontal ? startX + i : startX;
      let dashEndX = horizontal ? Math.min(startX + i + dashLength, endX) : startX;
      let dashStartY = horizontal ? startY : startY + i;
      let dashEndY = horizontal ? startY : Math.min(startY + i + dashLength, endY);
      drawDash(dashStartX, dashStartY, dashEndX, dashEndY, color1);

      dashStartX = horizontal ? startX + i + dashLength : startX;
      dashEndX = horizontal ? Math.min(startX + i + dashLength * 2, endX) : startX;
      dashStartY = horizontal ? startY : startY + i + dashLength;
      dashEndY = horizontal ? startY : Math.min(startY + i + dashLength * 2, endY);
      drawDash(dashStartX, dashStartY, dashEndX, dashEndY, color2);
    }
  }

  // Draw top side
  drawSide(x, y, x + width, y, width, true);

  // Draw right side
  drawSide(x + width, y, x + width, y + height, height, false);

  // Draw bottom side
  drawSide(x + width, y + height, x, y + height, width, true);

  // Draw left side
  drawSide(x, y + height, x, y, height, false);
}*/