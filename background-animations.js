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

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resizeHandler);
  }
}

// Export for use in main script
window.BackgroundAnimationManager = BackgroundAnimationManager;
