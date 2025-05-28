console.log('Starting to load data...');

// Load data for the dashboard
Promise.all([
    d3.csv("data/fines_over_months.csv", d => {
        return {
            month: d.Month,
            totalFines: +d["Total Fines"],
            // Set January's percentageChange to 0 instead of null
            percentageChange: d["Month-over-Month Percentage Change"] ? 
                parseFloat(d["Month-over-Month Percentage Change"]) : 0
        };
    }),
    d3.csv("data/fines_jurisdiction.csv", d => ({
        jurisdiction: d.JURISDICTION,
        fines: +d["Total Speeding Fines by Jurisdiction (2023)"]
    })),
    d3.csv("data/fines_location.csv", d => {
        console.log("Loading location data row:", d);
        return {
            location: d.LOCATION_TYPE,
            fines: +d.TOTAL_FINES
        };
    }),
    d3.csv("data/fines_age_groups.csv", d => {
        console.log("Loading age group data row:", d);
        return {
            ageGroup: d.AGE_GROUP,
            fines: +d["Sum(FINES)"]
        };
    }),
    d3.csv("data/fines_detection_method.csv", d => {
        console.log("Loading detection method data row:", d);
        return {
            method: d.DETECTION_METHOD_CLEAN,
            count: +d.DETECTION_METHOD_count
        };
    })
]).then(([monthlyData, jurisdictionData, locationData, ageGroupData, detectionMethodData]) => {
    // Store the data in a global variable
    console.log("Location data loaded:", locationData);
    console.log("Age group data loaded:", ageGroupData);
    console.log("Detection method data loaded:", detectionMethodData);
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