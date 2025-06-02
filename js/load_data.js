console.log('Starting to load data...');

// Load data from master_fine.csv
d3.csv("data/master_fine.csv").then(rawData => {
    console.log("Raw data loaded from master_fine.csv:", rawData.length, "rows");
    
    // Process data into the needed formats
    
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
    
    // Group fines by month, excluding QLD data
    rawData.forEach(d => {
        // Skip QLD data for monthly trend
        if (d.JURISDICTION === "QLD") return;
        
        const month = d["Month (Name)"];
        if (!monthlyFines[month]) {
            monthlyFines[month] = 0;
        }
        monthlyFines[month] += +d.FINES;
    });
    
    // Convert to array of objects
    const monthOrder = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    
    const monthlyData = monthOrder.map(month => ({
        month: month,
        totalFines: monthlyFines[month] || 0,
        percentageChange: 0 // Will calculate below
    }));
    
    // Calculate month-over-month percentage changes
    for (let i = 1; i < monthlyData.length; i++) {
        const currentFines = monthlyData[i].totalFines;
        const previousFines = monthlyData[i-1].totalFines;
        
        if (previousFines === 0) {
            monthlyData[i].percentageChange = 100; // Avoid division by zero
        } else {
            monthlyData[i].percentageChange = ((currentFines - previousFines) / previousFines) * 100;
        }
    }
    
    return monthlyData;
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

// Process raw data into location format
function processLocationData(rawData) {
    const locationFines = {};
    
    // Group fines by location, excluding "Unknown" locations
    rawData.forEach(d => {
        const location = d.LOCATION_TYPE;
        // Skip Unknown locations
        if (location === "Unknown") return;
        
        if (!locationFines[location]) {
            locationFines[location] = 0;
        }
        locationFines[location] += +d.FINES;
    });
    
    // Convert to array of objects
    return Object.entries(locationFines).map(([location, fines]) => ({
        location: location,
        fines: fines
    }));
}

// Process raw data into age group format
function processAgeGroupData(rawData) {
    const ageGroupFines = {};
    
    // Group fines by age group
    rawData.forEach(d => {
        const ageGroup = d.AGE_GROUP;
        // Skip Unknown and 0-16 age groups
        if (ageGroup === "Unknown" || ageGroup === "0-16") return;

        if (!ageGroupFines[ageGroup]) {
            ageGroupFines[ageGroup] = 0;
        }
        ageGroupFines[ageGroup] += +d.FINES;
    });
    
    // Convert to array of objects and sort by fines in descending order
    return Object.entries(ageGroupFines)
        .map(([ageGroup, fines]) => ({
            ageGroup: ageGroup,
            fines: fines
        }))
        .sort((a, b) => b.fines - a.fines); // Sort in descending order
}

// Process raw data into detection method format
function processDetectionMethodData(rawData) {
    const detectionMethodCounts = {};
    
    // Group by detection method
    rawData.forEach(d => {
        const method = d.DETECTION_METHOD_CLEAN;
        if (!detectionMethodCounts[method]) {
            detectionMethodCounts[method] = 0;
        }
        // Use the FINES value as the count since the original method counted occurrences
        detectionMethodCounts[method] += +d.FINES;
    });
    
    // Convert to array of objects
    return Object.entries(detectionMethodCounts).map(([method, count]) => ({
        method: method,
        count: count
    }));
}