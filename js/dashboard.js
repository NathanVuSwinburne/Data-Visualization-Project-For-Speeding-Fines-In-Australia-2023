// Check if D3 is loaded
if (typeof d3 === 'undefined') {
    console.error('D3.js is not loaded!');
    document.body.innerHTML = '<div style="color:red;padding:20px;font-family:Arial">Error: D3.js library failed to load. Please check your internet connection and refresh the page.</div>';
    throw new Error('D3.js is not loaded');
}

// Store filter state with validation methods
const filterState = {
    month: [],
    jurisdiction: [],
    ageGroup: [],
    
    // Validate if any filter is empty
    isValid: function() {
        return this.month.length > 0 && 
               this.jurisdiction.length > 0 && 
               this.ageGroup.length > 0;
    },
    
    // Get default values from raw data
    getDefaults: function() {
        return {
            month: [...new Set(window.rawDashboardData?.map(d => d["Month (Name)"]) || [])],
            jurisdiction: [...new Set(window.rawDashboardData?.map(d => d.JURISDICTION) || [])],
            ageGroup: [...new Set(window.rawDashboardData?.map(d => d.AGE_GROUP) || [])]
                .filter(ag => ag !== "Unknown" && ag !== "0-16")
        };
    },
    
    // Reset to default values
    reset: function() {
        const defaults = this.getDefaults();
        this.month = defaults.month;
        this.jurisdiction = defaults.jurisdiction;
        this.ageGroup = defaults.ageGroup;
    }
};

// Initialize Select2 with consistent styling
function initializeSelect2(selectId, placeholder) {
    const $select = $(selectId);
    
    // Destroy existing instance if any
    if ($select.hasClass('select2-hidden-accessible')) {
        $select.select2('destroy');
    }
    
    // Initialize with consistent options
    return $select.select2({
        placeholder: placeholder,
        allowClear: false,
        multiple: true,
        width: '100%',
        closeOnSelect: false,
        tags: false,
        maximumSelectionLength: 0, // No limit
        // Force consistent rendering
        templateResult: function(data) {
            return data.text;
        },
        templateSelection: function(data) {
            return data.text;
        }
    });
}

// Function to populate dropdowns
function populateDropdown(selectId, data, placeholder) {
    const $select = $(selectId);
    const filterType = selectId.replace('-filter', '').replace('#', '');
    
    // Clear existing options
    $select.empty();
    
    // Add data options (no placeholder option needed for multiple select)
    data.forEach(item => {
        $select.append(new Option(item, item, false, false));
    });
    
    // Initialize or re-initialize Select2
    if ($select.hasClass('select2-hidden-accessible')) {
        $select.select2('destroy');
    }
    
    const $select2 = initializeSelect2(selectId, placeholder);
    
    // Select all items initially
    $select.val(data).trigger('change');
    filterState[filterType] = data; // Set all items as selected
    
    return $select2;
}

