// interactions.js - Handles interactions for dashboard filters
console.log('Loading interactions.js');

// Month name to number mapping for proper sorting
const monthNameToNumber = {
    'January': 1,
    'February': 2,
    'March': 3,
    'April': 4,
    'May': 5,
    'June': 6,
    'July': 7,
    'August': 8,
    'September': 9,
    'October': 10,
    'November': 11,
    'December': 12
};

// Initialize filter elements once data is loaded
function initFilters() {
    console.log('Initializing filters');
    setTimeout(() => {
        initMonthFilter();
    }, 500); // Small delay to ensure DOM is fully loaded
}

// Initialize the month filter using Select2
function initMonthFilter() {
    console.log('Initializing month filter with Select2');
    
    if (!window.dashboardData || !window.dashboardData.monthlyTrend) {
        console.error('No data available for month filter');
        return;
    }
    
    // Get unique months and sort them correctly
    const months = [...new Set(window.dashboardData.monthlyTrend
        .map(d => d.month)
        .filter(month => month && typeof month === 'string'))];
    
    // Sort by month number
    const sortedMonths = months.sort((a, b) => monthNameToNumber[a] - monthNameToNumber[b]);
    
    console.log('Available months for filter:', sortedMonths);
    
    // Check if months array is empty
    if (sortedMonths.length === 0) {
        console.warn('No valid months found in data, using defaults');
        // Add all months as a fallback
        sortedMonths.push(
            'January', 'February', 'March', 'April', 
            'May', 'June', 'July', 'August', 
            'September', 'October', 'November', 'December'
        );
    }
    
    // Initialize Select2 on the month filter
    try {
        // Ensure jQuery and Select2 are available
        if (typeof $ === 'undefined' || typeof $.fn.select2 === 'undefined') {
            console.error('jQuery or Select2 not loaded');
            return;
        }
        
        const monthFilter = $('#month-filter');
        if (monthFilter.length === 0) {
            console.error('Month filter element not found');
            return;
        }
        
        // Clear any existing options
        monthFilter.empty();
        
        // Add months as options
        sortedMonths.forEach(month => {
            const option = new Option(month, month, false, false);
            monthFilter.append(option);
        });
        
        // Destroy any existing Select2 instance to avoid duplicates
        try {
            monthFilter.select2('destroy');
        } catch (e) {
            // Ignore errors if Select2 wasn't initialized yet
        }
        
        // Initialize Select2 with settings
        monthFilter.select2({
            placeholder: 'Select months',
            allowClear: true,
            width: '100%',
            minimumResultsForSearch: Infinity, // Hide search box
            dropdownCssClass: 'month-filter-dropdown',
            selectionCssClass: 'month-filter-selection',
            templateSelection: function(data, container) {
                // Replace multiple selections with a summary count
                if (!data.id) return data.text;
                return '';
            },
            templateResult: function(data) {
                // Normal display for dropdown items
                return data.text;
            }
        });
        
        // Add custom display for selected months
        monthFilter.on('change', function() {
            const selected = $(this).val() || [];
            const countText = selected.length === sortedMonths.length ? 
                'Filter months' : 
                selected.length + ' month(s) selected';
            
            // Update the select2 container to show selection summary
            const filterContainer = $(this).siblings('.select2-container').find('.select2-selection__rendered');
            filterContainer.text(countText);
        });
        
        // Select all months by default
        monthFilter.val(sortedMonths).trigger('change');
        
        // Add event listener for changes
        monthFilter.off('change').on('change', function() {
            applyMonthFilter();
        });
        
        // Add event listener to reset button
        $('#reset-filters').off('click').on('click', resetAllFilters);
        
        console.log('Month filter initialized successfully with', sortedMonths.length, 'options');
    } catch (error) {
        console.error('Error initializing month filter:', error);
    }
}

