// Road Safety Dashboard - Team 8

// Initialize tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("z-index", "100")
    .style("max-width", "200px")
    .style("white-space", "normal");

// Make tooltip available globally
window.tooltip = tooltip;

// Global data storage
let dashboardData = {
    monthlyTrend: [],
    jurisdictions: [],
    detectionMethods: [],
    ageGroups: [],
    locations: []
};

// Make data accessible globally
window.dashboardData = dashboardData;

// Global filter state
let filterState = {
    month: 'all',
    jurisdiction: 'all',
    ageGroup: 'all'
};

// Load data and initialize dashboard
async function initDashboard() {
    try {
        // Show loading state
        showLoadingState();
        
        // Log browser path for debugging
        console.log("Current URL:", window.location.href);
        console.log("Attempting to load data files from:", new URL('./data/', window.location.href).href);
        
        // Load all datasets using the DataLoader
        console.log("Starting data loading process...");
        dashboardData = await window.DataLoader.loadAllData();
        window.dashboardData = dashboardData; // Update global reference
        console.log("Data loading complete:", dashboardData);
        
        // Initialize charts
        updateKPIs();
        updateFilters();
        createMonthlyTrendChart();
        createJurisdictionChart();
        createDetectionMethodChart();
        createAgeGroupsChart();
        createLocationChart();
        
        // Hide loading state
        hideLoadingState();
        
        // Set up event listeners for filters
        document.getElementById('month-filter').addEventListener('change', function() {
            filterState.month = this.value;
            applyFilters();
        });
        
        document.getElementById('jurisdiction-filter').addEventListener('change', function() {
            filterState.jurisdiction = this.value;
            applyFilters();
        });
        
        document.getElementById('age-group-filter').addEventListener('change', function() {
            filterState.ageGroup = this.value;
            applyFilters();
        });
        
        document.getElementById('reset-filters').addEventListener('click', resetFilters);
        
    } catch (error) {
        console.error("Critical error initializing dashboard:", error);
        showErrorState("Failed to load dashboard data. Please try refreshing the page and check console for details.");
    }
}

// Show loading state
function showLoadingState() {
    document.querySelectorAll('.kpi-value').forEach(el => {
        el.textContent = 'Loading...';
    });
    
    document.querySelectorAll('.chart').forEach(chart => {
        chart.innerHTML = '<div class="loading-indicator">Loading chart data...</div>';
    });
}

// Hide loading state
function hideLoadingState() {
    document.querySelectorAll('.loading-indicator').forEach(indicator => {
        indicator.remove();
    });
}

// Show error state
function showErrorState(message) {
    document.querySelectorAll('.kpi-value').forEach(el => {
        el.textContent = 'Error';
        el.classList.add('error');
    });
    
    document.querySelectorAll('.chart').forEach(chart => {
        chart.innerHTML = `<div class="error-message">${message}</div>`;
    });
}

// Update KPI cards with relevant data
function updateKPIs() {
    // Calculate total fines
    const totalFines = dashboardData.monthlyTrend.reduce((acc, curr) => acc + curr.fines, 0);
    
    // Find peak month
    const peakMonth = dashboardData.monthlyTrend.reduce((max, curr) => 
        curr.fines > max.fines ? curr : max, { fines: 0 }).month;
    
    // Find top jurisdiction
    const topJurisdiction = dashboardData.jurisdictions.reduce((max, curr) => 
        curr.fines > max.fines ? curr : max, { fines: 0 }).jurisdiction;
    
    // Find top age group
    const topAgeGroup = dashboardData.ageGroups.reduce((max, curr) => 
        curr.fines > max.fines ? curr : max, { fines: 0 }).ageGroup;
    
    // Update KPI cards
    document.querySelector('#total-fines .kpi-value').textContent = totalFines.toLocaleString();
    document.querySelector('#highest-month .kpi-value').textContent = peakMonth;
    document.querySelector('#highest-jurisdiction .kpi-value').textContent = topJurisdiction;
    document.querySelector('#top-age-group .kpi-value').textContent = topAgeGroup;
}

