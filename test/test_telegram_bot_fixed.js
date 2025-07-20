/**
 * Fixed Telegram Bot Test with Enhanced Diagnostics
 * 
 * This test uses the improved bot class with better error handling
 * and detailed logging for troubleshooting connection issues.
 */

import dotenv from 'dotenv';
import { AgentsTeamBotFixed } from '../telegram_bot/bot_fixed.js';

// Load environment variables
dotenv.config();

/**
 * Enhanced test function with comprehensive diagnostics
 */
async function testTelegramBotFixed() {
    console.log('🔧 AI Agents Team - Enhanced Telegram Bot Test');
    console.log('='.repeat(60));
    console.log('');

    // Step 1: Environment validation
    console.log('🔍 Step 1: Validating environment...');
    
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
        console.log('Please add your bot token to .env file:');
        console.log('TELEGRAM_BOT_TOKEN=1234567890:ABCDefGhIJKlmnoPQRstUVWxyz');
        process.exit(1);
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    console.log(`✅ Bot token found: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`);
    
    // Validate token format
    const tokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
    if (!tokenPattern.test(token)) {
        console.error('❌ Invalid bot token format');
        console.log('Token should be in format: 1234567890:ABCDefGhIJKlmnoPQRstUVWxyz');
        process.exit(1);
    }
    
    console.log('✅ Token format is valid');
    console.log('');

    // Step 2: API Gateway check
    console.log('🔍 Step 2: Checking API Gateway connection...');
    try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
            const health = await response.json();
            console.log('✅ API Gateway is running');
            console.log(`   Status: ${health.status}`);
            console.log(`   Agents initialized: ${health.agents_initialized}`);
        } else {
            console.log('⚠️ API Gateway not responding on port 3000');
            console.log('   Bot will still start but task submission may fail');
        }
    } catch (error) {
        console.log('⚠️ Could not connect to API Gateway');
        console.log('   Make sure to run "npm start" in another terminal');
    }
    console.log('');

    // Step 3: Initialize bot
    console.log('🤖 Step 3: Initializing enhanced Telegram bot...');
    
    const bot = new AgentsTeamBotFixed('http://localhost:3000');
    
    // Step 4: Start bot with diagnostics
    console.log('🚀 Step 4: Starting bot with enhanced error handling...');
    
    const startResult = await bot.start();
    
    if (!startResult) {
        console.error('❌ Failed to start bot - check error messages above');
        process.exit(1);
    }
    
    console.log('✅ Bot started successfully!');
    console.log('');

    // Step 5: Display usage instructions
    console.log('📱 Step 5: Bot is ready for testing!');
    console.log('='.repeat(50));
    console.log('');
    console.log('🎯 How to test:');
    console.log('1. Open Telegram and find your bot');
    console.log('2. Send /start to begin interaction');
    console.log('3. Watch this console for detailed message logs');
    console.log('');
    console.log('🔧 Available commands to test:');
    console.log('   /start - Welcome message (test basic functionality)');
    console.log('   /help - Full command list');
    console.log('   /agents - List all AI agents (test API connection)');
    console.log('   /task - Submit a task (full workflow test)');
    console.log('   /report - Team performance report');
    console.log('');
    console.log('📋 Example task for testing:');
    console.log('   "Проанализируй рынок криптовалют в России"');
    console.log('   "Создай SEO стратегию для онлайн магазина"');
    console.log('   "Разработай концепцию бренда для IT стартапа"');
    console.log('');
    console.log('🔍 Watch for these in the console:');
    console.log('   📨 - Incoming messages');
    console.log('   ✅ - Successful operations');
    console.log('   ❌ - Errors or failures');
    console.log('   🔘 - Button presses');
    console.log('');
    console.log('🛑 Press Ctrl+C to stop the bot');
    console.log('');

    // Step 6: Setup monitoring
    let messageCount = 0;
    let lastActivity = Date.now();

    // Show activity indicator
    const activityIndicator = setInterval(() => {
        const now = Date.now();
        const timeSinceLastActivity = Math.floor((now - lastActivity) / 1000);
        
        if (timeSinceLastActivity > 30) {
            process.stdout.write(`⏰ Waiting for messages... (${timeSinceLastActivity}s idle)\r`);
        }
    }, 5000);

    // Override bot message logging
    const originalBot = bot.bot;
    if (originalBot) {
        originalBot.on('message', (msg) => {
            messageCount++;
            lastActivity = Date.now();
            
            console.log('\n' + '='.repeat(40));
            console.log(`📨 Message #${messageCount} received:`);
            console.log(`   From: ${msg.from.first_name} ${msg.from.last_name || ''}`);
            console.log(`   Username: @${msg.from.username || 'none'}`);
            console.log(`   Chat ID: ${msg.chat.id}`);
            console.log(`   Type: ${msg.chat.type}`);
            console.log(`   Text: "${msg.text || '[non-text message]'}"`);
            console.log(`   Time: ${new Date().toLocaleString()}`);
            console.log('='.repeat(40) + '\n');
        });

        originalBot.on('callback_query', (query) => {
            lastActivity = Date.now();
            
            console.log('\n' + '-'.repeat(40));
            console.log(`🔘 Button pressed:`);
            console.log(`   From: ${query.from.first_name}`);
            console.log(`   Data: ${query.data}`);
            console.log(`   Time: ${new Date().toLocaleString()}`);
            console.log('-'.repeat(40) + '\n');
        });
    }

    // Step 7: Graceful shutdown handling
    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down bot...');
        clearInterval(activityIndicator);
        
        await bot.stop();
        
        console.log('📊 Session Summary:');
        console.log(`   Messages received: ${messageCount}`);
        console.log(`   Session duration: ${Math.floor((Date.now() - lastActivity) / 1000)}s`);
        console.log('');
        console.log('✅ Bot stopped successfully!');
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM, shutting down...');
        clearInterval(activityIndicator);
        await bot.stop();
        process.exit(0);
    });
}

// Display startup banner
console.log('🚀 ENHANCED TELEGRAM BOT TEST');
console.log('');
console.log('This improved test includes:');
console.log('• ✅ Enhanced error handling and diagnostics');
console.log('• 🔍 Environment validation');
console.log('• 📊 API Gateway connection check');
console.log('• 📱 Improved message logging');
console.log('• 🔧 Bot configuration validation');
console.log('• 📈 Activity monitoring');
console.log('');
console.log('Starting diagnostic sequence...');
console.log('');

// Start the enhanced test
testTelegramBotFixed().catch(error => {
    console.error('💥 Fatal error during bot test:', error);
    process.exit(1);
});