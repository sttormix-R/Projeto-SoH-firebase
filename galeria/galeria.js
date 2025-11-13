document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-gallery');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const container = document.querySelector('.gallery-grid');
            const items = Array.from(galleryItems);
            
            if (sortValue === 'recent') {
                // Most recent first (default order)
                items.sort((a, b) => 0);
            } else if (sortValue === 'popular') {
                // Most likes first
                items.sort((a, b) => {
                    const likesA = parseInt(a.getAttribute('data-likes'));
                    const likesB = parseInt(b.getAttribute('data-likes'));
                    return likesB - likesA;
                });
            } else if (sortValue === 'oldest') {
                // Oldest first
                items.sort((a, b) => 1);
            }
            
            // Reappend items in new order
            items.forEach(item => {
                container.appendChild(item);
            });
        });
    }
    
    // Like functionality
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.gallery-item');
            const currentLikes = parseInt(item.getAttribute('data-likes'));
            const likeCount = this.querySelector('span');
            const icon = this.querySelector('i');
            
            if (this.classList.contains('liked')) {
                // Unlike
                item.setAttribute('data-likes', currentLikes - 1);
                likeCount.textContent = currentLikes - 1;
                this.classList.remove('liked');
                icon.className = 'far fa-heart';
                showNotification('Like removido!', 'info');
            } else {
                // Like
                item.setAttribute('data-likes', currentLikes + 1);
                likeCount.textContent = currentLikes + 1;
                this.classList.add('liked');
                icon.className = 'fas fa-heart';
                showNotification('Imagem curtida!', 'success');
            }
        });
    });
    
    // View image in modal
    const viewButtons = document.querySelectorAll('.view-btn');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalAuthor = document.getElementById('modal-author');
    const modalDescription = document.getElementById('modal-description');
    const modalTags = document.getElementById('modal-tags');
    const modalLikes = document.getElementById('modal-likes');
    const modalLikeBtn = document.querySelector('.modal-like-btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.gallery-item');
            const imageSrc = item.querySelector('img').src;
            const title = item.querySelector('h3').textContent;
            const author = item.querySelector('.image-author').textContent;
            const description = item.querySelector('.image-description').textContent;
            const tags = item.querySelector('.image-tags').innerHTML;
            const likes = item.getAttribute('data-likes');
            
            // Populate modal
            modalImage.src = imageSrc;
            modalTitle.textContent = title;
            modalAuthor.textContent = author;
            modalDescription.textContent = description;
            modalTags.innerHTML = tags;
            modalLikes.textContent = likes;
            
            // Set like button state
            const originalLikeBtn = item.querySelector('.like-btn');
            if (originalLikeBtn.classList.contains('liked')) {
                modalLikeBtn.classList.add('liked');
                modalLikeBtn.querySelector('i').className = 'fas fa-heart';
            } else {
                modalLikeBtn.classList.remove('liked');
                modalLikeBtn.querySelector('i').className = 'far fa-heart';
            }
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal
    const closeModal = document.querySelector('.close-modal');
    closeModal.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Modal like button
    if (modalLikeBtn) {
        modalLikeBtn.addEventListener('click', function() {
            const item = document.querySelector('.gallery-item img[src="' + modalImage.src + '"]').closest('.gallery-item');
            const originalLikeBtn = item.querySelector('.like-btn');
            
            // Trigger click on original like button
            originalLikeBtn.click();
            
            // Update modal likes
            const currentLikes = parseInt(item.getAttribute('data-likes'));
            modalLikes.textContent = currentLikes;
            
            // Update modal button state
            if (originalLikeBtn.classList.contains('liked')) {
                this.classList.add('liked');
                this.querySelector('i').className = 'fas fa-heart';
            } else {
                this.classList.remove('liked');
                this.querySelector('i').className = 'far fa-heart';
            }
        });
    }
    
    // Download functionality
    const downloadButtons = document.querySelectorAll('.download-btn');
    const modalDownloadBtn = document.querySelector('.modal-download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.gallery-item');
            const imageSrc = item.querySelector('img').src;
            const title = item.querySelector('h3').textContent;
            downloadImage(imageSrc, title);
        });
    });
    
    if (modalDownloadBtn) {
        modalDownloadBtn.addEventListener('click', function() {
            const imageSrc = modalImage.src;
            const title = modalTitle.textContent;
            downloadImage(imageSrc, title);
        });
    }
    
    function downloadImage(src, title) {
        const link = document.createElement('a');
        link.href = src;
        link.download = `HopeBorn_${title.replace(/\s+/g, '_')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Download iniciado!', 'success');
    }
    
    // Upload functionality
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.querySelector('.upload-btn');
    
    if (uploadZone && fileInput && uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        uploadZone.addEventListener('click', function() {
            fileInput.click();
        });
        
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            const wine = getComputedStyle(document.documentElement).getPropertyValue('--wine').trim();
            this.style.borderColor = wine;
            this.style.background = 'rgba(107, 13, 26, 0.1)';
        });
        
        uploadZone.addEventListener('dragleave', function() {
            const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
            this.style.borderColor = gold;
            this.style.background = 'transparent';
        });
        
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
            this.style.borderColor = gold;
            this.style.background = 'transparent';
        
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });

        
        fileInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                handleFileUpload(this.files[0]);
            }
        });
    }
    
    function handleFileUpload(file) {
        if (!file.type.match('image.*')) {
            showNotification('Por favor, selecione apenas arquivos de imagem!', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showNotification('A imagem deve ter menos de 10MB!', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            showNotification('Imagem carregada com sucesso! Em breve estará na galeria após moderação.', 'success');
            // In a real app, you would upload to server here
            console.log('Image uploaded:', file.name);
        };
        reader.readAsDataURL(file);
    }
    
    // Load more functionality
    const loadMoreBtn = document.querySelector('.load-more-btn');
    let visibleItems = 9;
    
    if (loadMoreBtn) {
        // Initially hide items beyond the first 9
        galleryItems.forEach((item, index) => {
            if (index >= visibleItems) {
                item.style.display = 'none';
            }
        });
        
        loadMoreBtn.addEventListener('click', function() {
            const allItems = document.querySelectorAll('.gallery-item');
            const currentlyHidden = Array.from(allItems).filter(item => 
                item.style.display === 'none' || item.style.display === ''
            );
            
            // Show next 3 items
            currentlyHidden.slice(0, 3).forEach((item, index) => {
                setTimeout(() => {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100);
                }, index * 200);
            });
            
            // Hide button if no more items to show
            if (currentlyHidden.length <= 3) {
                this.style.display = 'none';
            }
        });
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2e7d32' : type === 'error' ? '#c62828' : '#1565c0'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .gallery-item {
            transition: all 0.3s ease;
        }
        
        .notification button {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .like-btn.liked {
            background: #e74c3c !important;
            color: white !important;
        }
        
        .like-btn.liked i {
            color: white !important;
        }
    `;
    document.head.appendChild(style);
});