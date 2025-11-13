document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('character-search');
    const characterProfiles = document.querySelectorAll('.character-profile');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            characterProfiles.forEach(profile => {
                const characterName = profile.querySelector('h3').textContent.toLowerCase();
                const characterTitle = profile.querySelector('.character-title').textContent.toLowerCase();
                const characterFaction = profile.getAttribute('data-faction');
                
                if (characterName.includes(searchTerm) || 
                    characterTitle.includes(searchTerm) || 
                    characterFaction.includes(searchTerm)) {
                    profile.style.display = 'block';
                    setTimeout(() => {
                        profile.style.opacity = '1';
                        profile.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    profile.style.opacity = '0';
                    profile.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        profile.style.display = 'none';
                    }, 300);
                }
            });
        });
    }
    
    // Faction filtering
    const factionCards = document.querySelectorAll('.faction-card');
    
    factionCards.forEach(card => {
        card.addEventListener('click', function() {
            const faction = this.getAttribute('data-faction');
            
            characterProfiles.forEach(profile => {
                if (profile.getAttribute('data-faction') === faction) {
                    profile.style.display = 'block';
                    setTimeout(() => {
                        profile.style.opacity = '1';
                        profile.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    profile.style.opacity = '0';
                    profile.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        profile.style.display = 'none';
                    }, 300);
                }
            });
            
            // Show all characters when clicking Saligia card twice
            if (this.classList.contains('active')) {
                characterProfiles.forEach(profile => {
                    profile.style.display = 'block';
                    setTimeout(() => {
                        profile.style.opacity = '1';
                        profile.style.transform = 'translateY(0)';
                    }, 100);
                });
                this.classList.remove('active');
            } else {
                factionCards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Load more functionality
    const loadMoreBtn = document.querySelector('.load-more-btn');
    let visibleCharacters = 6;
    
    if (loadMoreBtn) {
        // Initially hide characters beyond the first 6
        characterProfiles.forEach((profile, index) => {
            if (index >= visibleCharacters) {
                profile.style.display = 'none';
            }
        });
        
        loadMoreBtn.addEventListener('click', function() {
            const allCharacters = document.querySelectorAll('.character-profile');
            const currentlyHidden = Array.from(allCharacters).filter(char => 
                char.style.display === 'none' || char.style.display === ''
            );
            
            // Show next 3 characters
            currentlyHidden.slice(0, 3).forEach((character, index) => {
                setTimeout(() => {
                    character.style.display = 'block';
                    setTimeout(() => {
                        character.style.opacity = '1';
                        character.style.transform = 'translateY(0)';
                    }, 100);
                }, index * 200);
            });
            
            // Hide button if no more characters to show
            if (currentlyHidden.length <= 3) {
                this.style.display = 'none';
            }
        });
    }
    
    // Character profile actions
    const viewButtons = document.querySelectorAll('.btn-primary');
    const historyButtons = document.querySelectorAll('.btn-secondary');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const characterName = this.closest('.character-profile').querySelector('h3').textContent;
            showNotification(`Abrindo ficha completa de ${characterName}...`, 'info');
        });
    });
    
    historyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const characterName = this.closest('.character-profile').querySelector('h3').textContent;
            showNotification(`Carregando história de ${characterName}...`, 'info');
        });
    });
    
    // Create character button
    const createCharacterBtn = document.querySelector('.create-character-btn');
    if (createCharacterBtn) {
        createCharacterBtn.addEventListener('click', function() {
            showNotification('Iniciando criação de personagem...', 'success');
            // Simulate redirect to character creation
            setTimeout(() => {
                window.location.href = '/character-creation.html';
            }, 1500);
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
        
        .character-profile {
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
    `;
    document.head.appendChild(style);
    
    // Animate stat bars on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statBars = entry.target.querySelectorAll('.stat-fill');
                statBars.forEach(bar => {
                    const currentWidth = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = currentWidth;
                    }, 300);
                });
            }
        });
    }, observerOptions);
    
    characterProfiles.forEach(profile => {
        observer.observe(profile);
    });
});