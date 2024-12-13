// Global Munsell Color Conversion Functions
//let colorData = [];

// Parse CSV data into a structured array
function parseCSV(csvString) {
    // Split into rows and remove the header row
    const rows = csvString.trim().split('\n');
    return rows.slice(1).map(row => {
        const [munsellHue, value1, value2, r, g, b] = row.split(',');
        return [
            munsellHue,   // Munsell Hue
            parseFloat(value1),  // First numeric value
            parseFloat(value2),  // Second numeric value
            parseInt(r),   // Red channel
            parseInt(g),   // Green channel
            parseInt(b)    // Blue channel
        ];
    });
}

// Calculate Gaussian (Euclidean) distance between two RGB colors
function calculateRGBDistance(rgb1, rgb2) {
    return Math.sqrt(
        Math.pow(rgb1[0] - rgb2[0], 2) +
        Math.pow(rgb1[1] - rgb2[1], 2) +
        Math.pow(rgb1[2] - rgb2[2], 2)
    );
}

// Find 25 closest colors by RGB distance
function findClosestColors(targetRGB) {
    // Sort colors by their distance to the target RGB
    const sortedColors = colorData
        .map(color => ({
            color,
            distance: calculateRGBDistance(targetRGB, /*color.slice(3)*/[color.R, color.G, color.B])
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 50)
        .map(item => item.color);

    return sortedColors;
}

/*/ Convert Munsell notation to color data
function findMunsellColor(munsellNotation) {
    // Exact match first
    const exactMatch = colorData.find(color => 
        color[0] === munsellNotation.split(' ')[0] &&
        color[1] === parseFloat(munsellNotation.split(' ')[1]) &&
        color[2] === parseFloat(munsellNotation.split(' ')[2])
    );

    if (exactMatch) return exactMatch;

    // If no exact match, return null
    return null;
}*/

function findMunsellColor(munsellNotation) {
    const [hue, value1, value2] = munsellNotation.split(' ');
    return colorData.find(color => 
        color.H === hue &&
        color.V === parseFloat(value1) &&
        color.C === parseFloat(value2)
    );
}

/*/ Load CSV data from file
function loadMunsellColors(filePath, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', filePath, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                colorData = parseCSV(xhr.responseText);
                if (callback) callback();
            } else {
                console.error('Error loading CSV:', xhr.statusText);
            }
        }
    };
    xhr.send();
}*/

////////////////////////////////////////

function createColorSelectionModal(capturedRGB, closestColors) {
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'color-selection-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    // Modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        width: 90%;
        max-width: 800px;
        max-height: 80%;
        overflow-y: auto;
    `;

    // Header
    const header = document.createElement('h2');
    header.textContent = 'Seleccione el Color Munsell más cercano';
    modalContent.appendChild(header);

    // Captured color display
    const capturedColorDiv = document.createElement('div');
    capturedColorDiv.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    `;
    const colorSquare = document.createElement('div');
    colorSquare.style.cssText = `
        width: 50px;
        height: 50px;
        background-color: rgb(${capturedRGB.join(',')});
        margin-right: 10px;
    `;
    const colorText = document.createElement('p');
    colorText.textContent = `Color Capturado: RGB(${capturedRGB.join(', ')})`;
    capturedColorDiv.appendChild(colorSquare);
    capturedColorDiv.appendChild(colorText);
    modalContent.appendChild(capturedColorDiv);

    // Confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirmar Selección';
    confirmButton.style.cssText = `
        margin: 20px;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    confirmButton.addEventListener('click', () => {
        if (selectedColor) {
            // Store the selected Munsell color
            const currentMeasurement = measurements[measurements.length - 1];
            currentMeasurement.munsell = [selectedColor.H, selectedColor.V, selectedColor.C];
            /*currentMeasurement.munsell = [
                selectedColor[0],  // Munsell Hue
                selectedColor[1],  // First value
                selectedColor[2]   // Second value
            ];*/
            
        }else{
            const firstColor = closestColors[0];
            const currentMeasurement = measurements[measurements.length - 1];
            currentMeasurement.munsell = [firstColor.H, firstColor.V, firstColor.C];
        }
        // Update localStorage
        saveMeasurements();
        
        // Remove the modal
        document.body.removeChild(modal);

        document.getElementById("smallSuggestionP").style.display = "unset";
    });
    modalContent.appendChild(confirmButton);

    // Closest colors grid
    const colorGrid = document.createElement('div');
    colorGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
    `;

    let selectedColor = null;

    closestColors.forEach((color, index) => {
        const colorItem = document.createElement('div');
        colorItem.style.cssText = `
            border: 2px solid #ddd;
            padding: 10px;
            cursor: pointer;
            text-align: center;
        `;

        const colorSquare = document.createElement('div');
        colorSquare.style.cssText = `
            width: 100%;
            height: 100px;
            background-color: rgb(${color.R}, ${color.G}, ${color.B}); 
            margin-bottom: 10px;
        `; //rgb(${color.slice(3).join(',')});

        const colorLabel = document.createElement('p');
        colorLabel.textContent = `${color.H} ${color.V} ${color.C}`;//`${color[0]} ${color[1]} ${color[2]}`;

        colorItem.appendChild(colorSquare);
        colorItem.appendChild(colorLabel);

        colorItem.addEventListener('click', () => {
            // Remove selection from all items
            colorGrid.querySelectorAll('div').forEach(item => {
                item.style.border = '2px solid #ddd';
            });
            
            // Highlight selected item
            colorItem.style.border = '2px solid blue';
            selectedColor = color;
        });

        // Pre-select the first color
        if (index === 0) {
            colorItem.style.border = '2px solid blue';
            selectedColor = color;
        }
        colorGrid.appendChild(colorItem);

    });

    modalContent.appendChild(colorGrid);

    

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}