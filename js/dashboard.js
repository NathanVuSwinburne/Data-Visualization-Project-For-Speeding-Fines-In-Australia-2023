// Check if D3 is loaded
if (typeof d3 === 'undefined') {
    console.error('D3.js is not loaded!');
    document.body.innerHTML = '<div style="color:red;padding:20px;font-family:Arial">Error: D3.js library failed to load. Please check your internet connection and refresh the page.</div>';
    throw new Error('D3.js is not loaded');
}

// Store filter state
const filterState = {
    month: [],
    jurisdiction: [],
    ageGroup: []
};

// Function to initialize Select2 dropdowns
function initializeSelect2(selector, placeholder) {
    return $(selector).select2({
        placeholder: placeholder,
        allowClear: true,
        width: 'style',
        closeOnSelect: false
    });
}

// Function to populate dropdowns
function populateDropdown(selectId, data, placeholder) {
    const $select = $(selectId);
    const filterType = selectId.replace('-filter', '').replace('#', '');
    
    // Clear existing options
    $select.empty();
    
    // Add placeholder option
    $select.append(new Option('', '', false, false));
    
    
    // Add data options
    data.forEach(item => {
        $select.append(new Option(item, item, false, false));
    });
    
    // Initialize or re-initialize Select2
    if ($select.hasClass('select2-hidden-accessible')) {
        $select.select2('destroy');
    }
    
    const $select2 = initializeSelect2(selectId, placeholder);
    
    // Set initial selection to "All"
    $select.val('all').trigger('change');
    filterState[filterType] = data; // Set all items as selected
    
    return $select2;
}

// Function to apply all filters
function applyFilters() {
    // Update filter state from Select2
    const monthSelect = $('#month-filter');
    const jurisdictionSelect = $('#jurisdiction-filter');
    const ageGroupSelect = $('#age-group-filter');
    
    // Check for "All" selection
    filterState.month = monthSelect.val()?.includes('all') ? 
        [...new Set(window.dashboardData.monthlyTrend.map(item => item.month))] : 
        (monthSelect.val() || []);
        
    filterState.jurisdiction = jurisdictionSelect.val()?.includes('all') ?
        [...new Set(window.dashboardData.jurisdiction.map(item => item.jurisdiction))] :
        (jurisdictionSelect.val() || []);
        
    filterState.ageGroup = ageGroupSelect.val()?.includes('all') ?
        [...new Set(window.dashboardData.ageGroup.map(item => item.ageGroup))] :
        (ageGroupSelect.val() || []);
    
    console.log('Applying filters:', filterState);
    
    // Here you would typically filter your data and update the charts
    // Example: filterDataAndUpdateCharts();
}

// Dashboard initialization
window.initDashboard = function() {
    console.log('Dashboard initialized');
    
    // Check and prepare containers
    prepareContainers();
    
    // Initialize all charts if data is available
    if (!window.dashboardInitialized && window.dashboardData) {
        // Populate dropdowns
        if (window.dashboardData.monthlyTrend) {
            const months = [...new Set(window.dashboardData.monthlyTrend.map(item => item.month))];
            populateDropdown('#month-filter', months, 'Select months');
        }
        
        if (window.dashboardData.jurisdiction) {
            const jurisdictions = [...new Set(window.dashboardData.jurisdiction.map(item => item.jurisdiction))];
            populateDropdown('#jurisdiction-filter', jurisdictions, 'Select jurisdictions');
        }
        
        if (window.dashboardData.ageGroup) {
            const ageGroups = [...new Set(window.dashboardData.ageGroup.map(item => item.ageGroup))];
            populateDropdown('#age-group-filter', ageGroups, 'Select age groups');
        }
        
        // Add change event listeners
        $('.select2-container').on('change', applyFilters);
        
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
        
        // Initialize detection method chart
        if (typeof initDetectionMethodChart === 'function' && window.dashboardData.detectionMethod) {
            console.log('Calling initDetectionMethodChart from dashboard');
            setTimeout(initDetectionMethodChart, 400);
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
        container.style.minHeight = '200px';
        
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
    // Reset filters button
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Clear all selections
            $('.select2').val(null).trigger('change');
            
            // Update filter state
            filterState.month = [];
            filterState.jurisdiction = [];
            filterState.ageGroup = [];
            
            console.log('Filters reset');
            applyFilters();
        });
    }

    // Floating filter panel scroll behavior
    const filterPanel = document.querySelector('.filters-section');
    if (filterPanel) {
        const scrollThreshold = -5; // Pixels to scroll before panel slides in
        const panelOnscreenTop = '45px'; // How far from the top edge when visible
        const panelOffscreenTop = '-400px'; // Initial off-screen position (should match CSS)

        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollThreshold) {
                filterPanel.style.top = panelOnscreenTop;
            } else {
                filterPanel.style.top = panelOffscreenTop;
            }
        });

        // Trigger scroll event once on load to set initial position based on current scroll
        // This ensures it's correctly positioned if page loads scrolled or threshold is 0 or negative
        window.dispatchEvent(new Event('scroll'));
    }
});