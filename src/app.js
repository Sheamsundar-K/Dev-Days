// UI code: connects the quiz logic (quiz.js) to the page (index.html).

const BEST_SCORE_KEY = "dev_days_best_score";
const state = { questions: [], current: 0, score: 0 };

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const progressText = document.getElementById("progress");
const questionText = document.getElementById("question-text");
const optionsList = document.getElementById("options");
const feedbackText = document.getElementById("feedback");
const nextButton = document.getElementById("next-btn");
const scoreText = document.getElementById("score-text");
const gradeText = document.getElementById("grade-text");
const startBestScoreText = document.getElementById("start-best-score");
const resultBestScoreText = document.getElementById("result-best-score");
const newBestMessage = document.getElementById("new-best-message");

function readBestScore() {
  try {
    const savedScore = window.localStorage.getItem(BEST_SCORE_KEY);
    if (savedScore === null) return null;

    const bestScore = Number(savedScore);
    if (!Number.isFinite(bestScore) || bestScore < 0 || bestScore > 100) {
      console.warn("The saved best score is invalid.");
      return null;
    }

    return bestScore;
  } catch (error) {
    console.warn("Unable to read the best score from localStorage.", error);
    return null;
  }
}

function saveBestScore(score) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch (error) {
    console.warn("Unable to save the best score to localStorage.", error);
  }
}

function formatBestScore(score) {
  return score === null ? "Best score: Not set" : `Best score: ${score}%`;
}

function renderStartBestScore() {
  startBestScoreText.textContent = formatBestScore(readBestScore());
}

function showScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.hidden = screen !== screenToShow;
  });
}

function startQuiz() {
  state.questions = shuffle(QUESTIONS);
  state.current = 0;
  state.score = 0;
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  const question = state.questions[state.current];
  progressText.textContent = `Question ${state.current + 1} of ${state.questions.length}`;
  questionText.textContent = question.question;
  feedbackText.textContent = "";
  nextButton.hidden = true;
  optionsList.innerHTML = "";

  question.options.forEach((option, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option;
    button.addEventListener("click", () => selectAnswer(index, button));
    item.appendChild(button);
    optionsList.appendChild(item);
  });
}

function selectAnswer(selectedIndex, selectedButton) {
  const question = state.questions[state.current];
  const buttons = optionsList.querySelectorAll("button");
  buttons.forEach((button) => (button.disabled = true));

  if (isCorrect(question, selectedIndex)) {
    state.score++;
    selectedButton.classList.add("correct");
    feedbackText.textContent = "Correct!";
  } else {
    selectedButton.classList.add("wrong");
    buttons[question.answer].classList.add("correct");
    feedbackText.textContent = "Not quite. The correct answer is highlighted.";
  }

  nextButton.hidden = false;
  nextButton.focus();
}

function nextQuestion() {
  state.current++;
  if (state.current < state.questions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  const total = state.questions.length;
  const percentage = calculatePercentage(state.score, total);
  const previousBest = readBestScore();
  const isNewBest = isNewBestScore(percentage, previousBest);

  if (isNewBest) {
    saveBestScore(percentage);
  }

  scoreText.textContent = `You scored ${state.score} out of ${total} (${percentage}%)`;
  resultBestScoreText.textContent = formatBestScore(isNewBest ? percentage : previousBest);
  newBestMessage.hidden = !isNewBest;
  gradeText.textContent = `Grade: ${getGrade(percentage)}`;
  showScreen(resultScreen);
}

renderStartBestScore();

document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("restart-btn").addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);
