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
    const data = getData();
    const tableBody = document.getElementById('dataTable');
    tableBody.innerHTML = ''; // Clear previous content
  
    data.forEach((item, index) => {
      const row = document.createElement('tr');
  
      // ID Column (Row Index)
      const idCell = document.createElement('td');
      idCell.textContent = index + 1;
      row.appendChild(idCell);
  
      // Data Columns
      for (let key in item) {
        const cell = document.createElement('td');
        cell.textContent = item[key];
        row.appendChild(cell);
      }
  
      // Add click listener to the entire row
      row.onclick = () => {
        console.log(`Row ID: ${index + 1}`);
      };
  
      tableBody.appendChild(row);
    });
  }
  
  function toggleTable() {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.style.display = tableContainer.style.display === 'none' ? 'block' : 'none';
    displayData();
  }
  
  // Initial load of data when the page loads
  displayData();