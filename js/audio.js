class AudioController {
    constructor() {
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.preload = 'auto';
        this.audio.setAttribute('playsinline', '');
        this.volume = 0.3;
        this.audio.volume = this.volume;
        this.currentTrack = '';
        this.isPlaying = false;
        this.userInteracted = false;
        this.fadeTimer = null;
        this.fadeDuration = 700;
        
        this.musicControl = document.getElementById('music-control');
        this.musicBtn = document.getElementById('music-btn');
        
        if (this.musicBtn) {
            this.musicBtn.addEventListener('click', () => this.toggle());
        }
        this.audio.addEventListener('ended', () => this.setButtonState(false));
        this.audio.addEventListener('error', () => this.setButtonState(false));
    }
    
    enable() {
        this.userInteracted = true;
        this.show();
        this.playTrack('opening', true);
    }

    toggle() {
        if (this.isPlaying) {
            this.audio.pause();
            this.setButtonState(false);
        } else {
            this.userInteracted = true;
            this.playTrack(this.currentTrack || 'opening', true);
        }
    }
    
    show() {
        if (this.musicControl) {
            this.musicControl.classList.add('visible');
        }
    }
    
    clampVolume(value) {
        return Math.min(1, Math.max(0, value));
    }

    playTrack(trackName, shouldPlay = this.isPlaying) {
        const tracks = window.birthdayData?.musicTracks || {};
        const source = tracks[trackName] || '';
        if (!source) {
            this.audio.pause();
            this.audio.removeAttribute('src');
            this.audio.load();
            this.currentTrack = '';
            this.setButtonState(false);
            return;
        }

        if (source === this.currentTrack) {
            if (shouldPlay && this.audio.src) this.playAudio();
            return;
        }

        this.audio.pause();
        this.audio.currentTime = 0;
        this.currentTrack = source;
        this.audio.src = new URL(source, document.baseURI).href;
        this.audio.load();
        this.audio.volume = this.clampVolume(this.volume);
        if (shouldPlay && this.userInteracted) this.playAudio();
    }

    playAudio() {
        if (!this.audio.src) {
            this.setButtonState(false);
            return;
        }

        this.audio.play()
            .then(() => this.setButtonState(true))
            .catch(() => this.setButtonState(false));
    }

    switchTo(trackName) {
        if (!this.userInteracted) return;
        const tracks = window.birthdayData?.musicTracks || {};
        const source = tracks[trackName] || '';
        if (!source) {
            this.audio.pause();
            this.setButtonState(false);
            return;
        }

        if (source === this.currentTrack) {
            if (this.audio.paused) this.playAudio();
            return;
        }

        if (this.fadeTimer) {
            cancelAnimationFrame(this.fadeTimer);
            this.fadeTimer = null;
        }

        const wasPlaying = this.isPlaying && !this.audio.paused;
        if (!wasPlaying) {
            this.playTrack(trackName, true);
            return;
        }

        const fadeStart = performance.now();
        const fadeOut = (timestamp) => {
            const progress = Math.min((timestamp - fadeStart) / this.fadeDuration, 1);
            this.audio.volume = this.clampVolume(this.volume * (1 - progress));
            if (progress < 1) {
                this.fadeTimer = requestAnimationFrame(fadeOut);
                return;
            }

            this.audio.pause();
            this.playTrack(trackName, true);
            this.audio.volume = 0;
            this.audio.play().then(() => {
                this.setButtonState(true);
                const rampStart = performance.now();
                const fadeIn = (fadeTimestamp) => {
                    const rampProgress = Math.min((fadeTimestamp - rampStart) / this.fadeDuration, 1);
                    this.audio.volume = this.clampVolume(this.volume * rampProgress);
                    if (rampProgress < 1) {
                        this.fadeTimer = requestAnimationFrame(fadeIn);
                    } else {
                        this.audio.volume = this.clampVolume(this.volume);
                        this.fadeTimer = null;
                    }
                };
                this.fadeTimer = requestAnimationFrame(fadeIn);
            }).catch(() => {
                this.audio.volume = this.clampVolume(this.volume);
                this.setButtonState(false);
                this.fadeTimer = null;
            });
        };
        this.fadeTimer = requestAnimationFrame(fadeOut);
    }

    setButtonState(playing) {
        this.isPlaying = playing;
        if (this.musicBtn) {
            this.musicBtn.classList.toggle('playing', playing);
            this.musicBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
            this.musicBtn.setAttribute('aria-pressed', String(playing));
        }
    }
}
