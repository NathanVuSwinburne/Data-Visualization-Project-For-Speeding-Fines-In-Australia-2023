// Monthly Trend Data Loader

// Data storage for monthly trend data
const monthlyTrendData = [];

/**
 * Load monthly trend data
 * @returns {Promise<Array>} Processed monthly trend data
 */
async function loadMonthlyTrendData() {
  try {
    console.log("Attempting to load monthly trend data");
    
    const data = await loadExcelFile('Trend_of_Speed_Fines_Over_Months_in_2023.xlsx');
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log("Raw data loaded successfully:", data.length, "records");
      
      const processedData = processMonthlyTrendData(data);
      
      if (processedData && processedData.length > 0) {
        return processedData;
      } else {
        console.error("Failed to process monthly trend data - empty result");
        throw new Error("Monthly trend data processing failed");
      }
    } else {
      console.error("No monthly trend data found in file or invalid data format");
      throw new Error("No monthly trend data found or invalid format");
    }
  } catch (error) {
    console.error("Error loading monthly trend data:", error);
    console.log("Falling back to mock monthly trend data");
    return getMockMonthlyTrendData();
  }
}

/**
 * Load Excel file from the data folder
 * @param {string} fileName - Name of Excel file to load
 * @returns {Promise<Array>} Array of data from the Excel file
 */
function loadExcelFile(fileName) {
  return new Promise((resolve, reject) => {
    try {
      // Try loading Excel with relative path
      tryLoadExcelWithXHR(`data/${fileName}`, (data) => {
        if (data) {
          console.log("Successfully loaded with relative path");
          resolve(data);
        } else {
          // Try with absolute path as fallback
          const absolutePath = `file:///C:/Users/Admin/Uni/COS30045/data-visualisation-project-dv08_t08/data/${fileName}`;
          console.log("Trying absolute path:", absolutePath);
          
          tryLoadExcelWithXHR(absolutePath, (data) => {
            if (data) {
              console.log("Successfully loaded with absolute path");
              resolve(data);
            } else {
              console.error("Could not load Excel file with either approach");
              reject(new Error("Failed to load Excel file"));
            }
          });
        }
      });
    } catch (error) {
      console.error(`Error in loadExcelFile for ${fileName}:`, error);
      reject(error);
    }
  });
}

/**
 * Helper function to try loading Excel file with XMLHttpRequest
 * @param {string} url - URL of the Excel file to load
 * @param {Function} callback - Callback function with parsed data or null
 */
function tryLoadExcelWithXHR(url, callback) {
  console.log(`Attempting to load Excel from: ${url}`);
  
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  
  xhr.onload = function() {
    if (this.status === 200) {
      console.log(`Got array buffer, size:`, this.response.byteLength);
      try {
        const data = parseExcelData(this.response);
        console.log(`Parsed data:`, data ? data.length : 0, "records");
        callback(data);
      } catch (error) {
        console.error(`Error parsing data:`, error);
        callback(null);
      }
    } else {
      console.error(`Failed with status: ${this.status}`);
      callback(null);
    }
  };
  
  xhr.onerror = function() {
    console.error(`Network error loading: ${url}`);
    callback(null);
  };
  
  xhr.send();
}

/**
 * Parse Excel data using SheetJS
 * @param {ArrayBuffer} arrayBuffer - Excel file as ArrayBuffer
 * @returns {Array} Parsed data from Excel file
 */
function parseExcelData(arrayBuffer) {
  try {
    // Make sure XLSX is available
    if (typeof XLSX === 'undefined') {
      console.error("XLSX library not loaded");
      throw new Error("XLSX library not loaded");
    }
    
    // Parse the Excel file using SheetJS
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    return jsonData;
  } catch (error) {
    console.error("Error parsing Excel data:", error);
    return [];
  }
}

/**
 * Process Monthly Trend Data
 * @param {Array} data - Raw data from Excel file
 * @returns {Array} Processed data for the dashboard
 */
function processMonthlyTrendData(data) {
  try {
    if (data.length === 0) return [];
    
    // Map data to the expected format for the dashboard
    const result = data.map(row => {
      // Get column names
      const keys = Object.keys(row);
      
      // Try to identify the month and fines columns
      let month, fines;
      
      // Look for common month column names
      const monthKeys = keys.filter(key => 
        /month|period|date|time/i.test(key) || 
        typeof row[key] === 'string' && 
        /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(row[key])
      );
      
      // Look for common fines/value column names
      const finesKeys = keys.filter(key => 
        /fine|count|total|value|number/i.test(key) || 
        typeof row[key] === 'number'
      );
      
      if (monthKeys.length > 0) {
        month = row[monthKeys[0]];
      } else {
        // Fallback: assume first column is month
        month = row[keys[0]];
      }
      
      if (finesKeys.length > 0) {
        fines = parseInt(row[finesKeys[0]] || 0);
      } else {
        // Fallback: assume second column is fines count
        fines = parseInt(row[keys[1]] || 0);
      }
      
      return { month, fines };
    });
    
    return result;
  } catch (error) {
    console.error("Error processing monthly trend data:", error);
    return [];
  }
}
