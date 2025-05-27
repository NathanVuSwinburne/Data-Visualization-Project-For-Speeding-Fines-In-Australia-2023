// Road Safety Dashboard - Data Loading Module - Team 8

/**
 * Data loading module for the Road Safety Dashboard
 * Uses SheetJS/xlsx to parse Excel files from the data folder
 */

// Import SheetJS if you're using modules (uncomment if needed)
// import * as XLSX from 'xlsx';

// Data storage for loaded Excel data
const dataStore = {
    monthlyTrend: [],
    jurisdictions: [],
    detectionMethods: [],
    ageGroups: [],
    locations: []
};

/**
 * Load all datasets needed for the dashboard
 * @returns {Promise<Object>} Object containing all loaded datasets
 */
async function loadAllData() {
    try {
        console.log("Loading all dashboard data...");
        
        // DEBUG - Log available Excel loading utilities
        console.log("XLSX library available:", typeof XLSX !== 'undefined');
        
        // Load data in sequence to prevent network issues
        console.log("Loading monthly trend data...");
        await loadMonthlyTrendData();
        
        console.log("Loading jurisdiction data...");
        await loadJurisdictionData();
        
        console.log("Loading detection method data...");
        await loadDetectionMethodData();
        
        console.log("Loading age group data...");
        await loadAgeGroupData();
        
        console.log("Loading location data...");
        await loadLocationData();
        
        console.log("All data loaded successfully");
        return dataStore;
    } catch (error) {
        console.error("Error loading data:", error);
        // In case of a critical error, use mock data
        console.log("Using mock data as fallback");
        fillWithMockData();
        return dataStore;
    }
}

/**
 * Load monthly trend data
 */
async function loadMonthlyTrendData() {
    try {
        console.log("Attempting to load monthly trend data");
        console.log("Using file: Trend_of_Speed_Fines_Over_Months_in_2023.xlsx");
        
        const data = await loadExcelFile('Trend_of_Speed_Fines_Over_Months_in_2023.xlsx');
        
        console.log("Monthly trend data fetch result:", data);
        
        if (data && Array.isArray(data) && data.length > 0) {
            console.log("Raw data loaded successfully:", data.length, "records");
            console.log("First few records:", data.slice(0, 3));
            
            const processedData = processMonthlyTrendData(data);
            
            if (processedData && processedData.length > 0) {
                dataStore.monthlyTrend = processedData;
                console.log("Monthly trend data processed and stored:", 
                    dataStore.monthlyTrend.length, "records");
                console.log("Sample processed data:", dataStore.monthlyTrend.slice(0, 3));
                return true;
            } else {
                console.error("Failed to process monthly trend data - empty result");
                throw new Error("Monthly trend data processing failed");
            }
        } else {
            console.error("No monthly trend data found in file or invalid data format");
            console.error("Data received:", data);
            throw new Error("No monthly trend data found or invalid format");
        }
    } catch (error) {
        console.error("Error loading monthly trend data:", error);
        console.log("Falling back to mock monthly trend data");
        dataStore.monthlyTrend = getMockMonthlyTrendData();
        return false;
    }
}

/**
 * Load jurisdiction data
 */
async function loadJurisdictionData() {
    try {
        const data = await loadExcelFile('Total_Speeding_Fines_by_Jurisdiction_2023.xlsx');
        if (data && data.length > 0) {
            dataStore.jurisdictions = processJurisdictionData(data);
            console.log("Jurisdiction data loaded:", dataStore.jurisdictions.length, "records");
        } else {
            throw new Error("No jurisdiction data found");
        }
    } catch (error) {
        console.error("Error loading jurisdiction data:", error);
        dataStore.jurisdictions = getMockJurisdictionData();
        console.log("Using mock jurisdiction data");
    }
}

/**
 * Load detection method data
 */
