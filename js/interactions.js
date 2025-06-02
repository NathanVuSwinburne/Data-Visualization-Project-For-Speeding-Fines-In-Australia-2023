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
            width: '100%'
        });
        
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

// Apply month filter based on selected values
function applyMonthFilter() {
    const selectedMonths = $('#month-filter').val() || [];
    
    console.log('Applying month filter with selected months:', selectedMonths);
    
    // Get original data
    const originalData = window.dashboardData.monthlyTrend;
    
    // Process data: add monthNumber for sorting
    const processedData = originalData.map(d => ({
        ...d,
        monthNumber: monthNameToNumber[d.month]
    }));
    
    // Sort by month number
    processedData.sort((a, b) => a.monthNumber - b.monthNumber);
    
    let filteredData = [...processedData];
    
    // Apply filtering if any months are selected
    if (selectedMonths.length > 0) {
        filteredData = processedData.filter(d => selectedMonths.includes(d.month));
    }
    
    // Recalculate percentage changes
    recalculatePercentageChanges(filteredData);
    
    // Remove monthNumber property - we don't need it anymore
    filteredData = filteredData.map(d => {
        const { monthNumber, ...rest } = d;
        return rest;
    });
    
    // Update the chart with filtered data
    updateMonthlyTrendChart(filteredData);
}

// Reset all filters
function resetAllFilters() {
    console.log('Resetting all filters');
    
    // Reset month filter
    $('#month-filter').val(null).trigger('change');
    
    // Reset monthly trend chart
    resetMonthlyTrendChart();
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
    
    // Re-initialize the chart with new data
    if (typeof initMonthlyTrendChart === 'function') {
        initMonthlyTrendChart();
    } else {
        console.error('Monthly trend chart initialization function not found');
    }
    
    // Restore original data
    window.dashboardData.monthlyTrend = originalData;
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