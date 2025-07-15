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

  // Simple fallback animation if the complex system fails
  function initSimpleParticles() {
    const circuitCanvas = document.getElementById('circuitLines');
    if (!circuitCanvas) return;

    let width = circuitCanvas.width = circuitCanvas.offsetWidth;
    let height = circuitCanvas.height = circuitCanvas.offsetHeight;
    const ctx = circuitCanvas.getContext('2d');
    
    const particles = [];
    const particleCount = 30;

    class SimpleParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.save();
        const isDark = document.body.classList.contains('dark-mode');
        ctx.fillStyle = `rgba(${isDark ? '48,209,88' : '52,199,89'}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new SimpleParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
      width = circuitCanvas.width = circuitCanvas.offsetWidth;
      height = circuitCanvas.height = circuitCanvas.offsetHeight;
    });

    animate();
  }

  // Initialize Background Animation System
  let backgroundAnimationManager;
  
  // Wait for DOM to be ready before initializing animations
  function initializeAnimations() {
    try {
      if (typeof BackgroundAnimationManager !== 'undefined') {
        backgroundAnimationManager = new BackgroundAnimationManager('circuitLines');
      } else {
        initSimpleParticles();
      }
    } catch (error) {
      console.error('Error initializing animations:', error);
      initSimpleParticles();
    }
  }

  // Initialize animations after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnimations);
  } else {
    initializeAnimations();
  }

  // Animation Selector functionality
  function initializeAnimationSelector() {
    const animationSelectorTrigger = document.getElementById('animationSelectorTrigger');
    const animationSelectorDropdown = document.getElementById('animationSelectorDropdown');
    
    if (!animationSelectorTrigger || !animationSelectorDropdown) {
      console.log('Animation selector elements not found');
      return;
    }
    
    let isAnimationMenuOpen = false;
    
    // Toggle dropdown
    animationSelectorTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      isAnimationMenuOpen = !isAnimationMenuOpen;
      animationSelectorDropdown.classList.toggle('show', isAnimationMenuOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      if (isAnimationMenuOpen) {
        isAnimationMenuOpen = false;
        animationSelectorDropdown.classList.remove('show');
      }
    });

    // Prevent dropdown from closing when clicking inside
    animationSelectorDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Handle animation selection
    const animationOptions = document.querySelectorAll('.animation-option');
    
    animationOptions.forEach(option => {
      option.addEventListener('click', () => {
        const animationType = option.dataset.animation;
        
        // Update active state
        animationOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Set animation
        if (backgroundAnimationManager && backgroundAnimationManager.setAnimation) {
          try {
            backgroundAnimationManager.setAnimation(animationType);
          } catch (error) {
            console.error('Error setting animation:', error);
          }
        } else {
          console.error('Background animation manager not available');
        }
        
        // Close dropdown
        isAnimationMenuOpen = false;
        animationSelectorDropdown.classList.remove('show');
      });
    });

    // Set initial active state based on stored preference
    const storedAnimation = localStorage.getItem('backgroundAnimation') || 'particles';
    
    const activeOption = document.querySelector(`[data-animation="${storedAnimation}"]`);
    if (activeOption) {
      animationOptions.forEach(opt => opt.classList.remove('active'));
      activeOption.classList.add('active');
    }
  }

  // Initialize animation selector after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnimationSelector);
  } else {
    initializeAnimationSelector();
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
      // Hide all screens
      document.querySelectorAll('.screen-container').forEach(screen => {
        screen.classList.remove('active');
      });
      document.querySelector('.event-info').style.display = 'none';

      // Show the selected screen
      if (screenName === 'main') {
        document.querySelector('.event-info').style.display = 'flex';
        // Show first slide of main screen
        const mainSlides = slides.filter(slide => slide.dataset.screen === 'main');
        if (mainSlides.length > 0) {
          mainSlides.forEach(slide => slide.classList.remove('active'));
          mainSlides[0].classList.add('active');
          current = slides.indexOf(mainSlides[0]);
        }
      } else {
        const targetScreen = document.querySelector(`.screen-container[data-screen="${screenName}"]`);
        if (targetScreen) {
          targetScreen.classList.add('active');
        }
      }

      // Update navigation active state
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.screen === screenName);
      });

      currentScreen = screenName;

      // Start auto-advance only for main screen
      if (screenName === 'main') {
        startAutoAdvance();
      } else {
        if (autoAdvanceInterval) {
          clearInterval(autoAdvanceInterval);
        }
      }
    }

    // Initialize with main screen
    showScreen('main');

    // Auto-advance only for the main screen
    function startAutoAdvance() {
      if (autoAdvanceInterval) {
        clearInterval(autoAdvanceInterval);
      }
      
      autoAdvanceInterval = setInterval(() => {
        if (currentScreen === 'main') {
          const mainSlides = slides.filter(slide => slide.dataset.screen === 'main');
          const currentIndex = mainSlides.findIndex(slide => slide.classList.contains('active'));
          const nextIndex = (currentIndex + 1) % mainSlides.length;
          
          mainSlides.forEach(slide => slide.classList.remove('active'));
          mainSlides[nextIndex].classList.add('active');
        }
      }, 5000);
    }

    // Navigation click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function() {
        const screenName = this.dataset.screen;
        showScreen(screenName);
      });
    });
  }

  // --- Supabase Integration ---
  // Replace with your actual Supabase project URL and anon key
  const SUPABASE_URL = 'https://amxvmnzhwehxmnwzzaoy.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHZtbnpod2VoeG1ud3p6YW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NTc5NDksImV4cCI6MjA2NzUzMzk0OX0.Vedmvf0QnCEh5TdgarY48BW2vrBgmYayQ2c-fcKFHlo';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Award message system functionality
  const messageForm = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const userSelect = document.getElementById('userSelect');
  const charCount = document.getElementById('charCount');
  const photoInput = document.getElementById('photoInput');
  const photoUploadArea = document.getElementById('photoUploadArea');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const photoPreview = document.getElementById('photoPreview');
  const messagePopup = document.getElementById('messagePopup');
  const messageAuthor = document.getElementById('messageAuthor');
  const messageText = document.getElementById('messageText');
  const messageTime = document.getElementById('messageTime');

  // Photo upload functionality - DISABLED: Now handled by award-messages.js
  // if (photoInput && photoUploadArea) {
  //   photoUploadArea.addEventListener('click', () => photoInput.click());
  //   
  //   photoInput.addEventListener('change', function(e) {
  //     const file = e.target.files[0];
  //     if (file) {
  //       const reader = new FileReader();
  //       reader.onload = function(e) {
  //         photoPreview.src = e.target.result;
  //         photoPreviewContainer.style.display = 'block';
  //         photoUploadArea.style.display = 'none';
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   });
  // }

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
    const submitBtn = messageForm.querySelector('.award-submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg class="submit-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="10,8 16,12 10,16"/></svg><span>Sending...</span>';

    try {
      // Check if there's a photo to upload
      let image_url = null;
      if (photoInput && photoInput.files && photoInput.files.length > 0) {
        const file = photoInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${author.replace(/\s+/g, '-').toLowerCase()}/${fileName}`;
        
        // Upload file to Supabase Storage
         const { data: uploadData, error: uploadError } = await supabase.storage
           .from('message-photos')
           .upload(filePath, file, {
             contentType: file.type,
             upsert: false
           });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          alert('Failed to upload image. Please try again.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
          return false;
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('message-photos')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      // Insert message into Supabase with image_url if available
      const { error } = await supabase.from('messages').insert([
        { author, content, image_url }
      ]);

      // Restore button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;

      if (error) {
        console.error('Error inserting message:', error);
        alert('Failed to send message. Please try again.');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred. Please try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
      return false;
    }
  }

  // Form submission - DISABLED: Now handled by award-messages.js
  // if (messageForm) {
  //   messageForm.addEventListener('submit', async function(e) {
  //     e.preventDefault();
  //     
  //     const userName = userSelect.value;
  //     const message = messageInput.value.trim();
  //     
  //     if (!userName || !message) {
  //       return;
  //     }

  //     // Send to Supabase
  //     const ok = await sendMessageToSupabase(userName, message);
  //     if (ok) {
  //       // Reset form
  //       messageForm.reset();
  //       charCount.textContent = '0';
  //       charCount.style.color = 'var(--muted)';
  //       
  //       // Reset photo preview
  //       if (photoPreviewContainer && photoUploadArea) {
  //         photoPreviewContainer.style.display = 'none';
  //         photoUploadArea.style.display = 'block';
  //         photoPreview.src = '';
  //       }
  //       
  //       // Show success popup
  //       showMessagePopup(userName, 'Award message sent!');
  //     }
  //   });
  // }

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
    }, 7000);
  }

  // --- Real-time Message Display with Spotlight Carousel ---
  const messagesPopups = document.getElementById('messagesPopups');
  const spotlightContainer = document.getElementById('spotlightContainer');
  const messagesQueue = document.getElementById('messagesQueue');
  const spotlightIndicators = document.getElementById('spotlightIndicators');
  const spotlightPrev = document.getElementById('spotlightPrev');
  const spotlightNext = document.getElementById('spotlightNext');
  
  let supabaseMessagesSubscription = null;
  let spotlightMessages = [];
  let currentSpotlightIndex = 0;
  let spotlightInterval = null;

  // Spotlight Carousel Manager
  class SpotlightCarousel {
    constructor() {
      this.messages = [];
      this.currentIndex = 0;
      this.isPlaying = true;
      this.interval = null;
      this.autoPlayDelay = 8000; // 8 seconds
      
      this.init();
    }
    
    init() {
      // Set up navigation listeners
      if (spotlightPrev) {
        spotlightPrev.addEventListener('click', () => this.prev());
      }
      if (spotlightNext) {
        spotlightNext.addEventListener('click', () => this.next());
      }
      
      // Start auto-play
      this.startAutoPlay();
    }
    
    clearMessages() {
      // Clear the messages array
      this.messages = [];
      this.currentIndex = 0;
      
      // Clear spotlight container
      if (spotlightContainer) {
        const existingItems = spotlightContainer.querySelectorAll('.spotlight-item');
        existingItems.forEach(item => item.remove());
        this.showPlaceholder();
      }
      
      // Clear queue container
      if (messagesQueue) {
        messagesQueue.innerHTML = '';
      }
      
      // Clear indicators
      if (spotlightIndicators) {
        spotlightIndicators.innerHTML = '';
      }
      
      // Stop auto-play
      this.stopAutoPlay();
    }
    
    addMessage(message) {
      // Add to beginning of array (newest first)
      this.messages.unshift(message);
      
      // Limit to 10 messages maximum
      if (this.messages.length > 10) {
        this.messages = this.messages.slice(0, 10);
      }
      
      this.updateSpotlight();
      this.updateQueue();
      this.updateIndicators();
      
      // Reset to first message when new one arrives
      this.currentIndex = 0;
      this.showMessage(0);
      this.restartAutoPlay();
    }
    
    updateSpotlight() {
      if (!spotlightContainer || this.messages.length === 0) {
        this.showPlaceholder();
        return;
      }
      
      // Clear existing spotlight items
      const existingItems = spotlightContainer.querySelectorAll('.spotlight-item');
      existingItems.forEach(item => item.remove());
      
      // Create spotlight items for each message
      this.messages.forEach((message, index) => {
        const spotlightItem = this.createSpotlightItem(message, index);
        spotlightContainer.appendChild(spotlightItem);
      });
      
      this.showMessage(this.currentIndex);
    }
    
    createSpotlightItem(message, index) {
      const item = document.createElement('div');
      item.className = 'spotlight-item';
      item.dataset.index = index;
      
      const timeStr = message.created_at ? 
        new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
        'Just now';
      
      item.innerHTML = `
        ${message.image_url ? `<img src="${message.image_url}" alt="${message.author}'s photo" class="spotlight-image" 
             onerror="this.style.display='none';">` : ''}
        <div class="spotlight-overlay">
          <div class="spotlight-author">${message.author}</div>
          <div class="spotlight-message">${message.content}</div>
        </div>
        <div class="spotlight-time">${timeStr}</div>
      `;
      
      return item;
    }
    
    showPlaceholder() {
      if (!spotlightContainer) return;
      
      spotlightContainer.innerHTML = `
        <div class="spotlight-placeholder">
          <div class="spotlight-placeholder-content">
            <div class="spotlight-placeholder-icon">🎭</div>
            <h3>Character Showcase Awaits</h3>
            <p>Step into the spotlight! Share your movie or book character costume to join the digital showcase.</p>
          </div>
        </div>
      `;
    }
    
    showMessage(index) {
      if (!spotlightContainer || this.messages.length === 0) return;
      
      const items = spotlightContainer.querySelectorAll('.spotlight-item');
      items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
      
      this.currentIndex = index;
      this.updateIndicators();
      this.updateQueueHighlight();
    }
    
    updateQueue() {
      if (!messagesQueue) return;
      
      messagesQueue.innerHTML = '';
      
      this.messages.forEach((message, index) => {
        const queueItem = this.createQueueItem(message, index);
        messagesQueue.appendChild(queueItem);
      });
    }
    
    createQueueItem(message, index) {
      const item = document.createElement('div');
      item.className = 'queue-item';
      item.dataset.index = index;
      
      const timeStr = message.created_at ? 
        new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
        'Just now';
      
      item.innerHTML = `
        ${message.image_url ? `<img src="${message.image_url}" alt="${message.author}" class="queue-image" 
             onerror="this.style.display='none';">` : 
          '<div class="queue-image" style="background: var(--glass-bg); display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 0.7rem;">No Image</div>'}
        <div class="queue-content">
          <div class="queue-author">${message.author}</div>
          <div class="queue-message">${message.content}</div>
          <div class="queue-time">${timeStr}</div>
        </div>
      `;
      
      // Add click listener to jump to this message in spotlight
      item.addEventListener('click', () => {
        this.showMessage(index);
        this.restartAutoPlay();
      });
      
      return item;
    }
    
    updateIndicators() {
      if (!spotlightIndicators) return;
      
      spotlightIndicators.innerHTML = '';
      
      this.messages.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'spotlight-indicator';
        if (index === this.currentIndex) {
          indicator.classList.add('active');
        }
        
        indicator.addEventListener('click', () => {
          this.showMessage(index);
          this.restartAutoPlay();
        });
        
        spotlightIndicators.appendChild(indicator);
      });
      
      // Update navigation buttons
      if (spotlightPrev) {
        spotlightPrev.disabled = this.messages.length <= 1;
      }
      if (spotlightNext) {
        spotlightNext.disabled = this.messages.length <= 1;
      }
    }
    
    updateQueueHighlight() {
      if (!messagesQueue) return;
      
      const queueItems = messagesQueue.querySelectorAll('.queue-item');
      queueItems.forEach((item, index) => {
        item.classList.toggle('featured', index === this.currentIndex);
      });
    }
    
    next() {
      if (this.messages.length <= 1) return;
      
      const nextIndex = (this.currentIndex + 1) % this.messages.length;
      this.showMessage(nextIndex);
    }
    
    prev() {
      if (this.messages.length <= 1) return;
      
      const prevIndex = this.currentIndex === 0 ? this.messages.length - 1 : this.currentIndex - 1;
      this.showMessage(prevIndex);
    }
    
    startAutoPlay() {
      if (this.interval) return;
      
      this.interval = setInterval(() => {
        if (this.messages.length > 1 && this.isPlaying) {
          this.next();
        }
      }, this.autoPlayDelay);
    }
    
    stopAutoPlay() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
    
    restartAutoPlay() {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
    
    pause() {
      this.isPlaying = false;
    }
    
    resume() {
      this.isPlaying = true;
    }
  }
  
  // Initialize Spotlight Carousel
  let spotlightCarousel = null;

  function renderMessagePopup({ author, content, created_at, image_url }) {
    console.log('Rendering message popup:', { author, content, image_url });
    
    // Initialize carousel if not exists
    if (!spotlightCarousel) {
      spotlightCarousel = new SpotlightCarousel();
    }
    
    // Add message to spotlight carousel
    spotlightCarousel.addMessage({ author, content, created_at, image_url });
    
    // Hide title and status when we have messages
    const liveTitle = document.getElementById('liveMessagesTitle');
    const status = document.getElementById('messagesStatus');
    if (liveTitle) liveTitle.classList.add('live-messages-fade');
    if (status) status.classList.add('live-messages-fade');
  }

  async function fetchAndShowRecentMessages() {
    if (!spotlightCarousel) {
      spotlightCarousel = new SpotlightCarousel();
    }
    
    // Clear existing messages to prevent duplicates
    spotlightCarousel.clearMessages();
    
    // Fetch last 10 messages, newest first
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (data && data.length > 0) {
      // Add messages to spotlight (they're already in newest-first order)
      data.forEach(msg => {
        spotlightCarousel.addMessage(msg);
      });
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
      // Initialize carousel and fetch recent messages
      if (!spotlightCarousel) {
        spotlightCarousel = new SpotlightCarousel();
      }
      fetchAndShowRecentMessages();
      subscribeToMessages();
      spotlightCarousel?.resume();
    } else {
      // Clean up when leaving messages screen
      unsubscribeFromMessages();
      spotlightCarousel?.pause();
      // Clear messages to prevent stale data when returning
      if (spotlightCarousel) {
        spotlightCarousel.clearMessages();
      }
    }
  }

  // Patch nav click handlers to call handleScreenChangeForMessages
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const screenName = this.dataset.screen;
      handleScreenChangeForMessages(screenName);
      // Official Digital Backdrop page logic
      const header = document.querySelector('.header');
      const mainContent = document.querySelector('.main-content');
      const eventInfo = document.querySelector('.event-info');
      const officialPage = document.querySelector('.official-backdrop-page');
      const circuitCanvas = document.getElementById('circuitLines');
      if (screenName === 'official') {
        if (header) header.style.display = 'none';
        if (mainContent) mainContent.style.display = 'none';
        if (officialPage) officialPage.style.display = 'block';
        if (circuitCanvas) circuitCanvas.style.display = 'block';
      } else {
        if (header) header.style.display = '';
        if (mainContent) mainContent.style.display = '';
        if (officialPage) officialPage.style.display = 'none';
        if (circuitCanvas) circuitCanvas.style.display = '';
      }
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
    
    // Format time with AM/PM
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    timeEl.textContent = `${hours}:${minutes} ${ampm}`;
    dateEl.textContent = `${day}, ${date} ${month} ${year}`;
  }
  updateDatetime();
  setInterval(updateDatetime, 1000);
});
