import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Telegram Bot for AI Agents Team Management System
 * Provides interface for task submission and status monitoring via Telegram
 */
class AgentsTeamBot {
  constructor(apiGatewayUrl = 'http://localhost:3000') {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.apiGatewayUrl = apiGatewayUrl;
    this.bot = null;
    this.userSessions = new Map(); // Store user session data
  }

  /**
   * Initialize and start the Telegram bot
   */
  async start() {
    if (!this.token) {
      console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
      return;
    }

    try {
      this.bot = new TelegramBot(this.token, { polling: true });
      this.setupCommands();
      this.setupMessageHandlers();
      
      console.log('🤖 Telegram bot started successfully');
      console.log('📱 Users can now interact with AI agents via Telegram');
      
    } catch (error) {
      console.error('❌ Failed to start Telegram bot:', error);
    }
  }

  /**
   * Setup bot commands
   */
  setupCommands() {
    // Set bot commands for Telegram menu
    this.bot.setMyCommands([
      { command: 'start', description: 'Start interacting with AI agents' },
      { command: 'help', description: 'Show available commands' },
      { command: 'task', description: 'Submit a new task' },
      { command: 'status', description: 'Check task status' },
      { command: 'agents', description: 'List available agents' },
      { command: 'report', description: 'Get team performance report' },
      { command: 'cancel', description: 'Cancel current operation' }
    ]);
  }

