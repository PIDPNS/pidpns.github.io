document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  // Load saved theme or system preference
  let mode = localStorage.getItem('themeMode');
  if (!mode) {
    mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  setThemeMode(mode);
  themeToggle.addEventListener('click', function() {
    setThemeMode(body.classList.contains('dark-mode') ? 'light' : 'dark');
  });
  function setThemeMode(mode) {
    if (mode === 'dark') {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
    localStorage.setItem('themeMode', mode);
  }

  // Digital circuit lines animation
  const circuitCanvas = document.getElementById('circuitLines');
  if (circuitCanvas) {
    let width = circuitCanvas.width = circuitCanvas.offsetWidth;
    let height = circuitCanvas.height = circuitCanvas.offsetHeight;
    const ctx = circuitCanvas.getContext('2d');
    function resizeCircuit() {
      width = circuitCanvas.width = circuitCanvas.offsetWidth;
      height = circuitCanvas.height = circuitCanvas.offsetHeight;
    }
    window.addEventListener('resize', resizeCircuit);
    // Generate random circuit lines
    function randomLines(count) {
      const lines = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const len = 120 + Math.random() * 180;
        const horizontal = Math.random() > 0.5;
        lines.push({
          x, y, len, horizontal,
          turn: Math.random() > 0.5
        });
      }
      return lines;
    }
    let lines = randomLines(32);
    let t = 0;
    function drawCircuit() {
      ctx.clearRect(0, 0, width, height);
      // Draw lines
      for (const line of lines) {
        ctx.save();
        ctx.strokeStyle = `rgba(67,233,123,0.18)`;
        ctx.shadowColor = '#43e97b';
        ctx.shadowBlur = 8 + 6 * Math.abs(Math.sin(t/2));
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        if (line.turn) {
          // L-shape
          if (line.horizontal) {
            ctx.lineTo(line.x + line.len * 0.6, line.y);
            ctx.lineTo(line.x + line.len * 0.6, line.y + line.len * 0.4);
          } else {
            ctx.lineTo(line.x, line.y + line.len * 0.6);
            ctx.lineTo(line.x + line.len * 0.4, line.y + line.len * 0.6);
          }
        } else {
          if (line.horizontal) {
            ctx.lineTo(line.x + line.len, line.y);
          } else {
            ctx.lineTo(line.x, line.y + line.len);
          }
        }
        ctx.stroke();
        ctx.restore();
        // Draw circuit nodes
        ctx.save();
        ctx.beginPath();
        let nodeX = line.horizontal ? line.x + line.len * (line.turn ? 0.6 : 1) : line.x;
        let nodeY = line.horizontal ? line.y : line.y + line.len * (line.turn ? 0.6 : 1);
        ctx.arc(nodeX, nodeY, 6 + 2 * Math.abs(Math.sin(t)), 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(56,142,60,${0.18 + 0.12 * Math.abs(Math.sin(t))})`;
        ctx.shadowColor = '#43e97b';
        ctx.shadowBlur = 16 + 8 * Math.abs(Math.sin(t));
        ctx.fill();
        ctx.restore();
      }
      t += 0.02;
      requestAnimationFrame(drawCircuit);
    }
    drawCircuit();
  }

  // Event info slider auto-advance
  const slider = document.querySelector('.event-slider');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.event-slide'));
    let current = 0;
    function showSlide(idx) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === idx);
      });
    }
    showSlide(current);
    setInterval(() => {
      current = (current + 1) % slides.length;
      showSlide(current);
    }, 5000);
  }

  // Current date and time updater
  function updateDatetime() {
    const timeEl = document.getElementById('currentTime');
    const dateEl = document.getElementById('currentDate');
    if (!timeEl || !dateEl) return;
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const day = days[now.getDay()];
    const date = now.getDate().toString().padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    dateEl.textContent = `${day}, ${date} ${month} ${year}`;
  }
  updateDatetime();
  setInterval(updateDatetime, 1000);
});
