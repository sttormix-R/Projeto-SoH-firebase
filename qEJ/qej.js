document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Ranking tabs
    const rankingTabs = document.querySelectorAll('.ranking-tab');
    const rankingLists = document.querySelectorAll('.ranking-list');
    
    rankingTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const rankingType = this.getAttribute('data-ranking');
            
            // Remove active class from all tabs and lists
            rankingTabs.forEach(t => t.classList.remove('active'));
            rankingLists.forEach(list => list.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding list
            this.classList.add('active');
            document.querySelector(`.ranking-list[data-ranking="${rankingType}"]`).classList.add('active');
        });
    });
    
    // Quiz functionality
    const startQuizButtons = document.querySelectorAll('.start-quiz-btn');
    const quizModal = document.getElementById('quiz-modal');
    const nextButton = document.getElementById('next-question');
    const timerElement = document.getElementById('timer');
    
    // Sample quiz data
    const quizzes = {
        'lore-geral': {
            title: 'Conhecimento Geral de HopeBorn',
            questions: [
                {
                    question: 'Qual é a capital do reino de HopeBorn?',
                    options: [
                        'Cidade do Sol',
                        'HopeBorn Capital',
                        'Fortaleza da Luz',
                        'Vila dos Heróis'
                    ],
                    correct: 1
                },
                {
                    question: 'Quantas facções principais existem em HopeBorn?',
                    options: [
                        '2',
                        '3',
                        '4',
                        '5'
                    ],
                    correct: 1
                },
                {
                    question: 'Qual facção representa os Sete Pecados Capitais?',
                    options: [
                        'Tenebris Ordo',
                        'Gehenna',
                        'Saligia',
                        'Ordem da Luz'
                    ],
                    correct: 2
                }
            ]
        },
        'quem-e-quem': {
            title: 'Quem é Quem em HopeBorn',
            questions: [
                {
                    question: 'Quem é conhecido como "O Mago do Orgulho"?',
                    options: [
                        'Ren',
                        'Krioni',
                        'Morwen',
                        'Nier'
                    ],
                    correct: 1
                },
                {
                    question: 'Qual personagem é da facção Tenebris Ordo?',
                    options: [
                        'Morwen Satanael',
                        'Krioni',
                        'Ren',
                        'Lazarus'
                    ],
                    correct: 2
                }
            ]
        }
    };
    
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let score = 0;
    let timer = null;
    
    startQuizButtons.forEach(button => {
        button.addEventListener('click', function() {
            const quizId = this.getAttribute('data-quiz');
            currentQuiz = quizzes[quizId];
            
            if (currentQuiz) {
                startQuiz(currentQuiz);
            }
        });
    });
    
    function startQuiz(quiz) {
        currentQuestionIndex = 0;
        score = 0;
        
        // Update modal title
        document.getElementById('quiz-title').textContent = quiz.title;
        document.getElementById('total-questions').textContent = quiz.questions.length;
        
        showQuestion(quiz.questions[0]);
        startTimer();
        quizModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function showQuestion(question) {
        document.getElementById('current-question').textContent = currentQuestionIndex + 1;
        document.getElementById('question-text').textContent = question.question;
        
        const optionsContainer = document.querySelector('.options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.setAttribute('data-correct', index === question.correct);
            optionElement.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            `;
            
            optionElement.addEventListener('click', function() {
                selectOption(this, question.correct);
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Reset timer
        resetTimer();
    }
    
    function selectOption(selectedOption, correctIndex) {
        const options = document.querySelectorAll('.option');
        const selectedIndex = Array.from(options).indexOf(selectedOption);
        
        // Disable all options
        options.forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        // Show correct/incorrect states
        options.forEach((option, index) => {
            if (index === correctIndex) {
                option.classList.add('correct');
            } else if (index === selectedIndex && index !== correctIndex) {
                option.classList.add('incorrect');
            }
        });
        
        // Update score
        if (selectedIndex === correctIndex) {
            score++;
        }
        
        // Enable next button
        nextButton.disabled = false;
        
        // Stop timer
        clearInterval(timer);
    }
    
    nextButton.addEventListener('click', function() {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < currentQuiz.questions.length) {
            showQuestion(currentQuiz.questions[currentQuestionIndex]);
            this.disabled = true;
        } else {
            endQuiz();
        }
    });
    
    function startTimer() {
        let timeLeft = 30;
        timerElement.textContent = timeLeft;
        
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                autoSelectOption();
            }
        }, 1000);
    }
    
    function resetTimer() {
        clearInterval(timer);
        startTimer();
    }
    
    function autoSelectOption() {
        const options = document.querySelectorAll('.option');
        if (options.length > 0) {
            const randomOption = options[Math.floor(Math.random() * options.length)];
            selectOption(randomOption, currentQuiz.questions[currentQuestionIndex].correct);
        }
    }
    
    function endQuiz() {
        const percentage = Math.round((score / currentQuiz.questions.length) * 100);
        
        // Show results
        const modalContent = document.querySelector('.quiz-modal .modal-content');
        modalContent.innerHTML = `
            <div class="quiz-header">
                <h2>Quiz Concluído!</h2>
            </div>
            <div class="quiz-body" style="text-align: center; padding: 3rem;">
                <h3 style="color: var(--gold); margin-bottom: 2rem;">Sua Pontuação: ${score}/${currentQuiz.questions.length}</h3>
                <div style="font-size: 4rem; color: var(--gold); margin-bottom: 2rem;">${percentage}%</div>
                <p style="margin-bottom: 2rem;">${getResultMessage(percentage)}</p>
                <button id="close-quiz" class="next-btn">Fechar</button>
            </div>
        `;
        
        document.getElementById('close-quiz').addEventListener('click', function() {
            quizModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    function getResultMessage(percentage) {
        if (percentage >= 90) return 'Excelente! Você é um verdadeiro mestre de HopeBorn!';
        if (percentage >= 70) return 'Muito bom! Você conhece bem o mundo de HopeBorn.';
        if (percentage >= 50) return 'Bom trabalho! Continue aprendendo sobre HopeBorn.';
        return 'Não desanime! Continue explorando o mundo de HopeBorn.';
    }
    
    // Close modal when clicking outside
    quizModal.addEventListener('click', function(e) {
        if (e.target === quizModal) {
            quizModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            clearInterval(timer);
        }
    });
    
    // Minigame buttons
    const playGameButtons = document.querySelectorAll('.play-game-btn');
    
    playGameButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gameId = this.getAttribute('data-game');
            showNotification(`Iniciando ${gameId}... Em desenvolvimento!`, 'info');
        });
    });
    
    // Challenge buttons
    const acceptChallengeButtons = document.querySelectorAll('.accept-challenge-btn');
    
    acceptChallengeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const challengeTitle = this.closest('.challenge-card').querySelector('h3').textContent;
            showNotification(`Desafio "${challengeTitle}" aceito!`, 'success');
        });
    });
    
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