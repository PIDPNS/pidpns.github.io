// Background Animation System
class BackgroundAnimationManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas element not found:', canvasId);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = this.canvas.offsetWidth;
    this.height = this.canvas.height = this.canvas.offsetHeight;
    this.animationId = null;
    this.currentAnimation = 'particles';
    
    // Bind resize handler
    this.resizeHandler = this.resize.bind(this);
    window.addEventListener('resize', this.resizeHandler);
    
    // Initialize with stored preference or default
    const stored = localStorage.getItem('backgroundAnimation');
    this.currentAnimation = stored || 'particles';
    console.log('Initial animation type:', this.currentAnimation);
    
    this.init();
  }

  resize() {
    this.width = this.canvas.width = this.canvas.offsetWidth;
    this.height = this.canvas.height = this.canvas.offsetHeight;
  }

  setAnimation(type) {
    this.currentAnimation = type;
    localStorage.setItem('backgroundAnimation', type);
    this.stop();
    this.init();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  init() {
    switch (this.currentAnimation) {
      case 'particles':
        this.initParticles();
        break;
      case 'waves':
        this.initWaves();
        break;
      case 'matrix':
        this.initMatrix();
        break;
      case 'geometric':
        this.initGeometric();
        break;
      case 'pages':
        this.initFloatingPages();
        break;
      case 'theatre':
        this.initTheatreLights();
        break;
      case 'none':
        this.stop();
        break;
      default:
        this.initParticles();
    }
  }

  // Original Particles Animation
  initParticles() {
    const particles = [];
    const connections = [];
    const particleCount = 45;
    const connectionCount = 25;

    class DataParticle {
      constructor(manager) {
        this.manager = manager;
        this.reset();
      }

      reset() {
        this.x = Math.random() * this.manager.width;
        this.y = Math.random() * this.manager.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.type = Math.floor(Math.random() * 3);
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += this.pulseSpeed;

        if (this.x < -10) this.x = this.manager.width + 10;
        if (this.x > this.manager.width + 10) this.x = -10;
        if (this.y < -10) this.y = this.manager.height + 10;
        if (this.y > this.manager.height + 10) this.y = -10;

        if (Math.random() < 0.005) {
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
        }
      }

      draw() {
        const ctx = this.manager.ctx;
        ctx.save();
        const pulseFactor = 0.8 + 0.2 * Math.sin(this.pulse);
        const currentSize = this.size * pulseFactor;
        const currentOpacity = this.opacity * pulseFactor;

        const isDark = document.body.classList.contains('dark-mode');
        ctx.fillStyle = `rgba(${isDark ? '48,209,88' : '52,199,89'}, ${currentOpacity})`;
        ctx.strokeStyle = `rgba(${isDark ? '40,167,69' : '40,167,69'}, ${currentOpacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = isDark ? '#30D158' : '#34C759';
        ctx.shadowBlur = 8 * pulseFactor;

        ctx.beginPath();
        
        switch (this.type) {
          case 0:
            ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
            break;
          case 1:
            const halfSize = currentSize / 2;
            ctx.rect(this.x - halfSize, this.y - halfSize, currentSize, currentSize);
            break;
          case 2:
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

    class Connection {
      constructor(particle1, particle2, manager) {
        this.p1 = particle1;
        this.p2 = particle2;
        this.manager = manager;
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

        const ctx = this.manager.ctx;
        ctx.save();
        const isDark = document.body.classList.contains('dark-mode');
        ctx.strokeStyle = `rgba(${isDark ? '48,209,88' : '52,199,89'}, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = isDark ? '#30D158' : '#34C759';
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      const particle = new DataParticle(this);
      particles.push(particle);
    }

    for (let i = 0; i < connectionCount; i++) {
      const p1 = particles[Math.floor(Math.random() * particles.length)];
      const p2 = particles[Math.floor(Math.random() * particles.length)];
      if (p1 !== p2) {
        connections.push(new Connection(p1, p2, this));
      }
    }

    const animate = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);

      connections.forEach(conn => {
        conn.update();
        conn.draw();
      });

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  // Wave Flow Animation
  initWaves() {
    const waves = [];
    const waveCount = 6;

    class Wave {
      constructor(manager, index) {
        this.manager = manager;
        this.amplitude = 30 + Math.random() * 20;
        this.frequency = 0.01 + Math.random() * 0.005;
        this.phase = index * Math.PI / 3;
        this.speed = 0.02 + Math.random() * 0.01;
        this.opacity = 0.3 + Math.random() * 0.3;
        this.yOffset = (index / waveCount) * manager.height;
      }

      update() {
        this.phase += this.speed;
      }

      draw() {
        const ctx = this.manager.ctx;
        ctx.save();
        
        const isDark = document.body.classList.contains('dark-mode');
        const gradient = ctx.createLinearGradient(0, 0, this.manager.width, 0);
        gradient.addColorStop(0, `rgba(${isDark ? '48,209,88' : '52,199,89'}, 0)`);
        gradient.addColorStop(0.5, `rgba(${isDark ? '48,209,88' : '52,199,89'}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${isDark ? '48,209,88' : '52,199,89'}, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowColor = isDark ? '#30D158' : '#34C759';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        for (let x = 0; x <= this.manager.width; x += 2) {
          const y = this.yOffset + this.amplitude * Math.sin(this.frequency * x + this.phase);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    for (let i = 0; i < waveCount; i++) {
      waves.push(new Wave(this, i));
    }

    const animate = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);

      waves.forEach(wave => {
        wave.update();
        wave.draw();
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  // Matrix Rain Animation
  initMatrix() {
    const drops = [];
    const fontSize = 14;
    const columns = Math.floor(this.width / fontSize);
    const chars = '01アカサタナハマヤラワンABCDEFGHIJKLMNOPQRSTUVWXYZ';

    class MatrixDrop {
      constructor(x, manager) {
        this.manager = manager;
        this.x = x;
        this.y = Math.random() * manager.height;
        this.speed = Math.random() * 3 + 2;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.chars = [];
        this.length = Math.random() * 20 + 10;
        
        for (let i = 0; i < this.length; i++) {
          this.chars.push(chars[Math.floor(Math.random() * chars.length)]);
        }
      }

      update() {
        this.y += this.speed;
        if (this.y > this.manager.height + this.length * fontSize) {
          this.y = -this.length * fontSize;
          this.speed = Math.random() * 3 + 2;
        }

        // Randomly change characters
        if (Math.random() < 0.1) {
          const index = Math.floor(Math.random() * this.chars.length);
          this.chars[index] = chars[Math.floor(Math.random() * chars.length)];
        }
      }

      draw() {
        const ctx = this.manager.ctx;
        ctx.save();
        ctx.font = `${fontSize}px monospace`;
        
        const isDark = document.body.classList.contains('dark-mode');
        
        for (let i = 0; i < this.chars.length; i++) {
          const charY = this.y - i * fontSize;
          if (charY > 0 && charY < this.manager.height) {
            const alpha = this.opacity * (1 - i / this.chars.length);
            ctx.fillStyle = `rgba(${isDark ? '48,209,88' : '52,199,89'}, ${alpha})`;
            ctx.fillText(this.chars[i], this.x, charY);
          }
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < columns; i++) {
      drops.push(new MatrixDrop(i * fontSize, this));
    }

    const animate = () => {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      drops.forEach(drop => {
        drop.update();
        drop.draw();
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  // Geometric Animation
  initGeometric() {
    const shapes = [];
    const shapeCount = 20;

    class GeometricShape {
      constructor(manager) {
        this.manager = manager;
        this.x = Math.random() * manager.width;
        this.y = Math.random() * manager.height;
        this.size = Math.random() * 40 + 10;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.type = Math.floor(Math.random() * 3); // 0: triangle, 1: square, 2: circle
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        if (this.x < -this.size) this.x = this.manager.width + this.size;
        if (this.x > this.manager.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = this.manager.height + this.size;
        if (this.y > this.manager.height + this.size) this.y = -this.size;
      }

      draw() {
        const ctx = this.manager.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const isDark = document.body.classList.contains('dark-mode');
        ctx.strokeStyle = `rgba(${isDark ? '48,209,88' : '52,199,89'}, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = isDark ? '#30D158' : '#34C759';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        
        switch (this.type) {
          case 0: // Triangle
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(-this.size / 2, this.size / 2);
            ctx.lineTo(this.size / 2, this.size / 2);
            ctx.closePath();
            break;
          case 1: // Square
            ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
            break;
          case 2: // Circle
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            break;
        }
        
        ctx.stroke();
        ctx.restore();
      }
    }

    for (let i = 0; i < shapeCount; i++) {
      shapes.push(new GeometricShape(this));
    }

    const animate = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);

      shapes.forEach(shape => {
        shape.update();
        shape.draw();
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  // Floating Movie Logos Animation - Perfect for Movie/Book Character Theme
  initFloatingPages() {
    const items = [];
    const itemCount = 25;
    const movieLogos = [
      { name: 'MARVEL', color: '#ED1D24', bgColor: '#000000', style: 'bold', type: 'logo' },
      { name: 'DISNEY', color: '#FFFFFF', bgColor: '#0047AB', style: 'script', type: 'logo' },
      { name: 'PIXAR', color: '#FFFFFF', bgColor: '#1E88E5', style: 'rounded', type: 'logo' },
      { name: 'DC', color: '#FFFFFF', bgColor: '#0078D4', style: 'bold', type: 'logo' },
      { name: 'NETFLIX', color: '#FFFFFF', bgColor: '#E50914', style: 'modern', type: 'logo' },
      { name: 'HBO', color: '#FFFFFF', bgColor: '#000000', style: 'bold', type: 'logo' },
      { name: 'UNIVERSAL', color: '#FFFFFF', bgColor: '#1B365D', style: 'globe', type: 'logo' }
    ];

    const movieTitles = [
      { name: 'AVENGERS', color: '#FFFFFF', bgColor: '#8B0000', style: 'action', type: 'title' },
      { name: 'STAR WARS', color: '#FFD700', bgColor: '#000000', style: 'space', type: 'title' },
      { name: 'JURASSIC PARK', color: '#FFD700', bgColor: '#2F4F2F', style: 'adventure', type: 'title' },
      { name: 'TITANIC', color: '#FFFFFF', bgColor: '#191970', style: 'romance', type: 'title' },
      { name: 'BATMAN', color: '#FFD700', bgColor: '#000000', style: 'dark', type: 'title' },
      { name: 'IRON MAN', color: '#FFD700', bgColor: '#8B0000', style: 'tech', type: 'title' },
      { name: 'SPIDER-MAN', color: '#FFFFFF', bgColor: '#DC143C', style: 'hero', type: 'title' },
      { name: 'FROZEN', color: '#87CEEB', bgColor: '#FFFFFF', style: 'animation', type: 'title' },
      { name: 'TOY STORY', color: '#FFFFFF', bgColor: '#FF6347', style: 'animation', type: 'title' },
      { name: 'HARRY POTTER', color: '#FFD700', bgColor: '#8B0000', style: 'magic', type: 'title' },
      { name: 'LORD OF RINGS', color: '#FFD700', bgColor: '#2F4F4F', style: 'fantasy', type: 'title' },
      { name: 'FAST & FURIOUS', color: '#FFFFFF', bgColor: '#000000', style: 'action', type: 'title' },
      { name: 'TRANSFORMERS', color: '#FFFFFF', bgColor: '#4682B4', style: 'tech', type: 'title' },
      { name: 'MISSION IMPOSSIBLE', color: '#FFFFFF', bgColor: '#000000', style: 'spy', type: 'title' },
      { name: 'JOHN WICK', color: '#FFFFFF', bgColor: '#2F2F2F', style: 'dark', type: 'title' },
      { name: 'BLACK PANTHER', color: '#FFD700', bgColor: '#4B0082', style: 'hero', type: 'title' },
      { name: 'WONDER WOMAN', color: '#FFD700', bgColor: '#8B0000', style: 'hero', type: 'title' },
      { name: 'GUARDIANS GALAXY', color: '#FFFFFF', bgColor: '#483D8B', style: 'space', type: 'title' },
      { name: 'DEADPOOL', color: '#FFFFFF', bgColor: '#8B0000', style: 'action', type: 'title' },
      { name: 'THOR', color: '#FFD700', bgColor: '#191970', style: 'fantasy', type: 'title' },
      { name: 'CAPTAIN AMERICA', color: '#FFFFFF', bgColor: '#4169E1', style: 'hero', type: 'title' },
      { name: 'INCREDIBLES', color: '#FFFFFF', bgColor: '#FF4500', style: 'animation', type: 'title' },
      { name: 'FINDING NEMO', color: '#FFFFFF', bgColor: '#1E90FF', style: 'animation', type: 'title' },
      { name: 'SHREK', color: '#FFFFFF', bgColor: '#228B22', style: 'animation', type: 'title' },
      { name: 'PIRATES CARIBBEAN', color: '#FFD700', bgColor: '#2F4F4F', style: 'adventure', type: 'title' },
      { name: 'INDIANA JONES', color: '#FFD700', bgColor: '#8B4513', style: 'adventure', type: 'title' },
      { name: 'JAMES BOND', color: '#FFFFFF', bgColor: '#000000', style: 'spy', type: 'title' },
      { name: 'ALIEN', color: '#FFFFFF', bgColor: '#2F2F2F', style: 'dark', type: 'title' }
    ];

    class FloatingItem {
      constructor(manager) {
        this.manager = manager;
        this.x = Math.random() * manager.width;
        this.y = Math.random() * manager.height;
        
        // Combine logos and titles into one array
        const allItems = [...movieLogos, ...movieTitles];
        this.item = allItems[Math.floor(Math.random() * allItems.length)];
        
        // Adjust size based on type
        if (this.item.type === 'logo') {
          this.width = Math.random() * 80 + 60; // 60-140px width for logos
          this.height = Math.random() * 40 + 30; // 30-70px height for logos
        } else {
          this.width = Math.random() * 120 + 100; // 100-220px width for titles
          this.height = Math.random() * 30 + 25; // 25-55px height for titles
        }
        
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.008;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.scale = Math.random() * 0.5 + 0.7; // 0.7-1.2 scale
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.glow = Math.random() * 0.3 + 0.1;
        this.shadowOffset = Math.random() * 3 + 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.pulsePhase += this.pulseSpeed;

        // Boundary wrapping
        if (this.x < -this.width) this.x = this.manager.width + this.width;
        if (this.x > this.manager.width + this.width) this.x = -this.width;
        if (this.y < -this.height) this.y = this.manager.height + this.height;
        if (this.y > this.manager.height + this.height) this.y = -this.height;

        // Occasional direction change for natural floating
        if (Math.random() < 0.001) {
          this.vx += (Math.random() - 0.5) * 0.1;
          this.vy += (Math.random() - 0.5) * 0.1;
          // Keep velocities reasonable
          this.vx = Math.max(-0.6, Math.min(0.6, this.vx));
          this.vy = Math.max(-0.4, Math.min(0.4, this.vy));
        }
      }

      draw() {
        const ctx = this.manager.ctx;
        ctx.save();
        
        const pulseFactor = 0.95 + 0.05 * Math.sin(this.pulsePhase);
        const currentOpacity = this.opacity * pulseFactor;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale * pulseFactor, this.scale * pulseFactor);
        
        const isDark = document.body.classList.contains('dark-mode');
        
        // Logo shadow
        ctx.save();
        ctx.translate(this.shadowOffset, this.shadowOffset);
        ctx.fillStyle = `rgba(0, 0, 0, ${currentOpacity * 0.3})`;
        this.drawItemShape(ctx, currentOpacity * 0.3);
        ctx.restore();
        
        // Logo background
        ctx.fillStyle = `rgba(${this.hexToRgb(this.item.bgColor)}, ${currentOpacity})`;
        this.drawItemShape(ctx, currentOpacity);
        
        // Logo glow effect
        ctx.shadowColor = this.item.color;
        ctx.shadowBlur = 15 * this.glow * pulseFactor;
        
        // Logo border
        ctx.strokeStyle = `rgba(${this.hexToRgb(this.item.color)}, ${currentOpacity * 0.7})`;
        ctx.lineWidth = 2;
        this.drawItemShape(ctx, currentOpacity, true);
        
        // Logo text
        ctx.fillStyle = `rgba(${this.hexToRgb(this.item.color)}, ${currentOpacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Different font styles for different items
        let fontSize = Math.min(this.width * 0.25, this.height * 0.4);
        let fontFamily = 'Arial';
        
        switch (this.item.style) {
          case 'bold':
            fontFamily = 'Arial Black, sans-serif';
            break;
          case 'script':
            fontFamily = 'Georgia, serif';
            fontSize *= 0.9;
            break;
          case 'rounded':
            fontFamily = 'Helvetica, sans-serif';
            break;
          case 'modern':
            fontFamily = 'Impact, sans-serif';
            break;
          case 'tech':
            fontFamily = 'Courier New, monospace';
            break;
          case 'classic':
            fontFamily = 'Times New Roman, serif';
            fontSize *= 0.95;
            break;
          case 'elegant':
            fontFamily = 'Garamond, serif';
            fontSize *= 0.9;
            break;
          case 'space':
            fontFamily = 'Orbitron, monospace';
            fontSize *= 0.85;
            break;
          case 'dreamy':
            fontFamily = 'Trebuchet MS, sans-serif';
            fontSize *= 0.9;
            break;
          case 'minimal':
            fontFamily = 'Helvetica Neue, sans-serif';
            fontSize *= 0.8;
            break;
          case 'horror':
            fontFamily = 'Chiller, fantasy';
            fontSize *= 1.1;
            break;
          case 'neon':
            fontFamily = 'Futura, sans-serif';
            fontSize *= 0.9;
            break;
          // Movie title styles
          case 'action':
            fontFamily = 'Impact, sans-serif';
            fontSize *= 0.8;
            break;
          case 'adventure':
            fontFamily = 'Trebuchet MS, sans-serif';
            fontSize *= 0.75;
            break;
          case 'romance':
            fontFamily = 'Georgia, serif';
            fontSize *= 0.8;
            break;
          case 'dark':
            fontFamily = 'Arial Black, sans-serif';
            fontSize *= 0.75;
            break;
          case 'hero':
            fontFamily = 'Impact, sans-serif';
            fontSize *= 0.8;
            break;
          case 'animation':
            fontFamily = 'Comic Sans MS, cursive';
            fontSize *= 0.85;
            break;
          case 'magic':
            fontFamily = 'Papyrus, fantasy';
            fontSize *= 0.8;
            break;
          case 'fantasy':
            fontFamily = 'Times New Roman, serif';
            fontSize *= 0.75;
            break;
          case 'spy':
            fontFamily = 'Arial, sans-serif';
            fontSize *= 0.7;
            break;
        }
        
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillText(this.item.name, 0, 0);
        
        // Additional item-specific decorations
        this.drawItemDecorations(ctx, currentOpacity);
        
        ctx.restore();
      }

      drawItemShape(ctx, opacity, strokeOnly = false) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        ctx.beginPath();
        
        // Movie titles get simpler shapes, logos get special shapes
        if (this.item.type === 'title') {
          // Most movie titles use rectangles with slight variations
          switch (this.item.style) {
            case 'action':
              // Slanted rectangle for action movies
              ctx.moveTo(-halfWidth, -halfHeight * 0.8);
              ctx.lineTo(halfWidth * 0.9, -halfHeight);
              ctx.lineTo(halfWidth, halfHeight * 0.8);
              ctx.lineTo(-halfWidth * 0.9, halfHeight);
              ctx.closePath();
              break;
            case 'dark':
              // Angular shape for dark movies
              const cutSize = Math.min(halfWidth, halfHeight) * 0.3;
              ctx.moveTo(-halfWidth + cutSize, -halfHeight);
              ctx.lineTo(halfWidth - cutSize, -halfHeight);
              ctx.lineTo(halfWidth, 0);
              ctx.lineTo(halfWidth - cutSize, halfHeight);
              ctx.lineTo(-halfWidth + cutSize, halfHeight);
              ctx.lineTo(-halfWidth, 0);
              ctx.closePath();
              break;
            case 'animation':
              // Rounded rectangle for animation
              const radius = Math.min(halfWidth, halfHeight) * 0.4;
              ctx.roundRect(-halfWidth, -halfHeight, this.width, this.height, radius);
              break;
            case 'magic':
              // Hexagon for magical movies
              for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x = halfWidth * 0.9 * Math.cos(angle);
                const y = halfHeight * 0.9 * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.closePath();
              break;
            default:
              // Standard rectangle for most titles
              ctx.rect(-halfWidth, -halfHeight, this.width, this.height);
          }
        } else {
          // Logo shapes (existing logic)
          switch (this.item.style) {
            case 'shield': // WB style
              ctx.moveTo(0, -halfHeight);
              ctx.lineTo(halfWidth * 0.8, -halfHeight * 0.6);
              ctx.lineTo(halfWidth, 0);
              ctx.lineTo(halfWidth * 0.8, halfHeight * 0.6);
              ctx.lineTo(0, halfHeight);
              ctx.lineTo(-halfWidth * 0.8, halfHeight * 0.6);
              ctx.lineTo(-halfWidth, 0);
              ctx.lineTo(-halfWidth * 0.8, -halfHeight * 0.6);
              ctx.closePath();
              break;
            case 'mountain': // Paramount style
              ctx.moveTo(0, -halfHeight);
              ctx.lineTo(halfWidth * 0.7, -halfHeight * 0.3);
              ctx.lineTo(halfWidth, halfHeight);
              ctx.lineTo(-halfWidth, halfHeight);
              ctx.lineTo(-halfWidth * 0.7, -halfHeight * 0.3);
              ctx.closePath();
              break;
            case 'globe': // Universal style
              ctx.arc(0, 0, Math.min(halfWidth, halfHeight), 0, Math.PI * 2);
              break;
            case 'rounded': // Pixar style
              const radius = Math.min(halfWidth, halfHeight) * 0.3;
              ctx.roundRect(-halfWidth, -halfHeight, this.width, this.height, radius);
              break;
            case 'dreamy': // DreamWorks style - cloud-like shape
              ctx.moveTo(-halfWidth, 0);
              ctx.quadraticCurveTo(-halfWidth, -halfHeight, 0, -halfHeight);
              ctx.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, 0);
              ctx.quadraticCurveTo(halfWidth, halfHeight, 0, halfHeight);
              ctx.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, 0);
              break;
            case 'space': // Lucasfilm style - hexagon
              for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x = halfWidth * 0.8 * Math.cos(angle);
                const y = halfHeight * 0.8 * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.closePath();
              break;
            default: // Rectangle for most logos
              ctx.rect(-halfWidth, -halfHeight, this.width, this.height);
          }
        }
        
        if (strokeOnly) {
          ctx.stroke();
        } else {
          ctx.fill();
        }
      }

      drawItemDecorations(ctx, opacity) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        // Different decorations for logos vs titles
        if (this.item.type === 'logo') {
          switch (this.item.name) {
            case 'MARVEL':
              // Small red accent lines
              ctx.strokeStyle = `rgba(237, 29, 36, ${opacity * 0.8})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(-halfWidth * 0.8, halfHeight * 0.7);
              ctx.lineTo(halfWidth * 0.8, halfHeight * 0.7);
              ctx.stroke();
              break;
            case 'DISNEY':
              // Small stars
              ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
              for (let i = 0; i < 3; i++) {
                const x = (Math.random() - 0.5) * this.width * 0.6;
                const y = (Math.random() - 0.5) * this.height * 0.6;
                this.drawStar(ctx, x, y, 3);
              }
              break;
            case 'UNIVERSAL':
              // Globe lines
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
              ctx.lineWidth = 1;
              for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(0, 0, halfHeight * 0.3 + i * 8, 0, Math.PI * 2);
                ctx.stroke();
              }
              break;
            case 'LUCASFILM':
              // Star field
              ctx.fillStyle = `rgba(255, 215, 0, ${opacity * 0.7})`;
              for (let i = 0; i < 5; i++) {
                const x = (Math.random() - 0.5) * this.width * 0.8;
                const y = (Math.random() - 0.5) * this.height * 0.8;
                this.drawStar(ctx, x, y, 2);
              }
              break;
          }
        } else {
          // Movie title decorations
          switch (this.item.style) {
            case 'action':
              // Explosion effect
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
              ctx.lineWidth = 2;
              for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                ctx.beginPath();
                ctx.moveTo(halfWidth * 0.3 * Math.cos(angle), halfHeight * 0.3 * Math.sin(angle));
                ctx.lineTo(halfWidth * 0.8 * Math.cos(angle), halfHeight * 0.8 * Math.sin(angle));
                ctx.stroke();
              }
              break;
            case 'space':
              // Space stars
              ctx.fillStyle = `rgba(255, 215, 0, ${opacity * 0.8})`;
              for (let i = 0; i < 4; i++) {
                const x = (Math.random() - 0.5) * this.width * 0.7;
                const y = (Math.random() - 0.5) * this.height * 0.7;
                this.drawStar(ctx, x, y, 2);
              }
              break;
            case 'magic':
              // Magical sparkles
              ctx.fillStyle = `rgba(255, 215, 0, ${opacity * 0.7})`;
              for (let i = 0; i < 6; i++) {
                const x = (Math.random() - 0.5) * this.width * 0.8;
                const y = (Math.random() - 0.5) * this.height * 0.8;
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
            case 'hero':
              // Hero emblem
              ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.6})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(0, 0, halfHeight * 0.4, 0, Math.PI * 2);
              ctx.stroke();
              break;
            case 'dark':
              // Dark energy lines
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
              ctx.lineWidth = 1;
              for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                const startX = (Math.random() - 0.5) * this.width * 0.6;
                const startY = (Math.random() - 0.5) * this.height * 0.6;
                const endX = (Math.random() - 0.5) * this.width * 0.6;
                const endY = (Math.random() - 0.5) * this.height * 0.6;
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
              }
              break;
            case 'animation':
              // Playful dots
              ctx.fillStyle = `rgba(255, 192, 203, ${opacity * 0.7})`;
              for (let i = 0; i < 5; i++) {
                const x = (Math.random() - 0.5) * this.width * 0.6;
                const y = (Math.random() - 0.5) * this.height * 0.6;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
          }
        }
      }

      drawStar(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const x1 = Math.cos(angle) * size;
          const y1 = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(x1, y1);
          else ctx.lineTo(x1, y1);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
          ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
          : '255, 255, 255';
      }
    }

    // Create floating movie items (logos and titles)
    for (let i = 0; i < itemCount; i++) {
      items.push(new FloatingItem(this));
    }

    const animate = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Sort items by opacity for proper layering
      items.sort((a, b) => a.opacity - b.opacity);

      items.forEach(item => {
        item.update();
        item.draw();
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  // Theatre Lights Animation - Frame Layout with Dark Red Theme
  initTheatreLights() {
    const lights = [];
    const lightSize = 60;

    class TheatreLight {
      constructor(manager, x, y, index, position) {
        this.manager = manager;
        this.x = x;
        this.y = y;
        this.index = index;
        this.position = position; // 'top', 'bottom', 'left', 'right'
        this.baseSize = lightSize;
        this.size = this.baseSize;
        this.brightness = 0.2;
        this.targetBrightness = 0.2;
        this.maxBrightness = 1.0; // Increased maximum brightness
        this.isActive = false;
        this.chasingPhase = 0;
        
        // Theatre-themed warm colors with higher intensity
        this.colors = [
          { r: 255, g: 240, b: 200 }, // Bright warm white
          { r: 255, g: 220, b: 160 }, // Bright amber
          { r: 255, g: 250, b: 180 }, // Bright golden white
          { r: 255, g: 200, b: 140 }  // Bright deep amber
        ];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // Chasing effect properties
        this.chaseSpeed = 0.05; // Speed of the chase effect
        this.chaseWidth = 3; // Number of lights that are bright at once
        this.totalLights = 0; // Will be set by the manager
        
        // Smooth transition properties
        this.transitionSpeed = 0.15; // Faster transitions for responsive chasing
        
        // Flicker effect (reduced for cleaner chasing)
        this.flickerIntensity = 0;
        this.maxFlicker = 0.05; // Reduced flicker for cleaner effect
      }

      update() {
        // Rotational chasing effect calculation
        this.chasingPhase += this.chaseSpeed;
        
        // Calculate position in the rotational chase sequence
        const chasePosition = this.chasingPhase % this.totalLights;
        
        // Determine if this light should be active in the current chase
        let chaseIntensity = 0;
        
        // Create a smooth rotating wave effect
        const distanceFromChase = Math.min(
          Math.abs(chasePosition - this.index),
          Math.abs(chasePosition - this.index + this.totalLights),
          Math.abs(chasePosition - this.index - this.totalLights)
        );
        
        if (distanceFromChase <= this.chaseWidth) {
          // Smooth falloff for chasing effect - creates a wave
          chaseIntensity = Math.cos((distanceFromChase / this.chaseWidth) * Math.PI * 0.5);
          chaseIntensity = Math.pow(chaseIntensity, 0.6); // Adjust curve for better visual effect
        }
        
        // Set target brightness based on chase intensity
        this.targetBrightness = 0.1 + (chaseIntensity * this.maxBrightness);
        
        // Smooth brightness transition
        this.brightness += (this.targetBrightness - this.brightness) * this.transitionSpeed;
        
        // Add subtle flicker only when bright
        if (this.brightness > 0.6) {
          this.flickerIntensity = Math.sin(Date.now() * 0.01 + this.index) * this.maxFlicker;
        } else {
          this.flickerIntensity = 0;
        }
        
        // Update size based on brightness for visual impact
        this.size = this.baseSize * (0.8 + this.brightness * 0.4);
      }

      draw() {
        const ctx = this.manager.ctx;
        const finalBrightness = Math.max(0, Math.min(1, this.brightness + this.flickerIntensity));
        
        // Theatre light housing (darker, more vintage)
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Outer housing with vintage theatre styling
        const housingGradient = ctx.createRadialGradient(0, 0, this.size * 0.2, 0, 0, this.size * 0.7);
        housingGradient.addColorStop(0, `rgba(60, 40, 30, 0.9)`);
        housingGradient.addColorStop(0.7, `rgba(40, 25, 20, 0.8)`);
        housingGradient.addColorStop(1, `rgba(20, 15, 10, 0.6)`);
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = housingGradient;
        ctx.fill();
        
        // Dark red theatre rim
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(120, 20, 20, 0.8)`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Inner bulb with enhanced brightness and warm theatre glow
        const bulbGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.55);
        const alpha = finalBrightness;
        
        // Brighter color values for enhanced visibility
        const brightR = Math.min(255, this.color.r + (finalBrightness * 50));
        const brightG = Math.min(255, this.color.g + (finalBrightness * 30));
        const brightB = Math.min(255, this.color.b + (finalBrightness * 20));
        
        bulbGradient.addColorStop(0, `rgba(${brightR}, ${brightG}, ${brightB}, ${alpha})`);
        bulbGradient.addColorStop(0.6, `rgba(${brightR}, ${brightG}, ${brightB}, ${alpha * 0.8})`);
        bulbGradient.addColorStop(1, `rgba(${brightR}, ${brightG}, ${brightB}, ${alpha * 0.3})`);
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = bulbGradient;
        ctx.fill();
        
        // Enhanced warm glow effect with increased brightness
        if (finalBrightness > 0.3) {
          const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2.2);
          const glowAlpha = finalBrightness * 0.7; // Increased glow intensity
          glowGradient.addColorStop(0, `rgba(${brightR}, ${brightG * 0.9}, ${brightB * 0.7}, ${glowAlpha})`);
          glowGradient.addColorStop(0.3, `rgba(${brightR}, ${brightG * 0.8}, ${brightB * 0.6}, ${glowAlpha * 0.6})`);
          glowGradient.addColorStop(0.7, `rgba(${brightR}, ${brightG * 0.7}, ${brightB * 0.5}, ${glowAlpha * 0.2})`);
          glowGradient.addColorStop(1, `rgba(${brightR}, ${brightG * 0.6}, ${brightB * 0.4}, 0)`);
          
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }
        
        // Vintage reflective highlight
        ctx.beginPath();
        ctx.arc(-this.size * 0.25, -this.size * 0.25, this.size * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${0.4 + finalBrightness * 0.3})`;
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Create frame of theatre lights around the perimeter in rotational order
    const margin = lightSize;
    const spacing = 120;
    
    // Calculate positions for rotational chasing effect
    const perimeterLights = [];
    
    // Top row (left to right)
    const topCount = Math.floor(this.width / spacing);
    for (let i = 0; i < topCount; i++) {
      const x = (i + 0.5) * (this.width / topCount);
      const y = margin;
      perimeterLights.push({ x, y, position: 'top' });
    }
    
    // Right column (top to bottom, excluding top corner)
    const rightCount = Math.floor((this.height - margin * 4) / spacing);
    for (let i = 0; i < rightCount; i++) {
      const x = this.width - margin;
      const y = margin * 2 + (i + 0.5) * ((this.height - margin * 4) / rightCount);
      perimeterLights.push({ x, y, position: 'right' });
    }
    
    // Bottom row (right to left)
    const bottomCount = Math.floor(this.width / spacing);
    for (let i = bottomCount - 1; i >= 0; i--) {
      const x = (i + 0.5) * (this.width / bottomCount);
      const y = this.height - margin;
      perimeterLights.push({ x, y, position: 'bottom' });
    }
    
    // Left column (bottom to top, excluding corners)
    const leftCount = Math.floor((this.height - margin * 4) / spacing);
    for (let i = leftCount - 1; i >= 0; i--) {
      const x = margin;
      const y = margin * 2 + (i + 0.5) * ((this.height - margin * 4) / leftCount);
      perimeterLights.push({ x, y, position: 'left' });
    }
    
    // Create lights in rotational order
    perimeterLights.forEach((lightData, index) => {
      lights.push(new TheatreLight(this, lightData.x, lightData.y, index, lightData.position));
    });

    // Set total light count for chasing effect
    lights.forEach(light => {
      light.totalLights = lights.length;
    });

    const animate = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Dark red theatre curtain background
      const bgGradient = this.ctx.createRadialGradient(
        this.width / 2, this.height / 2, 0,
        this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.8
      );
      bgGradient.addColorStop(0, 'rgba(40, 15, 15, 0.4)');
      bgGradient.addColorStop(0.6, 'rgba(60, 20, 20, 0.6)');
      bgGradient.addColorStop(1, 'rgba(20, 8, 8, 0.8)');
      
      this.ctx.fillStyle = bgGradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      // Add subtle theatre curtain texture
      const curtainGradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
      curtainGradient.addColorStop(0, 'rgba(80, 25, 25, 0.1)');
      curtainGradient.addColorStop(0.2, 'rgba(120, 35, 35, 0.15)');
      curtainGradient.addColorStop(0.4, 'rgba(80, 25, 25, 0.1)');
      curtainGradient.addColorStop(0.6, 'rgba(120, 35, 35, 0.15)');
      curtainGradient.addColorStop(0.8, 'rgba(80, 25, 25, 0.1)');
      curtainGradient.addColorStop(1, 'rgba(120, 35, 35, 0.15)');
      
      this.ctx.fillStyle = curtainGradient;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Update and draw all lights
      lights.forEach(light => {
        light.update();
        light.draw();
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resizeHandler);
  }
}

// Export for use in main script
window.BackgroundAnimationManager = BackgroundAnimationManager;
