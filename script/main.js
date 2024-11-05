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

const addMarker = document.getElementById("addMarker");
const removeMarker = document.getElementById("removeMarker");
const otherControls = document.getElementById("otherControls");

const toggleCameraBtn = document.getElementById('toggle-camera-btn');
const calibrateCameraBtn = document.getElementById('calibrate-sensor-btn');
const measurementBtn = document.getElementById('take-measurement-btn');
const canvas = document.getElementById("canvas");

let mediaStream = null; // Store media stream reference
let isCameraOn = false; // Boolean to track camera state
let isCalibrating = false;

let isAddingNewBox = false;
let intervalID;
let newColorisActive = false;
//const xRange = document.getElementById("xRange");
//const yRange = document.getElementById("yRange");
const rValue = document.getElementById("rValue");
const gValue = document.getElementById("gValue");
const bValue = document.getElementById("bValue");

let storedArray = localStorage.getItem("myArray");
let allEtiquetes = storedArray? JSON.parse(storedArray) : [];

let samplesArray = localStorage.getItem("samplesArray");
let allSamples = samplesArray? JSON.parse(samplesArray) : [];

let myChart = null;
let xRangeValue = 0;
let yRangeValue = 0;

/*function predictColor(){
  const context = canvas.getContext('2d', {willReadFrequently: true});

  let theColor = readZone(context, Number(xRangeValue)+15, Number(yRangeValue)+15, 100, 100);
  rValue.value = theColor[0];
  gValue.value = theColor[1];
  bValue.value = theColor[2];
}
xRange.addEventListener('input', predictColor);
yRange.addEventListener('input', predictColor);*/

canvas.addEventListener('click', function(event) {
  if(isAddingNewBox){

    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;    // scaleX factor
    const scaleY = canvas.height / rect.height;  // scaleY factor
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    //console.log(`Logical X: ${Math.floor(x)}, Logical Y: ${Math.floor(y)}`);

    const context = canvas.getContext('2d', {willReadFrequently: true});

    xRangeValue = Math.floor(x) - 65;
    yRangeValue = Math.floor(y) - 65;

    let theColor = readZone(context, Number(xRangeValue)+15, Number(yRangeValue)+15, 100, 100);
    //Sólo necesito guardar por ahí los valores, y guardarlos, ji ji ji, y resetar las variables con nueva cosa...
    rValue.value = theColor[0];
    gValue.value = theColor[1];
    bValue.value = theColor[2];
  }
});

removeMarker.addEventListener('click', ()=>{ //Borrando marcadores
  let res = Number(prompt("¿Qué marcador desea borrar?"));
  
  if(!res && res!=0){
    alert("No es un número válido");  
    return;
  }
  else if(res>allEtiquetes.length || res<1){
    alert("Fuera de rango");
    return;
  }
  else if(res != Math.round(res)){
    alert("Debe ser número entero!!!");
    return;
  }
  console.log(res);

  allEtiquetes.splice(res-1, 1);
  localStorage.setItem("myArray", JSON.stringify(allEtiquetes));
  
});

addMarker.addEventListener('click', ()=>{ //Botón nuevo marcador
  if(!isAddingNewBox){
    addMarker.innerText = "Guardar marcador";
    removeMarker.style.display = "none";
    otherControls.style.display = "block"; //And reset the values
    xRangeValue = 540;
    yRangeValue = 540;
    rValue.value = 80;
    gValue.value = 160;
    bValue.value = 240;
    
    newColorisActive = true;
    isAddingNewBox = true;
  }else{ 
    //Saving logic goes here
    allEtiquetes.push([Number(xRangeValue), Number(yRangeValue), 130, 130, 15, [Number(rValue.value), Number(gValue.value), Number(bValue.value)]]);
                //x, y, w, h, border, arrayWithColor
    localStorage.setItem("myArray", JSON.stringify(allEtiquetes));

    newColorisActive = false;
    addMarker.innerText = "Nuevo marcador";
    isAddingNewBox = false;
    removeMarker.style.display = "block";
    otherControls.style.display = "none";

    const context = canvas.getContext('2d', {willReadFrequently: true});
    
  }
});

