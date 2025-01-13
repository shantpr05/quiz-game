const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple";
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

async function fetchQuestions() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    questions = data.results.map((q) => ({
      question: q.question,
      options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
      answer: q.correct_answer,
    }));
    loadQuestion();
  } catch (error) {
    questionEl.textContent = "Failed to load questions. Please try again later.";
  }
}

function updateQuestionNumber() {
  const questionNumberEl = document.getElementById("question-number");
  if (currentQuestionIndex >= questions.length) {
    questionNumberEl.style.display = "none"; // Hide the question number
  } else {
    questionNumberEl.style.display = "block"; // Show the question number
    questionNumberEl.textContent = `Question ${currentQuestionIndex + 1}`;
  }  
}
function loadQuestion() {
  resetState(); // Clear previous question's state
  const currentQuestion = questions[currentQuestionIndex];
  
  // Update the question text
  questionEl.textContent = currentQuestion.question;

  // Update the question number
  updateQuestionNumber();

  // Generate answer options
  currentQuestion.options.forEach((option) => {
    const li = document.createElement("li");
    li.textContent = option;
    li.addEventListener("click", handleOptionClick);
    answersEl.appendChild(li);
  });

  updateProgress(); // Update progress bar (if applicable)
}


function resetState() {
  feedbackEl.textContent = "";
  nextBtn.disabled = true;
  answersEl.innerHTML = "";
}

function selectAnswer(selected, correct) {
  // Prevent multiple selections by disabling all options immediately
  Array.from(answersEl.children).forEach((li) => {
    li.removeEventListener("click", handleOptionClick);
    li.classList.add("disabled"); // Disable other options visually
  });

  // Highlight the selected option
  if (selected.textContent === correct) {
    selected.classList.add("correct");
    score++;
    feedbackEl.textContent = "Correct!";
  } else {
    selected.classList.add("incorrect");
    feedbackEl.textContent = "Wrong!";
  }
  nextBtn.disabled = false;
  Array.from(answersEl.children).forEach((li) => {
    li.removeEventListener("click", () => selectAnswer(li, correct));
  });
}

// Add a reusable function for adding event listeners
function handleOptionClick(event) {
  const selectedOption = event.target;
  const correctAnswer = questions[currentQuestionIndex].answer;
  selectAnswer(selectedOption, correctAnswer);
}
function updateProgress() {
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
}

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    
    questionEl.textContent = `Quiz Over! Your Score: ${score}/${questions.length}`;
    answersEl.innerHTML = "";
    nextBtn.disabled = true;
  }
});



restartBtn.addEventListener("click", () => {
  currentQuestionIndex = 0;
  score = 0;

  progressBar.style.width = "0%";
  feedbackEl.textContent = "";
  answersEl.innerHTML = "";
  questionEl.textContent = "Loading...";
  fetchQuestions();
});

fetchQuestions();
function showEndScreen() {
  questionEl.textContent = "Quiz Over!"; // Show end message
  answersEl.innerHTML = ""; // Clear answer options
  feedbackEl.textContent = `Your final score is ${score}/${questions.length}.`;

  // Hide the question number
  updateQuestionNumber();

  // Optionally hide the Next button if needed
  nextBtn.style.display = "none";
}
