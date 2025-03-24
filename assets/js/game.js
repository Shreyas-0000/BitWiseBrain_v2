// Quiz Generation
async function generateQuestionsByLanguage(language, count, difficulty) {
    try {
        const quizSettings = JSON.parse(localStorage.getItem('quizSettings'));
        if (!quizSettings) {
            throw new Error('Quiz settings not found');
        }

        const { difficulty: selectedDifficulty, questionCount } = quizSettings;
        
        let url = 'https://opentdb.com/api.php?';
        
        const params = new URLSearchParams({
            amount: questionCount === 'infinite' ? '50' : count,
            category: '18',
            difficulty: selectedDifficulty.toLowerCase()
        });
        
        url += params.toString();
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch questions from API');
        }
        
        const data = await response.json();
        
        if (data.response_code !== 0) {
            throw new Error(`API Error: ${data.response_code}`);
        }
        
        return data.results.map(q => ({
            question: q.question,
            options: q.type === 'boolean' 
                ? ['True', 'False']
                : [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
            answer: q.correct_answer,
            difficulty: q.difficulty
        }));
    } catch (error) {
        console.error('Error generating questions:', error);
        return [];
    }
}

// Main Quiz Logic
document.addEventListener('DOMContentLoaded', function() {
    const quizSettings = JSON.parse(localStorage.getItem('quizSettings'));
    if (!quizSettings) {
        window.location.href = 'quiz-setup.html';
        return;
    }

    const questionsContainer = document.getElementById('questions-container');
    const scoreElement = document.getElementById('score');
    const questionTemplate = document.getElementById('question-template');
    const questionsAnsweredElement = document.getElementById('questions-answered');
    const accuracyElement = document.getElementById('accuracy');
    const endQuizBtn = document.getElementById('end-quiz');
    const popup = document.getElementById('end-quiz-popup');
    const tryAgainBtn = document.getElementById('try-again');
    const finalQuestions = document.getElementById('final-questions');
    const finalAccuracy = document.getElementById('final-accuracy');
    const finalScore = document.getElementById('final-score');

    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let questionsAnswered = 0;
    let currentQuestionIndex = 0;
    let questions = [];
    let isLoading = false;
    let isInfiniteMode = false;
    let preloadTimeout = null;

    // Quiz Initialization
    async function startQuiz() {
        try {
            questionsContainer.innerHTML = `
                <div class="question-slide">
                    <div id="boxed">
                        <h2 class="question-text">Loading questions...</h2>
                    </div>
                </div>
            `;

            isInfiniteMode = quizSettings.questionCount === 'infinite';
            await loadQuestions();
            setupKeyboardNavigation();
        } catch (error) {
            console.error('Error starting quiz:', error);
            showError();
        }
    }

    // Question Loading
    async function loadQuestions() {
        if (isLoading) return;
        isLoading = true;
        
        try {
            const newQuestions = await generateQuestionsByLanguage('', 
                isInfiniteMode ? 50 : parseInt(quizSettings.questionCount), 
                quizSettings.difficulty
            );
            
            if (newQuestions.length === 0) {
                throw new Error('No questions received from API');
            }

            questions = newQuestions;
        displayQuestions();

            if (isInfiniteMode) {
                if (preloadTimeout) {
                    clearTimeout(preloadTimeout);
                }
                
                preloadTimeout = setTimeout(async () => {
                    await preloadNextBatch();
                }, 20000);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            showError();
        } finally {
            isLoading = false;
        }
    }

    // Question Preloading
    async function preloadNextBatch() {
        if (isLoading) return;
        isLoading = true;
        
        try {
            const newQuestions = await generateQuestionsByLanguage('', 50, quizSettings.difficulty);
            
            if (newQuestions.length === 0) {
                throw new Error('No questions received from API');
            }

            questions = [...questions, ...newQuestions];
            
            preloadTimeout = setTimeout(async () => {
                await preloadNextBatch();
            }, 20000);
        } catch (error) {
            console.error('Error preloading questions:', error);
        } finally {
            isLoading = false;
        }
    }

    // Question Display
    function displayQuestions() {
        questionsContainer.innerHTML = '';
        
        questions.forEach((q, index) => {
            const slide = questionTemplate.content.cloneNode(true);
            
            slide.querySelector('.question-text').textContent = q.question;
            
            const difficultyElement = slide.querySelector('.difficulty');
            difficultyElement.textContent = q.difficulty;
            difficultyElement.className = `difficulty ${q.difficulty}`;
            
            const choicesContainer = slide.querySelector('.choices-container');
            q.options.forEach((option, choiceIndex) => {
                const choiceElement = document.createElement('div');
                choiceElement.className = 'choice-container';
                choiceElement.tabIndex = 0;
                choiceElement.innerHTML = `
                    <span class="choice-prefix">${String.fromCharCode(65 + choiceIndex)}</span>
                    <span class="choice-text">${option}</span>
                `;
                
                choiceElement.addEventListener('click', () => handleAnswer(choiceElement, option, q.answer, index));
                choiceElement.addEventListener('keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleAnswer(choiceElement, option, q.answer, index);
                    }
                });
                
                choicesContainer.appendChild(choiceElement);
            });
            
            questionsContainer.appendChild(slide);
        });
    }

    // Answer Handling
    function handleAnswer(choiceElement, selectedAnswer, correctAnswer, questionIndex) {
        const questionSlide = choiceElement.closest('.question-slide');
        if (questionSlide.querySelector('.correct') || questionSlide.querySelector('.incorrect')) {
            return;
        }
        
        const isCorrect = selectedAnswer === correctAnswer;
        
        if (isCorrect) {
            score += 5;
            correctAnswers++;
            choiceElement.classList.add('correct');
        } else {
            score = Math.max(0, score - 1);
            incorrectAnswers++;
            choiceElement.classList.add('incorrect');
            
            const choices = questionSlide.querySelectorAll('.choice-container');
            choices.forEach(choice => {
                if (choice.querySelector('.choice-text').textContent === correctAnswer) {
                    choice.classList.add('correct');
                }
            });
        }
        
        questionsAnswered++;
        updateUI();
        
        if (!isInfiniteMode && questionsAnswered === questions.length) {
            setTimeout(() => {
                showEndQuizPopup();
            }, 1000);
        } else if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
                scrollToNextQuestion();
            }, 1000);
        }
    }

    // UI Updates
    function updateUI() {
        scoreElement.textContent = score;
        questionsAnsweredElement.textContent = questionsAnswered;
        
        const accuracy = questionsAnswered > 0 
            ? Math.round((correctAnswers / questionsAnswered) * 100) 
            : 0;
        
        accuracyElement.textContent = `${accuracy}%`;
        
        if (accuracy >= 70) {
            accuracyElement.style.color = '#4ade80';
        } else if (accuracy >= 40) {
            accuracyElement.style.color = '#facc15';
        } else {
            accuracyElement.style.color = '#f87171';
        }
    }

    // Navigation
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const currentSlide = getCurrentSlide();
            if (!currentSlide) return;
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    scrollToPreviousQuestion();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    scrollToNextQuestion();
                    break;
                case 'Escape':
                    e.preventDefault();
                    endQuiz();
                    break;
            }
        });
    }

    function scrollToPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            const slides = document.querySelectorAll('.question-slide');
            slides[currentQuestionIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function scrollToNextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            const slides = document.querySelectorAll('.question-slide');
            slides[currentQuestionIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Quiz End
    function endQuiz() {
        localStorage.setItem('mostRecentScore', score);
        localStorage.setItem('correctAnswers', correctAnswers);
        localStorage.setItem('incorrectAnswers', incorrectAnswers);
        window.location.href = '../html/end.html';
    }

    function showError() {
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

    endQuizBtn.addEventListener('click', () => {
        showEndQuizPopup();
    });

    function showEndQuizPopup() {
        const questionsAnswered = document.getElementById('questions-answered').textContent;
        const accuracy = document.getElementById('accuracy').textContent;
        const score = document.getElementById('score').textContent;

        finalQuestions.textContent = questionsAnswered;
        finalAccuracy.textContent = accuracy;
        finalScore.textContent = score;

        popup.classList.add('active');
    }

    tryAgainBtn.addEventListener('click', () => {
        window.location.href = 'quiz-setup.html';
    });

    startQuiz();
});
