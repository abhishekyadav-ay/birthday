class ParticleSystem {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.options = {
            count: options.count || 50,
            color: options.color || 'rgba(232,168,124,0.6)',
            minSize: options.minSize || 1,
            maxSize: options.maxSize || 3,
            speed: options.speed || 0.3,
            direction: options.direction || 'up',
            glow: options.glow !== undefined ? options.glow : true,
            connected: options.connected || false
        };
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;

        this.handleResize = this.resize.bind(this);
        window.addEventListener('resize', this.handleResize);
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else if (this.isRunning) {
                this.start();
            }
        });

        this.resize();
        this.initParticles();
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth || window.innerWidth;
        this.canvas.height = parent.clientHeight || window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: this.options.direction === 'up' ? -this.options.speed * (Math.random() * 0.5 + 0.5) : this.options.speed * (Math.random() * 0.5 + 0.5),
            opacity: Math.random() * 0.6 + 0.2,
            life: 0,
            maxLife: Math.random() * 100 + 50,
            angle: Math.random() * Math.PI * 2
        };
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.speedX + Math.sin(p.angle) * 0.2;
            p.y += p.speedY;
            p.life++;
            p.angle += 0.02;

            if (p.life >= p.maxLife) {
                p.opacity -= 0.02;
            } else if (p.opacity < 0.8) {
                p.opacity += 0.01;
            }

            if (p.opacity <= 0 || p.y < -10 || p.y > this.canvas.height + 10 || p.x < -10 || p.x > this.canvas.width + 10) {
                Object.assign(p, this.createParticle());
                p.y = this.options.direction === 'up' ? this.canvas.height + 5 : -5;
                p.life = 0;
                p.opacity = 0;
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.options.glow) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.options.color;
        }

        this.ctx.fillStyle = this.options.color;
        
        this.particles.forEach(p => {
            this.ctx.globalAlpha = Math.max(0, p.opacity);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }

    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.loop.bind(this));
    }

    start() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            this.draw(); 
            return;
        }
        
        this.isRunning = true;
        if (!this.animationId) {
            this.loop();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

class ConfettiSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#FFD700', '#FF69B4', '#FFC0CB', '#E6E6FA'];
        this.animationId = null;
        this.resize();
        
        window.addEventListener('resize', this.resize.bind(this));
    }
    
    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth || window.innerWidth;
        this.canvas.height = parent.clientHeight || window.innerHeight;
    }

    createConfetti() {
        return {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2 + 50,
            w: Math.random() * 8 + 4,
            h: Math.random() * 8 + 4,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            speedX: (Math.random() - 0.5) * 15,
            speedY: Math.random() * -15 - 5,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10,
            gravity: 0.5,
            life: 255
        };
    }

    start() {
        for (let i = 0; i < 60; i++) {
            this.particles.push(this.createConfetti());
        }
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles.forEach(p => {
                p.x = Math.random() * this.canvas.width;
                p.y = Math.random() * this.canvas.height;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, p.w, p.h);
            });
            return;
        }

        this.loop();
        
        setTimeout(() => this.stop(), 3000);
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        let alive = false;
        
        this.particles.forEach(p => {
            if (p.life <= 0) return;
            alive = true;
            
            p.speedY += p.gravity;
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotSpeed;
            p.life -= 2;
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.life / 255);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            this.ctx.restore();
        });
        
        if (alive) {
            this.animationId = requestAnimationFrame(this.loop.bind(this));
        } else {
            this.stop();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
