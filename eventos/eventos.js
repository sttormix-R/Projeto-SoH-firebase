document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            eventCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // View toggle functionality
    const viewButtons = document.querySelectorAll('.view-btn');
    const eventsContainer = document.querySelector('.events-container');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            eventsContainer.className = 'events-container ' + view + '-view';
        });
    });
    
    // Join event functionality
    const joinButtons = document.querySelectorAll('.join-event');
    
    joinButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventCard = this.closest('.event-card');
            const eventName = eventCard.querySelector('h3').textContent;
            const participantsCount = eventCard.querySelector('.participants-count span');
            const progressFill = eventCard.querySelector('.progress-fill');
            
            // Get current participant count
            const currentText = participantsCount.textContent;
            const match = currentText.match(/(\d+)\/(\d+)/);
            
            if (match) {
                let current = parseInt(match[1]);
                const max = parseInt(match[2]);
                
                if (current < max) {
                    current++;
                    participantsCount.textContent = `${current}/${max} participantes`;
                    
                    // Update progress bar
                    const percentage = (current / max) * 100;
                    progressFill.style.width = percentage + '%';
                    
                    // Update button if event is full
                    if (current === max) {
                        this.textContent = 'Evento Lotado';
                        this.disabled = true;
                        this.style.background = '#666';
                    }
                    
                    showNotification(`Você se juntou a "${eventName}"!`, 'success');
                } else {
                    showNotification('Este evento já está lotado!', 'error');
                }
            }
        });
    });
    
    // Create event button
    const createEventBtn = document.querySelector('.create-event-btn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', function() {
            showNotification('Abrindo formulário de criação de evento...', 'info');
            // Simulate opening event creation modal
            setTimeout(() => {
                openEventCreationModal();
            }, 1000);
        });
    }
    
    // Sort events by date (closest first)
    function sortEventsByDate() {
        const container = document.querySelector('.events-container');
        const events = Array.from(eventCards);
        
        events.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            return dateA - dateB;
        });
        
        events.forEach(event => {
            container.appendChild(event);
        });
    }
    
    // Initialize event sorting
    sortEventsByDate();
    
    // Update event status based on current time
    function updateEventStatus() {
        const now = new Date();
        
        eventCards.forEach(card => {
            const eventDate = new Date(card.getAttribute('data-date'));
            const statusElement = card.querySelector('.event-status');
            const joinButton = card.querySelector('.join-event');
            
            // Simple simulation - in real app, you'd use actual event times
            const timeDiff = eventDate.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff <= 0 && hoursDiff > -3) {
                // Event is live (within 3 hours of start time)
                statusElement.textContent = 'Ao Vivo';
                statusElement.className = 'event-status live';
                if (joinButton) {
                    joinButton.textContent = 'Entrar Agora';
                    joinButton.classList.add('live');
                }
            } else if (hoursDiff <= 24 && hoursDiff > 0) {
                // Event is starting soon (within 24 hours)
                statusElement.textContent = 'Em Breve';
                statusElement.className = 'event-status upcoming';
            }
            // Else keeps the default upcoming status
        });
    }
    
    // Initialize status updates
    updateEventStatus();
    
    // Update status every minute
    setInterval(updateEventStatus, 60000);
    
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
    
    // Event creation modal (simulated)
    function openEventCreationModal() {
        const modal = document.createElement('div');
        modal.className = 'event-creation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Criar Novo Evento</h2>
                <p>Esta funcionalidade estará disponível em breve!</p>
                <button class="modal-close">Fechar</button>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: var(--near-black-2);
            padding: 2rem;
            border-radius: var(--radius);
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 2px solid var(--gold);
        `;
        
        modalContent.querySelector('h2').style.cssText = `
            color: var(--gold);
            margin-bottom: 1rem;
            font-family: MedievalSharp, serif;
        `;
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.style.cssText = `
            background: var(--wine);
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 0.5rem;
            cursor: pointer;
            margin-top: 1rem;
        `;
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
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
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        .event-card {
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
});