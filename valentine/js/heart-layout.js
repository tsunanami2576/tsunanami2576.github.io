/**
 * Heart Layout Algorithm
 * Generates heart-shaped photo layout with varying sizes
 */
const HeartLayout = {
    // Photo size definitions (in pixels)
    sizes: [
        { name: 'small', width: 80, height: 80, weight: 0.4 },
        { name: 'medium', width: 120, height: 120, weight: 0.35 },
        { name: 'large', width: 150, height: 150, weight: 0.25 }
    ],
    
    // Container dimensions
    containerSize: 600,
    
    // Heart shape points cache
    heartPoints: [],
    
    // Photo positions
    positions: [],
    
    /**
     * Initialize heart layout
     */
    init() {
        this.updateContainerSize();
        this.generateHeartShape();
        this.generatePhotoPositions();
        this.renderPlaceholders();
        
        // Update on window resize
        window.addEventListener('resize', () => {
            this.updateContainerSize();
        });
    },
    
    /**
     * Update container size based on viewport
     */
    updateContainerSize() {
        const width = window.innerWidth;
        if (width <= 480) {
            this.containerSize = 320;
        } else if (width <= 768) {
            this.containerSize = 400;
        } else {
            this.containerSize = 600;
        }
        
        // Update CSS variable
        document.documentElement.style.setProperty('--heart-size', `${this.containerSize}px`);
        
        // Adjust photo sizes proportionally
        const scale = this.containerSize / 600;
        document.documentElement.style.setProperty('--photo-small', `${80 * scale}px`);
        document.documentElement.style.setProperty('--photo-medium', `${120 * scale}px`);
        document.documentElement.style.setProperty('--photo-large', `${150 * scale}px`);
        
        // Update sizes array
        this.sizes = [
            { name: 'small', width: 80 * scale, height: 80 * scale, weight: 0.4 },
            { name: 'medium', width: 120 * scale, height: 120 * scale, weight: 0.35 },
            { name: 'large', width: 150 * scale, height: 150 * scale, weight: 0.25 }
        ];
    },
    
    /**
     * Generate heart shape using parametric equations
     */
    generateHeartShape() {
        const points = [];
        const numPoints = 200;
        const scale = this.containerSize / 6; // Adjust to fit container
        const centerX = this.containerSize / 2;
        const centerY = this.containerSize / 2.2; // Offset for better centering
        
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * 2 * Math.PI;
            
            // Parametric heart equation
            const x = scale * 16 * Math.pow(Math.sin(t), 3);
            const y = scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) 
                      - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            
            points.push({
                x: centerX + x,
                y: centerY - y // Flip Y axis
            });
        }
        
        this.heartPoints = points;
    },
    
    /**
     * Check if point is inside heart shape
     */
    isInsideHeart(x, y) {
        const centerX = this.containerSize / 2;
        const centerY = this.containerSize / 2.2;
        const scale = this.containerSize / 6;
        
        // Normalize coordinates
        const nx = (x - centerX) / scale;
        const ny = (centerY - y) / scale;
        
        // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
        const eq = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
        return eq <= 0.5; // Add small tolerance
    },
    
    /**
     * Generate photo positions with varying sizes
     */
    generatePhotoPositions() {
        const positions = [];
        const numPhotos = 15; // Target number of photos
        const margin = 10; // Minimum margin between photos
        
        // Determine size for each photo based on weights
        const photoSizes = [];
        for (let i = 0; i < numPhotos; i++) {
            const rand = Math.random();
            let cumulativeWeight = 0;
            
            for (const size of this.sizes) {
                cumulativeWeight += size.weight;
                if (rand <= cumulativeWeight) {
                    photoSizes.push(size);
                    break;
                }
            }
        }
        
        // Sort by size (large first for better packing)
        photoSizes.sort((a, b) => b.width - a.width);
        
        // Try to place each photo
        for (let i = 0; i < photoSizes.length; i++) {
            const size = photoSizes[i];
            let placed = false;
            let attempts = 0;
            const maxAttempts = 100;
            
            while (!placed && attempts < maxAttempts) {
                // Random position
                const x = Math.random() * (this.containerSize - size.width);
                const y = Math.random() * (this.containerSize - size.height);
                
                // Check if photo center is inside heart
                const centerX = x + size.width / 2;
                const centerY = y + size.height / 2;
                
                if (this.isInsideHeart(centerX, centerY)) {
                    // Check for collisions with existing photos
                    let hasCollision = false;
                    
                    for (const pos of positions) {
                        if (this.rectanglesOverlap(
                            x, y, size.width, size.height,
                            pos.x, pos.y, pos.width, pos.height,
                            margin
                        )) {
                            hasCollision = true;
                            break;
                        }
                    }
                    
                    if (!hasCollision) {
                        positions.push({
                            x,
                            y,
                            width: size.width,
                            height: size.height,
                            size: size.name,
                            index: positions.length
                        });
                        placed = true;
                    }
                }
                
                attempts++;
            }
        }
        
        this.positions = positions;
        console.log(`Generated ${positions.length} photo positions`);
    },
    
    /**
     * Check if two rectangles overlap
     */
    rectanglesOverlap(x1, y1, w1, h1, x2, y2, w2, h2, margin = 0) {
        return !(x1 + w1 + margin < x2 || 
                 x2 + w2 + margin < x1 || 
                 y1 + h1 + margin < y2 || 
                 y2 + h2 + margin < y1);
    },
    
    /**
     * Render photo placeholders
     */
    renderPlaceholders() {
        const container = document.getElementById('heartContainer');
        container.innerHTML = ''; // Clear existing
        
        this.positions.forEach((pos, index) => {
            const placeholder = document.createElement('div');
            placeholder.className = `photo-placeholder ${pos.size}`;
            placeholder.style.left = `${pos.x}px`;
            placeholder.style.top = `${pos.y}px`;
            placeholder.dataset.index = index;
            
            container.appendChild(placeholder);
        });
    },
    
    /**
     * Get position for photo at index
     */
    getPosition(index) {
        return this.positions[index] || null;
    },
    
    /**
     * Get all positions
     */
    getAllPositions() {
        return this.positions;
    }
};
