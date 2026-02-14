/**
 * GitHub API Integration
 * Handles file uploads and management via GitHub API
 */
const GitHubAPI = {
    
    /**
     * Unicode-safe Base64 encode
     */
    base64Encode(str) {
        try {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                function(match, p1) {
                    return String.fromCharCode('0x' + p1);
                }));
        } catch (e) {
            // Fallback for very large strings
            return btoa(unescape(encodeURIComponent(str)));
        }
    },
    
    /**
     * Upload a file to GitHub repository
     */
    async uploadFile(path, content, message, isBase64 = false) {
        const config = Config.getConfig();
        if (!config) {
            throw new Error('GitHub 未配置');
        }
        
        const { username, repo, token } = config;
        const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
        
        try {
            // Check if file exists (to get SHA for update)
            let sha = null;
            try {
                const checkResponse = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (checkResponse.ok) {
                    const data = await checkResponse.json();
                    sha = data.sha;
                }
            } catch (e) {
                // File doesn't exist, which is fine for new files
            }
            
            // Prepare request body
            const body = {
                message,
                content: isBase64 ? content : this.base64Encode(content),
                branch: 'main' // or 'master', adjust as needed
            };
            
            if (sha) {
                body.sha = sha; // Required for updates
            }
            
            // Upload file
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            return result.content;
            
        } catch (error) {
            console.error('GitHub upload error:', error);
            throw error;
        }
    },
    
    /**
     * Get file content from GitHub
     */
    async getFile(path) {
        const config = Config.getConfig();
        if (!config) {
            throw new Error('GitHub 未配置');
        }
        
        const { username, repo, token } = config;
        const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
        
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.status === 404) {
                return null; // File doesn't exist
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Decode content
            if (data.content) {
                return {
                    content: atob(data.content.replace(/\n/g, '')),
                    sha: data.sha
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('GitHub fetch error:', error);
            throw error;
        }
    },
    
    /**
     * Upload photo to GitHub
     */
    async uploadPhoto(imageDataUrl, filename) {
        const config = Config.getConfig();
        if (!config) {
            throw new Error('GitHub 未配置');
        }
        
        // Extract base64 data
        const base64Data = imageDataUrl.split(',')[1];
        const photoPath = `${config.photoPath}/${filename}`;
        
        // Upload image
        await this.uploadFile(
            photoPath,
            base64Data,
            `Add photo: ${filename}`,
            true
        );
        
        // Return the GitHub raw URL for the image
        return `https://raw.githubusercontent.com/${config.username}/${config.repo}/main/${photoPath}`;
    },
    
    /**
     * Update photos metadata file
     */
    async updatePhotosMetadata(photos) {
        const config = Config.getConfig();
        if (!config) {
            throw new Error('GitHub 未配置');
        }
        
        const metadataPath = `${config.photoPath}/photos.json`;
        // photos is now an object, convert to JSON directly
        const content = JSON.stringify(photos, null, 2);
        
        await this.uploadFile(
            metadataPath,
            content,
            'Update photos metadata',
            false
        );
    },
    
    /**
     * Load photos metadata (public access, no token required for reading)
     */
    async loadPhotosMetadata() {
        const config = Config.getConfig();
        if (!config) {
            return {}; // Return empty object instead of array
        }
        
        try {
            // Try public raw URL first (no authentication needed)
            const { username, repo, photoPath } = config;
            const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/${photoPath}/photos.json`;
            const response = await fetch(rawUrl + '?t=' + Date.now());
            
            if (response.ok) {
                const photos = await response.json();
                
                // If photos is an array (old format), convert to object
                if (Array.isArray(photos)) {
                    const photoObj = {};
                    photos.forEach((photo, index) => {
                        if (photo) {
                            photoObj[index] = photo;
                        }
                    });
                    return photoObj;
                }
                
                // photos is already an object, just add cache-busting to URLs
                Object.values(photos).forEach(photo => {
                    if (photo && photo.url) {
                        photo.url = photo.url + (photo.url.includes('?') ? '&' : '?') + 't=' + Date.now();
                    }
                });
                return photos;
            }
            
            // Fallback to API with token if available
            if (config.token) {
                const metadataPath = `${photoPath}/photos.json`;
                const file = await this.getFile(metadataPath);
                
                if (file && file.content) {
                    const photos = JSON.parse(file.content);
                    // Convert array to object if needed
                    if (Array.isArray(photos)) {
                        const photoObj = {};
                        photos.forEach((photo, index) => {
                            if (photo) {
                                photoObj[index] = photo;
                            }
                        });
                        return photoObj;
                    }
                    return photos;
                }
            }
            
            return {};
        } catch (error) {
            console.error('Failed to load photos metadata:', error);
            return {};
        }
    }
};
