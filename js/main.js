class BirthdayApp {
    constructor() {
        this.sections = new SectionController(this);
        this.audio = new AudioController();
        this.particles = {};
        this.currentScreen = 'opening-screen';
        this.magicBurstTimer = null;
        this.magicSound = new Audio('assets/audio/magic-wand-burst.mp3');
        this.magicSound.preload = 'auto';
        this.magicSound.volume = 0.45;
    }

    init() {
        this.applyTheme();
        
        this.sections.initOpening();
        this.sections.initReveal();
        this.sections.initCake();
        this.sections.initMemories();
        this.sections.initGallery();
        this.sections.initReasons();
        this.sections.initSurprise();
        this.sections.initLetter();
        this.sections.initFinal();

        this.ensureMagicOverlay();

        if (document.getElementById('particles-canvas')) {
            this.particles.opening = new ParticleSystem('particles-canvas');
            this.particles.opening.start();
        }
        if (document.getElementById('reveal-particles')) {
            this.particles.reveal = new ParticleSystem('reveal-particles', { color: 'rgba(255,215,0,0.6)' });
        }
        if (document.getElementById('final-particles')) {
            this.particles.final = new ParticleSystem('final-particles', { color: 'rgba(255,192,203,0.6)', count: 80 });
        }

        this.setupEventListeners();
        this.setupScrollObserver();
    }

    applyTheme() {
        if (!window.birthdayData || !window.birthdayData.theme) return;
        const root = document.documentElement;
        const theme = window.birthdayData.theme;
        
        if (theme.primaryBg) root.style.setProperty('--bg-primary', theme.primaryBg);
        if (theme.secondaryBg) root.style.setProperty('--bg-secondary', theme.secondaryBg);
        if (theme.accent) root.style.setProperty('--accent', theme.accent);
        if (theme.accentPink) root.style.setProperty('--accent-pink', theme.accentPink);
        if (theme.textPrimary) root.style.setProperty('--text-primary', theme.textPrimary);
        if (theme.textSecondary) root.style.setProperty('--text-secondary', theme.textSecondary);
        if (theme.gold) root.style.setProperty('--gold', theme.gold);
    }

    ensureMagicOverlay() {
        const openingScreen = document.getElementById('opening-screen');
        if (!openingScreen || document.getElementById('magic-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'magic-overlay';
        overlay.className = 'magic-overlay';
        openingScreen.appendChild(overlay);
    }

    triggerMagicBurst() {
        const overlay = document.getElementById('magic-overlay');
        const seal = document.querySelector('.opening-seal');
        if (!overlay || !seal) return;

        if (this.magicBurstTimer) {
            clearTimeout(this.magicBurstTimer);
        }
        seal.classList.remove('magic-activated');
        void seal.offsetWidth;
        seal.classList.add('magic-activated');

        overlay.classList.remove('active');
        overlay.style.opacity = '0';
        overlay.style.filter = 'brightness(0.8)';
        overlay.innerHTML = '';
        void overlay.offsetWidth;
        overlay.classList.add('active');
        overlay.style.opacity = '1';
        overlay.style.filter = 'brightness(1)';

        for (let i = 0; i < 46; i++) {
            const particle = document.createElement('span');
            particle.className = 'magic-particle';
            const angle = (Math.PI * 2 * i) / 70;
            const radius = 76 + Math.random() * 170;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius - 40;
            const size = 4 + Math.random() * 9;
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.setProperty('--dx', `${dx}px`);
            particle.style.setProperty('--dy', `${dy}px`);
            particle.style.animationDelay = `${(i % 10) * 0.01}s`;
            particle.style.transform = 'translate(-50%, -50%)';
            overlay.appendChild(particle);
        }

        this.magicBurstTimer = setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.filter = 'brightness(0.8)';
            setTimeout(() => {
                overlay.classList.remove('active');
                overlay.innerHTML = '';
            }, 650);
        }, 850);

        this.playMagicSound();
    }

    playMagicSound() {
        this.magicSound.currentTime = 0;
        this.magicSound.play().catch(() => {});
    }

    setupEventListeners() {
        const seal = document.querySelector('.opening-seal');
        if (seal) {
            seal.addEventListener('click', () => this.triggerMagicBurst());
        }

        const btnOpen = document.getElementById('open-surprise-btn');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => {
                this.audio.enable();
                this.transitionTo('birthday-reveal');
            });
        }

        const btnEnv = document.getElementById('open-envelope-btn');
        if (btnEnv) {
            btnEnv.addEventListener('click', () => {
                this.sections.openEnvelope();
                setTimeout(() => this.transitionTo('letter-section'), 1200);
            });
        }

        const continueBtn = document.getElementById('letter-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.transitionTo('final-screen'));
        }
    }

    transitionTo(targetId) {
        const currentEl = document.getElementById(this.currentScreen);
        const targetEl = document.getElementById(targetId);
        
        if (!currentEl || !targetEl) return;

        if (this.currentScreen === 'cake-section') {
            this.sections.stopBlowDetection();
        }

        currentEl.style.opacity = '0';
        currentEl.style.transform = 'translateY(-20px)';
        currentEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        setTimeout(() => {
            currentEl.classList.remove('active');
            currentEl.style.transform = '';
            currentEl.style.opacity = '';
            
            targetEl.classList.add('active');
            targetEl.style.opacity = '0';
            targetEl.style.transform = 'translateY(20px)';
            targetEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            // trigger reflow
            void targetEl.offsetWidth;
            
            targetEl.style.opacity = '1';
            targetEl.style.transform = 'translateY(0)';
            
            this.currentScreen = targetId;
            this.updateJourney(targetId);
            this.audio.switchTo(this.trackForScreen(targetId));

            if (targetId === 'birthday-reveal') {
                if (this.particles.opening) this.particles.opening.stop();
                if (this.particles.reveal) this.particles.reveal.start();
                this.sections.playReveal();
            } else if (targetId === 'cake-section') {
                if (this.particles.reveal) this.particles.reveal.stop();
                this.sections.playCake();
            } else if (targetId === 'letter-section') {
                document.body.style.overflow = 'hidden';
                document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
                const surpriseSection = document.getElementById('surprise-section');
                if (surpriseSection) surpriseSection.style.display = 'none';
                this.sections.playLetter();
            } else if (targetId === 'final-screen') {
                if (this.particles.final) this.particles.final.start();
                this.sections.playFinal();
            }
        }, 600);
    }

    switchToScrollMode() {
        const cakeSection = document.getElementById('cake-section');
        const sections = document.querySelectorAll('.section');
        const surpriseSection = document.getElementById('surprise-section');
        
        if (cakeSection) {
            cakeSection.style.opacity = '0';
            cakeSection.style.transition = 'opacity 0.6s ease';
            setTimeout(() => {
                cakeSection.classList.remove('active');
                cakeSection.style.opacity = '';
                
                // Show scrollable sections
                sections.forEach(sec => {
                    sec.style.display = 'block';
                });
                if (surpriseSection) {
                    surpriseSection.style.display = 'flex';
                }
                
                document.body.style.overflow = 'auto';
                this.updateJourney('memories-section');
                
            }, 600);
        }
    }

    updateJourney(activeId) {
        const steps = document.querySelectorAll('.journey-step');
        const activeStep = document.querySelector(`.journey-step[data-step="${activeId}"]`);
        const activeIndex = activeStep ? [...steps].indexOf(activeStep) : 0;

        steps.forEach((step, index) => {
            step.classList.toggle('active', index === activeIndex);
            step.classList.toggle('complete', index < activeIndex);
        });
    }

    trackForScreen(screenId) {
        const tracks = {
            'opening-screen': 'opening',
            'birthday-reveal': 'reveal',
            'cake-section': 'cake',
            'memories-section': 'memories',
            'gallery-section': 'gallery',
            'reasons-section': 'memories',
            'surprise-section': 'surprise',
            'letter-section': 'letter',
            'final-screen': 'final'
        };
        return tracks[screenId] || 'opening';
    }

    setupScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    if (entry.target.id === 'surprise-section') {
                        this.sections.playSurprise();
                    }
                    const step = entry.target.closest('.section, .screen');
                    if (step && document.body.style.overflow !== 'hidden') {
                        this.updateJourney(step.id);
                        this.audio.switchTo(this.trackForScreen(step.id));
                    }
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.memory-card, .gallery-item, .reason-item, #surprise-section').forEach(el => {
            observer.observe(el);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new BirthdayApp();
    app.init();
});
