// interactions.js - Handle UI interactions only

// Toggle filter panel visibility on mobile
document.addEventListener('DOMContentLoaded', function() {
    // Mobile filter toggle functionality
    if (window.innerWidth <= 767) {
        const filterSection = document.querySelector('.filters-section');
        
        // Create toggle button for mobile
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
    }
    
    // Smooth scroll behavior for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add hover effects to charts
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(chart => {
        chart.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        chart.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
    });
});

// Export any needed functions
window.interactionsInitialized = true;