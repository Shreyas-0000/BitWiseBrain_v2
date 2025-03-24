// Course topics data
const courseTopics = {
    html: {
        title: 'HTML Topics',
        topics: [
            'Introduction to HTML',
            'Basic HTML Tags',
            'Links and Images',
            'Tables',
            'Forms and Input',
            'Semantic HTML',
            'Multimedia in HTML',
            'HTML Entities & Symbols',
            'IFrames',
            'Meta Tags & SEO Basics',
            'Advanced Form Features',
            'Accessibility in HTML',
            'HTML APIs (Advanced Integration)',
            'HTML5 Advanced Features'
        ]
    },
    css: {
        title: 'CSS Topics',
        topics: [
            'Introduction to CSS & Types (Inline, Internal, External)',
            'CSS Syntax, Selectors & Specificity',
            'Colors, Units & CSS Variables',
            'Text & Font Styling (Typography)',
            'Box Model (Margin, Padding, Border, Content)',
            'Backgrounds, Gradients & Borders',
            'CSS Positioning & Z-Index',
            'Flexbox Layout',
            'Grid Layout',
            'Responsive Design & Media Queries',
            'Pseudo-classes & Pseudo-elements',
            'CSS Transitions, Transformations & Animations',
            'Advanced Selectors & Combinators',
            'Clipping, Masking, Filters & Shadows',
            'Modern CSS Features'
        ]
    },
    javascript: {
        title: 'JavaScript Topics',
        topics: [
            'Introduction to JavaScript',
            'Operators & Expressions',
            'Conditional Statements',
            'Loops & Iteration',
            'Functions',
            'Arrays & Array Methods',
            'Objects & Object Methods',
            'String Methods & Manipulation',
            'DOM Manipulation & Events',
            'ES6 Features',
            'Advanced Functions',
            'Asynchronous JavaScript',
            'Error Handling & Debugging',
            'Object-Oriented JavaScript',
            'JavaScript APIs & Advanced Topics'
        ]
    },
    python: {
        title: 'Python Topics',
        topics: [
            'Introduction to Python Programming',
            'Variables and Data Types',
            'Control Flow Statements',
            'Functions and Modules',
            'Data Structures',
            'Object-Oriented Programming (OOP)',
            'File Handling',
            'Exception Handling',
            'Iterators and Generators',
            'Decorators and Closures',
            'Regular Expressions',
            'Concurrency and Parallelism',
            'Networking and Web Development',
            'Testing and Debugging',
            'Advanced Libraries and Frameworks'
        ]
    }
};

let currentCourse = '';
let currentTopic = '';
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let correctAnswers = 0;
let questionsAnswered = 0;
let courseQuestions = null; // Will store all questions for the current course
let currentTopicQuestions = []; // Will store questions for the current topic
let completedTopics = []; // Track completed topics

// Get DOM elements
const modal = document.getElementById('topicsModal');
const modalTitle = document.getElementById('modalTitle');
const topicsList = document.getElementById('topicsList');
const closeModal = document.querySelector('.close-modal');
const startQuizButtons = document.querySelectorAll('.start-quiz-btn');
const moreDetailsBtn = document.querySelector('.more-details-btn');
const quizModal = document.getElementById('quizModal');
const questionsContainer = document.getElementById('questions-container');
const questionTemplate = document.getElementById('question-template');
const endQuizBtn = document.getElementById('end-quiz');
const popup = document.getElementById('end-quiz-popup');
const tryAgainBtn = document.getElementById('try-again');
const questionsAnsweredElement = document.getElementById('questions-answered');
const accuracyElement = document.getElementById('accuracy');
const scoreElement = document.getElementById('score');
const finalQuestions = document.getElementById('final-questions');
const finalAccuracy = document.getElementById('final-accuracy');
const finalScore = document.getElementById('final-score');

