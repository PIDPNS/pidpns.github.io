document.addEventListener('DOMContentLoaded', function() {
    // Load event data from JSON file
    loadEventData();
    // Generate QR code
    generateQRCode();
    // Initialize theme toggle
    initThemeToggle();
    // Initialize digital grid animation
    initDigitalGrid();
});

function loadEventData() {
    fetch('event.json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('eventTitle').textContent = data.title || 'Majlis Pelancaran Buku 2025';
            document.getElementById('eventDate').textContent = data.date || '7 Julai 2025';
            document.getElementById('eventLocation').textContent = data.location || 'Auditorium Utama';
            document.getElementById('eventHashtag').textContent = data.hashtag || '#PNSEvent2025';
            document.title = data.title ? `${data.title} - Perpustakaan Negeri Sabah` : 'Perpustakaan Negeri Sabah - Event Backdrop';
        })
        .catch(() => {});
}

function generateQRCode() {
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrSize = 100;
    const qrCanvas = document.createElement('canvas');
    qrCanvas.width = qrSize;
    qrCanvas.height = qrSize;
    qrCanvas.style.width = '100%';
    qrCanvas.style.height = '100%';
    const ctx = qrCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, qrSize, qrSize);
    ctx.fillStyle = '#00ffae';
    const cellSize = 10;
    for (let y = 0; y < qrSize; y += cellSize) {
        for (let x = 0; x < qrSize; x += cellSize) {
            if (Math.random() > 0.7) {
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }
    ctx.fillRect(0, 0, cellSize * 3, cellSize * 3);
    ctx.fillRect(qrSize - cellSize * 3, 0, cellSize * 3, cellSize * 3);
    ctx.fillRect(0, qrSize - cellSize * 3, cellSize * 3, cellSize * 3);
    ctx.fillStyle = 'white';
    ctx.fillRect(cellSize, cellSize, cellSize, cellSize);
    ctx.fillRect(qrSize - cellSize * 2, cellSize, cellSize, cellSize);
    ctx.fillRect(cellSize, qrSize - cellSize * 2, cellSize, cellSize);
    qrCodeContainer.appendChild(qrCanvas);
}

function initThemeToggle() {
    const toggleBtn = document.getElementById('darkModeToggle');
    const body = document.body;
    // Check for saved preference
    let mode = localStorage.getItem('themeMode');
    if (!mode) {
        mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setThemeMode(mode);
    toggleBtn.addEventListener('click', function() {
        const isDark = body.classList.contains('dark-mode');
        setThemeMode(isDark ? 'light' : 'dark');
    });
}
function setThemeMode(mode) {
    const body = document.body;
    if (mode === 'dark') {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
    } else {
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
    }
    localStorage.setItem('themeMode', mode);
}

function initDigitalGrid() {
    const canvas = document.getElementById('digitalGrid');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    // Animation
    let t = 0;
    function drawGrid() {
        ctx.clearRect(0, 0, width, height);
        const gridSize = 60;
        for (let x = 0; x < width; x += gridSize) {
            for (let y = 0; y < height; y += gridSize) {
                ctx.save();
                ctx.strokeStyle = `rgba(0,255,174,${0.12 + 0.08 * Math.sin(t + x * 0.01 + y * 0.01)})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + gridSize, y);
                ctx.lineTo(x + gridSize, y + gridSize);
                ctx.lineTo(x, y + gridSize);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
                // Digital dots
                if ((x + y) % 120 === 0) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x + gridSize / 2, y + gridSize / 2, 2.5 + 2 * Math.abs(Math.sin(t + x * 0.02)), 0, 2 * Math.PI);
                    ctx.fillStyle = `rgba(0,255,174,${0.18 + 0.12 * Math.abs(Math.cos(t + y * 0.02))})`;
                    ctx.shadowColor = '#00ffae';
                    ctx.shadowBlur = 8;
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
        t += 0.03;
        requestAnimationFrame(drawGrid);
    }
    drawGrid();
}