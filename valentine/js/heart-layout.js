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
        const scale = this.containerSize / 5.5; // Increased scale for larger heart
        
        // Normalize coordinates
        const nx = (x - centerX) / scale;
        const ny = (centerY - y) / scale;
        
        // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
        const eq = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
        return eq <= 5.0; // Much larger tolerance for better coverage
    },
    
    /**
     * Generate perfect heart positions using a deterministic hardcoded template
     */
    generatePhotoPositions(availablePhotosCount = 20) {
        // 20 perfectly curated relative positions forming a heart
        // rx, ry: relative center coordinates (0.0 to 1.0)
        // rw: relative width/height scale
        const heartTemplate = [
            { rx: 0.50, ry: 0.45, rw: 0.22 }, // 0. Center (Largest, main focus)
            { rx: 0.30, ry: 0.38, rw: 0.18 }, // 1. Mid-Left inner
            { rx: 0.70, ry: 0.38, rw: 0.18 }, // 2. Mid-Right inner
            { rx: 0.35, ry: 0.18, rw: 0.16 }, // 3. Top-Left lobe
            { rx: 0.65, ry: 0.18, rw: 0.16 }, // 4. Top-Right lobe
            { rx: 0.50, ry: 0.25, rw: 0.16 }, // 5. Top Center dip
            { rx: 0.20, ry: 0.28, rw: 0.15 }, // 6. Far Top-Left
            { rx: 0.80, ry: 0.28, rw: 0.15 }, // 7. Far Top-Right
            { rx: 0.15, ry: 0.45, rw: 0.14 }, // 8. Far Left edge
            { rx: 0.85, ry: 0.45, rw: 0.14 }, // 9. Far Right edge
            { rx: 0.40, ry: 0.58, rw: 0.18 }, // 10. Lower-Left inner
            { rx: 0.60, ry: 0.58, rw: 0.18 }, // 11. Lower-Right inner
            { rx: 0.25, ry: 0.60, rw: 0.15 }, // 12. Lower-Left outer
            { rx: 0.75, ry: 0.60, rw: 0.15 }, // 13. Lower-Right outer
            { rx: 0.50, ry: 0.72, rw: 0.18 }, // 14. Bottom center core
            { rx: 0.35, ry: 0.75, rw: 0.14 }, // 15. Bottom-Left taper
            { rx: 0.65, ry: 0.75, rw: 0.14 }, // 16. Bottom-Right taper
            { rx: 0.43, ry: 0.83, rw: 0.12 }, // 17. Tip transition Left
            { rx: 0.57, ry: 0.83, rw: 0.12 }, // 18. Tip transition Right
            { rx: 0.50, ry: 0.90, rw: 0.15 }  // 19. Absolute Bottom tip
        ];

        const positions = [];
        // Determine how many photos we actually have, up to 20
        const actualCount = Math.min(availablePhotosCount, heartTemplate.length);

        for (let i = 0; i < actualCount; i++) {
            const tmpl = heartTemplate[i];
            // Scale relative width to actual pixels based on container
            const sizePx = this.containerSize * tmpl.rw;
            
            // Convert relative center (rx, ry) to absolute Top-Left (x, y) for CSS
            const x = (tmpl.rx * this.containerSize) - (sizePx / 2);
            const y = (tmpl.ry * this.containerSize) - (sizePx / 2);

            positions.push({
                x: x,
                y: y,
                width: sizePx,
                height: sizePx,
                size: 'medium', // Default size for compatibility
                index: i,
                zIndex: i === 0 ? 10 : 1 // Ensure center photo stays on top
            });
        }
        
        this.positions = positions;
        console.log(`✓ Generated ${positions.length} photo positions in heart shape`);
        return positions;
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
