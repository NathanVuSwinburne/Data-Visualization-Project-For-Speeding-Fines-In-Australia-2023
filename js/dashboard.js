// Check if D3 is loaded
if (typeof d3 === 'undefined') {
    console.error('D3.js is not loaded!');
    document.body.innerHTML = '<div style="color:red;padding:20px;font-family:Arial">Error: D3.js library failed to load. Please check your internet connection and refresh the page.</div>';
    throw new Error('D3.js is not loaded');
}

// Dashboard initialization
window.initDashboard = function() {
    console.log('Dashboard initialized');
    
    // Check and prepare containers
    prepareContainers();
    
    // Initialize all charts if data is available
    if (!window.dashboardInitialized && window.dashboardData) {
        // Initialize monthly trend chart
        if (typeof initMonthlyTrendChart === 'function' && window.dashboardData.monthlyTrend) {
            console.log('Calling initMonthlyTrendChart from dashboard');
            setTimeout(initMonthlyTrendChart, 0);
        }
        
        // Initialize location chart
        if (typeof initLocationChart === 'function' && window.dashboardData.location) {
            console.log('Calling initLocationChart from dashboard');
            setTimeout(initLocationChart, 100);
        }
        
        // Initialize jurisdiction chart
        if (typeof initJurisdictionChart === 'function' && window.dashboardData.jurisdiction) {
            console.log('Calling initJurisdictionChart from dashboard');
            setTimeout(initJurisdictionChart, 200);
        }
        
        // Initialize age group chart
        if (typeof initAgeGroupChart === 'function' && window.dashboardData.ageGroup) {
            console.log('Calling initAgeGroupChart from dashboard');
            setTimeout(initAgeGroupChart, 300);
        }
        
        window.dashboardInitialized = true;
    }
};

// Prepare containers function
function prepareContainers() {
    // Ensure chart containers have proper dimensions
    const chartContainers = document.querySelectorAll('.chart');
    chartContainers.forEach(container => {
        // Set minimum height to ensure visibility
        container.style.minHeight = '300px';
        
        // Debug info
        const style = window.getComputedStyle(container);
        console.log(`Container #${container.id} dimensions:`, {
            width: container.offsetWidth,
            height: container.offsetHeight,
            display: style.display,
            visibility: style.visibility
        });
    });
}

// Add any dashboard-wide event listeners or functionality here
document.addEventListener('DOMContentLoaded', function() {
    // Initialize any dashboard-wide functionality
    
    // Example: Reset filters button
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Reset all filter dropdowns to 'all'
            const selects = document.querySelectorAll('select');
            selects.forEach(select => {
                select.value = 'all';
            });
            
            // Here you would typically trigger a chart update
            // For now, we'll just log the reset
            console.log('Filters reset');
        });
    }
});