// Function to apply all filters
function applyFilters() {
    // Check if raw data is available
    if (!window.rawDashboardData) {
        console.error('Raw data not available for filtering');
        return;
    }
    
    // Update filter state from Select2
    const monthSelect = $('#month-filter');
    const jurisdictionSelect = $('#jurisdiction-filter');
    const ageGroupSelect = $('#age-group-filter');
    
    // Get all available values if none selected
    const allMonths = [...new Set(window.rawDashboardData.map(d => d["Month (Name)"]))];
    const allJurisdictions = [...new Set(window.rawDashboardData.map(d => d.JURISDICTION))];
    const allAgeGroups = [...new Set(window.rawDashboardData.map(d => d.AGE_GROUP))]
        .filter(ag => ag !== "Unknown" && ag !== "0-16");
    
    // Get selected values or use all if none selected
    filterState.month = monthSelect.val()?.length > 0 ? monthSelect.val() : allMonths;
    filterState.jurisdiction = jurisdictionSelect.val()?.length > 0 ? jurisdictionSelect.val() : allJurisdictions;
    filterState.ageGroup = ageGroupSelect.val()?.length > 0 ? ageGroupSelect.val() : allAgeGroups;
    
    console.log('Applying filters:', filterState);
    
    // Apply combined filters to raw data
    const filteredRawData = window.rawDashboardData.filter(d => {
        const monthMatch = filterState.month.includes(d["Month (Name)"]);
        const jurisdictionMatch = filterState.jurisdiction.includes(d.JURISDICTION);
        const ageGroupMatch = filterState.ageGroup.includes(d.AGE_GROUP) || 
                            d.AGE_GROUP === "Unknown" || 
                            d.AGE_GROUP === "0-16"; // Include these for other charts
        
        return monthMatch && jurisdictionMatch && ageGroupMatch;
    });
    
    // Update all charts with filtered data
    updateAllCharts(filteredRawData);
    
    // Update KPIs with filtered data
    updateKPIs(filteredRawData);
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
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    const availableMonths = months.filter(month => 
        window.dashboardData.monthlyTrend.some(item => item.month === month)
    );
    populateDropdown('#month-filter', availableMonths, 'Select months');
}
        
        if (window.dashboardData.jurisdiction) {
            const jurisdictions = [...new Set(window.dashboardData.jurisdiction.map(item => item.jurisdiction))];
            populateDropdown('#jurisdiction-filter', jurisdictions, 'Select jurisdictions');
        }
        
        if (window.dashboardData.ageGroup) {
            const ageGroups = [...new Set(window.dashboardData.ageGroup.map(item => item.ageGroup))];
            populateDropdown('#age-group-filter', ageGroups, 'Select age groups');
        }
        
        // Add change event listeners - use single listener to avoid conflicts
        $('#month-filter, #jurisdiction-filter, #age-group-filter').on('change', function() {
            console.log('Filter changed:', this.id);
            
            // Get current selections
            const currentSelections = $(this).val() || [];
            const filterType = this.id.replace('-filter', '');
            
            // Prevent removing last element
            if (currentSelections.length === 0) {
                alert('You cannot remove the last element');
                // Revert to previous valid selection
                $(this).val(filterState[filterType]).trigger('change');
                return;
            }
            
            // Only apply filters if selection is valid
            applyFilters();
        });
        
        // Add reset filters button functionality
        $('#reset-filters').on('click', function() {
            console.log('Resetting all filters');
            
            // Get all available values
            const allMonths = [...new Set(window.rawDashboardData.map(d => d["Month (Name)"]))];
            const allJurisdictions = [...new Set(window.rawDashboardData.map(d => d.JURISDICTION))];
            const allAgeGroups = [...new Set(window.rawDashboardData.map(d => d.AGE_GROUP))]
                .filter(ag => ag !== "Unknown" && ag !== "0-16");
            
            // Reset month filter
            $('#month-filter').val(allMonths).trigger('change');
            
            // Reset jurisdiction filter
            $('#jurisdiction-filter').val(allJurisdictions).trigger('change');
            
            // Reset age group filter
            $('#age-group-filter').val(allAgeGroups).trigger('change');
            
            // Update filter state
            filterState.month = allMonths;
            filterState.jurisdiction = allJurisdictions;
            filterState.ageGroup = allAgeGroups;
            
            // Apply filters to update charts
            applyFilters();
        });
        
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
        container.style.minHeight = '350px';
        
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
            // Get all available options
            const allMonths = [...new Set(window.dashboardData.monthlyTrend.map(item => item.month))];
            const allJurisdictions = [...new Set(window.dashboardData.jurisdiction.map(item => item.jurisdiction))];
            const allAgeGroups = [...new Set(window.dashboardData.ageGroup.map(item => item.ageGroup))];
            
            // Select all options
            $('#month-filter').val(allMonths).trigger('change');
            $('#jurisdiction-filter').val(allJurisdictions).trigger('change');
            $('#age-group-filter').val(allAgeGroups).trigger('change');
            
            console.log('Filters reset to show all data');
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


