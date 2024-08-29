/*/ Helper function to compute polynomial regression coefficients
function polynomialRegression(x, y, degree) {
    const n = x.length;
    const X = [];
  
    // Construct the design matrix X
    for (let i = 0; i < n; i++) {
      X[i] = [];
      for (let j = 0; j <= degree; j++) {
        X[i].push(Math.pow(x[i], j));
      }
    }
  
    // Compute the transpose of X
    const XT = X[0].map((_, colIndex) => X.map(row => row[colIndex]));
  
    // Compute (X^T * X)
    const XTX = XT.map(row => row.map((_, i) => row.reduce((sum, xVal, j) => sum + xVal * X[j][i], 0)));
  
    // Compute (X^T * y)
    const XTy = XT.map(row => row.reduce((sum, xVal, i) => sum + xVal * y[i], 0));
  
    // Solve for coefficients (X^T * X)^-1 * (X^T * y) using a linear solver
    const coefficients = solveLinearSystem(XTX, XTy);
  
    return coefficients;
  }
  
  // Helper function to solve a linear system Ax = b using Gaussian elimination
  function solveLinearSystem(A, b) {
    const n = A.length;
    const M = A.map(row => row.slice());
    
    // Augment matrix A with vector b
    for (let i = 0; i < n; i++) {
      M[i].push(b[i]);
    }
  
    // Perform Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Pivot for maximum value in column
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
          maxRow = k;
        }
      }
  
      // Swap rows
      [M[i], M[maxRow]] = [M[maxRow], M[i]];
  
      // Eliminate column
      for (let k = i + 1; k < n; k++) {
        const factor = M[k][i] / M[i][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= M[i][j] * factor;
        }
      }
    }
  
    // Back-substitution to solve for coefficients
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = M[i][n] / M[i][i];
      for (let k = i - 1; k >= 0; k--) {
        M[k][n] -= M[k][i] * x[i];
      }
    }
  
    return x;
  }

// Function to apply polynomial correction
function applyCorrection(coefficients, input) {
    let correctedValue = 0;
    for (let i = 0; i < coefficients.length; i++) {
      correctedValue += coefficients[i] * Math.pow(input, i);
    }
    return correctedValue;
  }

// Example calibration data
const R_calibration = [50, 100, 150, 200];
const R_measured = [55, 110, 145, 195]; // Example measured values for Red channel

const G_calibration = [60, 120, 180, 240];
const G_measured = [65, 125, 175, 235]; // Example measured values for Green channel

const B_calibration = [70, 140, 210, 280];
const B_measured = [75, 135, 205, 275]; // Example measured values for Blue channel

// Perform polynomial regression to get coefficients for each channel
const degree = 4; // You can adjust this degree

const R_coefficients = polynomialRegression(R_measured, R_calibration, degree);
const G_coefficients = polynomialRegression(G_measured, G_calibration, degree);
const B_coefficients = polynomialRegression(B_measured, B_calibration, degree);

console.log(R_coefficients);
console.log(G_coefficients);
console.log(B_coefficients);

// Apply correction for a new input value
const newR = 160;
const newG = 190;
const newB = 220;

const correctedR = applyCorrection(R_coefficients, newR);
const correctedG = applyCorrection(G_coefficients, newG);
const correctedB = applyCorrection(B_coefficients, newB);

console.log("Corrected Color Values:", correctedR, correctedG, correctedB);

*/

// Function to compute linear regression coefficients (a, b)
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

// Example calibration data
const R_calibration = [50, 100, 150, 200];
const R_measured = [55, 110, 145, 195]; // Example measured values for Red channel

const G_calibration = [60, 120, 180, 240];
const G_measured = [65, 125, 175, 235]; // Example measured values for Green channel

const B_calibration = [70, 140, 210, 280];
const B_measured = [75, 135, 205, 275]; // Example measured values for Blue channel

// Perform linear regression to get coefficients for each channel
const R_coeffs = linearRegression(R_measured, R_calibration);
const G_coeffs = linearRegression(G_measured, G_calibration);
const B_coeffs = linearRegression(B_measured, B_calibration);

console.log(R_coeffs);
console.log(G_coeffs);
console.log(B_coeffs);


// Apply correction for a new input value
const newR = 160;
const newG = 190;
const newB = 220;

const correctedR = applyLinearCorrection(R_coeffs.a, R_coeffs.b, newR);
const correctedG = applyLinearCorrection(G_coeffs.a, G_coeffs.b, newG);
const correctedB = applyLinearCorrection(B_coeffs.a, B_coeffs.b, newB);

console.log("Corrected Color Values:", correctedR, correctedG, correctedB);