function applyMonthFilter() {
    const selectedMonths = $('#month-filter').val() || [];
    
    console.log('Applying month filter with selected months:', selectedMonths);
    
    // Check if raw data is available
    if (!window.rawDashboardData) {
        console.error('Raw data not available for filtering');
        return;
    }
    
    // Get all available months if none selected (show all)
    const allMonths = [...new Set(window.rawDashboardData.map(d => d["Month (Name)"]))];
    const monthsToFilter = selectedMonths.length === 0 ? allMonths : selectedMonths;
    
    // Update Monthly Trend Chart (existing code)
    const originalData = window.dashboardData.monthlyTrend;
    const processedData = originalData.map(d => ({
        ...d,
        monthNumber: monthNameToNumber[d.month]
    }));
    
    processedData.sort((a, b) => a.monthNumber - b.monthNumber);
    
    let filteredMonthlyData = [...processedData];
    if (selectedMonths.length > 0) {
        filteredMonthlyData = processedData.filter(d => selectedMonths.includes(d.month));
    }
    
    recalculatePercentageChanges(filteredMonthlyData);
    filteredMonthlyData = filteredMonthlyData.map(d => {
        const { monthNumber, ...rest } = d;
        return rest;
    });
    
    updateMonthlyTrendChart(filteredMonthlyData);
    
    // Update Location Chart
    const filteredLocationData = processLocationData(window.rawDashboardData, monthsToFilter);
    updateLocationChart(filteredLocationData);
    
    // Update Age Group Chart
    const filteredAgeGroupData = processAgeGroupData(window.rawDashboardData, monthsToFilter);
    updateAgeGroupChart(filteredAgeGroupData);
    
    // Update Detection Method Chart
    const filteredDetectionData = processDetectionMethodData(window.rawDashboardData, monthsToFilter);
    updateDetectionMethodChart(filteredDetectionData);
    
    // Update KPIs
    updateKPIs(monthsToFilter);
}

// Reset all filters
function resetAllFilters() {
    console.log('Resetting all filters');
    
    // Get all months
    const allMonths = [...new Set(window.rawDashboardData.map(d => d["Month (Name)"]))];
    const sortedMonths = allMonths.sort((a, b) => monthNameToNumber[a] - monthNameToNumber[b]);
    
    // Reset month filter to select all
    $('#month-filter').val(sortedMonths).trigger('change');
}

// Reset monthly trend chart to show all data
function resetMonthlyTrendChart() {
    console.log('Resetting monthly trend chart');
    
    // Get original data
    const originalData = window.dashboardData.monthlyTrend;
    
    // Process data for correct ordering
    const processedData = originalData.map(d => ({
        ...d,
        monthNumber: monthNameToNumber[d.month]
    }));
    
    // Sort by month number
    processedData.sort((a, b) => a.monthNumber - b.monthNumber);
    
    // Recalculate percentage changes
    recalculatePercentageChanges(processedData);
    
    // Remove monthNumber property
    const finalData = processedData.map(d => {
        const { monthNumber, ...rest } = d;
        return rest;
    });
    
    // Update chart with all data
    updateMonthlyTrendChart(finalData);
}

// Recalculate percentage changes based on filtered/sorted data
function recalculatePercentageChanges(data) {
    // First month has no previous month to compare with
    if (data.length > 0) {
        data[0].percentageChange = 0;
    }
    
    // Calculate percentage changes for remaining months
    for (let i = 1; i < data.length; i++) {
        const currentFines = data[i].totalFines;
        const previousFines = data[i-1].totalFines;
        
        if (previousFines === 0) {
            // Avoid division by zero
            data[i].percentageChange = 100; // Indicate infinite increase
        } else {
            // Calculate percentage change
            const change = ((currentFines - previousFines) / previousFines) * 100;
            data[i].percentageChange = parseFloat(change.toFixed(2));
        }
    }
}

// Update the monthly trend chart with filtered data
function updateMonthlyTrendChart(filteredData) {
    // Temporarily override the global data
    const originalData = window.dashboardData.monthlyTrend;
    window.dashboardData.monthlyTrend = filteredData;
    
    // Check if chart exists and apply transition if possible
    const chartContainer = d3.select("#monthly-trend-chart");
    const existingSvg = chartContainer.select("svg");
    
    if (!existingSvg.empty() && typeof window.updateMonthlyTrendChartWithTransition === 'function') {
        // Apply transition to existing chart
        window.updateMonthlyTrendChartWithTransition(filteredData);
    } else {
        // Re-initialize the chart with new data if transition function not available
        if (typeof initMonthlyTrendChart === 'function') {
            initMonthlyTrendChart();
        } else {
            console.error('Monthly trend chart initialization function not found');
        }
    }
    
    // Restore original data
    window.dashboardData.monthlyTrend = originalData;
}

