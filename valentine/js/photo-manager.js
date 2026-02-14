/**
 * Photo Manager
 * Handles photo upload, storage, and display
 */
const PhotoManager = {
    photos: [],
    currentUploadIndex: null,
    
    /**
     * Initialize photo manager
     */
    init() {
        this.attachEventHandlers();
    },
    
    /**
     * Attach event handlers
     */
    attachEventHandlers() {
        const fileInput = document.getElementById('fileInput');
        const heartContainer = document.getElementById('heartContainer');
        
        // Handle placeholder clicks
        heartContainer.addEventListener('click', (e) => {
            const placeholder = e.target.closest('.photo-placeholder');
            if (placeholder) {
                this.currentUploadIndex = parseInt(placeholder.dataset.index);
                fileInput.click();
            }
            
            // Handle photo clicks for viewer
            const photoItem = e.target.closest('.photo-item');
            if (photoItem) {
                const index = parseInt(photoItem.dataset.index);
                const photo = this.photos[index];
                if (photo) {
                    PhotoViewer.show(photo);
                }
            }
        });
        
        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
            e.target.value = ''; // Reset input
        });
    },
    
    /**
     * Handle file upload
     */
    async handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('请选择图片文件', 'error');
            return;
        }
        
        try {
            this.showLoading('正在处理照片...');
            
            // Compress image
            const compressedDataUrl = await this.compressImage(file);
            
            // Extract EXIF timestamp
            const timestamp = await this.extractTimestamp(file);
            
            // Generate filename
            const filename = `photo-${Date.now()}.jpg`;
            
            // Upload to GitHub
            this.showLoading('正在上传到 GitHub...');
            const url = await GitHubAPI.uploadPhoto(compressedDataUrl, filename);
            
            // Create photo object
            const photo = {
                url,
                timestamp: timestamp.toISOString(),
                displayDate: this.formatDate(timestamp),
                index: this.currentUploadIndex,
                filename
            };
            
            // Add to photos array
            this.photos[this.currentUploadIndex] = photo;
            
            // Update metadata on GitHub
            await GitHubAPI.updatePhotosMetadata(this.photos);
            
            // Display photo
            this.displayPhoto(photo);
            
            this.hideLoading();
            this.showToast('✓ 照片上传成功！', 'success');
            
        } catch (error) {
            console.error('Upload failed:', error);
            this.hideLoading();
            this.showToast('上传失败: ' + error.message, 'error');
        }
    },
    
    /**
     * Compress image using Canvas
     */
    compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 1920;
                    
                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize;
                            width = maxSize;
                        } else {
                            width = (width / height) * maxSize;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw and compress
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                
                img.onerror = reject;
                img.src = e.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Extract timestamp from image EXIF data
     */
    extractTimestamp(file) {
        return new Promise((resolve) => {
            EXIF.getData(file, function() {
                const dateTime = EXIF.getTag(this, 'DateTime') || 
                               EXIF.getTag(this, 'DateTimeOriginal') ||
                               EXIF.getTag(this, 'DateTimeDigitized');
                
                if (dateTime) {
                    // Parse EXIF date format: "YYYY:MM:DD HH:MM:SS"
                    const parts = dateTime.split(' ');
                    const dateParts = parts[0].split(':');
                    const timeParts = parts[1].split(':');
                    
                    const date = new Date(
                        parseInt(dateParts[0]),
                        parseInt(dateParts[1]) - 1,
                        parseInt(dateParts[2]),
                        parseInt(timeParts[0]),
                        parseInt(timeParts[1]),
                        parseInt(timeParts[2])
                    );
                    
                    resolve(date);
                } else {
                    // Fallback to file modification date
                    resolve(new Date(file.lastModified));
                }
            });
        });
    },
    
    /**
     * Format date for display
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    },
    
    /**
     * Display photo in heart layout
     */
    displayPhoto(photo) {
        const container = document.getElementById('heartContainer');
        const placeholder = container.querySelector(`[data-index="${photo.index}"]`);
        
        if (placeholder) {
            // Replace placeholder with photo
            const position = HeartLayout.getPosition(photo.index);
            
            const photoItem = document.createElement('div');
            photoItem.className = `photo-item photo-${position.size}`;
            photoItem.style.left = `${position.x}px`;
            photoItem.style.top = `${position.y}px`;
            photoItem.dataset.index = photo.index;
            
            const img = document.createElement('img');
            img.src = photo.url;
            img.alt = photo.displayDate;
            
            photoItem.appendChild(img);
            
            // Replace placeholder
            container.replaceChild(photoItem, placeholder);
        }
    },
    
    /**
     * Load photos from GitHub
     */
    async loadPhotos() {
        if (!Config.isConfigured()) {
            return;
        }
        
        try {
            this.showLoading('正在加载照片...');
            
            const photos = await GitHubAPI.loadPhotosMetadata();
            this.photos = photos;
            
            // Display all photos
            photos.forEach(photo => {
                if (photo && photo.url) {
                    this.displayPhoto(photo);
                }
            });
            
            this.hideLoading();
            
            if (photos.length > 0) {
                this.showToast(`已加载 ${photos.length} 张照片`, 'success');
            }
            
        } catch (error) {
            console.error('Failed to load photos:', error);
            this.hideLoading();
            this.showToast('加载照片失败', 'error');
        }
    },
    
    /**
     * Show loading overlay
     */
    showLoading(message = '加载中...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = overlay.querySelector('.loading-text');
        text.textContent = message;
        overlay.classList.remove('hidden');
    },
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('hidden');
    },
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
};
