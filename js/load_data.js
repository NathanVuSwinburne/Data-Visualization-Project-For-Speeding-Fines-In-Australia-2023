console.log('Starting to load data...');

const monthAbbreviations = {
    "January": "JAN", "February": "FEB", "March": "MAR", "April": "APR",
    "May": "MAY", "June": "JUN", "July": "JUL", "August": "AUG",
    "September": "SEP", "October": "OCT", "November": "NOV", "December": "DEC"
};

// Load data from master_fine.csv
d3.csv("data/master_fine.csv").then(rawData => {
    console.log("Raw data loaded from master_fine.csv:", rawData.length, "rows");
    
    // Transform month names to abbreviations IN PLACE in the 'Month (Name)' field
    rawData.forEach(d => {
        const fullMonthName = d["Month (Name)"];
        d["Month (Name)"] = monthAbbreviations[fullMonthName] || fullMonthName;
    });
    
    // Store raw data globally for filtering (now with abbreviated month names in 'Month (Name)')
    window.rawDashboardData = rawData;
    // 1. Monthly trend data
    const monthlyData = processMonthlyData(rawData);
    
    // 2. Jurisdiction data
    const jurisdictionData = processJurisdictionData(rawData);
    
    // 3. Location data
    const locationData = processLocationData(rawData);
    
    // 4. Age group data
    const ageGroupData = processAgeGroupData(rawData);
    
    // 5. Detection method data
    const detectionMethodData = processDetectionMethodData(rawData);
    
    // Store the data in a global variable
    console.log("Location data processed:", locationData);
    console.log("Age group data processed:", ageGroupData);
    console.log("Detection method data processed:", detectionMethodData);
    
    window.dashboardData = {
        monthlyTrend: monthlyData,
        jurisdiction: jurisdictionData,
        location: locationData,
        ageGroup: ageGroupData,
        detectionMethod: detectionMethodData
    };
    console.log("Full dashboard data object:", window.dashboardData);
    
    // Sort jurisdiction data by fines (descending)
    const sortedJurisdictionData = [...jurisdictionData].sort((a, b) => b.fines - a.fines);
    
    // Calculate total fines (sum of all jurisdiction fines)
    const totalFines = jurisdictionData.reduce((sum, item) => sum + item.fines, 0);
    
    // Update the KPI for total fines
    document.getElementById('total-fines').querySelector('.kpi-value').textContent = 
        totalFines.toLocaleString();
    
    // Find the jurisdiction with the most fines
    const topJurisdiction = sortedJurisdictionData[0];
    
    // Update the KPI for top jurisdiction
    if (topJurisdiction) {
        document.getElementById('highest-jurisdiction').querySelector('.kpi-value').textContent = 
            `${topJurisdiction.jurisdiction} (${topJurisdiction.fines.toLocaleString()})`;
    }
    
    // Find the peak month
    const peakMonthData = monthlyData.reduce((max, item) => 
        item.totalFines > max.totalFines ? item : max, monthlyData[0]);
    
    // Update the KPI for peak month
    document.getElementById('highest-month').querySelector('.kpi-value').textContent = 
        `${peakMonthData.month} (${peakMonthData.totalFines.toLocaleString()})`;
        
    // Find the top age group
    const sortedAgeGroupData = [...ageGroupData].sort((a, b) => b.fines - a.fines);
    const topAgeGroup = sortedAgeGroupData[0];
    
    // Update the KPI for top age group
    if (topAgeGroup) {
        document.getElementById('top-age-group').querySelector('.kpi-value').textContent = 
            `${topAgeGroup.ageGroup} (${topAgeGroup.fines.toLocaleString()})`;  
    }
    
    // Initialize the dashboard
    if (window.initDashboard) {
        window.initDashboard();
    }
    
    // Initialize the monthly trend chart (with a slight delay to ensure DOM is ready)
    setTimeout(() => {
        if (typeof initMonthlyTrendChart === 'function') {
            initMonthlyTrendChart();
        } else {
            console.error('Monthly trend chart initialization function not found');
        }
    }, 100);
}).catch(error => {
    console.error('Error loading data:', error);
});

