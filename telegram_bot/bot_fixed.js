import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Fixed Telegram Bot for AI Agents Team Management System
 * Improved error handling and message processing
 */
class AgentsTeamBotFixed {
  constructor(apiGatewayUrl = 'http://localhost:3000') {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.apiGatewayUrl = apiGatewayUrl;
    this.bot = null;
    this.userSessions = new Map();
    this.isStarted = false;
  }

  /**
   * Initialize and start the Telegram bot with better error handling
   */
  async start() {
    if (!this.token) {
      console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
      console.log('Token format should be: 1234567890:ABCDefGhIJKlmnoPQRstUVWxyz');
      return false;
    }

    try {
      console.log('🔧 Creating bot instance...');
      
      // Create bot with explicit options
      this.bot = new TelegramBot(this.token, {
        polling: {
          interval: 300,
          autoStart: true,
          params: {
            timeout: 10
          }
        }
      });

      console.log('🔧 Setting up error handlers...');
      this.setupErrorHandlers();
      
      console.log('🔧 Setting up commands...');
      await this.setupCommands();
      
      console.log('🔧 Setting up message handlers...');
      this.setupMessageHandlers();
      
      this.isStarted = true;
      console.log('✅ Telegram bot started successfully');
      console.log('📱 Bot is ready to receive messages');
      
      // Test the bot by getting bot info
      try {
        const botInfo = await this.bot.getMe();
        console.log(`🤖 Bot info: @${botInfo.username} (${botInfo.first_name})`);
        console.log(`📋 Bot ID: ${botInfo.id}`);
      } catch (error) {
        console.error('⚠️ Could not get bot info:', error.message);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to start Telegram bot:', error.message);
      console.error('Full error:', error);
      return false;
    }
  }

  /**
   * Setup error handlers
   */
  setupErrorHandlers() {
    this.bot.on('error', (error) => {
      console.error('🔴 Bot error:', error);
    });

    this.bot.on('polling_error', (error) => {
      console.error('🔴 Polling error:', error.code, error.message);
      
      // Try to restart if polling fails
      if (error.code === 'EFATAL') {
        console.log('🔄 Attempting to restart polling...');
        setTimeout(() => {
          this.restart();
        }, 5000);
      }
    });
  }

  /**
   * Setup bot commands with better error handling
   */
  async setupCommands() {
    try {
      const commands = [
        { command: 'start', description: 'Start interacting with AI agents' },
        { command: 'help', description: 'Show available commands' },
        { command: 'task', description: 'Submit a new task' },
        { command: 'status', description: 'Check task status' },
        { command: 'agents', description: 'List available agents' },
        { command: 'report', description: 'Get team performance report' },
        { command: 'cancel', description: 'Cancel current operation' }
      ];
      
      await this.bot.setMyCommands(commands);
      console.log('✅ Bot commands set successfully');
    } catch (error) {
      console.error('⚠️ Could not set bot commands:', error.message);
    }
  }

  /**
   * Setup message handlers with improved logging
   */
  setupMessageHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      console.log(`📨 /start command from ${msg.from.first_name} (${msg.chat.id})`);
      await this.sendWelcomeMessage(msg.chat.id);
    });

    // Handle /help command
    this.bot.onText(/\/help/, async (msg) => {
      console.log(`📨 /help command from ${msg.from.first_name} (${msg.chat.id})`);
      await this.sendHelpMessage(msg.chat.id);
    });

    // Handle /task command
    this.bot.onText(/\/task/, async (msg) => {
      console.log(`📨 /task command from ${msg.from.first_name} (${msg.chat.id})`);
      await this.initiateTaskSubmission(msg.chat.id);
    });

    // Handle /agents command
    this.bot.onText(/\/agents/, async (msg) => {
      console.log(`📨 /agents command from ${msg.from.first_name} (${msg.chat.id})`);
      await this.listAgents(msg.chat.id);
    });

    // Handle /status command with parameter
    this.bot.onText(/\/status (.+)/, async (msg, match) => {
      const taskId = match[1];
      console.log(`📨 /status command from ${msg.from.first_name} for task: ${taskId}`);
      await this.checkTaskStatus(msg.chat.id, taskId);
    });

    // Handle /report command
    this.bot.onText(/\/report/, async (msg) => {
      console.log(`📨 /report command from ${msg.from.first_name} (${msg.chat.id})`);
      await this.generateTeamReport(msg.chat.id);
    });

    // Handle /cancel command
    this.bot.onText(/\/cancel/, async (msg) => {
      console.log(`📨 /cancel command from ${msg.from.first_name} (${msg.chat.id})`);
      await this.cancelOperation(msg.chat.id);
    });

    // Handle regular text messages
    this.bot.on('message', async (msg) => {
      // Skip if it's a command
      if (msg.text && msg.text.startsWith('/')) return;
      
      console.log(`📨 Text message from ${msg.from.first_name}: "${msg.text}"`);
      await this.handleTextMessage(msg.chat.id, msg.text);
    });

    // Handle callback queries (button presses)
    this.bot.on('callback_query', async (callbackQuery) => {
      console.log(`🔘 Button pressed by ${callbackQuery.from.first_name}: ${callbackQuery.data}`);
      await this.handleCallbackQuery(callbackQuery);
    });

    console.log('✅ Message handlers set up successfully');
  }

  /**
   * Send welcome message
   */
  async sendWelcomeMessage(chatId) {
    const message = `🤖 *Добро пожаловать в AI Agents Team Management System!*

Я ваш помощник для координации команды AI агентов. Вот что я могу:

🎯 Отправлять задачи специализированным агентам
📊 Проверять статус выполнения задач
👥 Показывать доступных агентов и их специализации
📈 Генерировать отчеты о производительности
🔍 Мониторить состояние системы

Используйте /help для просмотра всех команд или /task чтобы начать!`;

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      console.log(`✅ Welcome message sent to ${chatId}`);
    } catch (error) {
      console.error(`❌ Failed to send welcome message to ${chatId}:`, error.message);
    }
  }

  /**
   * Send help message
   */
  async sendHelpMessage(chatId) {
    const message = `📚 *Доступные команды:*

/task - Отправить новую задачу команде AI агентов
/status <taskId> - Проверить статус конкретной задачи
/agents - Список всех доступных агентов
/report - Получить отчет о работе команды
/cancel - Отменить текущую операцию

*Как отправить задачу:*
1. Используйте команду /task
2. Опишите задачу максимально подробно
3. Выберите приоритет
4. Получите ID задачи для отслеживания

*Доступные специализации агентов:*
🔍 SEO Specialist - Оптимизация поисковых систем
🎨 Brand Manager - Управление брендом
📊 Market Analyst - Анализ рынка
💰 Finance Analyst - Финансовый анализ
📦 Product Manager - Управление продуктом
📢 Marketing Manager - Маркетинг и реклама
🤝 Partnership Manager - Развитие партнерств

Нужна помощь? Просто опишите что хотите сделать!`;

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      console.log(`✅ Help message sent to ${chatId}`);
    } catch (error) {
      console.error(`❌ Failed to send help message to ${chatId}:`, error.message);
    }
  }

  /**
   * Initiate task submission
   */
  async initiateTaskSubmission(chatId) {
    this.userSessions.set(chatId, { 
      state: 'awaiting_task_description',
      taskData: {}
    });

    const message = `📝 *Отправка задачи AI агентам*

Опишите задачу, которую хотите поручить нашей команде AI агентов. Будьте максимально подробными для лучшего результата.

*Пример:* "Проанализируйте SEO возможности для интернет-магазина экологичных товаров"

Введите описание задачи:`;

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      console.log(`✅ Task initiation message sent to ${chatId}`);
    } catch (error) {
      console.error(`❌ Failed to send task initiation message to ${chatId}:`, error.message);
    }
  }

  /**
   * Handle text messages based on user session
   */
  async handleTextMessage(chatId, text) {
    const session = this.userSessions.get(chatId);
    
    if (!session) {
      const message = "Пожалуйста, используйте /task для отправки задачи или /help для просмотра доступных команд.";
      try {
        await this.bot.sendMessage(chatId, message);
      } catch (error) {
        console.error(`❌ Failed to send response to ${chatId}:`, error.message);
      }
      return;
    }

    switch (session.state) {
      case 'awaiting_task_description':
        session.taskData.description = text;
        session.state = 'selecting_priority';
        await this.showPrioritySelection(chatId);
        break;
        
      default:
        const defaultMessage = "Я не понимаю что вы хотите сделать. Используйте /help для просмотра команд.";
        try {
          await this.bot.sendMessage(chatId, defaultMessage);
        } catch (error) {
          console.error(`❌ Failed to send default response to ${chatId}:`, error.message);
        }
    }
  }

  /**
   * Show priority selection with inline keyboard
   */
  async showPrioritySelection(chatId) {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔴 Высокий приоритет', callback_data: 'priority_high' },
          { text: '🟡 Средний приоритет', callback_data: 'priority_medium' }
        ],
        [
          { text: '🟢 Низкий приоритет', callback_data: 'priority_low' }
        ]
      ]
    };

    const message = `⚡ *Выберите приоритет задачи:*

🔴 **Высокий** - Срочно, требует немедленного внимания
🟡 **Средний** - Стандартный приоритет (рекомендуется)
🟢 **Низкий** - Можно выполнить при наличии ресурсов`;

    try {
      await this.bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      });
      console.log(`✅ Priority selection sent to ${chatId}`);
    } catch (error) {
      console.error(`❌ Failed to send priority selection to ${chatId}:`, error.message);
    }
  }

  /**
   * Handle callback queries from inline keyboards
   */
  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const session = this.userSessions.get(chatId);

    if (!session) return;

    try {
      await this.bot.answerCallbackQuery(callbackQuery.id);

      if (data.startsWith('priority_')) {
        const priority = data.replace('priority_', '');
        session.taskData.priority = priority;
        
        await this.submitTask(chatId, session.taskData);
      }
    } catch (error) {
      console.error(`❌ Failed to handle callback query from ${chatId}:`, error.message);
    }
  }

  /**
   * Submit task to API gateway
   */
  async submitTask(chatId, taskData) {
    try {
      await this.bot.sendMessage(chatId, '⏳ Отправляю задачу команде AI агентов...');

      const response = await fetch(`${this.apiGatewayUrl}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: taskData.description,
          priority: taskData.priority,
          requiredSkills: taskData.requiredSkills || []
        })
      });

      const result = await response.json();

      if (result.success) {
        const message = `✅ *Задача успешно отправлена!*

📋 *ID задачи:* \`${result.data.taskId}\`
🤖 *Назначено:* ${result.data.assignedAgent}
⚡ *Приоритет:* ${taskData.priority}

📈 *Предварительный результат:*
${result.data.result.substring(0, 500)}${result.data.result.length > 500 ? '...' : ''}

Используйте \`/status ${result.data.taskId}\` для проверки полного статуса.`;

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } else {
        await this.bot.sendMessage(chatId, `❌ *Ошибка отправки задачи*\n\n${result.error || result.message}`);
      }

    } catch (error) {
      console.error('Error submitting task:', error);
      await this.bot.sendMessage(chatId, '❌ Ошибка подключения к системе AI агентов. Попробуйте позже.');
    }

    // Clear session
    this.userSessions.delete(chatId);
  }

  /**
   * List available agents
   */
  async listAgents(chatId) {
    try {
      await this.bot.sendMessage(chatId, '📋 Получаю информацию об агентах...');

      const response = await fetch(`${this.apiGatewayUrl}/agents`);
      const result = await response.json();

      if (result.success) {
        let message = `👥 *Доступные AI агенты (${result.total_agents})*\n\n`;

        result.agents.forEach(agent => {
          const statusIcon = agent.status === 'idle' ? '🟢' : agent.status === 'busy' ? '🟡' : '🔴';
          message += `${statusIcon} *${agent.name}*\n`;
          message += `   Роль: ${agent.role}\n`;
          message += `   Статус: ${agent.status}\n`;
          message += `   Текущие задачи: ${agent.current_tasks}\n`;
          message += `   Выполнено: ${agent.completed_tasks}\n\n`;
        });

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } else {
        await this.bot.sendMessage(chatId, '❌ Ошибка получения информации об агентах');
      }

    } catch (error) {
      console.error('Error listing agents:', error);
      await this.bot.sendMessage(chatId, '❌ Ошибка подключения к системе агентов.');
    }
  }

  /**
   * Check task status
   */
  async checkTaskStatus(chatId, taskId) {
    try {
      await this.bot.sendMessage(chatId, '🔍 Проверяю статус задачи...');

      const response = await fetch(`${this.apiGatewayUrl}/status/${taskId}`);
      const result = await response.json();

      if (result.success) {
        const task = result.data;
        const message = `📋 *Отчет о статусе задачи*

📋 *ID задачи:* \`${taskId}\`
📊 *Статус:* ${task.status}
🤖 *Агент:* ${task.assignedAgent || 'Не назначен'}
⚡ *Приоритет:* ${task.priority || 'Н/Д'}

📝 *Описание:* ${task.description}

${task.result ? `📈 *Результат:*\n${task.result.result}` : ''}
${task.error ? `❌ *Ошибка:*\n${task.error}` : ''}

⏰ *Временная шкала:*
Создано: ${task.assignedAt ? new Date(task.assignedAt).toLocaleString() : 'Н/Д'}
${task.completedAt ? `Завершено: ${new Date(task.completedAt).toLocaleString()}` : ''}`;

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } else {
        await this.bot.sendMessage(chatId, `❌ Задача не найдена: ${taskId}`);
      }

    } catch (error) {
      console.error('Error checking task status:', error);
      await this.bot.sendMessage(chatId, '❌ Ошибка проверки статуса задачи.');
    }
  }

  /**
   * Generate team report
   */
  async generateTeamReport(chatId) {
    try {
      await this.bot.sendMessage(chatId, '📊 Генерирую отчет о работе команды...');

      const response = await fetch(`${this.apiGatewayUrl}/reports/team`);
      const result = await response.json();

      if (result.success) {
        const report = result.data;
        const stats = report.team_statistics;

        const message = `📈 *Отчет о работе команды*

📅 *Сгенерирован:* ${new Date(report.generated_at).toLocaleString()}

📊 *Обзор:*
• Всего агентов: ${stats.total_agents}
• Активные задачи: ${stats.active_tasks}
• Выполненные задачи: ${stats.completed_tasks}
• Неудачные задачи: ${stats.failed_tasks}

📈 *Метрики производительности:*
• Назначено задач: ${stats.performance_metrics.tasksAssigned}
• Выполнено задач: ${stats.performance_metrics.tasksCompleted}
• Процент успеха: ${stats.performance_metrics.successRate.toFixed(1)}%
• Среднее время: ${stats.performance_metrics.averageCompletionTime.toFixed(1)} мин

🧠 *Анализ CEO:*
${report.ceo_insights}`;

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } else {
        await this.bot.sendMessage(chatId, '❌ Ошибка генерации отчета команды');
      }

    } catch (error) {
      console.error('Error generating team report:', error);
      await this.bot.sendMessage(chatId, '❌ Ошибка генерации отчета.');
    }
  }

  /**
   * Cancel current operation
   */
  async cancelOperation(chatId) {
    if (this.userSessions.has(chatId)) {
      this.userSessions.delete(chatId);
      await this.bot.sendMessage(chatId, '❌ Операция отменена.');
    } else {
      await this.bot.sendMessage(chatId, 'Нет активной операции для отмены.');
    }
  }

  /**
   * Restart the bot
   */
  async restart() {
    console.log('🔄 Restarting bot...');
    if (this.bot) {
      await this.bot.stopPolling();
    }
    setTimeout(() => {
      this.start();
    }, 2000);
  }

  /**
   * Stop the bot
   */
  async stop() {
    if (this.bot && this.isStarted) {
      console.log('🛑 Stopping Telegram bot...');
      await this.bot.stopPolling();
      this.isStarted = false;
      console.log('✅ Telegram bot stopped');
    }
  }
}

export { AgentsTeamBotFixed };