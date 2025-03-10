// Enhanced implementation for Open Trivia DB API with infinite scrolling and dynamic difficulty
document.addEventListener('DOMContentLoaded', function() {
    const questionsContainer = document.getElementById('questions-container');
    const scoreElement = document.getElementById('score');
    const questionTemplate = document.getElementById('question-template');
    const hudElement = document.getElementById('hud');

    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let triviaQuestions = [];
    let isLoading = false;
    let currentDifficulty = 'easy'; // Start with easy questions
    let questionsAnswered = 0;
    let sessionStartTime = Date.now();
    
    // Reposition the score HUD to prevent overlap
    if (hudElement) {
        // Move the HUD below the accuracy box
        hudElement.style.top = '80px';
        hudElement.style.right = '20px';
    }
    
    // Add controls info box if it doesn't exist
    if (!document.getElementById('controls-info')) {
        const controlsInfo = document.createElement('div');
        controlsInfo.id = 'controls-info';
        controlsInfo.innerHTML = `
            <div class="controls-content">
                <p>Controls:</p>
                <ul>
                    <li>↑/↓ - Navigate questions</li>
                    <li>Tab/Shift+Tab - Navigate options</li>
                    <li>Space/Enter - Select answer</li>
                    <li>Esc - End Quiz & See Results</li>
                </ul>
            </div>
        `;
        controlsInfo.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            padding: 15px;
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.15);
            color: white;
            font-size: 0.9rem;
        `;
        document.body.appendChild(controlsInfo);
    }
    
    // Add difficulty indicator
    const difficultyIndicator = document.createElement('div');
    difficultyIndicator.id = 'difficulty-indicator';
    difficultyIndicator.innerHTML = `
        <p>Difficulty: <span id="current-difficulty">Easy</span></p>
    `;
    difficultyIndicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        padding: 10px 15px;
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        z-index: 1000;
        color: white;
    `;
    document.body.appendChild(difficultyIndicator);
    
    // Add progress indicator
    const progressIndicator = document.createElement('div');
    progressIndicator.id = 'progress-indicator';
    progressIndicator.innerHTML = `
        <p>Questions: <span id="questions-answered">0</span> | Accuracy: <span id="accuracy">0%</span></p>
    `;
    progressIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        padding: 10px 15px;
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        z-index: 1000;
        color: white;
    `;
    document.body.appendChild(progressIndicator);

    // Initialize the game
    async function startGame() {
        try {
            // Show loading message
            questionsContainer.innerHTML = `
                <div class="question-slide">
                    <div id="boxed">
                        <h2 class="question-text">Loading questions...</h2>
                    </div>
                </div>
            `;

            // Load initial questions
            await loadMoreQuestions();
            
            // Set up scroll listener for infinite scrolling
            setupInfiniteScroll();
            
            // Set up keyboard navigation
            setupKeyboardNavigation();
            
        } catch (error) {
            console.error('Error:', error);
            questionsContainer.innerHTML = `
                <div class="question-slide">
                    <div id="boxed">
                        <h2 class="question-text">Error loading questions. Please try again.</h2>
                        <div class="choices-container">
                            <div class="choice-container" onclick="location.reload()">
                                <span class="choice-prefix">↻</span>
                                <span class="choice-text">Reload</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Load more questions
    async function loadMoreQuestions() {
        if (isLoading) return;
        
        isLoading = true;
        
        try {
            // Determine difficulty based on score
            updateDifficulty();
            
            // Fetch computer science questions with current difficulty
            const response = await fetch(`https://opentdb.com/api.php?amount=10&category=18&difficulty=${currentDifficulty}&encode=url3986`);
            const data = await response.json();
            
            if (data.response_code === 0) {
                // Process questions
                const newQuestions = data.results.map(q => {
                    // Decode all answers
                    const correctAnswer = decodeURIComponent(q.correct_answer);
                    const incorrectAnswers = q.incorrect_answers.map(a => decodeURIComponent(a));
                    
                    // Combine and shuffle all choices
                    const allChoices = [...incorrectAnswers, correctAnswer];
                    const shuffledChoices = _.shuffle(allChoices);
                    
                    return {
                        question: decodeURIComponent(q.question),
                        correctAnswer: correctAnswer,
                        allChoices: shuffledChoices,
                        category: decodeURIComponent(q.category),
                        difficulty: decodeURIComponent(q.difficulty)
                    };
                });
                
                // Add to existing questions
                triviaQuestions = [...triviaQuestions, ...newQuestions];
                
                // Display all questions
                displayQuestions();
            } else if (data.response_code === 1) {
                // No results found, try a different category
                const response = await fetch(`https://opentdb.com/api.php?amount=10&difficulty=${currentDifficulty}&encode=url3986`);
                const data = await response.json();
                
                if (data.response_code === 0) {
                    // Process questions from any category
                    const newQuestions = data.results.map(q => {
                        const correctAnswer = decodeURIComponent(q.correct_answer);
                        const incorrectAnswers = q.incorrect_answers.map(a => decodeURIComponent(a));
                        const allChoices = [...incorrectAnswers, correctAnswer];
                        const shuffledChoices = _.shuffle(allChoices);
                        
                        return {
                            question: decodeURIComponent(q.question),
                            correctAnswer: correctAnswer,
                            allChoices: shuffledChoices,
                            category: decodeURIComponent(q.category),
                            difficulty: decodeURIComponent(q.difficulty)
                        };
                    });
                    
                    triviaQuestions = [...triviaQuestions, ...newQuestions];
                    displayQuestions();
                }
            } else {
                console.error('API Error:', data.response_code);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
        } finally {
            isLoading = false;
        }
    }

    // Update difficulty based on score
    function updateDifficulty() {
        // Adjust difficulty based on score
        let newDifficulty;
        
        if (score >= 100) {
            newDifficulty = 'hard';
        } else if (score >= 50) {
            newDifficulty = 'medium';
        } else {
            newDifficulty = 'easy';
        }
        
        // Update difficulty indicator if changed
        if (newDifficulty !== currentDifficulty) {
            currentDifficulty = newDifficulty;
            const difficultySpan = document.getElementById('current-difficulty');
            difficultySpan.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
            
            // Add visual feedback for difficulty change
            difficultyIndicator.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                difficultyIndicator.style.animation = '';
            }, 500);
            
            console.log(`Difficulty changed to: ${currentDifficulty}`);
        }
    }

    // Update progress indicators
    function updateProgressIndicators() {
        const questionsAnsweredElement = document.getElementById('questions-answered');
        const accuracyElement = document.getElementById('accuracy');
        
        questionsAnsweredElement.textContent = questionsAnswered;
        
        const accuracy = questionsAnswered > 0 
            ? Math.round((correctAnswers / questionsAnswered) * 100) 
            : 0;
        
        accuracyElement.textContent = `${accuracy}%`;
        
        // Color code accuracy
        if (accuracy >= 70) {
            accuracyElement.style.color = '#4ade80'; // Green
        } else if (accuracy >= 40) {
            accuracyElement.style.color = '#facc15'; // Yellow
        } else {
            accuracyElement.style.color = '#f87171'; // Red
        }
    }

    // Display questions
    function displayQuestions() {
        // Clear loading message if present
        if (questionsContainer.querySelector('.question-text')?.textContent === 'Loading questions...') {
            questionsContainer.innerHTML = '';
        }
        
        // Get current question count
        const currentCount = document.querySelectorAll('.question-slide').length;
        
        // Add new questions
        triviaQuestions.slice(currentCount).forEach((q, index) => {
            const absoluteIndex = currentCount + index;
            const slide = questionTemplate.content.cloneNode(true);
            
            // Set question text
            slide.querySelector('.question-text').textContent = q.question;
            
            // Add category and difficulty info
            const boxed = slide.querySelector('#boxed');
            const metaInfo = document.createElement('div');
            metaInfo.className = 'question-meta';
            metaInfo.innerHTML = `
                <span class="category">${q.category}</span>
                <span class="difficulty ${q.difficulty}">${q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}</span>
            `;
            metaInfo.style.cssText = `
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                margin-bottom: 10px;
                opacity: 0.7;
            `;
            boxed.insertBefore(metaInfo, boxed.firstChild);
            
            // Style difficulty tag
            const difficultyTag = metaInfo.querySelector('.difficulty');
            if (q.difficulty === 'easy') {
                difficultyTag.style.color = '#4ade80';
            } else if (q.difficulty === 'medium') {
                difficultyTag.style.color = '#facc15';
            } else {
                difficultyTag.style.color = '#f87171';
            }
            
            // Add choices
            const choicesContainer = slide.querySelector('.choices-container');
            q.allChoices.forEach((choice, choiceIndex) => {
                const choiceElement = document.createElement('div');
                choiceElement.className = 'choice-container';
                choiceElement.tabIndex = 0; // Make focusable
                choiceElement.innerHTML = `
                    <span class="choice-prefix">${String.fromCharCode(65 + choiceIndex)}</span>
                    <span class="choice-text">${choice}</span>
                `;
                
                // Add click event
                choiceElement.addEventListener('click', () => {
                    handleAnswer(choiceElement, choice, q.correctAnswer, absoluteIndex);
                });
                
                // Add keyboard event for space/enter
                choiceElement.addEventListener('keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleAnswer(choiceElement, choice, q.correctAnswer, absoluteIndex);
                    }
                });
                
                choicesContainer.appendChild(choiceElement);
            });
            
            questionsContainer.appendChild(slide);
        });
    }

    // Set up infinite scroll
    function setupInfiniteScroll() {
        const container = document.querySelector('.container');
        
        container.addEventListener('scroll', () => {
            const scrollPosition = container.scrollTop + container.clientHeight;
            const scrollHeight = container.scrollHeight;
            
            // Load more when near the bottom
            if (scrollHeight - scrollPosition < 300 && !isLoading) {
                loadMoreQuestions();
            }
        });
    }

    // Set up keyboard navigation
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const currentSlide = getVisibleQuestionSlide();
            
            if (!currentSlide) return;
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    scrollToPreviousQuestion(currentSlide);
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    scrollToNextQuestion(currentSlide);
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    finishQuiz();
                    break;
            }
        });
    }

    // Get the currently visible question slide
    function getVisibleQuestionSlide() {
        const slides = document.querySelectorAll('.question-slide');
        
        for (const slide of slides) {
            const rect = slide.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2;
            
            if (isVisible) {
                return slide;
            }
        }
        
        return null;
    }

    // Scroll to previous question
    function scrollToPreviousQuestion(currentSlide) {
        const prevSlide = currentSlide.previousElementSibling;
        if (prevSlide && prevSlide.classList.contains('question-slide')) {
            prevSlide.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Scroll to next question
    function scrollToNextQuestion(currentSlide) {
        const nextSlide = currentSlide.nextElementSibling;
        if (nextSlide && nextSlide.classList.contains('question-slide')) {
            nextSlide.scrollIntoView({ behavior: 'smooth' });
        } else if (!isLoading) {
            // Load more questions if we're at the end
            loadMoreQuestions();
        }
    }

    // Handle answer selection
    function handleAnswer(choiceElement, selectedAnswer, correctAnswer, questionIndex) {
        // Check if already answered
        const questionSlide = choiceElement.closest('.question-slide');
        if (questionSlide.querySelector('.correct') || questionSlide.querySelector('.incorrect')) {
            return;
        }
        
        // Check if answer is correct
        const isCorrect = selectedAnswer === correctAnswer;
        
        // Mark selected answer
        choiceElement.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Update score: +10 for correct, -5 for incorrect
        if (isCorrect) {
            score += 10;
            correctAnswers++;
        } else {
            score = Math.max(0, score - 5); // Prevent negative score
            incorrectAnswers++;
            
            // Highlight correct answer
            const choices = questionSlide.querySelectorAll('.choice-container');
            choices.forEach(choice => {
                if (choice.querySelector('.choice-text').textContent === correctAnswer) {
                    choice.classList.add('correct');
                }
            });
        }
        
        // Update counters
        questionsAnswered++;
        
        // Update displays
        scoreElement.textContent = score;
        updateProgressIndicators();
        
        // Update difficulty after score change
        updateDifficulty();
        
        // Save stats to localStorage for end page
        localStorage.setItem('mostRecentScore', score);
        localStorage.setItem('correctAnswers', correctAnswers);
        localStorage.setItem('incorrectAnswers', incorrectAnswers);
        
        // Scroll to next question after delay
        setTimeout(() => {
            scrollToNextQuestion(questionSlide);
        }, 1000);
    }
    
    // Finish quiz and go to end page
    function finishQuiz() {
        // Calculate session duration
        const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000); // in seconds
        
        // Save final stats to localStorage
        localStorage.setItem('mostRecentScore', score);
        localStorage.setItem('correctAnswers', correctAnswers);
        localStorage.setItem('incorrectAnswers', incorrectAnswers);
        localStorage.setItem('questionsAnswered', questionsAnswered);
        localStorage.setItem('sessionDuration', sessionDuration);
        localStorage.setItem('averageTimePerQuestion', questionsAnswered > 0 ? Math.round(sessionDuration / questionsAnswered) : 0);
        
        // Navigate to end page
        window.location.href = '../html/end.html';
    }

    // Add CSS for animations and new elements
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .question-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            margin-bottom: 10px;
            opacity: 0.7;
        }
        
        .difficulty.easy {
            color: #4ade80;
        }
        
        .difficulty.medium {
            color: #facc15;
        }
        
        .difficulty.hard {
            color: #f87171;
        }
    `;
    document.head.appendChild(style);

    // Start the game
    startGame();
});
