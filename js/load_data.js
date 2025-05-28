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
    }))
]).then(([monthlyData, jurisdictionData]) => {
    // Store the data in a global variable
    window.dashboardData = {
        monthlyTrend: monthlyData,
        jurisdiction: jurisdictionData
    };
    
    // Sort jurisdiction data by fines (descending)
    const sortedJurisdictionData = [...jurisdictionData].sort((a, b) => b.fines - a.fines);
    
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