/**
 * Photo Viewer with 3D Effects
 * Handles photo viewing with tilt and holographic effects
 */
const PhotoViewer = {
    currentPhoto: null,
    isOpen: false,
    
    // Enhanced tilt settings
    maxTilt: 25, // Increased from 15 for stronger effect
    
    // Elements
    viewer: null,
    photoCard: null,
    photoImage: null,
    photoTimestamp: null,
    backdrop: null,
    holographicOverlay: null,
    
    /**
     * Initialize photo viewer
     */
    init() {
        this.viewer = document.getElementById('photoViewer');
        this.photoCard = this.viewer.querySelector('.photo-card');
        this.photoImage = this.viewer.querySelector('.photo-image');
        this.photoTimestamp = this.viewer.querySelector('.photo-timestamp');
        this.backdrop = this.viewer.querySelector('.viewer-backdrop');
        this.holographicOverlay = this.viewer.querySelector('.holographic-overlay');
        
        this.attachEventHandlers();
    },
    
    /**
     * Attach event handlers
     */
    attachEventHandlers() {
        // Mouse move for tilt effect
        this.photoCard.addEventListener('mousemove', (e) => {
            this.photoCard.classList.add('tilting');
            this.handleTilt(e);
        });
        
        // Touch move for mobile tilt
        this.photoCard.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.photoCard.classList.add('tilting');
            this.handleTilt(e.touches[0]);
        });
        
        // Reset tilt on mouse leave
        this.photoCard.addEventListener('mouseleave', () => {
            this.photoCard.classList.remove('tilting');
            this.resetTilt();
        });
        
        // Reset tilt on touch end
        this.photoCard.addEventListener('touchend', () => {
            this.photoCard.classList.remove('tilting');
            this.resetTilt();
        });
        
        // Close on backdrop click
        this.backdrop.addEventListener('click', () => {
            this.hide();
        });
        
        // Close on photo click
        this.photoCard.addEventListener('click', () => {
            this.hide();
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    },
    
    /**
     * Show photo in viewer
     */
    show(photo) {
        this.currentPhoto = photo;
        this.isOpen = true;
        
        // Set photo
        this.photoImage.src = photo.url;
        this.photoTimestamp.textContent = photo.displayDate;
        
        // Get source element for animation
        const sourceElement = document.querySelector(`[data-index="${photo.index}"]`);
        
        if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            
            // Set initial position
            gsap.set(this.photoCard, {
                x: rect.left + rect.width / 2 - window.innerWidth / 2,
                y: rect.top + rect.height / 2 - window.innerHeight / 2,
                scale: Math.min(rect.width / 600, rect.height / 600),
                opacity: 0
            });
        }
        
        // Show viewer
        this.viewer.classList.remove('hidden');
        
        // Animate entry
        const tl = gsap.timeline();
        
        tl.to(this.backdrop, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
        }, 0);
        
        tl.to(this.photoCard, {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out'
        }, 0);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    },
    
    /**
     * Hide viewer
     */
    hide() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Reset tilt
        this.resetTilt();
        
        // Get target element for animation
        const targetElement = document.querySelector(`[data-index="${this.currentPhoto.index}"]`);
        
        // Animate exit
        const tl = gsap.timeline({
            onComplete: () => {
                this.viewer.classList.add('hidden');
                this.currentPhoto = null;
            }
        });
        
        tl.to(this.backdrop, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in'
        }, 0);
        
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            
            tl.to(this.photoCard, {
                x: rect.left + rect.width / 2 - window.innerWidth / 2,
                y: rect.top + rect.height / 2 - window.innerHeight / 2,
                scale: Math.min(rect.width / 600, rect.height / 600),
                opacity: 0,
                duration: 0.4,
                ease: 'power2.in'
            }, 0);
        } else {
            tl.to(this.photoCard, {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in'
            }, 0);
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    },
    
    /**
     * Handle tilt effect based on mouse/touch position
     */
    handleTilt(event) {
        if (!this.isOpen) return;
        
        const rect = this.photoCard.getBoundingClientRect();
        
        // Get mouse/touch position relative to card
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Normalize to [-1, 1]
        const xPercent = (x / rect.width - 0.5) * 2;
        const yPercent = (y / rect.height - 0.5) * 2;
        
        // Calculate rotation with stronger effect
        const rotateY = xPercent * this.maxTilt;
        const rotateX = -yPercent * this.maxTilt;
        
        // Calculate shine angle for holographic effect
        const shineAngle = Math.atan2(yPercent, xPercent) * 180 / Math.PI;
        
        // Calculate shine position (0 to 100%)
        const shineX = ((xPercent + 1) / 2) * 100;
        const shineY = ((yPercent + 1) / 2) * 100;
        
        // Apply transforms with enhanced depth
        this.photoCard.style.setProperty('--rotate-x', `${rotateX}deg`);
        this.photoCard.style.setProperty('--rotate-y', `${rotateY}deg`);
        this.photoCard.style.setProperty('--shine-angle', `${shineAngle}deg`);
        this.photoCard.style.setProperty('--shine-x', `${shineX}%`);
        this.photoCard.style.setProperty('--shine-y', `${shineY}%`);
        
        // Enhanced scale effect for depth
        const distance = Math.sqrt(xPercent * xPercent + yPercent * yPercent);
        const scale = 1 + (distance * 0.02); // Subtle scale increase
        this.photoCard.style.setProperty('--scale', scale);
    },
    
    /**
     * Reset tilt to default position
     */
    resetTilt() {
        this.photoCard.classList.remove('tilting');
        
        gsap.to(this.photoCard, {
            '--rotate-x': '0deg',
            '--rotate-y': '0deg',
            '--shine-angle': '45deg',
            '--shine-x': '50%',
            '--shine-y': '50%',
            '--scale': 1,
            duration: 0.5,
            ease: 'power2.out'
        });
    }
};