async function loadDetectionMethodData() {
    try {
        const data = await loadExcelFile('Speeding_Fine_by_Detection_Method_2023.xlsx');
        if (data && data.length > 0) {
            dataStore.detectionMethods = processDetectionMethodData(data);
            console.log("Detection method data loaded:", dataStore.detectionMethods.length, "records");
        } else {
            throw new Error("No detection method data found");
        }
    } catch (error) {
        console.error("Error loading detection method data:", error);
        dataStore.detectionMethods = getMockDetectionMethodData();
        console.log("Using mock detection method data");
    }
}

/**
 * Load age group data
 */
async function loadAgeGroupData() {
    try {
        const data = await loadExcelFile('number_of_fines_across_all_age_groups_in_2023.xlsx');
        if (data && data.length > 0) {
            dataStore.ageGroups = processAgeGroupData(data);
            console.log("Age group data loaded:", dataStore.ageGroups.length, "records");
        } else {
            throw new Error("No age group data found");
        }
    } catch (error) {
        console.error("Error loading age group data:", error);
        dataStore.ageGroups = getMockAgeGroupData();
        console.log("Using mock age group data");
    }
}

/**
 * Load location data
 */
async function loadLocationData() {
    try {
        const data = await loadExcelFile('Number_of_Speeding_Fines_by_Location_in_2023.xlsx');
        if (data && data.length > 0) {
            dataStore.locations = processLocationData(data);
            console.log("Location data loaded:", dataStore.locations.length, "records");
        } else {
            throw new Error("No location data found");
        }
    } catch (error) {
        console.error("Error loading location data:", error);
        dataStore.locations = getMockLocationData();
        console.log("Using mock location data");
    }
}

/**
 * Fill all datasets with mock data
 */
function fillWithMockData() {
    dataStore.monthlyTrend = getMockMonthlyTrendData();
    dataStore.jurisdictions = getMockJurisdictionData();
    dataStore.detectionMethods = getMockDetectionMethodData();
    dataStore.ageGroups = getMockAgeGroupData();
    dataStore.locations = getMockLocationData();
}

/**
 * Load Excel file from the data folder
 * @param {string} fileName - Name of Excel file to load
 * @returns {Promise<Array>} Array of data from the Excel file
 */
