/**
 * Photo Viewer with 3D Holographic Effects
 */
const PhotoViewer = {
    currentPhoto: null,
    isOpen: false,
    maxTilt: 15, // 降低到15度，更加优雅
    
    viewer: null,
    photoCardWrapper: null,
    photoCardInner: null,
    photoImage: null,
    photoTimestamp: null,
    backdrop: null,
    
    init() {
        this.viewer = document.getElementById('photoViewer');
        this.photoCardWrapper = this.viewer.querySelector('.photo-card-wrapper');
        this.photoCardInner = this.viewer.querySelector('.photo-card-inner');
        this.photoImage = this.viewer.querySelector('.photo-image');
        this.photoTimestamp = this.viewer.querySelector('.photo-timestamp');
        this.backdrop = this.viewer.querySelector('.viewer-backdrop');
        
        this.attachEventHandlers();
    },
    
    attachEventHandlers() {
        // 使用 window 的鼠标移动，这样即使鼠标移出卡片一点也能保持丝滑
        window.addEventListener('mousemove', (e) => {
            if (this.isOpen && !this.photoCardInner.classList.contains('resetting')) {
                this.handleTilt(e);
            }
        });
        
        this.photoCardInner.addEventListener('touchmove', (e) => {
            if (this.isOpen) {
                e.preventDefault();
                this.handleTilt(e.touches[0]);
            }
        });
        
        this.photoCardInner.addEventListener('mouseleave', () => this.resetTilt());
        this.photoCardInner.addEventListener('touchend', () => this.resetTilt());
        this.backdrop.addEventListener('click', () => this.hide());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.hide();
        });
    },
    
    show(photo) {
        this.currentPhoto = photo;
        this.isOpen = true;
        this.photoImage.src = photo.url;
        this.photoTimestamp.textContent = photo.displayDate || 'Our Memory';
        
        const sourceElement = document.querySelector(`[data-index="${photo.index}"]`);
        
        // 重置 3D 状态
        this.photoCardInner.classList.add('resetting');
        this.photoCardInner.style.setProperty('--rotate-x', '0deg');
        this.photoCardInner.style.setProperty('--rotate-y', '0deg');
        this.photoCardInner.style.setProperty('--scale', 1);
        
        if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            // 注意：GSAP 现在只动画外层的 Wrapper
            gsap.set(this.photoCardWrapper, {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                opacity: 0
            });
        }
        
        this.viewer.classList.remove('hidden');
        
        const tl = gsap.timeline({
            onComplete: () => {
                this.photoCardInner.classList.remove('resetting'); // 动画结束，允许 3D 交互
            }
        });
        
        tl.to(this.backdrop, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0);
        
        // 居中显示，使用百分比和transform
        const viewerCenterX = window.innerWidth / 2;
        const viewerCenterY = window.innerHeight / 2;
        const cardWidth = Math.min(window.innerWidth * 0.85, 500);
        const cardHeight = cardWidth * 1.25; // 宽高比1:1.25
        
        tl.to(this.photoCardWrapper, {
            x: viewerCenterX - cardWidth / 2,
            y: viewerCenterY - cardHeight / 2,
            width: cardWidth,
            height: cardHeight,
            opacity: 1,
            duration: 0.6,
            ease: 'back.out(1.2)'
        }, 0);
        
        document.body.style.overflow = 'hidden';
    },
    
    hide() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.resetTilt();
        
        const targetElement = document.querySelector(`[data-index="${this.currentPhoto.index}"]`);
        
        const tl = gsap.timeline({
            onComplete: () => {
                this.viewer.classList.add('hidden');
                this.currentPhoto = null;
            }
        });
        
        tl.to(this.backdrop, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
        
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            tl.to(this.photoCardWrapper, {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                opacity: 0,
                duration: 0.4,
                ease: 'power2.inOut'
            }, 0);
        } else {
            tl.to(this.photoCardWrapper, { opacity: 0, scale: 0.8, duration: 0.3 }, 0);
        }
        
        document.body.style.overflow = '';
    },
    
    handleTilt(event) {
        const rect = this.photoCardInner.getBoundingClientRect();
        
        // 限制在卡片范围内才响应
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) {
            return;
        }
        
        // 计算鼠标相对卡片中心的偏移百分比 (-1 到 1)
        const xPercent = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const yPercent = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        
        // 映射角度 (鼠标在右边，卡片向右转，即 rotateY 为正；鼠标在下边，卡片向下转，即 rotateX 为负)
        const rotateY = xPercent * this.maxTilt;
        const rotateX = -yPercent * this.maxTilt;
        
        // 光斑位置映射 (0% 到 100%)
        const shineX = ((event.clientX - rect.left) / rect.width) * 100;
        const shineY = ((event.clientY - rect.top) / rect.height) * 100;
        
        // 轻微放大效果
        const distance = Math.sqrt(xPercent * xPercent + yPercent * yPercent);
        const scale = 1 + (distance * 0.02); 
        
        // 将变量注入内层容器
        this.photoCardInner.style.setProperty('--rotate-x', `${rotateX}deg`);
        this.photoCardInner.style.setProperty('--rotate-y', `${rotateY}deg`);
        this.photoCardInner.style.setProperty('--shine-x', `${shineX}%`);
        this.photoCardInner.style.setProperty('--shine-y', `${shineY}%`);
        this.photoCardInner.style.setProperty('--scale', scale);
    },
    
    resetTilt() {
        this.photoCardInner.classList.add('resetting');
        this.photoCardInner.style.setProperty('--rotate-x', '0deg');
        this.photoCardInner.style.setProperty('--rotate-y', '0deg');
        this.photoCardInner.style.setProperty('--shine-x', '50%');
        this.photoCardInner.style.setProperty('--shine-y', '50%');
        this.photoCardInner.style.setProperty('--scale', 1);
        
        // 移除 resetting 类以便下次能够无缝跟手
        setTimeout(() => {
            if(this.photoCardInner) this.photoCardInner.classList.remove('resetting');
        }, 500);
    }
};