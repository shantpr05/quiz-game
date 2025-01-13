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

function loadQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionEl.innerHTML = currentQuestion.question;
  currentQuestion.options.forEach((option) => {
    const li = document.createElement("li");
    li.textContent = option;
    li.addEventListener("click", () => selectAnswer(li, currentQuestion.answer));
    answersEl.appendChild(li);
  });
  updateProgress();
}

function resetState() {
  feedbackEl.textContent = "";
  nextBtn.disabled = true;
  answersEl.innerHTML = "";
}

function selectAnswer(selected, correct) {
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
  fetchQuestions();
});

fetchQuestions();
