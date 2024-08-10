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

let myChart = null;

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
  const context = canvas.getContext('2d', {willReadFrequently: true});

  if (isCameraOn && videoElement.readyState >= 2) {
    console.time('Draw Image');
    context.drawImage(videoElement, 0, 0, xSize, ySize);
    console.timeEnd('Draw Image');


    /*/Starts the brightness increase
    console.time('Get ImageData');
    const imageData = context.getImageData(0, 0, xSize, ySize);
    const data = imageData.data;
    console.timeEnd('Get ImageData');

    console.time('Modify ImageData');
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(data[i] + 30, 255);     // R
      data[i + 1] = Math.min(data[i + 1] + 30, 255); // G
      data[i + 2] = Math.min(data[i + 2] + 30, 255); // B
    }
    console.timeEnd('Modify ImageData');

    console.time('Put ImageData');
    context.putImageData(imageData, 0, 0);
    console.timeEnd('Put ImageData');
    //Ends the brightness increase*/


    drawSimpleBoundingBox(context, 0, 0, 130, 130, 15, "black"); //Leaves 100^2 box for readings, corner 15, 15
    drawSimpleBoundingBox(context, 0, 150, 130, 130, 15, "white"); //Leaves 100^2 box for readings, corner 15, 145

    let theColor = readZone(context, 15, 15, 100, 100);
    drawResultingColor(context, 130, 15, 100, 100, theColor);

    canvas.style.display='block';
  }
  console.timeEnd('Total time');
});

function drawResultingColor(ctx, x, y, w, h, color){
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function readZone(ctx, x, y, w, h){
  const cSpace = document.getElementById("cSpace");
  const zoneData = ctx.getImageData(x,y,w,h);
  const theData = zoneData.data;
  //The switch-aided color transformation function can be called here
  const pixels = imageDataToPixels(theData);
  
  let alteredColorSpace = convertFromRGB(pixels, cSpace.value);
  console.log(cSpace.value);
  //console.log(alteredColorSpace);

  let maxValues;
  switch (cSpace.value) {
    case 'RGB':
        maxValues = [255, 255, 255];
        break;
    case 'HSL':
    case 'HSV':
        maxValues = [360, 1, 1];
        break;
    case 'CMYK':
        maxValues = [1, 1, 1, 1];
        break;
    default:
        throw new Error('Unsupported color space');
  }

  const histograms = generateHistogram(alteredColorSpace, maxValues);
  plotHistogram(histograms);

  newColor = Array(maxValues.length).fill(0);
  for(let i=0; i<alteredColorSpace.length; i++){
    //console.log("adding");
    for(let j=0; j<maxValues.length; j++){
      newColor[j]+=alteredColorSpace[i][j];
    }
  }
  newColor = newColor.map(x => x/alteredColorSpace.length);
  console.log(newColor);
  nowRGB = convertToRGB(newColor, cSpace.value);
  console.log(nowRGB);
  document.getElementById("colorR").innerText = `rgb(${Math.round(nowRGB[0])}, ${Math.round(nowRGB[1])}, ${Math.round(nowRGB[2])})`;

  return `rgb(${nowRGB[0]}, ${nowRGB[1]}, ${nowRGB[2]})`;
  
}

function average(thePixels){
  return color;
}
//The function should be called manually for each color test... maybe already storing 
//desired-vs-readed color per channel, on a friendly matrix (to build the lookup table/function)
//Finally... call the same function, and pass it trough the builded lookup artifact.

function normalizeValue(value, max) {
  return Math.round(value * 255 / max);
}

function generateHistogram(pixels, maxValues) {
  const numBins = 256;
  const numChannels = maxValues.length;
  const histograms = Array.from({ length: numChannels }, () => new Array(numBins).fill(0));

  pixels.forEach(pixel => {
      for (let i = 0; i < numChannels; i++) {
          const normalizedValue = normalizeValue(pixel[i], maxValues[i]);
          histograms[i][normalizedValue]++;
      }
  });

  return histograms;
}

function plotHistogram(histograms) {
  const labels = Array.from({ length: 256 }, (_, i) => i);
  const data = {
      labels: labels,
      datasets: histograms.map((histogram, index) => ({
          label: `Channel ${index + 1}`,
          backgroundColor: `rgba(${255 - index * 60}, ${index * 60}, ${255 - index * 60}, 0.5)`,
          borderColor: `rgba(${255 - index * 60}, ${index * 60}, ${255 - index * 60}, 1)`,
          data: histogram,
          fill: false,
          borderWidth: 1
      }))
  };

  const ctx = document.getElementById('histogram').getContext('2d');
  if (myChart) {
    myChart.destroy();
  }
  myChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: false, //Crucial to set desired size!!!
      //maintainAspectRatio: false, // Just remember this exists :)
      scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Value'
                  }
                },
                y: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'Frequency (log)'
                      }
                    }
              }
              }
  });
}
            


/// Phase 22222222222222222222222222222222222222
////////////////////////////////
function convertFromRGB(pixels, colorSpace) {
  //const chroma = require('chroma-js'); // Import chroma-js library
  switch (colorSpace) {
    case 'RGB':
      return pixels;
    case 'HSL':
      return pixels.map(([r, g, b]) => {
        let [h, s, l] = chroma([r, g, b]).hsl();
        h = isNaN(h) ? 0 : h;
        return [h, s, l];
      });
    case 'HSV':
      return pixels.map(([r, g, b]) => {
        let [h, s, v] = chroma([r, g, b]).hsv();
        h = isNaN(h) ? 0 : h;
        return [h, s, v];
      });
    case 'CMYK':
      return pixels.map(([r, g, b]) => chroma([r, g, b]).cmyk());
    default:
      throw new Error('Unsupported color space');
  }
}

function convertToRGB(color, colorSpace) {
  //const chroma = require('chroma-js'); // Ensure chroma-js is imported if using Node.js

  switch (colorSpace) {
    case 'RGB':
      return color;
    case 'HSL':
      return chroma.hsl(...color).rgb();
    case 'HSV':
      return chroma.hsv(...color).rgb();
    case 'CMYK':
      return chroma.cmyk(...color).rgb();
    default:
      throw new Error('Unsupported color space');
  }
}


function imageDataToPixels(data) {
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Skip alpha channel
    pixels.push([r, g, b]);
  }
  return pixels;
}

function drawSimpleBoundingBox(ctx, x, y, width, height, lineWidth, color){
  ctx.fillStyle=color;
  
  ctx.fillRect(x, y, width, lineWidth); //Top bar
  ctx.fillRect(x, y+height-lineWidth, width, lineWidth); //Bottom bar
  
  ctx.fillRect(x, y, lineWidth, height); //Left bar
  ctx.fillRect(x+width-lineWidth, y, lineWidth, height); //Right bar
}
