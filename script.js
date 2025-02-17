const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple";
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");
const questionNumberEl = document.getElementById("question-number");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

async function fetchQuestions() {
  try {
    const response = await fetch(API_URL);
    // Handle HTTP errors since fetch won't.
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.status}`);
    }
    const data = await response.json();
    // use more descriptive variable names
    questions = data.results.map((question) => ({
      question: question.question,
      options: shuffleArray([
        ...question.incorrect_answers,
        question.correct_answer,
      ]),
      answer: question.correct_answer,
    }));
    loadQuestion();
  } catch (error) {
    questionEl.textContent =
      "Failed to load questions. Please try again later.";
  }
}

// Break out shuffle function for readability
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function updateQuestionNumber() {
  // Move getElementById outside of the function for better performance
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
  // Should be textContent instead of innerHTML
  answersEl.textContent = "";
}

function selectAnswer(selected, correct) {
  // Prevent multiple selections by disabling all options immediately
  Array.from(answersEl.children).forEach((li) => {
    li.removeEventListener("click", handleOptionClick);
    li.classList.add("disabled"); // Disable other options visually
  });

  // Highlight the selected option

  // for better readability, you can use a ternary operator
  const isCorrect = selected.textContent === correct;
  selected.classList.add(isCorrect ? "correct" : "incorrect");
  feedbackEl.textContent = isCorrect ? "Correct!" : "Wrong!";
  isCorrect ? score++ : null;

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
    // Should be textContent instead of innerHTML
    answersEl.textContent = "";
    nextBtn.disabled = true;
  }
});

restartBtn.addEventListener("click", () => {
  currentQuestionIndex = 0;
  score = 0;

  progressBar.style.width = "0%";
  feedbackEl.textContent = "";
  // Should be textContent instead of innerHTML
  answersEl.textContent = "";
  questionEl.textContent = "Loading...";
  fetchQuestions();
});

fetchQuestions();
function showEndScreen() {
  questionEl.textContent = "Quiz Over!"; // Show end message
  // Should be textContent instead of innerHTML
  answersEl.textContent = ""; // Clear answer options
  feedbackEl.textContent = `Your final score is ${score}/${questions.length}.`;

  // Hide the question number
  updateQuestionNumber();

  // Optionally hide the Next button if needed
  nextBtn.style.display = "none";
}
