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

// Data Management
let measurements = JSON.parse(localStorage.getItem('measurements')) || [];

function saveMeasurements() {
    localStorage.setItem('measurements', JSON.stringify(measurements));
    updateTable();
}

function updateTable() {
    const tbody = document.querySelector('#measurements-table tbody');
    tbody.innerHTML = '';
    
    measurements.forEach((measurement, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <span class="color-preview" style="background-color: rgb(${measurement.rgb.join(',')})"></span>
            </td>
            <td>(${measurement.rgb.join(',')})</td>
            <td>(${measurement.munsell.join(',')})</td>
            <td>${measurement.notes}</td>
            <td>${measurement.timestamp}</td>
            <td><span class="delete-icon" onclick="deleteMeasurement(${index})">🗑️</span></td>
        `;
        tbody.appendChild(row);
    });
}

function deleteMeasurement(index) {
    if (confirm('¿Realmente quiere borrar esta toma?')) {
        measurements.splice(index, 1);
        saveMeasurements();
    }
}

function deleteAllData() {
    if (confirm('Quiere borrar toda la tabla?')) {
        if (confirm('Esta acción no puede deshacerse. Desea borrar la tabla?')) {
            measurements = [];
            saveMeasurements();
        }
    }
}

function exportData() {
    const csv = [
        ['ID', 'RGB', 'Munsell', 'Notas', 'Fecha / Hora'],
        ...measurements.map((m, i) => [
            i + 1,
            `${m.rgb.join('-')}`,
            `${m.munsell.join('-')}`,
            m.notes,
            m.timestamp
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mediciones-color.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Camera Management
let stream = null;
const video = document.getElementById('camera-feed');
const canvas = document.getElementById('camera-canvas');
const ctx = canvas.getContext('2d', {willReadFrequently: true});
const loadingIndicator = document.createElement('div'); // Loading indicator element

loadingIndicator.id = 'loading-indicator';
loadingIndicator.textContent = 'Cargando cámara...'; // Or an animated GIF/SVG
loadingIndicator.style.cssText = `
    display: none; /* Hidden by default */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 1001; /* Ensure it's above other elements */
`;

document.body.appendChild(loadingIndicator); // Add to the DOM

async function startCamera() {
  loadingIndicator.style.display = 'block'; // Show loading indicator
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            //Loving this: https://upload.wikimedia.org/wikipedia/commons/0/0c/Vector_Video_Standards8.svg
            video: {
                facingMode: 'environment',
                width: { ideal: 1080 },//1080}, //min: 1080, ideal: 1080, max: 1080 
                height: { ideal: 1080 } //1080}, //min: 1080, ideal: 1080, max: 1080 
            }
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          video.style.display = 'block';
          canvas.style.display = 'none';
          loadingIndicator.style.display = 'none'; // Hide loading indicator
      };

      video.onloadeddata = () => {   //This is what actually shows the camera!!!
          loadingIndicator.style.display = 'none'; // Hide loading indicator when video has started 
      }
        // video.style.display = 'block';
        // canvas.style.display = 'none';
        
        // // Set canvas size once video metadata is loaded
        // video.onloadedmetadata = () => {
        //     canvas.width = video.videoWidth;
        //     canvas.height = video.videoHeight;
        // };
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('No se pudo abrir la cámara. Por favor permita su uso en la configuración de la página.');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        video.style.display = 'none'; // Hide video element
        stream = null;
    }
    showSection('data-section');
}

function takeMeasurement() {
    if (!stream) return;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get the 10x10 center area
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);

    // Initialize arrays to store RGB values
    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;

    // Sample 10x10 center pixels
    const sampleSize = 10;
    const startX = centerX - Math.floor(sampleSize / 2);
    const startY = centerY - Math.floor(sampleSize / 2);

    for (let x = 0; x < sampleSize; x++) {
        for (let y = 0; y < sampleSize; y++) {
            const pixelData = ctx.getImageData(startX + x, startY + y, 1, 1).data;

            // Accumulate RGB values
            redTotal += pixelData[0];
            greenTotal += pixelData[1];
            blueTotal += pixelData[2];
        }
    }

    // Calculate average RGB
    const totalPixels = sampleSize * sampleSize;
    const rgb = [
        Math.floor(redTotal / totalPixels),
        Math.floor(greenTotal / totalPixels),
        Math.floor(blueTotal / totalPixels)
    ];

    /*/ Get center pixel color
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
    
    const rgb = [pixelData[0], pixelData[1], pixelData[2]];*/
    const notes = prompt('Notas de la toma:').replace(',', ' ') || '';
    //const munsell = [pixelData[0], pixelData[1], pixelData[2]];
    const munsell = [1,2,3];
    
    var goodDate = new Date().toLocaleString();
    goodDate = goodDate.replace(',',' -');
    measurements.push({
        rgb,
        munsell,//rgb,//munsell,
        notes,
        timestamp: goodDate
    });
    
    // Find 25 closest colors
    const closestColors = findClosestColors(rgb);
    
    
    // Show color selection modal
    createColorSelectionModal(rgb, closestColors);
    
    /*saveMeasurements();
    alert(`Color registrado: RGB(${rgb.join(',')})`);*/
}

function showSection(sectionId) {
  if (sectionId !== 'camera-section' && stream) { // Stop camera if not camera section
      stopCamera();
  }

  document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');

  if (sectionId === 'camera-section') {
      startCamera();
  }
}
/*/ Section Management
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'camera-section') {
        startCamera();
    }
}*/

// Initialize
updateTable();

////////////////////////////////////////////////

/*// Load the colors first//./munsellDatabaseCreation/colors.csv
loadMunsellColors('https://emiliolem.github.io/ground-eye-analysis/munsellDatabaseCreation/colors.csv', () => {
  / Now you can use the functions directly
  const closestToRed = findClosestColors([255, 0, 0]);
  console.log('25 Closest Colors to Red:', closestToRed);

  const specificColor = findMunsellColor('2.5R 4 6');
  console.log('Specific Color:', specificColor);
});*/










/*
measurementBtn.addEventListener('click', async () => {
  console.time('Total time');
  
  
  
  if (isCameraOn && videoElement.readyState >= 2) {
    const xSize = canvas.width = videoElement.videoWidth;
    const ySize = canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d', {willReadFrequently: true});

    context.drawImage(videoElement, 0, 0, xSize, ySize);


    //drawSimpleBoundingBox(context, 0, 0, 130, 130, 15, [0, 0, 0]); //Leaves 100^2 box for readings, corner 15, 15
    drawSimpleBoundingBox(context, xSize/2-130/2, ySize/2-130/2, 130, 130, 15, [0, 128, 255]); //Leaves 100^2 box for readings, corner 15, 145
    drawPreviousMarkers(context);

    let theColor = readZone(context, xSize/2-130/2+15, ySize/2-130/2+15, 100, 100);
    drawResultingColor(context, xSize/2-130/2+15, ySize/2-130/2+15, 50, 100, theColor);

    var correctedR = theColor[0];
    var correctedG = theColor[1];
    var correctedB = theColor[2];
    
    console.log(correctedR);
    /////////// Starts correction
    if(allEtiquetes.length > 1){
      console.log('getting into the conditional');
      console.log(allEtiquetes);
      
      
      
      calData = getCalibrationData(context);
      
      const R_coeffs = linearRegression(calData.R_msr, calData.R_cali);
      const G_coeffs = linearRegression(calData.G_msr, calData.G_cali);
      const B_coeffs = linearRegression(calData.B_msr, calData.B_cali);
      
      console.log(R_coeffs);
      console.log(G_coeffs);
      console.log(B_coeffs);
      
      correctedR = Math.round(applyLinearCorrection(R_coeffs.a, R_coeffs.b, theColor[0]));
      correctedG = Math.round(applyLinearCorrection(G_coeffs.a, G_coeffs.b, theColor[1]));
      correctedB = Math.round(applyLinearCorrection(B_coeffs.a, B_coeffs.b, theColor[2]));
      
      drawResultingColor(context, xSize/2-130/2+15+50, ySize/2-130/2+15, 50, 100, [correctedR,correctedG,correctedB]);
    }

    ///////////////////Ends correction
    
    
    canvas.style.display='block';
    videoElement.style.visibility="hidden";
    document.getElementById("controls").style.visibility = "hidden";
    
    setTimeout(()=>{
      alert(`Color medido: rgb(${theColor[0]}, ${theColor[1]}, ${theColor[2]})
        corregido a: rgb(${correctedR}, ${correctedG}, ${correctedB})`);
        
        var date = new Date();
        var laNota = prompt("Nota:");
        allSamples.push([allSamples.length+1, ...theColor, correctedR,correctedG, correctedB, laNota.replace(/[;,]/g, ' '), date.toLocaleString()]);
        localStorage.setItem("samplesArray", JSON.stringify(allSamples));

        //document.getElementById("controls").style.visibility = "visible";
        canvas.style.display='none';
        videoElement.style.visibility="visible";
        document.getElementById("controls").style.visibility = "visible";
      }, 1);
      

  }else{
    alert("Primero abra la cámara!");
  }
  console.timeEnd('Total time');
});

function linearRegression(x, y) {
  const n = x.length;

  const sumX = x.reduce((sum, xi) => sum + xi, 0);
  const sumY = y.reduce((sum, yi) => sum + yi, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  // Calculate slope (a) and intercept (b)
  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - a * sumX) / n;

  return { a, b };
}

// Function to apply linear correction
function applyLinearCorrection(a, b, input) {
  return a * input + b;
}



function drawPreviousMarkers(ctx){
  for(let i=0; i<allEtiquetes.length; i++){
    drawSimpleBoundingBox(ctx, ...allEtiquetes[i]); //Leaves 100^2 box for readings, corner 15, 15  
    ctx.font = "bold 50px Arial";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = `rgb(${255-allEtiquetes[i][5][0]}, ${255-allEtiquetes[i][5][1]}, ${255-allEtiquetes[i][5][2]})`;
    ctx.fillText(i+1, allEtiquetes[i][0]+50, allEtiquetes[i][1]+40);
  }
  //drawSimpleBoundingBox(ctx, 40, 20, 130, 130, 15, [0, 0, 0]);


  if(newColorisActive){
    drawSimpleBoundingBox(ctx, Number(xRangeValue),Number(yRangeValue), 130, 130, 15, [Number(rValue.value), Number(gValue.value), Number(bValue.value)]);
    //console.log([Number(rValue.value), Number(gValue.value), Number(bValue.value)]);
    
  }
}

function drawResultingColor(ctx, x, y, w, h, color){
  ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  ctx.fillRect(x, y, w, h);
}

function readZone(ctx, x, y, w, h){
  //const cSpace = document.getElementById("cSpace");
  const zoneData = ctx.getImageData(x,y,w,h);
  const theData = zoneData.data;
  //The switch-aided color transformation function can be called here
  const pixels = imageDataToPixels(theData);
  
 

  newColor = Array(3).fill(0); //'3' Used to be maxValues.length
  for(let i=0; i<pixels.length; i++){ // 'pixels' used to be alteredColorSpace
    //console.log("adding");
    for(let j=0; j<3; j++){ //'3' Used to be maxValues.length
      newColor[j]+=pixels[i][j]; // 'pixels' used to be alteredColorSpace
    }
  }
  newColor = newColor.map(x => Math.round(x/pixels.length)); // 'pixels' used to be alteredColorSpace
  
  return newColor;
  
}


       


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
}*/


function drawDecoratedRect(ctx, x, y, width, height, color) {
  // Calculate the inverse color
  const inverseColor = [255 - color[0], 255 - color[1], 255 - color[2]];
  const colorString = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  const inverseColorString = `rgb(${inverseColor[0]}, ${inverseColor[1]}, ${inverseColor[2]})`;

  // Determine the size of each sector (9 sectors)
  const numSectors = 9;
  const sectorWidth = width / numSectors;
  const sectorHeight = height / numSectors;

  // Draw the sectors with intercalated colors
  for (let i = 0; i < numSectors; i++) {
      const currentColor = i % 2 === 0 ? inverseColorString : colorString;
      ctx.fillStyle = currentColor;

      if (width > height) {
          // Horizontal division (for top and bottom bars)
          ctx.fillRect(x + i * sectorWidth, y, sectorWidth, height);
      } else {
          // Vertical division (for left and right bars)
          ctx.fillRect(x, y + i * sectorHeight, width, sectorHeight);
      }
  }
}

function drawSimpleBoundingBox(ctx, x, y, width, height, lineWidth, color) {
  // Top bar
  drawDecoratedRect(ctx, x, y, width, lineWidth, color);

  // Bottom bar
  drawDecoratedRect(ctx, x, y + height - lineWidth, width, lineWidth, color);

  // Left bar
  drawDecoratedRect(ctx, x, y, lineWidth, height, color);

  // Right bar
  drawDecoratedRect(ctx, x + width - lineWidth, y, lineWidth, height, color);
}






