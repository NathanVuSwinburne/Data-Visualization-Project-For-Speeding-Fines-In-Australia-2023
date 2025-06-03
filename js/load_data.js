// Monthly Trend Data Loader

// Data storage for monthly trend data
const monthlyTrendData = [];

// Jurisdiction Data Loader
let jurisdictionData = [];

// Data Loading Utilities

/**
 * Load Excel file from the data folder
 * @param {string} fileName - Name of Excel file to load
 * @returns {Promise<Array>} Array of data from the Excel file
 */
async function loadExcelFile(fileName) {
    try {
        const response = await fetch(`data/${fileName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const data = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const firstSheetName = data.SheetNames[0];
        const worksheet = data.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Get headers from first row
        const headers = jsonData[0];
        
        // Convert data to array of objects
        const result = jsonData.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index];
            });
            return obj;
        });

        console.log(`Loaded data from ${fileName}:`, result);
        return result;
    } catch (error) {
        console.error(`Error loading Excel file ${fileName}:`, error);
        throw error;
    }
}

/**
 * Load monthly trend data
 * @returns {Promise<Array>} Processed monthly trend data
 */
async function loadMonthlyTrendData() {
    try {
        console.log("Attempting to load monthly trend data");
        const data = await loadExcelFile('Trend_of_Speed_Fines_Over_Months_in_2023.xlsx');
        
        return data.map(row => ({
            month: row.Month,
            fines: parseInt(row.Fines) || 0
        }));
    } catch (error) {
        console.error("Error loading monthly trend data:", error);
        return [];
    }
}

/**
 * Load jurisdiction data
 * @returns {Promise<Array>} Processed jurisdiction data
 */
async function loadJurisdictionData() {
    try {
        console.log("Attempting to load jurisdiction data");
        const data = await loadExcelFile('Total_Speeding_Fines_by_Jurisdiction_2023.xlsx');
        
        const processedData = data.map(row => ({
            Jurisdiction: row.Jurisdiction,
            Fines: parseInt(row.Fines) || 0,
            Percentage: parseFloat(row.Percentage) || 0
        }));

        console.log("Processed jurisdiction data:", processedData);
        return processedData;
    } catch (error) {
        console.error("Error loading jurisdiction data:", error);
        return [];
    }
}

/**
 * Load detection method data
 * @returns {Promise<Array>} Processed detection method data
 */
async function loadDetectionMethodData() {
    try {
        console.log("Attempting to load detection method data");
        const data = await loadExcelFile('Speeding_Fine_by_Detection_Method_2023.xlsx');
        
        return data.map(row => ({
            method: row['Detection Method'],
            count: parseInt(row.Count) || 0,
            percentage: parseFloat(row.Percentage) || 0
        }));
    } catch (error) {
        console.error("Error loading detection method data:", error);
        return [];
    }
}

/**
 * Load location type data
 * @returns {Promise<Array>} Processed location type data
 */
async function loadLocationData() {
    try {
        console.log("Attempting to load location data");
        const data = await loadExcelFile('Number_of_Speeding_Fines_by_Location_in_2023.xlsx');
        
        return data.map(row => ({
            location: row.Location,
            count: parseInt(row.Count) || 0
        }));
    } catch (error) {
        console.error("Error loading location data:", error);
        return [];
    }
}

/**
 * Load age group data
 * @returns {Promise<Array>} Processed age group data
 */
async function loadAgeGroupData() {
    try {
        console.log("Attempting to load age group data");
        const data = await loadExcelFile('number_of_fines_across_all_age_groups_in_2023.xlsx');
        
        return data.map(row => ({
            ageGroup: row['Age Group'],
            count: parseInt(row.Count) || 0
        }));
    } catch (error) {
        console.error("Error loading age group data:", error);
        return [];
    }
}

/**
 * Main data loading function that loads all required data
 * @returns {Promise<Object>} Object containing all loaded data
 */
async function loadData() {
    try {
        const [
            monthlyData,
            jurisdictionData,
            detectionData,
            locationData,
            ageData
        ] = await Promise.all([
            loadMonthlyTrendData(),
            loadJurisdictionData(),
            loadDetectionMethodData(),
            loadLocationData(),
            loadAgeGroupData()
        ]);

        console.log("All data loaded successfully:", {
            monthlyTrendData: monthlyData,
            jurisdictionData: jurisdictionData,
            detectionMethodData: detectionData,
            locationData: locationData,
            ageGroupData: ageData
        });

        return {
            monthlyTrendData: monthlyData,
            jurisdictionData: jurisdictionData,
            detectionMethodData: detectionData,
            locationData: locationData,
            ageGroupData: ageData
        };
    } catch (error) {
        console.error("Error in loadData:", error);
        return {
            monthlyTrendData: [],
            jurisdictionData: [],
            detectionMethodData: [],
            locationData: [],
            ageGroupData: []
        };
    }
}
