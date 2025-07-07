document.addEventListener('DOMContentLoaded', function() {
    // Load event data from JSON file
    loadEventData();
    
    // Initialize countdown timer
    initCountdown();
    
    // Generate QR code
    generateQRCode();
    
    // Initialize dark mode toggle
    initDarkModeToggle();
});

/**
 * Load event data from external JSON file
 */
function loadEventData() {
    fetch('event.json')
        .then(response => response.json())
        .then(data => {
            // Update DOM elements with event data
            document.getElementById('eventTitle').textContent = data.title || 'Majlis Pelancaran Buku 2025';
            document.getElementById('eventDate').textContent = data.date || '7 Julai 2025';
            document.getElementById('eventLocation').textContent = data.location || 'Auditorium Utama';
            document.getElementById('eventHashtag').textContent = data.hashtag || '#PNSEvent2025';
            
            // Update countdown target date if provided
            if (data.targetDate) {
                initCountdown(new Date(data.targetDate));
            }
            
            // Update document title
            document.title = data.title ? `${data.title} - Perpustakaan Negeri Sabah` : 'Perpustakaan Negeri Sabah - Event Backdrop';
        })
        .catch(error => {
            console.warn('Could not load event data:', error);
            // Continue with default values if JSON file is not available
        });
}

/**
 * Initialize countdown timer
 * @param {Date} targetDate - The target date to count down to
 */
function initCountdown(targetDate) {
    // Default to a date in the future if not provided
    const countdownTarget = targetDate || new Date('2025-07-07T09:00:00');
    
    // Update the countdown every second
    function updateCountdown() {
        const now = new Date();
        const difference = countdownTarget - now;
        
        // If the target date is in the past, display zeros
        if (difference < 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Update the DOM
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    // Initial update
    updateCountdown();
    
    // Update every second
    setInterval(updateCountdown, 1000);
}

/**
 * Generate a QR code for the event
 */
function generateQRCode() {
    // Simple placeholder for QR code
    // In a real implementation, you would use a library like qrcode.js
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    
    // Create a placeholder QR code (simple grid pattern)
    const qrSize = 100;
    const qrCanvas = document.createElement('canvas');
    qrCanvas.width = qrSize;
    qrCanvas.height = qrSize;
    qrCanvas.style.width = '100%';
    qrCanvas.style.height = '100%';
    
    const ctx = qrCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, qrSize, qrSize);
    ctx.fillStyle = 'black';
    
    // Draw a simple pattern (this is just a placeholder)
    const cellSize = 10;
    for (let y = 0; y < qrSize; y += cellSize) {
        for (let x = 0; x < qrSize; x += cellSize) {
            // Random pattern for demonstration
            if (Math.random() > 0.7) {
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }
    
    // Add position markers (corners)
    ctx.fillRect(0, 0, cellSize * 3, cellSize * 3);
    ctx.fillRect(qrSize - cellSize * 3, 0, cellSize * 3, cellSize * 3);
    ctx.fillRect(0, qrSize - cellSize * 3, cellSize * 3, cellSize * 3);
    
    // Add white squares inside position markers
    ctx.fillStyle = 'white';
    ctx.fillRect(cellSize, cellSize, cellSize, cellSize);
    ctx.fillRect(qrSize - cellSize * 2, cellSize, cellSize, cellSize);
    ctx.fillRect(cellSize, qrSize - cellSize * 2, cellSize, cellSize);
    
    // Add the canvas to the container
    qrCodeContainer.appendChild(qrCanvas);
}

/**
 * Initialize dark mode toggle functionality
 */
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Check for saved preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply saved preference
    if (isDarkMode) {
        body.classList.add('dark-mode');
    }
    
    // Toggle dark mode on button click
    darkModeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        
        // Save preference
        const currentMode = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', currentMode);
    });
}