// Update Location Chart
function updateLocationChart(filteredData) {
    // Temporarily override the global data
    const originalData = window.dashboardData.location;
    window.dashboardData.location = filteredData;
    
    // Check if chart exists and apply transition if possible
    const chartContainer = d3.select("#location-chart");
    const existingSvg = chartContainer.select("svg");
    
    if (!existingSvg.empty() && typeof window.updateLocationChartWithTransition === 'function') {
        // Apply transition to existing chart
        window.updateLocationChartWithTransition(filteredData);
    } else {
        // Re-initialize the chart with new data if transition function not available
        if (typeof initLocationChart === 'function') {
            initLocationChart();
        }
    }
    
    // Restore original data
    window.dashboardData.location = originalData;
}

// Update Age Group Chart
function updateAgeGroupChart(filteredData) {
    // Temporarily override the global data
    const originalData = window.dashboardData.ageGroup;
    window.dashboardData.ageGroup = filteredData;
    
    // Check if chart exists and apply transition if possible
    const chartContainer = d3.select("#age-groups-chart");
    const existingSvg = chartContainer.select("svg");
    
    if (!existingSvg.empty() && typeof window.updateAgeGroupChartWithTransition === 'function') {
        // Apply transition to existing chart
        window.updateAgeGroupChartWithTransition(filteredData);
    } else {
        // Re-initialize the chart with new data if transition function not available
        if (typeof initAgeGroupChart === 'function') {
            initAgeGroupChart();
        }
    }
    
    // Restore original data
    window.dashboardData.ageGroup = originalData;
}

// Update Detection Method Chart
function updateDetectionMethodChart(filteredData) {
    // Temporarily override the global data
    const originalData = window.dashboardData.detectionMethod;
    window.dashboardData.detectionMethod = filteredData;
    
    // Check if chart exists and apply transition if possible
    const chartContainer = d3.select("#detection-method-chart");
    const existingSvg = chartContainer.select("svg");
    
    if (!existingSvg.empty() && typeof window.updateDetectionMethodChartWithTransition === 'function') {
        // Apply transition to existing chart
        window.updateDetectionMethodChartWithTransition(filteredData);
    } else {
        // Re-initialize the chart with new data if transition function not available
        if (typeof initDetectionMethodChart === 'function') {
            initDetectionMethodChart();
        }
    }
    
    // Restore original data
    window.dashboardData.detectionMethod = originalData;
}

// Update KPIs based on filtered data
function updateKPIs(selectedMonths) {
    const filteredData = selectedMonths.length > 0 
        ? window.rawDashboardData.filter(d => selectedMonths.includes(d["Month (Name)"]))
        : window.rawDashboardData;
    
    // Recalculate total fines
    const totalFines = filteredData.reduce((sum, d) => sum + (+d.FINES), 0);
    document.getElementById('total-fines').querySelector('.kpi-value').textContent = 
        totalFines.toLocaleString();
    
    // Recalculate top jurisdiction
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
    }
    
    // Update top age group
    const ageGroupData = processAgeGroupData(filteredData);
    if (ageGroupData.length > 0) {
        const topAgeGroup = ageGroupData[0];
        document.getElementById('top-age-group').querySelector('.kpi-value').textContent = 
            `${topAgeGroup.ageGroup} (${topAgeGroup.fines.toLocaleString()})`;
    }
}

// Initialize filters when the page loads
$(document).ready(function() {
    console.log('Document ready, checking for dashboard data');
    
    // If data is already loaded, initialize filters immediately
    if (window.dashboardData) {
        initFilters();
    } else {
        // Otherwise, wait for data to be loaded
        const checkDataInterval = setInterval(() => {
            if (window.dashboardData) {
                clearInterval(checkDataInterval);
                initFilters();
            }
        }, 100);
    }
    
    // Initialize Select2 for all multi-select dropdowns
    $('.filters-section select[multiple]').each(function() {
        $(this).select2({
            placeholder: 'Select options',
            allowClear: true,
            width: '100%'
        });
    });
});