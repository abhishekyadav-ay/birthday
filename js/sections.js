class SectionController {
    constructor(app) {
        this.app = app;
        this.blownCandles = 0;
        this.currentLightboxIndex = 0;
        this.microphoneStream = null;
        this.microphoneContext = null;
        this.microphoneFrame = null;
        this.blowStartedAt = 0;
        this.celebrationStarted = false;
    }

    // --- SECTION 1: Opening ---
    initOpening() {
        const textEl = document.getElementById('opening-text');
        const btnEl = document.getElementById('open-surprise-btn');
        if (textEl && window.birthdayData) textEl.textContent = birthdayData.openingText;
        if (btnEl && window.birthdayData) btnEl.textContent = birthdayData.openButtonText;
        
        setTimeout(() => {
            if (textEl) {
                textEl.classList.add('fade-in');
                const text = textEl.textContent;
                textEl.textContent = '';
                
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                
                if (prefersReducedMotion) {
                    textEl.textContent = text;
                } else {
                    [...text].forEach((char, i) => {
                        const span = document.createElement('span');
                        span.innerHTML = char === ' ' ? '&nbsp;' : char;
                        span.style.animationDelay = `${i * 0.05}s`;
                        span.className = 'char-reveal';
                        textEl.appendChild(span);
                    });
                }
            }
            setTimeout(() => {
                if (btnEl) btnEl.classList.add('fade-in');
            }, 1500);
        }, 500);
    }

    // --- SECTION 2: Birthday Reveal ---
    initReveal() {
        const preEl = document.getElementById('reveal-pre');
        const nameEl = document.getElementById('reveal-name');
        const subEl = document.getElementById('reveal-sub');
        if (preEl && window.birthdayData) preEl.textContent = birthdayData.revealPreText;
        if (nameEl && window.birthdayData) nameEl.textContent = birthdayData.herName;
        if (subEl && window.birthdayData) subEl.textContent = birthdayData.revealSubText;
    }

    playReveal() {
        const preEl = document.getElementById('reveal-pre');
        const nameEl = document.getElementById('reveal-name');
        const subEl = document.getElementById('reveal-sub');
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        setTimeout(() => {
            if (preEl) preEl.classList.add('fade-in');
        }, 300);

        setTimeout(() => {
            if (nameEl && !prefersReducedMotion) {
                const text = nameEl.textContent;
                nameEl.textContent = '';
                [...text].forEach((char, i) => {
                    const span = document.createElement('span');
                    span.innerHTML = char === ' ' ? '&nbsp;' : char;
                    span.style.animationDelay = `${i * 0.1}s`;
                    span.className = 'char-reveal-gold'; 
                    nameEl.appendChild(span);
                });
            } else if (nameEl) {
                nameEl.classList.add('fade-in');
            }
        }, 800);

        setTimeout(() => {
            if (subEl) subEl.classList.add('fade-in');
        }, nameEl && !prefersReducedMotion ? 800 + nameEl.textContent.length * 100 + 500 : 2000);

        setTimeout(() => {
            this.app.transitionTo('cake-section');
        }, 4000);
    }

    // --- SECTION 3: Cake ---
    initCake() {
        const textEl = document.getElementById('cake-text');
        const msgEl = document.getElementById('cake-message');
        const rowEl = document.getElementById('candles-row');
        
        if (textEl && window.birthdayData) textEl.textContent = birthdayData.cakeText;
        if (msgEl && window.birthdayData) msgEl.textContent = birthdayData.cakeMessage;
        
        if (rowEl && window.birthdayData) {
            rowEl.innerHTML = '';
            for (let i = 0; i < birthdayData.candleCount; i++) {
                const candle = document.createElement('div');
                candle.className = 'candle';
                candle.innerHTML = `<div class="candle-flame"></div><div class="candle-smoke"></div>`;
                rowEl.appendChild(candle);
            }
        }
        this.blownCandles = 0;
    }

    playCake() {
        const textEl = document.getElementById('cake-text');
        const cake = document.querySelector('.cake');
        const permissionEl = document.getElementById('cake-permission');
        if (textEl) textEl.classList.add('fade-in');
        if (cake) cake.classList.add('scale-in');
        this.celebrationStarted = false;
        if (permissionEl) permissionEl.textContent = 'A small moment of magic is ready.';
        this.startBlowDetection();
        
        const candles = document.querySelectorAll('.candle');
        candles.forEach(candle => {
            candle.addEventListener('click', () => this.blowCandle(candle), { once: true });
        });
    }

    async startBlowDetection() {
        const permissionEl = document.getElementById('cake-permission');
        if (!navigator.mediaDevices?.getUserMedia) {
            if (permissionEl) permissionEl.textContent = 'A small moment of magic is ready.';
            return;
        }

        if (permissionEl) permissionEl.textContent = 'A small moment of magic is ready.';

        try {
            this.microphoneStream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });

            if (this.celebrationStarted) {
                this.stopBlowDetection();
                return;
            }

            const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextCtor) return;
            this.microphoneContext = new AudioContextCtor();
            const source = this.microphoneContext.createMediaStreamSource(this.microphoneStream);
            const analyser = this.microphoneContext.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.72;
            source.connect(analyser);
            const samples = new Uint8Array(analyser.fftSize);

            const monitor = () => {
                if (!this.microphoneStream || this.celebrationStarted) return;
                analyser.getByteTimeDomainData(samples);
                let sum = 0;
                for (const sample of samples) {
                    const normalized = (sample - 128) / 128;
                    sum += normalized * normalized;
                }
                const volume = Math.sqrt(sum / samples.length);
                const now = performance.now();
                if (volume > 0.14) {
                    if (!this.blowStartedAt) this.blowStartedAt = now;
                    if (now - this.blowStartedAt >= 90) {
                        this.blowOutCandles();
                        return;
                    }
                } else if (now - this.blowStartedAt > 180) {
                    this.blowStartedAt = 0;
                }
                this.microphoneFrame = requestAnimationFrame(monitor);
            };
            monitor();
        } catch (error) {
            if (permissionEl) permissionEl.textContent = 'A small moment of magic is ready.';
            this.stopBlowDetection();
        }
    }

    stopBlowDetection() {
        if (this.microphoneFrame) cancelAnimationFrame(this.microphoneFrame);
        this.microphoneFrame = null;
        if (this.microphoneStream) {
            this.microphoneStream.getTracks().forEach(track => track.stop());
        }
        this.microphoneStream = null;
        if (this.microphoneContext) {
            this.microphoneContext.close().catch(() => {});
        }
        this.microphoneContext = null;
        this.blowStartedAt = 0;
    }

    blowOutCandles() {
        if (this.celebrationStarted) return;
        this.celebrationStarted = true;
        document.querySelectorAll('.candle').forEach(candle => this.blowCandle(candle));
        this.stopBlowDetection();
    }

    blowCandle(candleEl) {
        if (candleEl.classList.contains('blown')) return;
        const flame = candleEl.querySelector('.candle-flame');
        const smoke = candleEl.querySelector('.candle-smoke');
        candleEl.classList.add('blown');
        if (flame) flame.classList.add('blown');
        if (smoke) smoke.classList.add('active');
        
        this.blownCandles++;
        if (this.blownCandles >= window.birthdayData.candleCount) {
            this.triggerCelebration();
        }
    }

    triggerCelebration() {
        this.stopBlowDetection();
        const partySound = window.birthdayData?.partySound;
        if (partySound) {
            const audio = new Audio(partySound);
            audio.preload = 'auto';
            audio.currentTime = 0;
            audio.volume = 0.55;
            audio.play().catch(() => {});
        }
        document.body.style.backgroundColor = '#111';
        setTimeout(() => {
            document.body.style.backgroundColor = '';
        }, 300);

        const confetti = new ConfettiSystem('confetti-canvas');
        confetti.start();

        const msgEl = document.getElementById('cake-message');
        if (msgEl) msgEl.classList.add('visible');

        setTimeout(() => {
            this.app.switchToScrollMode();
        }, 1800);
    }

    // --- SECTION 4: Memories ---
    initMemories() {
        const titleEl = document.getElementById('memories-title');
        const container = document.getElementById('timeline-container');
        
        if (titleEl && window.birthdayData) titleEl.textContent = birthdayData.memoriesTitle;
        if (container && window.birthdayData && window.birthdayData.memories) {
            container.innerHTML = birthdayData.memories.map(memory => `
                <div class="memory-card">
                    <div class="memory-image-wrapper">
                        <img class="memory-image" src="${memory.image}" alt="${memory.title}" loading="lazy" onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
                    </div>
                    <div class="memory-info">
                        <span class="memory-number">${memory.number}</span>
                        <h3 class="memory-title">${memory.title}</h3>
                        <span class="memory-date">${memory.date}</span>
                        <p class="memory-desc">${memory.description}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    // --- SECTION 5: Gallery ---
    initGallery() {
        const titleEl = document.getElementById('gallery-title');
        const container = document.getElementById('gallery-container');
        
        if (titleEl && window.birthdayData) titleEl.textContent = birthdayData.galleryTitle;
        if (container && window.birthdayData && window.birthdayData.gallery) {
            container.innerHTML = birthdayData.gallery.map((item, i) => {
                const randomRotation = (Math.random() * 6 - 3).toFixed(2);
                const randomTapeRotation = (Math.random() * 10 - 5).toFixed(2);
                return `
                    <div class="gallery-item" style="--rotate: ${randomRotation}deg; --tape-rotate: ${randomTapeRotation}deg" data-index="${i}">
                        <div class="gallery-tape"></div>
                        <img src="${item.image}" alt="${item.caption}" loading="lazy" onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
                    </div>
                `;
            }).join('');
            
            container.querySelectorAll('.gallery-item').forEach((item, index) => {
                item.addEventListener('click', () => this.openLightbox(index));
            });
        }
        this.initLightboxControls();
    }

    openLightbox(index) {
        this.currentLightboxIndex = index;
        const img = document.getElementById('lightbox-img');
        const caption = document.getElementById('lightbox-caption');
        const lightbox = document.getElementById('lightbox');
        
        if (img && window.birthdayData && window.birthdayData.gallery[index]) img.src = window.birthdayData.gallery[index].image;
        if (caption && window.birthdayData && window.birthdayData.gallery[index]) caption.textContent = window.birthdayData.gallery[index].caption;
        if (lightbox) lightbox.classList.add('active');
        
        document.body.style.overflow = 'hidden';
        
        this.keydownHandler = (e) => {
            if (e.key === 'Escape') this.closeLightbox();
            else if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
            else if (e.key === 'ArrowRight') this.navigateLightbox(1);
        };
        document.addEventListener('keydown', this.keydownHandler);
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) lightbox.classList.remove('active');
        document.body.style.overflow = '';
        if (this.keydownHandler) document.removeEventListener('keydown', this.keydownHandler);
    }

    navigateLightbox(direction) {
        if (!window.birthdayData || !window.birthdayData.gallery || !window.birthdayData.gallery.length) return;
        this.currentLightboxIndex = (this.currentLightboxIndex + direction + window.birthdayData.gallery.length) % window.birthdayData.gallery.length;
        
        const img = document.getElementById('lightbox-img');
        const caption = document.getElementById('lightbox-caption');
        
        if (img) {
            img.style.opacity = '0.5';
            setTimeout(() => {
                img.src = window.birthdayData.gallery[this.currentLightboxIndex].image;
                if (caption) caption.textContent = window.birthdayData.gallery[this.currentLightboxIndex].caption;
                img.style.opacity = '1';
            }, 150);
        }
    }

    initLightboxControls() {
        const closeBtn = document.getElementById('lightbox-close');
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');
        const overlay = document.querySelector('.lightbox-overlay');
        
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeLightbox());
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.navigateLightbox(1));
        if (overlay) overlay.addEventListener('click', () => this.closeLightbox());
        
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            let touchStartX = 0;
            lightbox.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
            lightbox.addEventListener('touchend', e => {
                const touchEndX = e.changedTouches[0].screenX;
                if (touchEndX - touchStartX > 50) this.navigateLightbox(-1);
                if (touchStartX - touchEndX > 50) this.navigateLightbox(1);
            });
        }
    }

    // --- SECTION 6: Reasons ---
    initReasons() {
        const titleEl = document.getElementById('reasons-title');
        const container = document.getElementById('reasons-container');
        
        if (titleEl && window.birthdayData) titleEl.textContent = window.birthdayData.reasonsTitle;
        if (container && window.birthdayData && window.birthdayData.reasons) {
            container.innerHTML = window.birthdayData.reasons.map(reason => `
                <div class="reason-item">${reason}</div>
            `).join('');
        }
    }

    // --- SECTION 7: Surprise ---
    initSurprise() {
        const textEl = document.getElementById('surprise-text');
        const btnEl = document.getElementById('open-envelope-btn');
        
        if (textEl && window.birthdayData) textEl.textContent = window.birthdayData.surpriseText;
        if (btnEl && window.birthdayData) btnEl.textContent = window.birthdayData.surpriseButtonText;
    }

    playSurprise() {
        const textEl = document.getElementById('surprise-text');
        const envelope = document.getElementById('envelope-wrapper');
        const btn = document.getElementById('open-envelope-btn');
        
        if (textEl) textEl.classList.add('fade-in');
        if (envelope) envelope.classList.add('scale-in');
        
        setTimeout(() => {
            if (btn) btn.classList.add('fade-in');
        }, 1000);
    }

    openEnvelope() {
        const envelope = document.getElementById('envelope');
        if (envelope) envelope.classList.add('opened');
    }

    // --- SECTION 8: Letter ---
    initLetter() {
        const titleEl = document.getElementById('letter-title');
        const contentEl = document.getElementById('letter-content');
        
        if (titleEl && window.birthdayData) titleEl.textContent = window.birthdayData.letterTitle;
        if (contentEl && window.birthdayData && window.birthdayData.finalLetter) {
            contentEl.innerHTML = '';
            const lines = window.birthdayData.finalLetter.split('\n');
            lines.forEach(line => {
                const span = document.createElement('span');
                span.className = 'letter-line';
                span.innerHTML = line || '&nbsp;';
                contentEl.appendChild(span);
            });
        }
    }

    playLetter() {
        const titleEl = document.getElementById('letter-title');
        const continueBtn = document.getElementById('letter-continue-btn');
        if (titleEl) titleEl.classList.add('fade-in');
        if (continueBtn) {
            continueBtn.classList.remove('fade-in');
            continueBtn.setAttribute('aria-hidden', 'true');
        }
        
        const lines = document.querySelectorAll('.letter-line');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        lines.forEach((line, i) => {
            if (prefersReducedMotion) {
                line.classList.add('visible');
            } else {
                setTimeout(() => {
                    line.classList.add('visible');
                }, 200 * i);
            }
        });
        
        const revealDuration = prefersReducedMotion ? 300 : 200 * lines.length + 400;
        setTimeout(() => {
            if (continueBtn) {
                continueBtn.classList.add('fade-in');
                continueBtn.setAttribute('aria-hidden', 'false');
            }
        }, revealDuration);
    }

    // --- SECTION 9: Final ---
    initFinal() {
        const nameEl = document.getElementById('final-name');
        const quoteEl = document.getElementById('final-quote');
        const creditEl = document.getElementById('final-credit');
        
        if (nameEl && window.birthdayData) nameEl.textContent = window.birthdayData.herName;
        if (quoteEl && window.birthdayData) quoteEl.textContent = window.birthdayData.closingLine;
        if (creditEl && window.birthdayData) creditEl.textContent = "Made with love, by " + window.birthdayData.yourName;
    }

    playFinal() {
        const pre = document.querySelector('.final-pre');
        const nameEl = document.getElementById('final-name');
        const quoteEl = document.getElementById('final-quote');
        const creditEl = document.getElementById('final-credit');
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            if (pre) pre.classList.add('fade-in');
            if (nameEl) nameEl.classList.add('fade-in');
            if (quoteEl) quoteEl.classList.add('fade-in');
            if (creditEl) creditEl.classList.add('fade-in');
        } else {
            setTimeout(() => { if (pre) pre.classList.add('fade-in'); }, 300);
            setTimeout(() => { if (nameEl) nameEl.classList.add('fade-in'); }, 800);
            setTimeout(() => { if (quoteEl) quoteEl.classList.add('fade-in'); }, 1500);
            setTimeout(() => { if (creditEl) creditEl.classList.add('fade-in'); }, 2200);
        }
    }
}
