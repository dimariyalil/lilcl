/**
 * Telegram Bot Test for AI Agents Team Management System
 * 
 * This test file starts the Telegram bot and shows all incoming messages
 * for testing and debugging purposes.
 */

import dotenv from 'dotenv';
import { AgentsTeamBot } from '../telegram_bot/bot.js';

// Load environment variables
dotenv.config();

/**
 * Test function to start and monitor the Telegram bot
 */
async function testTelegramBot() {
    console.log('🤖 AI Agents Team Management System - Telegram Bot Test');
    console.log('='.repeat(60));
    console.log('');

    // Check if Telegram bot token is available
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
        console.log('Please add your Telegram bot token to .env file:');
        console.log('TELEGRAM_BOT_TOKEN=your_bot_token_here');
        console.log('');
        console.log('To get a bot token:');
        console.log('1. Message @BotFather on Telegram');
        console.log('2. Use /newbot command');
        console.log('3. Follow the instructions');
        console.log('4. Copy the token to .env file');
        process.exit(1);
    }

    try {
        console.log('📱 Initializing Telegram bot...');
        
        // Create bot instance pointing to our API gateway
        const bot = new AgentsTeamBot('http://localhost:3000');
        
        // Add message logging for debugging
        console.log('🔧 Setting up message logging...');
        
        // Override the bot's message handler to add logging
        const originalStart = bot.start.bind(bot);
        bot.start = async function() {
            await originalStart();
            
            // Add logging for all messages
            if (this.bot) {
                this.bot.on('message', (msg) => {
                    console.log('📨 Incoming message:');
                    console.log(`   From: ${msg.from.first_name} ${msg.from.last_name || ''} (@${msg.from.username || 'no username'})`);
                    console.log(`   Chat ID: ${msg.chat.id}`);
                    console.log(`   Text: ${msg.text || '[Non-text message]'}`);
                    console.log(`   Time: ${new Date().toLocaleString()}`);
                    console.log('');
                });

                // Log callback queries (button presses)
                this.bot.on('callback_query', (query) => {
                    console.log('🔘 Button pressed:');
                    console.log(`   From: ${query.from.first_name} ${query.from.last_name || ''}`);
                    console.log(`   Data: ${query.data}`);
                    console.log(`   Time: ${new Date().toLocaleString()}`);
                    console.log('');
                });

                // Log errors
                this.bot.on('error', (error) => {
                    console.error('❌ Bot error:', error);
                });

                // Log polling events
                this.bot.on('polling_error', (error) => {
                    console.error('❌ Polling error:', error);
                });
            }
        };

        // Start the bot
        await bot.start();
        
        console.log('✅ Telegram bot started successfully!');
        console.log('');
        console.log('🎯 Bot is now running and waiting for messages...');
        console.log('');
        console.log('📋 How to test:');
        console.log('1. Open Telegram app');
        console.log('2. Search for your bot by username');
        console.log('3. Send /start to begin');
        console.log('4. Try commands like /help, /task, /agents');
        console.log('5. Watch this console for message logs');
        console.log('');
        console.log('🔧 Available bot commands:');
        console.log('   /start - Welcome message');
        console.log('   /help - Show help');
        console.log('   /task - Submit new task');
        console.log('   /status <taskId> - Check task status');
        console.log('   /agents - List available agents');
        console.log('   /report - Team performance report');
        console.log('   /cancel - Cancel operation');
        console.log('');
        console.log('⚠️  Note: Make sure the API gateway is running on localhost:3000');
        console.log('   Run "npm start" in another terminal to start the API gateway');
        console.log('');
        console.log('🛑 Press Ctrl+C to stop the bot');
        console.log('');

        // Keep the process running
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping Telegram bot...');
            bot.stop();
            console.log('✅ Bot stopped successfully!');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Stopping Telegram bot...');
            bot.stop();
            console.log('✅ Bot stopped successfully!');
            process.exit(0);
        });

        // Show that we're waiting for messages
        setInterval(() => {
            process.stdout.write('.');
        }, 30000); // Show a dot every 30 seconds to indicate bot is alive

    } catch (error) {
        console.error('❌ Failed to start Telegram bot:');
        console.error('Error:', error.message);
        console.log('');
        console.log('🔍 Troubleshooting tips:');
        console.log('1. Verify TELEGRAM_BOT_TOKEN in .env file');
        console.log('2. Check internet connection');
        console.log('3. Ensure bot token is valid and active');
        console.log('4. Check if bot is not already running elsewhere');
        console.log('5. Verify bot has necessary permissions');
        
        if (process.env.NODE_ENV === 'development') {
            console.log('');
            console.log('Full error details:');
            console.error(error);
        }
        
        process.exit(1);
    }
}

// Display startup information
console.log('🤖 TELEGRAM BOT TEST STARTING...');
console.log('');
console.log('This test will:');
console.log('• Start the Telegram bot');
console.log('• Log all incoming messages');
console.log('• Show bot commands and interactions');
console.log('• Keep the bot running for testing');
console.log('');

// Start the test
testTelegramBot();