// Add to your dashboard.js or create a new file
document.addEventListener('DOMContentLoaded', function() {
    // Mobile filter toggle
    if (window.innerWidth <= 767) {
        const filterSection = document.querySelector('.filters-section');
        
        // Create toggle button
        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'filter-toggle';
        toggleBtn.innerHTML = '☰ Filters';
        toggleBtn.style.cssText = `
            position: fixed;
            left: 10px;
            top: 50px;
            background: #16b5bd;
            color: white;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 1025;
            font-size: 14px;
        `;
        document.body.appendChild(toggleBtn);
        
        // Toggle filter visibility
        toggleBtn.addEventListener('click', function() {
            filterSection.classList.toggle('active');
            toggleBtn.style.display = 'none';
        });
        
        // Close on clicking outside
        document.addEventListener('click', function(e) {
            if (filterSection.classList.contains('active') && 
                !filterSection.contains(e.target) && 
                e.target !== toggleBtn) {
                filterSection.classList.remove('active');
                toggleBtn.style.display = 'block';
            }
        });
        
        // Close button in filter header
        const closeBtn = filterSection.querySelector('h3');
        closeBtn.addEventListener('click', function(e) {
            if (e.offsetX > closeBtn.offsetWidth - 30) {
                filterSection.classList.remove('active');
                toggleBtn.style.display = 'block';
            }
        });
    }
});

// Function to update all charts with filtered data
function updateAllCharts(filteredRawData) {
    // Process filtered data for each chart
    const monthlyData = processMonthlyData(filteredRawData);
    const jurisdictionData = processJurisdictionData(filteredRawData);
    const locationData = processLocationData(filteredRawData);
    const ageGroupData = processAgeGroupData(filteredRawData);
    const detectionMethodData = processDetectionMethodData(filteredRawData);
    
    // Update global data
    window.dashboardData.monthlyTrend = monthlyData;
    window.dashboardData.jurisdiction = jurisdictionData;
    window.dashboardData.location = locationData;
    window.dashboardData.ageGroup = ageGroupData;
    window.dashboardData.detectionMethod = detectionMethodData;
    
    // Update Monthly Trend Chart with transition if available
    if (typeof updateMonthlyTrendChartWithTransition === 'function') {
        console.log('Updating monthly trend chart with transition');
        const container = d3.select("#monthly-trend-chart");
        const svg = container.select("svg").select("g");
        
        if (!svg.empty()) {
            updateMonthlyTrendChartWithTransition(monthlyData);
        } else {
            console.log('Monthly trend chart SVG not found, initializing');
            initMonthlyTrendChart();
        }
    } else if (typeof initMonthlyTrendChart === 'function') {
        initMonthlyTrendChart();
    }
    
    // Update Jurisdiction Chart with transition if available
    if (typeof updateJurisdictionChartWithTransition === 'function') {
        console.log('Updating jurisdiction chart with transition');
        const container = d3.select("#jurisdiction-chart");
        const svg = container.select("svg");
        
        if (!svg.empty()) {
            updateJurisdictionChartWithTransition(jurisdictionData);
        } else {
            console.log('Jurisdiction chart SVG not found, initializing');
            initJurisdictionChart();
        }
    } else if (typeof initJurisdictionChart === 'function') {
        initJurisdictionChart();
    }
    
    // Update Location Chart with transition if available
    if (typeof updateLocationChartWithTransition === 'function') {
        console.log('Updating location chart with transition');
        const container = d3.select("#location-chart");
        const svg = container.select("svg").select("g");
        
        if (!svg.empty()) {
            updateLocationChartWithTransition(locationData);
        } else {
            console.log('Location chart SVG not found, initializing');
            initLocationChart();
        }
    } else if (typeof initLocationChart === 'function') {
        initLocationChart();
    }
    
    // Update Age Group Chart with transition if available
    if (typeof updateAgeGroupChartWithTransition === 'function') {
        console.log('Updating age group chart with transition');
        const container = d3.select("#age-groups-chart");
        const svg = container.select("svg"); // Remove .select("g") since the SVG doesn't have a nested group
        
        if (!svg.empty()) {
            updateAgeGroupChartWithTransition(ageGroupData);
        } else {
            console.log('Age group chart SVG not found, initializing');
            initAgeGroupChart();
        }
    } else if (typeof initAgeGroupChart === 'function') {
        initAgeGroupChart();
    }
    
    // Update Detection Method Chart with transition if available
    if (typeof updateDetectionMethodChartWithTransition === 'function') {
        console.log('Updating detection method chart with transition');
        const container = d3.select("#detection-method-chart");
        const svg = container.select("svg").select("g");
        
        if (!svg.empty()) {
            updateDetectionMethodChartWithTransition(detectionMethodData);
        } else {
            console.log('Detection method chart SVG not found, initializing');
            initDetectionMethodChart();
        }
    } else if (typeof initDetectionMethodChart === 'function') {
        initDetectionMethodChart();
    }
}

