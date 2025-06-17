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

// Manual and auto createColorSelectionModal function

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
    capturedColorDiv.style.cssText = `display: flex; align-items: center; margin-bottom: 20px;`;
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
    
    // Dynamic preview section
    const previewWrapper = document.createElement('div');
    modalContent.appendChild(previewWrapper);
    
    // Button to toggle mode
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Usar Selección Manual';
    toggleButton.style.cssText = `
    margin: 10px 0;
    padding: 5px 10px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    `;
    modalContent.appendChild(toggleButton);
    
    // Confirm button
    const confirmButton = document.createElement('button');
    modalContent.appendChild(confirmButton);
    
    // Area for color selection
    const colorChoosingArea = document.createElement('div');
    modalContent.appendChild(colorChoosingArea);
    
    // using the dynamic preview section
    previewWrapper.style.cssText = `margin-top: 20px; display: flex; align-items: center; gap: 15px;`;

    const previewSquare = document.createElement('div');
    previewSquare.style.cssText = `
        width: 50px;
        height: 50px;
        background-color: transparent;
        border: 1px solid #ccc;
    `;

    const previewLabel = document.createElement('span');
    previewLabel.textContent = 'Vista previa del color';

    previewWrapper.appendChild(previewSquare);
    previewWrapper.appendChild(previewLabel);

    function updatePreview(H, V, C) {
        const found = colorData.find(c => c.H === H && c.V === V && c.C === C);
        if (found) {
            previewSquare.style.backgroundColor = `rgb(${found.R}, ${found.G}, ${found.B})`;
            previewLabel.textContent = `Vista previa: ${H} ${V}/${C}`;
        } else {
            previewSquare.style.backgroundColor = 'transparent';
            previewLabel.textContent = `Color no encontrado`;
        }
    }

    // -------- Grid UI --------
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
        `;

        const colorLabel = document.createElement('p');
        colorLabel.textContent = `${color.H} ${color.V}/${color.C}`;

        colorItem.appendChild(colorSquare);
        colorItem.appendChild(colorLabel);

        colorItem.addEventListener('click', () => {
            colorGrid.querySelectorAll('div').forEach(item => {
                item.style.border = '2px solid #ddd';
            });
            colorItem.style.border = '2px solid blue';
            selectedColor = color;
            updatePreview(color.H, color.V, color.C);
        });

        if (index === 0) {
            colorItem.style.border = '2px solid blue';
            selectedColor = color;
        }

        colorGrid.appendChild(colorItem);
    });

    // -------- Manual UI --------
    const manualDiv = document.createElement('div');
    manualDiv.style.display = 'none';

    // Get unique Hue values
    const hues = [...new Set(colorData.map(c => c.H))];

    const hSelect = document.createElement('select');
    hues.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = h;
        hSelect.appendChild(opt);
    });

    const vSelect = document.createElement('select');
    const cSelect = document.createElement('select');

    const labelH = document.createElement('label');
    labelH.textContent = 'H: ';
    labelH.appendChild(hSelect);
    const labelV = document.createElement('label');
    labelV.textContent = 'V: ';
    labelV.appendChild(vSelect);
    const labelC = document.createElement('label');
    labelC.textContent = 'C: ';
    labelC.appendChild(cSelect);

    manualDiv.appendChild(labelH);
    manualDiv.appendChild(labelV);
    manualDiv.appendChild(labelC);

    let manualColor = {
        H: hSelect.value,
        V: null,
        C: null
    };

    function updateVandC(hue) {
        const filtered = colorData.filter(c => c.H === hue);
        const vValues = [...new Set(filtered.map(c => c.V))].sort((a, b) => a - b);
        const cValues = [...new Set(filtered.map(c => c.C))].sort((a, b) => a - b);

        vSelect.innerHTML = '';
        cSelect.innerHTML = '';

        vValues.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            vSelect.appendChild(opt);
        });

        cValues.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            cSelect.appendChild(opt);
        });

        manualColor.V = parseInt(vSelect.value);
        manualColor.C = parseInt(cSelect.value);
        updatePreview(hue, manualColor.V, manualColor.C);
    }

    hSelect.addEventListener('change', e => {
        manualColor.H = e.target.value;
        updateVandC(manualColor.H);
    });

    vSelect.addEventListener('change', e => {
        manualColor.V = parseInt(e.target.value);
        updatePreview(manualColor.H, manualColor.V, manualColor.C);
    });

    cSelect.addEventListener('change', e => {
        manualColor.C = parseInt(e.target.value);
        updatePreview(manualColor.H, manualColor.V, manualColor.C);
    });

    updateVandC(hSelect.value); // Initialize

    // Add UI panels to switching container
    colorChoosingArea.appendChild(colorGrid);
    colorChoosingArea.appendChild(manualDiv);

    toggleButton.addEventListener('click', () => {
        if (colorGrid.style.display !== 'none') {
            // Switching to Manual mode
            colorGrid.style.display = 'none';
            manualDiv.style.display = 'block';
            toggleButton.textContent = 'Usar Selección por Sugerencias';

            // Set dropdowns to match the current selected color
            const current = selectedColor || closestColors[0];
            manualColor.H = current.H;
            manualColor.V = current.V;
            manualColor.C = current.C;

            hSelect.value = current.H;
            updateVandC(current.H); // This updates V and C dropdowns

            // Set V and C values after their options have been refreshed
            vSelect.value = current.V;
            cSelect.value = current.C;

            // Update preview
            updatePreview(current.H, current.V, current.C);

        } else {
            // Switching to Grid mode
            colorGrid.style.display = 'grid';
            manualDiv.style.display = 'none';
            toggleButton.textContent = 'Usar Selección Manual';
        }
    });
    
    // old toggle would leave the drop down selectors on initial range, bad.
    //toggleButton.addEventListener('click', () => {
    //    if (colorGrid.style.display !== 'none') {
    //        colorGrid.style.display = 'none';
    //        manualDiv.style.display = 'block';
    //        toggleButton.textContent = 'Usar Selección por Sugerencias';
    //    } else {
    //        colorGrid.style.display = 'grid';
    //        manualDiv.style.display = 'none';
    //        toggleButton.textContent = 'Usar Selección Manual';
    //    }
    //});

    // defining the confirm button
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
        const currentMeasurement = measurements[measurements.length - 1];
        if (manualDiv.style.display !== 'none') {
            currentMeasurement.munsell = [manualColor.H, manualColor.V, manualColor.C];
        } else if (selectedColor) {
            currentMeasurement.munsell = [selectedColor.H, selectedColor.V, selectedColor.C];
        } else {
            const fallback = closestColors[0];
            currentMeasurement.munsell = [fallback.H, fallback.V, fallback.C];
        }

        saveMeasurements();
        document.body.removeChild(modal);
        document.getElementById("smallSuggestionP").style.display = "unset";
    });

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Set initial preview from grid
    updatePreview(selectedColor.H, selectedColor.V, selectedColor.C);
}


/*// Initial manual and auto createColorSelectionModal function
function createColorSelectionModal(capturedRGB, closestColors) {
    // Extract all unique values for sliders from colorData
    const allH = [...new Set(colorData.map(c => c.H))];
    const allV = [...new Set(colorData.map(c => c.V))].sort((a,b) => a-b);
    const allC = [...new Set(colorData.map(c => c.C))].sort((a,b) => a-b);

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

    const header = document.createElement('h2');
    header.textContent = 'Seleccione el Color Munsell más cercano';
    modalContent.appendChild(header);

    const capturedColorDiv = document.createElement('div');
    capturedColorDiv.style.cssText = `display: flex; align-items: center; margin-bottom: 20px;`;
    const colorSquare = document.createElement('div');
    colorSquare.style.cssText = `width: 50px; height: 50px; background-color: rgb(${capturedRGB.join(',')}); margin-right: 10px;`;
    const colorText = document.createElement('p');
    colorText.textContent = `Color Capturado: RGB(${capturedRGB.join(', ')})`;
    capturedColorDiv.appendChild(colorSquare);
    capturedColorDiv.appendChild(colorText);
    modalContent.appendChild(capturedColorDiv);

    // ---- Toggle Button ----
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Cambiar Modo';
    toggleButton.style.cssText = `margin: 10px; padding: 5px 10px;`;
    modalContent.appendChild(toggleButton);

    // ---- Color Choosing Area ----
    const colorChoosingArea = document.createElement('div');
    modalContent.appendChild(colorChoosingArea);

    // ---- Color Grid Mode ----
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
        `;

        const colorLabel = document.createElement('p');
        colorLabel.textContent = `${color.H} ${color.V} ${color.C}`;

        colorItem.appendChild(colorSquare);
        colorItem.appendChild(colorLabel);

        colorItem.addEventListener('click', () => {
            colorGrid.querySelectorAll('div').forEach(item => {
                item.style.border = '2px solid #ddd';
            });
            colorItem.style.border = '2px solid blue';
            selectedColor = color;
        });

        if (index === 0) {
            colorItem.style.border = '2px solid blue';
            selectedColor = color;
        }

        colorGrid.appendChild(colorItem);
    });

    // ---- Manual Slider Mode ----
    const sliderDiv = document.createElement('div');
    sliderDiv.style.display = 'none'; // initially hidden

    const createSelect = (labelText, options, onChangeCallback) => {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '10px';

        const label = document.createElement('label');
        label.textContent = labelText;
        wrapper.appendChild(label);

        const select = document.createElement('select');
        options.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            select.appendChild(opt);
        });
        select.addEventListener('change', onChangeCallback);
        wrapper.appendChild(select);
        return [wrapper, select];
    };

    let manualColor = { H: allH[0], V: allV[0], C: allC[0] };

    const [hWrapper, hSelect] = createSelect('Tono (H):', allH, e => manualColor.H = e.target.value);
    const [vWrapper, vSelect] = createSelect('Valor (V):', allV, e => manualColor.V = parseInt(e.target.value));
    const [cWrapper, cSelect] = createSelect('Croma (C):', allC, e => manualColor.C = parseInt(e.target.value));
    sliderDiv.appendChild(hWrapper);
    sliderDiv.appendChild(vWrapper);
    sliderDiv.appendChild(cWrapper);

    colorChoosingArea.appendChild(colorGrid);
    colorChoosingArea.appendChild(sliderDiv);

    // ---- Toggle functionality ----
    let mode = 'grid';
    toggleButton.addEventListener('click', () => {
        if (mode === 'grid') {
            colorGrid.style.display = 'none';
            sliderDiv.style.display = 'block';
            mode = 'manual';
        } else {
            sliderDiv.style.display = 'none';
            colorGrid.style.display = 'grid';
            mode = 'grid';
        }
    });

    // ---- Confirm button ----
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
        const currentMeasurement = measurements[measurements.length - 1];
        if (mode === 'grid' && selectedColor) {
            currentMeasurement.munsell = [selectedColor.H, selectedColor.V, selectedColor.C];
        } else if (mode === 'manual') {
            currentMeasurement.munsell = [manualColor.H, manualColor.V, manualColor.C];
        }
        saveMeasurements();
        document.body.removeChild(modal);
        document.getElementById("smallSuggestionP").style.display = "unset";
    });
    modalContent.appendChild(confirmButton);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}//*/


/* // Just auto RGB createColorSelectionModal function

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
            //currentMeasurement.munsell = [
            //    selectedColor[0],  // Munsell Hue
            //    selectedColor[1],  // First value
            //    selectedColor[2]   // Second value
            //];
            
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
}//*/