// Populate filter dropdowns
function updateFilters() {
    // Month filter
    const monthFilter = document.getElementById('month-filter');
    // Clear existing options except the first one
    while (monthFilter.options.length > 1) {
        monthFilter.remove(1);
    }
    
    // Add new options
    dashboardData.monthlyTrend.forEach(item => {
        const option = document.createElement('option');
        option.value = item.month;
        option.textContent = item.month;
        monthFilter.appendChild(option);
    });
    
    // Jurisdiction filter
    const jurisdictionFilter = document.getElementById('jurisdiction-filter');
    // Clear existing options except the first one
    while (jurisdictionFilter.options.length > 1) {
        jurisdictionFilter.remove(1);
    }
    
    // Add new options
    dashboardData.jurisdictions.forEach(item => {
        const option = document.createElement('option');
        option.value = item.jurisdiction;
        option.textContent = item.jurisdiction;
        jurisdictionFilter.appendChild(option);
    });
    
    // Age group filter
    const ageGroupFilter = document.getElementById('age-group-filter');
    // Clear existing options except the first one
    while (ageGroupFilter.options.length > 1) {
        ageGroupFilter.remove(1);
    }
    
    // Add new options
    dashboardData.ageGroups.forEach(item => {
        const option = document.createElement('option');
        option.value = item.ageGroup;
        option.textContent = item.ageGroup;
        ageGroupFilter.appendChild(option);
    });
}

// Apply current filters to all visualizations
function applyFilters() {
    // Get filtered data based on current filter state
    const filteredData = getFilteredData();
    
    // Update charts with filtered data
    createMonthlyTrendChart(filteredData.monthlyTrend);
    createJurisdictionChart(filteredData.jurisdictions);
    createDetectionMethodChart(filteredData.detectionMethods);
    createAgeGroupsChart(filteredData.ageGroups);
    createLocationChart(filteredData.locations);
    
    console.log("Filters applied:", filterState);
}

// Get data filtered by current filter state
function getFilteredData() {
    // Start with a copy of the original data
    let filteredData = {
        monthlyTrend: [...dashboardData.monthlyTrend],
        jurisdictions: [...dashboardData.jurisdictions],
        detectionMethods: [...dashboardData.detectionMethods],
        ageGroups: [...dashboardData.ageGroups],
        locations: [...dashboardData.locations]
    };
    
    // This is a simplified example of filtering - in a real application,
    // you would need cross-filtering logic based on your data relationships
    
    // Month filter
    if (filterState.month !== 'all') {
        // In a real application, you would filter other datasets based on month
        // For this example, we're just keeping the selected month in the monthly trend
        filteredData.monthlyTrend = filteredData.monthlyTrend.filter(
            item => item.month === filterState.month
        );
    }
    
    // Jurisdiction filter
    if (filterState.jurisdiction !== 'all') {
        // Filter jurisdictions
        filteredData.jurisdictions = filteredData.jurisdictions.filter(
            item => item.jurisdiction === filterState.jurisdiction
        );
    }
    
    // Age group filter
    if (filterState.ageGroup !== 'all') {
        // Filter age groups
        filteredData.ageGroups = filteredData.ageGroups.filter(
            item => item.ageGroup === filterState.ageGroup
        );
    }
    
    return filteredData;
}

// Reset all filters to default
function resetFilters() {
    filterState = {
        month: 'all',
        jurisdiction: 'all',
        ageGroup: 'all'
    };
    
    document.getElementById('month-filter').value = 'all';
    document.getElementById('jurisdiction-filter').value = 'all';
    document.getElementById('age-group-filter').value = 'all';
    
    applyFilters();
}

// Add window resize listener for responsive charts
window.addEventListener('resize', function() {
    // Debounce to prevent too many redraws
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(function() {
        createMonthlyTrendChart();
        createJurisdictionChart();
        createDetectionMethodChart();
        createAgeGroupsChart();
        createLocationChart();
    }, 250);
});

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard); 