  /**
   * Setup message handlers
   */
  setupMessageHandlers() {
    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.sendWelcomeMessage(chatId);
    });

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      this.sendHelpMessage(chatId);
    });

    // Task submission command
    this.bot.onText(/\/task/, (msg) => {
      const chatId = msg.chat.id;
      this.initiateTaskSubmission(chatId);
    });

    // Status check command
    this.bot.onText(/\/status (.+)/, (msg, match) => {
      const chatId = msg.chat.id;
      const taskId = match[1];
      this.checkTaskStatus(chatId, taskId);
    });

    // Agents list command
    this.bot.onText(/\/agents/, (msg) => {
      const chatId = msg.chat.id;
      this.listAgents(chatId);
    });

    // Team report command
    this.bot.onText(/\/report/, (msg) => {
      const chatId = msg.chat.id;
      this.generateTeamReport(chatId);
    });

    // Cancel command
    this.bot.onText(/\/cancel/, (msg) => {
      const chatId = msg.chat.id;
      this.cancelOperation(chatId);
    });

    // Handle regular text messages based on user session state
    this.bot.on('message', (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;
      
      const chatId = msg.chat.id;
      this.handleTextMessage(chatId, msg.text);
    });

    // Handle callback queries from inline keyboards
    this.bot.on('callback_query', (callbackQuery) => {
      this.handleCallbackQuery(callbackQuery);
    });
  }

  /**
   * Send welcome message
   */
  sendWelcomeMessage(chatId) {
    const message = `🤖 Welcome to AI Agents Team Management System!

I'm your assistant for coordinating with our team of AI agents. Here's what I can help you with:

🎯 Submit tasks to specialized agents
📊 Check task status and progress  
👥 View available agents and their expertise
📈 Generate performance reports
🔍 Monitor system health

Use /help to see all available commands, or /task to get started!`;

    this.bot.sendMessage(chatId, message);
  }

  /**
   * Send help message
   */
  sendHelpMessage(chatId) {
    const message = `📚 **Available Commands:**

/task - Submit a new task to the AI agents team
/status <taskId> - Check the status of a specific task
/agents - List all available agents and their specializations
/report - Get comprehensive team performance report
/cancel - Cancel current operation

**How to submit a task:**
1. Use /task command
2. Describe your task in detail
3. Select priority level
4. Choose required skills (optional)
5. Get task ID and track progress

**Available Agent Specializations:**
🔍 SEO Specialist - Search optimization, keywords
🎨 Brand Manager - Brand strategy, identity
📊 Market Analyst - Market research, trends
💰 Finance Analyst - Financial analysis, budgets
📦 Product Manager - Product strategy, development
📢 Marketing Manager - Campaigns, promotion
🤝 Partnership Manager - Business development

Need help? Just describe what you want to accomplish!`;

    this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  /**
   * Initiate task submission process
   */
  initiateTaskSubmission(chatId) {
    this.userSessions.set(chatId, { 
      state: 'awaiting_task_description',
      taskData: {}
    });

    const message = `📝 **Task Submission**

Please describe the task you'd like to assign to our AI agents team. Be as detailed as possible for the best results.

Example: "Analyze SEO opportunities for our e-commerce website selling eco-friendly products"

Type your task description:`;

    this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  /**
   * Handle text messages based on user session state
   */
  async handleTextMessage(chatId, text) {
    const session = this.userSessions.get(chatId);
    
    if (!session) {
      this.bot.sendMessage(chatId, "Please use /task to start submitting a task or /help for available commands.");
      return;
    }

    switch (session.state) {
      case 'awaiting_task_description':
        session.taskData.description = text;
        session.state = 'selecting_priority';
        this.showPrioritySelection(chatId);
        break;
        
      default:
        this.bot.sendMessage(chatId, "I'm not sure what you're trying to do. Use /help for available commands.");
    }
  }

  /**
   * Show priority selection keyboard
   */
  showPrioritySelection(chatId) {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔴 High Priority', callback_data: 'priority_high' },
          { text: '🟡 Medium Priority', callback_data: 'priority_medium' }
        ],
        [
          { text: '🟢 Low Priority', callback_data: 'priority_low' }
        ]
      ]
    };

    this.bot.sendMessage(chatId, 
      '⚡ **Select Task Priority:**\n\n' +
      '🔴 **High** - Urgent, needs immediate attention\n' +
      '🟡 **Medium** - Standard priority (recommended)\n' +
      '🟢 **Low** - Can be completed when resources available',
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  }

  /**
   * Handle callback queries from inline keyboards
   */
  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const session = this.userSessions.get(chatId);

    if (!session) return;

    if (data.startsWith('priority_')) {
      const priority = data.replace('priority_', '');
      session.taskData.priority = priority;
      
      await this.bot.answerCallbackQuery(callbackQuery.id);
      await this.submitTask(chatId, session.taskData);
    }
  }

  /**
   * Submit task to API gateway
   */
  async submitTask(chatId, taskData) {
    try {
      this.bot.sendMessage(chatId, '⏳ Submitting task to AI agents team...');

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
        const message = `✅ **Task Submitted Successfully!**

**Task ID:** \`${result.data.taskId}\`
**Assigned to:** ${result.data.assignedAgent}
**Priority:** ${taskData.priority}

**Result Preview:**
${result.data.result.substring(0, 500)}${result.data.result.length > 500 ? '...' : ''}

Use \`/status ${result.data.taskId}\` to check full status anytime.`;

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } else {
        this.bot.sendMessage(chatId, `❌ **Task Submission Failed**\n\n${result.error || result.message}`);
      }

    } catch (error) {
      console.error('Error submitting task:', error);
      this.bot.sendMessage(chatId, '❌ Error connecting to AI agents system. Please try again later.');
    }

    // Clear session
    this.userSessions.delete(chatId);
  }

  /**
   * Check task status
   */
  async checkTaskStatus(chatId, taskId) {
    try {
      this.bot.sendMessage(chatId, '🔍 Checking task status...');

      const response = await fetch(`${this.apiGatewayUrl}/status/${taskId}`);
      const result = await response.json();

      if (result.success) {
        const task = result.data;
        const message = `📋 **Task Status Report**

**Task ID:** \`${taskId}\`
**Status:** ${task.status}
**Agent:** ${task.assignedAgent || 'Not assigned'}
**Priority:** ${task.priority || 'N/A'}

**Description:** ${task.description}

${task.result ? `**Result:**\n${task.result.result}` : ''}
${task.error ? `**Error:**\n${task.error}` : ''}

**Timeline:**
Created: ${task.assignedAt ? new Date(task.assignedAt).toLocaleString() : 'N/A'}
${task.completedAt ? `Completed: ${new Date(task.completedAt).toLocaleString()}` : ''}`;

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } else {
        this.bot.sendMessage(chatId, `❌ Task not found: ${taskId}`);
      }

    } catch (error) {
      console.error('Error checking task status:', error);
      this.bot.sendMessage(chatId, '❌ Error checking task status. Please try again later.');
    }
  }

  /**
   * List available agents
   */
  async listAgents(chatId) {
    try {
      this.bot.sendMessage(chatId, '📋 Fetching agent information...');

      const response = await fetch(`${this.apiGatewayUrl}/agents`);
      const result = await response.json();

      if (result.success) {
        let message = `👥 **Available AI Agents (${result.total_agents})**\n\n`;

        result.agents.forEach(agent => {
          const statusIcon = agent.status === 'idle' ? '🟢' : agent.status === 'busy' ? '🟡' : '🔴';
          message += `${statusIcon} **${agent.name}**\n`;
          message += `   Role: ${agent.role}\n`;
          message += `   Status: ${agent.status}\n`;
          message += `   Current Tasks: ${agent.current_tasks}\n`;
          message += `   Completed: ${agent.completed_tasks}\n\n`;
        });

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } else {
        this.bot.sendMessage(chatId, '❌ Error fetching agent information');
      }

    } catch (error) {
      console.error('Error listing agents:', error);
      this.bot.sendMessage(chatId, '❌ Error connecting to agents system. Please try again later.');
    }
  }

  /**
   * Generate team performance report
   */
  async generateTeamReport(chatId) {
    try {
      this.bot.sendMessage(chatId, '📊 Generating team performance report...');

      const response = await fetch(`${this.apiGatewayUrl}/reports/team`);
      const result = await response.json();

      if (result.success) {
        const report = result.data;
        const stats = report.team_statistics;

        const message = `📈 **Team Performance Report**

**Generated:** ${new Date(report.generated_at).toLocaleString()}

**Overview:**
• Total Agents: ${stats.total_agents}
• Active Tasks: ${stats.active_tasks}
• Completed Tasks: ${stats.completed_tasks}
• Failed Tasks: ${stats.failed_tasks}

**Performance Metrics:**
• Tasks Assigned: ${stats.performance_metrics.tasksAssigned}
• Tasks Completed: ${stats.performance_metrics.tasksCompleted}
• Success Rate: ${stats.performance_metrics.successRate.toFixed(1)}%
• Avg Completion Time: ${stats.performance_metrics.averageCompletionTime.toFixed(1)} min

**CEO Insights:**
${report.ceo_insights}`;

        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } else {
        this.bot.sendMessage(chatId, '❌ Error generating team report');
      }

    } catch (error) {
      console.error('Error generating team report:', error);
      this.bot.sendMessage(chatId, '❌ Error generating report. Please try again later.');
    }
  }

  /**
   * Cancel current operation
   */
  cancelOperation(chatId) {
    if (this.userSessions.has(chatId)) {
      this.userSessions.delete(chatId);
      this.bot.sendMessage(chatId, '❌ Operation cancelled.');
    } else {
      this.bot.sendMessage(chatId, 'No active operation to cancel.');
    }
  }

  /**
   * Stop the bot
   */
  stop() {
    if (this.bot) {
      this.bot.stopPolling();
      console.log('🛑 Telegram bot stopped');
    }
  }
}

export { AgentsTeamBot };