// Fetch questions from JSON file
async function fetchQuestions(course) {
    try {
        // Use relative paths based on where this script is being executed
        let url;
        
        // Use the appropriate file for each course
        if (window.location.pathname.includes('/assets/')) {
            // We're in a subdirectory
            url = `../../questions/${course.toLowerCase()}_mcq.json`;
        } else {
            // We're in the main directory
            url = `questions/${course.toLowerCase()}_mcq.json`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${course} questions: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform data based on course
        if (course.toLowerCase() === 'css') {
            return transformCSSQuestions(data);
        } else if (course.toLowerCase() === 'html') {
            return transformHTMLQuestions(data);
        } else if (course.toLowerCase() === 'javascript') {
            return transformJavaScriptQuestions(data);
        } else if (course.toLowerCase() === 'python') {
            return transformPythonQuestions(data);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching questions:', error);
        return null;
    }
}

// Transform CSS questions to match the structure of other course questions
function transformCSSQuestions(data) {
    if (!data || !data.css_mcq_questions) {
        return null;
    }
    
    // Group questions by category
    const questionsByCategory = {};
    
    data.css_mcq_questions.forEach(q => {
        if (!questionsByCategory[q.category]) {
            questionsByCategory[q.category] = [];
        }
        
        // Transform the question format
        const options = [q.options.a, q.options.b, q.options.c, q.options.d];
        const correctAnswerIndex = ['a', 'b', 'c', 'd'].indexOf(q.correct_answer);
        
        questionsByCategory[q.category].push({
            question: q.question,
            options: options,
            answer: options[correctAnswerIndex] // Store the text of the correct answer
        });
    });
    
    // Transform to match the structure of other courses
    const topics = Object.keys(questionsByCategory).map(category => {
        return {
            topic: category,
            questions: questionsByCategory[category]
        };
    });
    
    return {
        topics: topics
    };
}

// Transform HTML questions to match the structure of other course questions
function transformHTMLQuestions(data) {
    if (!data || !data.html_mcq_questions) {
        return null;
    }
    
    // Group questions by category
    const questionsByCategory = {};
    
    data.html_mcq_questions.forEach(q => {
        if (!questionsByCategory[q.category]) {
            questionsByCategory[q.category] = [];
        }
        
        // Transform the question format
        const options = [q.options.a, q.options.b, q.options.c, q.options.d];
        const correctAnswerIndex = ['a', 'b', 'c', 'd'].indexOf(q.correct_answer);
        
        questionsByCategory[q.category].push({
            question: q.question,
            options: options,
            answer: options[correctAnswerIndex] // Store the text of the correct answer
        });
    });
    
    // Transform to match the structure of other courses
    const topics = Object.keys(questionsByCategory).map(category => {
        return {
            topic: category,
            questions: questionsByCategory[category]
        };
    });
    
    return {
        topics: topics
    };
}

// Transform JavaScript questions to match the structure of other course questions
function transformJavaScriptQuestions(data) {
    if (!data || !data.javascript_mcq_questions) {
        return null;
    }
    
    // Group questions by category
    const questionsByCategory = {};
    
    data.javascript_mcq_questions.forEach(q => {
        if (!questionsByCategory[q.category]) {
            questionsByCategory[q.category] = [];
        }
        
        // Transform the question format
        const options = [q.options.a, q.options.b, q.options.c, q.options.d];
        const correctAnswerIndex = ['a', 'b', 'c', 'd'].indexOf(q.correct_answer);
        
        questionsByCategory[q.category].push({
            question: q.question,
            options: options,
            answer: options[correctAnswerIndex] // Store the text of the correct answer
        });
    });
    
    // Transform to match the structure of other courses
    const topics = Object.keys(questionsByCategory).map(category => {
        return {
            topic: category,
            questions: questionsByCategory[category]
        };
    });
    
    return {
        topics: topics
    };
}

// Transform Python questions to match the structure of other course questions
function transformPythonQuestions(data) {
    if (!data || !data.python_mcq_questions) {
        return null;
    }
    
    // Group questions by category
    const questionsByCategory = {};
    
    data.python_mcq_questions.forEach(q => {
        if (!questionsByCategory[q.category]) {
            questionsByCategory[q.category] = [];
        }
        
        // Transform the question format
        const options = [q.options.a, q.options.b, q.options.c, q.options.d];
        const correctAnswerIndex = ['a', 'b', 'c', 'd'].indexOf(q.correct_answer);
        
        questionsByCategory[q.category].push({
            question: q.question,
            options: options,
            answer: options[correctAnswerIndex] // Store the text of the correct answer
        });
    });
    
    // Transform to match the structure of other courses
    const topics = Object.keys(questionsByCategory).map(category => {
        return {
            topic: category,
            questions: questionsByCategory[category]
        };
    });
    
    return {
        topics: topics
    };
}

// Shuffle array elements (for randomizing options)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Show modal with topics
function showTopics(course) {
    currentCourse = course;
    const courseData = courseTopics[course];
    modalTitle.textContent = courseData.title;
    
    // Clear previous topics
    topicsList.innerHTML = '';
    
    // Add topics
    courseData.topics.forEach((topic, index) => {
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
        topicItem.textContent = `${index + 1}. ${topic}`;
        topicsList.appendChild(topicItem);
    });
    
    // Show modal with animation
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Add click event listeners
if (startQuizButtons) {
    startQuizButtons.forEach(button => {
        button.addEventListener('click', () => {
            const course = button.getAttribute('data-course');
            showTopics(course);
        });
    });
}

// Handle More Details button click
if (moreDetailsBtn) {
    moreDetailsBtn.addEventListener('click', () => {
        if (!currentCourse) return;
        
        // Store the current course data in localStorage
        localStorage.setItem('currentCourseData', JSON.stringify({
            course: currentCourse,
            data: courseTopics[currentCourse]
        }));
        
        // Navigate to the course details page with correct path
        window.location.href = 'assets/html/course-details.html';
    });
}

// Load course content on the details page
function loadCourseContent() {
    const courseContent = document.getElementById('courseContent');
    if (courseContent) {
        const storedData = JSON.parse(localStorage.getItem('currentCourseData'));
        if (storedData) {
            const { data, course } = storedData;
            
            console.log(`Loading content for ${course} course`);
            
            // Fetch questions data for this course
            fetchQuestions(course)
                .then(questions => {
                    if (!questions) {
                        console.error(`Failed to load questions for ${course} course`);
                        // Show error message in the UI
                        courseContent.innerHTML = `
                            <h1>${data.title}</h1>
                            <div class="error-message">
                                <h2>Error loading questions</h2>
                                <p>There was a problem loading questions for this course. Please try refreshing the page.</p>
                            </div>
                        `;
                        return;
                    }
                    
                    console.log(`Successfully loaded ${questions.topics ? questions.topics.length : 0} topics for ${course} course`);
                    courseQuestions = questions;
            
            courseContent.innerHTML = `
                <h1>${data.title}</h1>
                <div class="topic-section">
                    ${data.topics.map((topic, index) => {
                        if (typeof topic === 'string') {
                            return `
                                <div class="topic-item">
                                    <div class="topic-content">
                                        <h3>${index + 1}. ${topic}</h3>
                                        <p>Learn about ${topic.toLowerCase()} and master the concepts through practical examples.</p>
                                    </div>
                                    <button class="quiz-btn" onclick="startQuiz('${index}')">
                                        <ion-icon name="arrow-forward"></ion-icon>
                                        Start Quiz
                                    </button>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="topic-item">
                                    <div class="topic-content">
                                        <h3>${index + 1}. ${topic.title}</h3>
                                        <p>Learn about ${topic.title.toLowerCase()} and master the concepts through practical examples.</p>
                                    </div>
                                    <button class="quiz-btn" onclick="startQuiz('${index}')">
                                        <ion-icon name="arrow-forward"></ion-icon>
                                        Start Quiz
                                    </button>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            `;
                })
                .catch(error => {
                    console.error('Error in loadCourseContent:', error);
                    courseContent.innerHTML = `
                        <h1>${data.title}</h1>
                        <div class="error-message">
                            <h2>Error loading questions</h2>
                            <p>There was a problem loading questions for this course. Please try refreshing the page.</p>
                            <p>Error: ${error.message}</p>
                        </div>
                    `;
                });
        } else {
            // If no data is found, redirect back to courses page
            window.location.href = 'courses.html';
        }
    }
}

// Close modal
if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    });
}

// Close modal when clicking outside
if (modal) {
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Handle keyboard events
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Navbar functionality
const hamburger = document.querySelector('.hamburger');
const navbar = document.querySelector('.left-navbar');

if (hamburger && navbar) {
    hamburger.addEventListener('click', () => {
        navbar.classList.toggle('expanded');
    });
}

// Find matching topic in questions JSON
function findMatchingTopic(topicName) {
    if (!courseQuestions || !courseQuestions.topics) return null;
    
    // Get stored course data to check which course we're dealing with
    const storedData = JSON.parse(localStorage.getItem('currentCourseData'));
    const currentCourse = storedData ? storedData.course : '';
    const isCSSCourse = currentCourse === 'css';
    const isHTMLCourse = currentCourse === 'html';
    
    // Clean up topic name for better matching
    const cleanTopicName = topicName.toLowerCase()
        .replace(/\s*\(.*?\)\s*/g, '') // Remove content in parentheses
        .trim();
    
    // Log the topics we have for debugging
    if (courseQuestions && courseQuestions.topics) {
        console.log("Available topics:", courseQuestions.topics.map(t => t.topic));
        console.log("Looking for topic:", cleanTopicName);
    }
    
    // Special handling for CSS and HTML courses
    if (isCSSCourse || isHTMLCourse) {
        // Try to match based on the beginning of the category
        let match = courseQuestions.topics.find(topic => {
            const topicLower = topic.topic.toLowerCase();
            
            // Check for exact match with cleaned names
            const cleanTopicLower = topicLower.replace(/\s*\(.*?\)\s*/g, '').trim();
            if (cleanTopicLower === cleanTopicName) {
                return true;
            }
            
            // Check for includes match
            if (cleanTopicName.includes(cleanTopicLower) || 
                cleanTopicLower.includes(cleanTopicName)) {
                return true;
            }
            
            // Check for beginning match (first word or two)
            const topicWords = cleanTopicLower.split(' ');
            const nameWords = cleanTopicName.split(' ');
            
            // Match first two words if possible
            if (topicWords.length >= 2 && nameWords.length >= 2) {
                const topicStart = `${topicWords[0]} ${topicWords[1]}`.toLowerCase();
                const nameStart = `${nameWords[0]} ${nameWords[1]}`.toLowerCase();
                if (topicStart === nameStart) {
                    return true;
                }
            }
            
            // Match just the first word as a last resort
            return topicWords[0] === nameWords[0];
        });
        
        if (match) {
            console.log("Found matching topic:", match.topic);
            return match;
        }
    }
    
    // First try an exact match
    let match = courseQuestions.topics.find(topic => 
        topic.topic.toLowerCase() === cleanTopicName
    );
    
    // If no exact match, try contains match
    if (!match) {
        match = courseQuestions.topics.find(topic => 
            topic.topic.toLowerCase().includes(cleanTopicName) || 
            cleanTopicName.includes(topic.topic.toLowerCase())
        );
    }
    
    // If still no match, try matching by keywords
    if (!match) {
        const keywords = cleanTopicName.split(/\s+/);
        match = courseQuestions.topics.find(topic => {
            const topicLower = topic.topic.toLowerCase();
            return keywords.some(keyword => 
                keyword.length > 3 && topicLower.includes(keyword)
            );
        });
    }
    
    if (match) {
        console.log("Found matching topic:", match.topic);
    } else {
        console.warn("No matching topic found for:", topicName);
    }
    
    return match;
}

// Start quiz for a specific topic
function startQuiz(topicId) {
    // Store current topic ID
    currentTopic = topicId;
    localStorage.setItem('currentTopic', topicId);
    
    // Get the course data from localStorage
    const storedData = JSON.parse(localStorage.getItem('currentCourseData'));
    if (!storedData) return;
    
    // Reset quiz state completely
    currentQuestionIndex = 0;
    score = 0;
    questionsAnswered = 0;
    correctAnswers = 0;
    currentTopicQuestions = [];
    
    // Get the topic name
    const topicName = storedData.data.topics[topicId];
    
    // Find the matching topic in the questions JSON
    if (courseQuestions) {
        const matchingTopic = findMatchingTopic(topicName);
        
        // Log information about the matching topic for debugging
        console.log(`Starting quiz for topic: ${topicName}`);
        console.log(`Matched with: ${matchingTopic ? matchingTopic.topic : 'No match found'}`);
        
        if (matchingTopic && matchingTopic.questions) {
            console.log(`Found ${matchingTopic.questions.length} questions for this topic`);
            
            // Process questions - create a copy with randomized options
            currentTopicQuestions = matchingTopic.questions.map(q => {
                // Create copy of the question
                const question = { ...q };
                
                // Save correct answer (could be text or index)
                const correctAnswer = question.answer;
                
                // Create shuffled options
                const options = [...question.options];
                const shuffledOptions = shuffleArray([...options]);
                
                // Find correct index - handle both string answer and numeric index
                let correctIndex;
                if (typeof correctAnswer === 'number') {
                    // If it's already an index
                    correctIndex = shuffledOptions.indexOf(options[correctAnswer]);
                } else {
                    // If it's the answer text
                    correctIndex = shuffledOptions.findIndex(opt => opt === correctAnswer);
                }
                
                return {
                    question: question.question,
                    options: shuffledOptions,
                    answer: correctIndex
                };
            });
        } else {
            // No questions found for this topic
            alert(`No questions found for the topic "${topicName}". Moving to the next topic if available.`);
            moveToNextTopic();
            return;
        }
    } else {
        // No questions data available
        alert("Questions data not loaded. Please try refreshing the page.");
        return;
    }
    
    // Get the quiz modal and show it
    const quizModal = document.getElementById('quizModal');
    if (quizModal) {
        // Clear previous questions and setup
        const questionsContainer = document.getElementById('questions-container');
        if (questionsContainer) {
            questionsContainer.innerHTML = '';
        }
        
        // Configure the container for scrolling
        const container = quizModal.querySelector('.container');
        if (container) {
            // Reset scroll position
            container.scrollTop = 0;
            
            // Make sure the container has the right styles
            container.style.height = '100vh';
            container.style.width = '100vw';
            container.style.overflowY = 'scroll';
            container.style.scrollBehavior = 'smooth';
            container.style.scrollSnapType = 'y proximity';
        }
        
        // Show the quiz modal
        quizModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Display questions immediately
        displayQuestions();
        
        // Update UI
        updateUI();
    }
}

function displayQuestions() {
    const container = document.getElementById('questions-container');
    if (!container) return;
    
    // Clear previous questions
    container.innerHTML = '';
    
    // If no questions for this topic, try to move to next topic
    if (!currentTopicQuestions || currentTopicQuestions.length === 0) {
        moveToNextTopic();
        return;
    }
    
    // Get the question template
    const template = document.getElementById('question-template');
    if (!template) {
        console.error('Question template not found');
        return;
    }
    
    // Get the course and topic data
    const storedData = JSON.parse(localStorage.getItem('currentCourseData'));
    const topicName = storedData?.data?.topics[currentTopic] || 'Unknown Topic';
    
    // Display each question
    currentTopicQuestions.forEach((question, index) => {
        const questionElement = template.content.cloneNode(true);
        const questionSlide = questionElement.querySelector('.question-slide');
        const questionBox = questionElement.querySelector('#boxed');
        
        // Set question text
        const questionText = questionElement.querySelector('.question-text');
        questionText.textContent = question.question;
        
        // Set category and difficulty
        const category = questionElement.querySelector('.category');
        const difficulty = questionElement.querySelector('.difficulty');
        category.textContent = topicName;
        difficulty.textContent = 'Multiple Choice';
        
        // Add choices
        const choicesContainer = questionElement.querySelector('.choices-container');
        question.options.forEach((option, optionIndex) => {
            const choice = document.createElement('div');
            choice.className = 'choice-container';
            choice.tabIndex = 0; // Make the choice focusable for keyboard users
            choice.innerHTML = `
                <span class="choice-prefix">${String.fromCharCode(65 + optionIndex)}</span>
                <span class="choice-text">${option}</span>
            `;
            choice.addEventListener('click', () => handleAnswer(optionIndex, index));
            
            // Add keyboard support for choices
            choice.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleAnswer(optionIndex, index);
                }
            });
            
            choicesContainer.appendChild(choice);
        });
        
        // Add to container
        container.appendChild(questionElement);
    });
    
    // Reset scroll position to the top before setting up behaviors
    const quizContainer = document.querySelector('.container');
    if (quizContainer) {
        quizContainer.scrollTop = 0;
    }
    
    // Set up smooth scrolling behavior
    setupScrollBehavior();
    
    // Set up keyboard navigation
    setupKeyboardNavigation();
    
    // Ensure the first question is visible
    setTimeout(() => {
        currentQuestionIndex = 0;
        const slides = document.querySelectorAll('.question-slide');
        if (slides && slides[0]) {
            slides[0].scrollIntoView({ behavior: 'auto', block: 'center' });
        }
    }, 100);
}

// Set up keyboard navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Only handle keys if the quiz modal is visible
        const quizModal = document.getElementById('quizModal');
        if (!quizModal || quizModal.style.display !== 'block') return;
        
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
                const popup = document.getElementById('end-quiz-popup');
                if (popup && popup.classList.contains('active')) {
                    // If popup is already active, do nothing
                    return;
                }
                showEndQuizPopup();
                break;
        }
    });
}

// Set up scroll behavior
function setupScrollBehavior() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    let scrollTimeout;
    
    container.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const newIndex = getCurrentQuestionIndex();
            if (newIndex !== currentQuestionIndex) {
                currentQuestionIndex = newIndex;
            }
        }, 50);
    });
}

// Get current visible slide
function getCurrentSlide() {
    const slides = document.querySelectorAll('.question-slide');
    for (const slide of slides) {
        const rect = slide.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
            return slide;
        }
    }
    return null;
}

// Get current question index
function getCurrentQuestionIndex() {
    const currentSlide = getCurrentSlide();
    if (!currentSlide) return currentQuestionIndex;
    
    const slides = Array.from(document.querySelectorAll('.question-slide'));
    return slides.indexOf(currentSlide);
}

// Navigation functions
function scrollToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        const slides = document.querySelectorAll('.question-slide');
        if (slides && slides[currentQuestionIndex]) {
            slides[currentQuestionIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function scrollToNextQuestion() {
    if (currentQuestionIndex < currentTopicQuestions.length - 1) {
        currentQuestionIndex++;
        const slides = document.querySelectorAll('.question-slide');
        if (slides && slides[currentQuestionIndex]) {
            slides[currentQuestionIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function handleAnswer(selectedIndex, questionIndex) {
    if (!currentTopicQuestions || questionIndex >= currentTopicQuestions.length) return;
    
    const question = currentTopicQuestions[questionIndex];
    if (!question) return;
    
    // Get the question slide
    const questionSlide = document.querySelectorAll('.question-slide')[questionIndex];
    if (!questionSlide) return;
    
    // Check if this question has already been answered
    if (questionSlide.querySelector('.correct') || questionSlide.querySelector('.incorrect')) {
        return; // Question already answered
    }
    
    const choices = questionSlide.querySelectorAll('.choice-container');
    
    // Disable all choices
    choices.forEach(choice => {
        choice.style.pointerEvents = 'none';
    });
    
    // Mark correct and incorrect answers
    choices.forEach((choice, index) => {
        if (index === question.answer) {
            choice.classList.add('correct');
        } else if (index === selectedIndex) {
            choice.classList.add('incorrect');
        }
    });
    
    // Update score
    if (selectedIndex === question.answer) {
        score += 10;
        correctAnswers++;
    }
    questionsAnswered++;
    
    // Update UI
    updateUI();
    
    // Check if we've answered all questions in this topic
    const allAnswered = questionsAnswered >= currentTopicQuestions.length;
    
    // Move to next question after a delay or move to next topic if all questions answered
    setTimeout(() => {
        if (allAnswered) {
            // All questions in this topic are answered, move to next topic
            moveToNextTopic();
        } else if (questionIndex < currentTopicQuestions.length - 1) {
            // Move to the next question
            scrollToNextQuestion();
        }
    }, 1000);
}

// Move to the next topic
function moveToNextTopic() {
    const storedData = JSON.parse(localStorage.getItem('currentCourseData'));
    if (!storedData || !storedData.data) return;
    
    // Add current topic to completed topics
    if (currentTopic !== null && !completedTopics.includes(currentTopic)) {
        completedTopics.push(currentTopic);
    }
    
    // Find next topic that has questions
    const totalTopics = storedData.data.topics.length;
    let nextTopicId = parseInt(currentTopic) + 1;
    
    // Check if we've completed all topics
    if (nextTopicId >= totalTopics || completedTopics.length >= totalTopics) {
        showEndQuizPopup();
        return;
    }
    
    // Start quiz for next topic
    currentTopic = nextTopicId.toString();
    localStorage.setItem('currentTopic', currentTopic);
    
    // Reset counters for the new topic
    questionsAnswered = 0;
    correctAnswers = 0; // Reset correct answers count
    currentQuestionIndex = 0;
    
    // Get next topic questions
    const topicName = storedData.data.topics[currentTopic];
    
    // Update UI before showing the alert
    updateUI();
    
    // Show topic name notification
    const notification = document.createElement('div');
    notification.classList.add('topic-notification');
    notification.innerHTML = `<h3>Moving to next topic: ${topicName}</h3>`;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 2500);
    
    const matchingTopic = findMatchingTopic(topicName);
    
    if (matchingTopic && matchingTopic.questions) {
        // Process questions with randomized options
        currentTopicQuestions = matchingTopic.questions.map(q => {
            // Create copy of the question
            const question = { ...q };
            
            // Save correct answer (could be text or index)
            const correctAnswer = question.answer;
            
            // Create shuffled options
            const options = [...question.options];
            const shuffledOptions = shuffleArray([...options]);
            
            // Find correct index - handle both string answer and numeric index
            let correctIndex;
            if (typeof correctAnswer === 'number') {
                // If it's already an index
                correctIndex = shuffledOptions.indexOf(options[correctAnswer]);
            } else {
                // If it's the answer text
                correctIndex = shuffledOptions.findIndex(opt => opt === correctAnswer);
            }
            
            return {
                question: question.question,
                options: shuffledOptions,
                answer: correctIndex
            };
        });
        
        // Display new questions
        displayQuestions();
        
        // Scroll to the first question
        setTimeout(() => {
            const slides = document.querySelectorAll('.question-slide');
            if (slides && slides[0]) {
                slides[0].scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        }, 100);
    } else {
        // If no questions found for this topic, try the next one
        moveToNextTopic();
    }
}

// Update UI elements
function updateUI() {
    // Ensure correctAnswers is not greater than questionsAnswered
    if (correctAnswers > questionsAnswered) {
        correctAnswers = questionsAnswered;
    }
    
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    
    if (questionsAnsweredElement) questionsAnsweredElement.textContent = questionsAnswered;
    if (accuracyElement) accuracyElement.textContent = `${accuracy}%`;
    if (scoreElement) scoreElement.textContent = score;

    // Update accuracy color based on value
    if (accuracyElement) {
    if (accuracy >= 80) {
        accuracyElement.style.color = '#4CAF50';
    } else if (accuracy >= 60) {
        accuracyElement.style.color = '#FFC107';
    } else {
        accuracyElement.style.color = '#F44336';
    }
    }
    
    // Log statistics for debugging
    console.log(`Stats - Questions: ${questionsAnswered}, Correct: ${correctAnswers}, Accuracy: ${accuracy}%`);
}

// Show end quiz popup
function showEndQuizPopup() {
    const popup = document.getElementById('end-quiz-popup');
    if (!popup) return;
    
    const finalQuestions = document.getElementById('final-questions');
    const finalAccuracy = document.getElementById('final-accuracy');
    const finalScore = document.getElementById('final-score');
    
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    
    if (finalQuestions) finalQuestions.textContent = questionsAnswered;
    if (finalAccuracy) finalAccuracy.textContent = `${accuracy}%`;
    if (finalScore) finalScore.textContent = score;
    
    popup.classList.add('active');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load course content
    loadCourseContent();
    
    // Add CSS for topic notification
    const style = document.createElement('style');
    style.textContent = `
        .topic-notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(30, 200, 255, 0.2);
            backdrop-filter: blur(10px);
            padding: 20px 40px;
            border-radius: 10px;
            border: 1px solid rgba(30, 200, 255, 0.4);
            color: white;
            z-index: 2100;
            text-align: center;
            animation: fadeIn 0.5s ease;
            box-shadow: 0 0 30px rgba(30, 200, 255, 0.3);
        }
        
        .topic-notification h3 {
            margin: 0;
            color: white;
            font-size: 1.5rem;
        }
        
        .fade-out {
            animation: fadeOut 0.5s ease forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Set up end quiz button
    const endQuizBtn = document.getElementById('end-quiz');
    if (endQuizBtn) {
        endQuizBtn.addEventListener('click', () => {
            showEndQuizPopup();
        });
    }
    
    // Set up try again button
    const tryAgainBtn = document.getElementById('try-again');
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => {
            const popup = document.getElementById('end-quiz-popup');
            if (popup) popup.classList.remove('active');
            
            // Reset completed topics
            completedTopics = [];
            
            // Restart quiz with first topic
            startQuiz("0");
        });
    }
    
    // Set up return to topics button
    const returnBtn = document.getElementById('return-to-topics');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            const popup = document.getElementById('end-quiz-popup');
            if (popup) popup.classList.remove('active');
            
            // Hide quiz modal
            const quizModal = document.getElementById('quizModal');
            if (quizModal) quizModal.style.display = 'none';
            
            // Show topics again
            document.body.style.overflow = 'auto';
        });
    }
});

function initializeQuiz() {
    // Get current topic from localStorage or set default
    const storedTopic = localStorage.getItem('currentTopic') || '0';
    
    // Start quiz with the stored topic
    startQuiz(storedTopic);
} 