toggleCameraBtn.addEventListener('click', async () => { //Botón toggle camera
  if (isCameraOn) {
    
    videoElement.srcObject = null; // Stop video source
    videoElement.style.display = 'none';
    mediaStream.getTracks().forEach(track => track.stop()); // Stop media tracks
    isCameraOn = false;
    toggleCameraBtn.textContent = 'Abrir cámara';
  } else {
    try {
      //Loving this: https://upload.wikimedia.org/wikipedia/commons/0/0c/Vector_Video_Standards8.svg
      //Potentially scalable to SQFHD 1920*1920
      const constraints = {
        video: {
          facingMode: "environment", //// Instagram square format
          height: { idea: 1080}, //min: 1080, ideal: 1080, max: 1080 
          width: { ideal: 1080}, //min: 1080, ideal: 1080, max: 1080 
          aspectRatio: 1
        }
      };
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = mediaStream;
      videoElement.style.display = 'block';
      isCameraOn = true;
      toggleCameraBtn.textContent = 'Cerrar cámara';
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }
});

calibrateCameraBtn.addEventListener('click', async ()=>{
  if(isCameraOn && videoElement.readyState >= 2 && !isCalibrating){
    const xSize = canvas.width = videoElement.videoWidth;
    const ySize = canvas.height = videoElement.videoHeight;

    const context = canvas.getContext('2d', {willReadFrequently: true});

    intervalID = setInterval(()=>{
      context.drawImage(videoElement, 0, 0, xSize, ySize);
      drawPreviousMarkers(context);
    }, 100);

    canvas.style.display='block';
    
    addMarker.innerText = "Nuevo marcador";
    addMarker.style.display = "block";
    removeMarker.style.display = "block";
    isAddingNewBox = false;

    toggleCameraBtn.style.display = "none";
    calibrateCameraBtn.innerText = "Cerrar calibración";
    measurementBtn.style.display = "none";
    isCalibrating = true;

    videoElement.style.visibility="hidden"

    
  }else if(isCalibrating){
    isCalibrating = false;
    canvas.style.display='none';

    addMarker.style.display = "none";
    removeMarker.style.display = "none";
    otherControls.style.display = "none";
    isAddingNewBox = false;
    newColorisActive = false;
    clearInterval(intervalID);

    toggleCameraBtn.style.display = "initial";
    calibrateCameraBtn.innerText = "Calibrar sensor";
    measurementBtn.style.display = "initial";

    videoElement.style.visibility = "visible";
  }else{
    alert("Primero abra la cámara!");
  }
});

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

function getCalibrationData(context){
  const R_cali = [];
  const G_cali = [];
  const B_cali = [];

  const R_msr = [];
  const G_msr = [];
  const B_msr = [];

  for(let i=0; i<allEtiquetes.length; i++){
    //drawSimpleBoundingBox(ctx, ...allEtiquetes[i]); //Leaves 100^2 box for readings, corner 15, 15  
    R_cali.push(allEtiquetes[i][5][0]);
    G_cali.push(allEtiquetes[i][5][1]);
    B_cali.push(allEtiquetes[i][5][2]);
    
    readedColor = readZone(context, allEtiquetes[i][0]+15, allEtiquetes[i][1]+15, 100, 100);

    R_msr.push(readedColor[0]);
    G_msr.push(readedColor[1]);
    B_msr.push(readedColor[2]);
  }
  return {
    R_cali,
    G_cali,
    B_cali,
    R_msr,
    G_msr,
    B_msr
  };
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
  
  /*let alteredColorSpace = convertFromRGB(pixels, cSpace.value);
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
  plotHistogram(histograms);*/

  newColor = Array(3).fill(0); //'3' Used to be maxValues.length
  for(let i=0; i<pixels.length; i++){ // 'pixels' used to be alteredColorSpace
    //console.log("adding");
    for(let j=0; j<3; j++){ //'3' Used to be maxValues.length
      newColor[j]+=pixels[i][j]; // 'pixels' used to be alteredColorSpace
    }
  }
  newColor = newColor.map(x => Math.round(x/pixels.length)); // 'pixels' used to be alteredColorSpace
  //console.log(newColor);
  /*nowRGB = convertToRGB(newColor, cSpace.value);
  console.log(nowRGB);
  */
  
  return newColor;
  
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

/*function drawSimpleBoundingBox(ctx, x, y, width, height, lineWidth, color){
  ctx.fillStyle=color;
  
  ctx.fillRect(x, y, width, lineWidth); //Top bar
  ctx.fillRect(x, y+height-lineWidth, width, lineWidth); //Bottom bar
  
  ctx.fillRect(x, y, lineWidth, height); //Left bar
  ctx.fillRect(x+width-lineWidth, y, lineWidth, height); //Right bar
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
// Function to convert the array to CSV format
function convertArrayToCSV(array) {
  const headers = ["No. de muestra", "canal R", "canal G", "canal B", "R-real", "G-real", "B-real", "Nota", "fecha", "hora"];
  const csvContent = [
      headers.join(','), // Add headers
      ...array.map(row => row.join(',')) // Add rows
  ].join('\n');
  return csvContent;
}

// Function to download the CSV file
function downloadCSV(csvContent, filename = 'muestras.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Sample data array (Replace this with your actual data)

// Add an event listener to the button
document.getElementById("downloadCsvBtn").addEventListener("click", function() {
  const csvContent = convertArrayToCSV(allSamples);
  downloadCSV(csvContent);
});

document.getElementById("deleteData").addEventListener("click", ()=>{
  if(confirm("¿Desea eliminar todos los registros?")){
    if(confirm("Está a punto de eliminar todos los registros")){
      allSamples = [];
      localStorage.setItem("samplesArray", JSON.stringify(allSamples));
    }
  }
})






function toggleTable() {
  const tableContainer = document.getElementById('tableContainer');
  tableContainer.style.display = tableContainer.style.display === 'none' ? 'block' : 'none';
}

function getData() {
  return JSON.parse(localStorage.getItem('data')) || [];
}

// Utility function to save data to localStorage
function saveData(data) {
  localStorage.setItem('data', JSON.stringify(data));
}

// Adds new random data to localStorage and updates the table
function addNewData() {
  const data = getData();
  const newItem = {
    col1: `Text ${Math.random().toFixed(2)}`, // Sample text data
    col2: `Text ${Math.random().toFixed(2)}`,
    col3: `Text ${Math.random().toFixed(2)}`
  };
  data.push(newItem);
  saveData(data);
  displayData(); // Update the table display
}

// Function to display data in the table
function displayData() {
  const tableBody = document.getElementById('tableBody');
  const data = getData();
  
  // Clear existing table content
  tableBody.innerHTML = '';
  
  // Add each data row to the table
  data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${item.col1}</td>
          <td>${item.col2}</td>
          <td>${item.col3}</td>
      `;
      tableBody.appendChild(row);
  });
}

// Initial load of data when the page loads
//window.onload = displayData;