/**
 * AI Agents Team Management System - CEO Agent Test
 * 
 * This test file demonstrates how to use the lil_Boss_CEO agent to:
 * 1. Initialize the CEO agent with specialized knowledge
 * 2. Submit a complex market analysis task
 * 3. Receive and display the AI-generated response
 * 
 * The test focuses on betting market analysis in Eastern Europe,
 * showcasing the agent's ability to provide strategic business insights.
 */

// Import required dependencies
import dotenv from 'dotenv';
import { CEOAgent } from '../agents/lil_Boss_CEO/index.js';

// Load environment variables from .env file
// This includes our Claude AI API key and other configuration
dotenv.config();

/**
 * Main test function that runs the CEO agent test
 */
async function testCEOAgent() {
    console.log('🤖 AI Agents Team Management System - CEO Test');
    console.log('=' * 50);
    console.log('');

    try {
        // Step 1: Initialize the CEO Agent
        console.log('📋 Step 1: Initializing CEO agent...');
        const ceoAgent = new CEOAgent();
        
        // Initialize the agent (loads knowledge base and sets up connections)
        await ceoAgent.initialize();
        console.log('✅ CEO agent initialized successfully!');
        console.log('');

        // Step 2: Define the test task
        console.log('📝 Step 2: Preparing market analysis task...');
        const taskDescription = `Analyze betting market opportunities in Eastern Europe focusing on:
        
1. Regulatory environment - What are the current laws and regulations?
2. Market size - What's the potential revenue and customer base?
3. Competition level - Who are the major players and market saturation?
4. Growth potential - What are the trends and future opportunities?

Please provide a comprehensive strategic analysis with actionable recommendations for market entry.`;

        console.log('Task prepared: Betting market analysis for Eastern Europe');
        console.log('Focus areas: Regulatory, Market Size, Competition, Growth Potential');
        console.log('');

        // Step 3: Submit the task to the CEO agent
        console.log('🚀 Step 3: Sending task to CEO agent...');
        console.log('⏳ Please wait, the AI is analyzing the market...');
        console.log('');

        // Submit the task with high priority (since it's a strategic analysis)
        const result = await ceoAgent.assignTask(
            taskDescription,
            'high',  // Priority level: high, medium, or low
            ['Market Analysis', 'Strategic Planning', 'Business Intelligence']  // Required skills
        );

        // Step 4: Process and display the results
        console.log('📊 Step 4: Processing results...');
        console.log('✅ Response received!');
        console.log('');

        if (result.success) {
            // Display successful result
            console.log('🎉 TASK COMPLETED SUCCESSFULLY!');
            console.log('=' * 50);
            console.log('');
            
            console.log(`📋 Task ID: ${result.taskId}`);
            console.log(`🤖 Assigned to: ${result.assignedAgent}`);
            console.log('');
            
            console.log('📈 MARKET ANALYSIS RESULTS:');
            console.log('-' * 30);
            console.log(result.result);
            console.log('');
            
            console.log('✅ Analysis complete! The CEO agent has provided strategic insights.');
            
        } else {
            // Display error if task failed
            console.log('❌ TASK FAILED');
            console.log('Error details:', result.error);
        }

        // Step 5: Display agent status
        console.log('');
        console.log('📊 Step 5: Agent Status Summary');
        console.log('-' * 30);
        const systemStatus = ceoAgent.getSystemStatus();
        console.log(`CEO Status: ${systemStatus.ceo_status.status}`);
        console.log(`Total Team Agents: ${systemStatus.team_agents.length}`);
        console.log(`Active Tasks: ${systemStatus.active_tasks}`);
        console.log(`System Health: ${systemStatus.system_health}%`);

    } catch (error) {
        // Handle any errors that occur during the test
        console.error('❌ ERROR OCCURRED DURING TEST:');
        console.error('Error message:', error.message);
        console.error('');
        
        // Provide helpful troubleshooting information
        console.log('🔍 TROUBLESHOOTING TIPS:');
        console.log('1. Check if CLAUDE_API_KEY is set in .env file');
        console.log('2. Verify internet connection');
        console.log('3. Make sure all dependencies are installed (npm install)');
        console.log('4. Check if the API key is valid and has sufficient credits');
        console.log('');
        
        // Show the full error stack for developers
        if (process.env.NODE_ENV === 'development') {
            console.log('Full error stack (development mode):');
            console.error(error);
        }
    }
}

/**
 * Helper function to create a visual separator
 */
function createSeparator(char = '=', length = 50) {
    return char.repeat(length);
}

// Add some helpful information about the test
console.log('🎯 WHAT THIS TEST DOES:');
console.log('• Tests the CEO agent initialization');
console.log('• Submits a complex market analysis task');
console.log('• Demonstrates AI-powered business intelligence');
console.log('• Shows how agents coordinate and respond');
console.log('• Provides real strategic business insights');
console.log('');
console.log('⚡ EXPECTED OUTCOME:');
console.log('The AI will analyze the Eastern European betting market');
console.log('and provide strategic recommendations for business entry.');
console.log('');

// Run the test
testCEOAgent();