async function loadExcelFile(fileName) {
    return new Promise((resolve, reject) => {
        try {
            let fullPath;
            
            // Special case for monthly trend data
            if (fileName === 'Trend_of_Speed_Fines_Over_Months_in_2023.xlsx') {
                // Try multiple approaches to load the file
                
                // First approach: Use relative path from current page
                tryLoadExcelWithXHR(`data/${fileName}`, (data) => {
                    if (data) {
                        console.log("Successfully loaded with relative path");
                        resolve(data);
                    } else {
                        // Second approach: Try with file:// protocol 
                        const absolutePath = `file:///C:/Users/Admin/Uni/COS30045/data-visualisation-project-dv08_t08/data/${fileName}`;
                        console.log("Trying absolute path:", absolutePath);
                        
                        tryLoadExcelWithXHR(absolutePath, (data) => {
                            if (data) {
                                console.log("Successfully loaded with absolute path");
                                resolve(data);
                            } else {
                                // If both approaches fail, use mock data
                                console.error("Could not load Excel file with either approach");
                                reject(new Error("Failed to load Excel file"));
                            }
                        });
                    }
                });
            } else {
                // For other files, use standard relative path
                tryLoadExcelWithXHR(`data/${fileName}`, (data) => {
                    if (data) {
                        resolve(data);
                    } else {
                        reject(new Error(`Failed to load ${fileName}`));
                    }
                });
            }
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
        console.log("Workbook sheets:", workbook.SheetNames);
        
        // Get the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Log some info about the worksheet
        console.log("First sheet name:", workbook.SheetNames[0]);
        console.log("Worksheet ref:", worksheet['!ref']);
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log("JSON data parsed, records:", jsonData.length);
        
        if (jsonData.length > 0) {
            console.log("First record sample:", jsonData[0]);
        }
        
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
        console.log("Processing monthly trend data, records:", data.length);
        if (data.length === 0) return [];
        
        // Log first record to see structure
        console.log("Sample record:", data[0]);
        console.log("All column keys sample:", Object.keys(data[0]));
        
        // Map data to the expected format for the dashboard
        const result = data.map(row => {
            // Get column names
            const keys = Object.keys(row);
            
            // Try to intelligently identify the month and fines columns
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
            
            console.log(`Extracted: Month=${month}, Fines=${fines} from keys:`, keys);
            return { month, fines };
        });
        
        console.log("Processed monthly data:", result);
        return result;
    } catch (error) {
        console.error("Error processing monthly trend data:", error);
        return [];
    }
}

/**
 * Process Jurisdiction Data
 * @param {Array} data - Raw data from Excel file
 * @returns {Array} Processed data for the dashboard
 */
function processJurisdictionData(data) {
    try {
        console.log("Processing jurisdiction data, records:", data.length);
        if (data.length === 0) return [];
        
        // Log first record to see structure
        console.log("Sample record:", data[0]);
        
        // Map data to the expected format for the dashboard
        const result = data.map(row => {
            // Get column names
            const keys = Object.keys(row);
            
            // Assume first column is jurisdiction and second is fines count
            const jurisdiction = row[keys[0]];
            const fines = parseInt(row[keys[1]] || 0);
            
            return { jurisdiction, fines };
        });
        
        return result;
    } catch (error) {
        console.error("Error processing jurisdiction data:", error);
        return [];
    }
}

/**
 * Process Detection Method Data
 * @param {Array} data - Raw data from Excel file
 * @returns {Array} Processed data for the dashboard
 */
function processDetectionMethodData(data) {
    try {
        console.log("Processing detection method data, records:", data.length);
        if (data.length === 0) return [];
        
        // Log first record to see structure
        console.log("Sample record:", data[0]);
        
        // Map data to the expected format for the dashboard
        const result = data.map(row => {
            // Get column names
            const keys = Object.keys(row);
            
            // Assume first column is method and second is fines count
            const method = row[keys[0]];
            const fines = parseInt(row[keys[1]] || 0);
            
            return { method, fines };
        });
        
        return result;
    } catch (error) {
        console.error("Error processing detection method data:", error);
        return [];
    }
}

/**
 * Process Age Group Data
 * @param {Array} data - Raw data from Excel file
 * @returns {Array} Processed data for the dashboard
 */
function processAgeGroupData(data) {
    try {
        console.log("Processing age group data, records:", data.length);
        if (data.length === 0) return [];
        
        // Log first record to see structure
        console.log("Sample record:", data[0]);
        
        // Map data to the expected format for the dashboard
        const result = data.map(row => {
            // Get column names
            const keys = Object.keys(row);
            
            // Assume first column is age group and second is fines count
            const ageGroup = row[keys[0]];
            const fines = parseInt(row[keys[1]] || 0);
            
            return { ageGroup, fines };
        });
        
        return result;
    } catch (error) {
        console.error("Error processing age group data:", error);
        return [];
    }
}

/**
 * Process Location Data
 * @param {Array} data - Raw data from Excel file
 * @returns {Array} Processed data for the dashboard
 */
function processLocationData(data) {
    try {
        console.log("Processing location data, records:", data.length);
        if (data.length === 0) return [];
        
        // Log first record to see structure
        console.log("Sample record:", data[0]);
        
        // Map data to the expected format for the dashboard
        const result = data.map(row => {
            // Get column names
            const keys = Object.keys(row);
            
            // Assume first column is location and second is fines count
            const location = row[keys[0]];
            const fines = parseInt(row[keys[1]] || 0);
            
            return { location, fines };
        });
        
        return result;
    } catch (error) {
        console.error("Error processing location data:", error);
        return [];
    }
}


/**
 * Public API for the data loading module
 */
const DataLoader = {
    loadAllData,
    dataStore
};

// Export for use in other modules
// If using ES modules, uncomment the next line
// export default DataLoader;

// For script tag usage
window.DataLoader = DataLoader; 