// Update KPIs based on filtered data
function updateKPIs(filteredData) {
    // Calculate total fines
    const totalFines = filteredData.reduce((sum, d) => sum + (+d.FINES), 0);
    document.getElementById('total-fines').querySelector('.kpi-value').textContent = 
        totalFines.toLocaleString();
    
    // Calculate highest month (excluding QLD for monthly data)
    const monthlyFines = {};
    filteredData.forEach(d => {
        if (d.JURISDICTION === "QLD") return; // Skip QLD for monthly
        const month = d["Month (Name)"];
        if (!monthlyFines[month]) {
            monthlyFines[month] = 0;
        }
        monthlyFines[month] += +d.FINES;
    });
    
    let peakMonth = { month: 'N/A', totalFines: 0 };
    Object.entries(monthlyFines).forEach(([month, fines]) => {
        if (fines > peakMonth.totalFines) {
            peakMonth = { month, totalFines: fines };
        }
    });
    
    document.getElementById('highest-month').querySelector('.kpi-value').textContent = 
        peakMonth.totalFines > 0 ? `${peakMonth.month} (${peakMonth.totalFines.toLocaleString()})` : 'N/A';
    
    // Calculate top jurisdiction
    const jurisdictionFines = {};
    filteredData.forEach(d => {
        const jurisdiction = d.JURISDICTION;
        if (!jurisdictionFines[jurisdiction]) {
            jurisdictionFines[jurisdiction] = 0;
        }
        jurisdictionFines[jurisdiction] += +d.FINES;
    });
    
    const sortedJurisdictions = Object.entries(jurisdictionFines)
        .map(([jurisdiction, fines]) => ({ jurisdiction, fines }))
        .sort((a, b) => b.fines - a.fines);
    
    if (sortedJurisdictions.length > 0) {
        const topJurisdiction = sortedJurisdictions[0];
        document.getElementById('highest-jurisdiction').querySelector('.kpi-value').textContent = 
            `${topJurisdiction.jurisdiction} (${topJurisdiction.fines.toLocaleString()})`;
    } else {
        document.getElementById('highest-jurisdiction').querySelector('.kpi-value').textContent = 'N/A';
    }
    
    // Calculate top age group
    const ageGroupFines = {};
    filteredData.forEach(d => {
        const ageGroup = d.AGE_GROUP;
        if (ageGroup === "Unknown" || ageGroup === "0-16") return;
        
        if (!ageGroupFines[ageGroup]) {
            ageGroupFines[ageGroup] = 0;
        }
        ageGroupFines[ageGroup] += +d.FINES;
    });
    
    const sortedAgeGroups = Object.entries(ageGroupFines)
        .map(([ageGroup, fines]) => ({ ageGroup, fines }))
        .sort((a, b) => b.fines - a.fines);
    
    if (sortedAgeGroups.length > 0) {
        const topAgeGroup = sortedAgeGroups[0];
        document.getElementById('top-age-group').querySelector('.kpi-value').textContent = 
            `${topAgeGroup.ageGroup} (${topAgeGroup.fines.toLocaleString()})`;
    } else {
        document.getElementById('top-age-group').querySelector('.kpi-value').textContent = 'N/A';
    }
}