// Process raw data into monthly trend format
function processMonthlyData(rawData) {
    const monthlyFines = {};
    const presentInRawDataMonths = new Set(); // Keep track of months actually in rawData

    // Group fines by month, excluding QLD data
    rawData.forEach(d => {
        // Skip QLD data for monthly trend
        if (d.JURISDICTION === "QLD") return;
        
        const month = d["Month (Name)"]; // This now directly gives the abbreviation
        presentInRawDataMonths.add(month); // Record that this month has data from the filter
        if (!monthlyFines[month]) {
            monthlyFines[month] = 0;
        }
        monthlyFines[month] += +d.FINES;
    });
    
    const monthOrder = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
    
    // Create an array of month objects, ONLY for months that were present in rawData 
    // AND have aggregated fines > 0. Maintain chronological order.
    let processedData = monthOrder
        .filter(month => presentInRawDataMonths.has(month) && monthlyFines[month] > 0)
        .map(month => ({
            month: month,
            totalFines: monthlyFines[month], // Will be > 0 due to the filter
            percentageChange: 0 // Initialize, will calculate next
        }));
    
    // Calculate month-over-month percentage changes based on the sequence in processedData.
    // This loop now correctly operates on the sequence of *actually present and displayed* months.
    for (let i = 0; i < processedData.length; i++) {
        if (i === 0) {
            // First month in the current sequence. No prior month in this view to compare against.
            processedData[i].percentageChange = null; // Or 0, depending on desired display for the first point
        } else {
            const currentFines = processedData[i].totalFines;
            const previousFines = processedData[i-1].totalFines; // Previous month in the *sequence*
            
            // previousFines should not be 0 here because of the earlier filter: monthlyFines[month] > 0
            if (previousFines === 0) { 
                 // This case should ideally not be hit if months with zero fines are already filtered out.
                 // If it can be hit, decide on a representation (e.g., 100% if current is >0, or null/0)
                processedData[i].percentageChange = (currentFines > 0) ? 100 : 0; 
            } else {
                processedData[i].percentageChange = ((currentFines - previousFines) / previousFines) * 100;
            }
        }
    }
    
    return processedData; // Return the array of only relevant, processed months
}

// Process raw data into jurisdiction format
function processJurisdictionData(rawData) {
    const jurisdictionFines = {};
    
    // Group fines by jurisdiction
    rawData.forEach(d => {
        const jurisdiction = d.JURISDICTION;
        if (!jurisdictionFines[jurisdiction]) {
            jurisdictionFines[jurisdiction] = 0;
        }
        jurisdictionFines[jurisdiction] += +d.FINES;
    });
    
    // Convert to array of objects
    return Object.entries(jurisdictionFines).map(([jurisdiction, fines]) => ({
        jurisdiction: jurisdiction,
        fines: fines
    }));
}

// Modify each processing function to accept filtered data
function processLocationData(rawData, filteredMonths = null) {
    const locationFines = {};
    
    // Filter by months if specified
    const dataToProcess = filteredMonths && filteredMonths.length > 0 
        ? rawData.filter(d => filteredMonths.includes(d["Month (Name)"])) // d["Month (Name)"] is now an abbreviation
        : rawData;
    
    // Group fines by location, excluding "Unknown" locations
    dataToProcess.forEach(d => {
        const location = d.LOCATION_TYPE;
        if (location === "Unknown") return;
        
        if (!locationFines[location]) {
            locationFines[location] = 0;
        }
        locationFines[location] += +d.FINES;
    });
    
    return Object.entries(locationFines).map(([location, fines]) => ({
        location: location,
        fines: fines
    }));
}

function processAgeGroupData(rawData, filteredMonths = null) {
    const ageGroupFines = {};
    
    // Filter by months if specified
    const dataToProcess = filteredMonths && filteredMonths.length > 0 
        ? rawData.filter(d => filteredMonths.includes(d["Month (Name)"])) // d["Month (Name)"] is now an abbreviation
        : rawData;
    
    dataToProcess.forEach(d => {
        const ageGroup = d.AGE_GROUP;
        if (ageGroup === "Unknown" || ageGroup === "0-16") return;

        if (!ageGroupFines[ageGroup]) {
            ageGroupFines[ageGroup] = 0;
        }
        ageGroupFines[ageGroup] += +d.FINES;
    });
    
    return Object.entries(ageGroupFines)
        .map(([ageGroup, fines]) => ({
            ageGroup: ageGroup,
            fines: fines
        }))
        .sort((a, b) => b.fines - a.fines);
}

function processDetectionMethodData(rawData, filteredMonths = null) {
    const detectionMethodCounts = {};
    
    // Filter by months if specified
    const dataToProcess = filteredMonths && filteredMonths.length > 0 
        ? rawData.filter(d => filteredMonths.includes(d["Month (Name)"])) // d["Month (Name)"] is now an abbreviation
        : rawData;
    
    dataToProcess.forEach(d => {
        const method = d.DETECTION_METHOD_CLEAN;
        const fines = +d.FINES;

        if (method === "Other") {
            return; // Skip "Other" values
        } else if (method === "Fixed or mobile camera") {
            const halfFines = fines / 2;
            detectionMethodCounts["Mobile camera"] = (detectionMethodCounts["Mobile camera"] || 0) + halfFines;
            detectionMethodCounts["Fixed camera systems"] = (detectionMethodCounts["Fixed camera systems"] || 0) + halfFines;
        } else {
            if (!detectionMethodCounts[method]) {
                detectionMethodCounts[method] = 0;
            }
            detectionMethodCounts[method] += fines;
        }
    });
    
    return Object.entries(detectionMethodCounts).map(([method, count]) => ({
        method: method,
        count: count
    }));
}

// Make processing functions globally available
window.processMonthlyData = processMonthlyData;
window.processJurisdictionData = processJurisdictionData;
window.processLocationData = processLocationData;
window.processAgeGroupData = processAgeGroupData;
window.processDetectionMethodData = processDetectionMethodData;