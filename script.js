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

  // Professional floating data particles animation
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

    // Particle class for data elements
    class DataParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.type = Math.floor(Math.random() * 3); // 0: circle, 1: square, 2: hexagon
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += this.pulseSpeed;

        // Wrap around edges
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;

        // Occasional direction change
        if (Math.random() < 0.005) {
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
        }
      }

      draw() {
        ctx.save();
        const pulseFactor = 0.8 + 0.2 * Math.sin(this.pulse);
        const currentSize = this.size * pulseFactor;
        const currentOpacity = this.opacity * pulseFactor;

        // Set color based on theme
        const isDark = body.classList.contains('dark-mode');
        const primaryColor = isDark ? '#0A84FF' : '#007AFF';
        const accentColor = isDark ? '#5E5CE6' : '#5856D6';

        ctx.fillStyle = `rgba(${isDark ? '10,132,255' : '0,122,255'}, ${currentOpacity})`;
        ctx.strokeStyle = `rgba(${isDark ? '94,92,230' : '88,86,214'}, ${currentOpacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 8 * pulseFactor;

        ctx.beginPath();
        
        switch (this.type) {
          case 0: // Circle
            ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
            break;
          case 1: // Square
            const halfSize = currentSize / 2;
            ctx.rect(this.x - halfSize, this.y - halfSize, currentSize, currentSize);
            break;
          case 2: // Hexagon
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const px = this.x + currentSize * Math.cos(angle);
              const py = this.y + currentSize * Math.sin(angle);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            break;
        }

        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Connection lines between nearby particles
    class Connection {
      constructor(particle1, particle2) {
        this.p1 = particle1;
        this.p2 = particle2;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120 && distance > 20) {
          this.opacity = this.maxOpacity * (1 - distance / 120);
        } else {
          this.opacity = 0;
        }
      }

      draw() {
        if (this.opacity <= 0) return;

        ctx.save();
        const isDark = body.classList.contains('dark-mode');
        ctx.strokeStyle = `rgba(${isDark ? '10,132,255' : '0,122,255'}, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = isDark ? '#0A84FF' : '#007AFF';
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Initialize particles and connections
    const particles = [];
    const connections = [];
    const particleCount = 45;
    const connectionCount = 25;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new DataParticle());
    }

    for (let i = 0; i < connectionCount; i++) {
      const p1 = particles[Math.floor(Math.random() * particles.length)];
      const p2 = particles[Math.floor(Math.random() * particles.length)];
      if (p1 !== p2) {
        connections.push(new Connection(p1, p2));
      }
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Update and draw connections first (background)
      connections.forEach(conn => {
        conn.update();
        conn.draw();
      });

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Event info slider auto-advance
  const slider = document.querySelector('.event-slider');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.event-slide'));
    let current = 0;
    let currentScreen = 'main';
    let autoAdvanceInterval;

    function showSlide(idx) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === idx);
      });
    }

    function showScreen(screenName) {
      // Hide all slides
      slides.forEach(slide => {
        slide.classList.remove('active');
      });

      // Show only slides for the selected screen
      const screenSlides = slides.filter(slide => slide.dataset.screen === screenName);
      if (screenSlides.length > 0) {
        screenSlides[0].classList.add('active');
        current = slides.indexOf(screenSlides[0]);
      }

      // Update navigation active state
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.screen === screenName);
      });

      currentScreen = screenName;
    }

    // Initialize with main screen
    showScreen('main');

    // Auto-advance only for the current screen
    function startAutoAdvance() {
      if (autoAdvanceInterval) {
        clearInterval(autoAdvanceInterval);
      }
      
      autoAdvanceInterval = setInterval(() => {
        const currentScreenSlides = slides.filter(slide => slide.dataset.screen === currentScreen);
        const currentScreenIndex = currentScreenSlides.findIndex(slide => slide.classList.contains('active'));
        const nextIndex = (currentScreenIndex + 1) % currentScreenSlides.length;
        
        // Hide all slides for current screen
        currentScreenSlides.forEach(slide => slide.classList.remove('active'));
        // Show next slide for current screen
        currentScreenSlides[nextIndex].classList.add('active');
      }, 5000);
    }

    startAutoAdvance();

    // Navigation click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function() {
        const screenName = this.dataset.screen;
        showScreen(screenName);
        startAutoAdvance(); // Restart auto-advance for new screen
      });
    });
  }

  // --- Supabase Integration ---
  // Replace with your actual Supabase project URL and anon key
  const SUPABASE_URL = 'https://amxvmnzhwehxmnwzzaoy.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHZtbnpod2VoeG1ud3p6YW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NTc5NDksImV4cCI6MjA2NzUzMzk0OX0.Vedmvf0QnCEh5TdgarY48BW2vrBgmYayQ2c-fcKFHlo';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Message system functionality
  const messageForm = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const userSelect = document.getElementById('userSelect');
  const charCount = document.getElementById('charCount');
  const messagePopup = document.getElementById('messagePopup');
  const messageAuthor = document.getElementById('messageAuthor');
  const messageText = document.getElementById('messageText');
  const messageTime = document.getElementById('messageTime');

  // Character counter
  if (messageInput) {
    messageInput.addEventListener('input', function() {
      const count = this.value.length;
      charCount.textContent = count;
      
      // Change color when approaching limit
      if (count > 180) {
        charCount.style.color = '#FF3B30';
      } else if (count > 150) {
        charCount.style.color = '#FF9500';
      } else {
        charCount.style.color = 'var(--muted)';
      }
    });
  }

  // --- Supabase Send Message ---
  async function sendMessageToSupabase(author, content) {
    // Show loading state (disable button)
    const submitBtn = messageForm.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Insert message into Supabase
    const { error } = await supabase.from('messages').insert([
      { author, content }
    ]);

    // Restore button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';

    if (error) {
      alert('Failed to send message. Please try again.');
      return false;
    }
    return true;
  }

  // Form submission
  if (messageForm) {
    messageForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const userName = userSelect.value;
      const message = messageInput.value.trim();
      
      if (!userName || !message) {
        return;
      }

      // Send to Supabase
      const ok = await sendMessageToSupabase(userName, message);
      if (ok) {
        // Reset form
        messageForm.reset();
        charCount.textContent = '0';
        charCount.style.color = 'var(--muted)';
        // Show success popup
        showMessagePopup(userName, 'Message sent!');
      }
    });
  }

  // Message popup functionality
  function showMessagePopup(author, text) {
    if (!messagePopup || !messageAuthor || !messageText || !messageTime) return;

    // Update popup content
    messageAuthor.textContent = author;
    messageText.textContent = text;
    messageTime.textContent = 'Just now';

    // Show popup
    messagePopup.classList.add('show');

    // Hide popup after 5 seconds
    setTimeout(() => {
      messagePopup.classList.remove('show');
    }, 5000);
  }

  // --- Real-time Message Display ---
  const messagesPopups = document.getElementById('messagesPopups');
  let supabaseMessagesSubscription = null;

  function renderMessagePopup({ author, content, created_at }) {
    if (!messagesPopups) return;
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'message-popup show';
    popup.innerHTML = `
      <div class="message-content">
        <div class="message-header">
          <span class="message-author">${author}</span>
          <span class="message-time">${created_at ? new Date(created_at).toLocaleTimeString() : 'Just now'}</span>
        </div>
        <div class="message-text">${content}</div>
      </div>
    `;
    messagesPopups.appendChild(popup);
    // Remove after 5 seconds
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => popup.remove(), 500);
    }, 5000);
  }

  async function fetchAndShowRecentMessages() {
    if (!messagesPopups) return;
    messagesPopups.innerHTML = '';
    // Fetch last 5 messages, newest first
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) {
      // Show newest first (top)
      data.reverse().forEach(msg => renderMessagePopup(msg));
    }
  }

  function subscribeToMessages() {
    if (supabaseMessagesSubscription) return;
    supabaseMessagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        renderMessagePopup(payload.new);
      })
      .subscribe();
  }

  function unsubscribeFromMessages() {
    if (supabaseMessagesSubscription) {
      supabase.removeChannel(supabaseMessagesSubscription);
      supabaseMessagesSubscription = null;
    }
  }

  // --- Screen change logic for real-time messages ---
  function handleScreenChangeForMessages(screenName) {
    if (screenName === 'messages') {
      fetchAndShowRecentMessages();
      subscribeToMessages();
    } else {
      unsubscribeFromMessages();
      if (messagesPopups) messagesPopups.innerHTML = '';
    }
  }

  // Patch nav click handlers to call handleScreenChangeForMessages
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const screenName = this.dataset.screen;
      handleScreenChangeForMessages(screenName);
    });
  });

  // If page loads on messages screen, start subscription
  if (document.querySelector('.event-slide.active[data-screen="messages"]')) {
    handleScreenChangeForMessages('messages');
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
