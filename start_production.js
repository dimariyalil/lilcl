#!/usr/bin/env node

/**
 * Production Startup Script for AI Agents Team Management System
 * 
 * This script starts both the API Gateway and Telegram Bot in production mode
 */

import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Starting AI Agents Team Management System in Production Mode');
console.log('='.repeat(70));

// Check required environment variables
const requiredEnvVars = ['CLAUDE_API_KEY', 'TELEGRAM_BOT_TOKEN'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.log('\nPlease set these variables and try again.');
    process.exit(1);
}

console.log('✅ Environment variables validated');
console.log('🌐 Starting API Gateway...');

// Start API Gateway
const apiGateway = spawn('node', ['api_gateway/server.js'], {
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'production' }
});

apiGateway.stdout.on('data', (data) => {
    process.stdout.write(`[API] ${data}`);
});

apiGateway.stderr.on('data', (data) => {
    process.stderr.write(`[API ERROR] ${data}`);
});

// Wait a bit for API Gateway to start, then start Telegram Bot
setTimeout(() => {
    console.log('🤖 Starting Telegram Bot...');
    
    const telegramBot = spawn('node', ['test/test_telegram_bot.js'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
    });

    telegramBot.stdout.on('data', (data) => {
        process.stdout.write(`[BOT] ${data}`);
    });

    telegramBot.stderr.on('data', (data) => {
        process.stderr.write(`[BOT ERROR] ${data}`);
    });

    telegramBot.on('close', (code) => {
        console.log(`🤖 Telegram Bot exited with code ${code}`);
        if (code !== 0) {
            console.log('Restarting Telegram Bot...');
            // Можно добавить автоматический перезапуск
        }
    });

}, 3000);

apiGateway.on('close', (code) => {
    console.log(`🌐 API Gateway exited with code ${code}`);
    if (code !== 0) {
        console.log('Restarting API Gateway...');
        // Можно добавить автоматический перезапуск
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down AI Agents System...');
    apiGateway.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down AI Agents System...');
    apiGateway.kill('SIGTERM');
    process.exit(0);
});

console.log('🎯 System starting up...');
console.log('📱 Telegram Bot will be available shortly');
console.log('🌐 API Gateway will be available on port 3000');
console.log('🛑 Press Ctrl+C to stop the system');
console.log('');