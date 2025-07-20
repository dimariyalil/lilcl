/**
 * AI Agents Team Management System - Simple CEO Agent Test
 * 
 * This test demonstrates the CEO agent working directly without team delegation.
 * It shows how the agent can process strategic tasks using Claude AI.
 */

// Import required dependencies
import dotenv from 'dotenv';
import { Agent } from '../agents/base/Agent.js';

// Load environment variables from .env file
dotenv.config();

/**
 * Simple test function that tests the base agent functionality
 */
async function testCEOAgentDirect() {
    console.log('🤖 AI Agents Team Management System - Simple CEO Test');
    console.log('='.repeat(60));
    console.log('');

    try {
        // Step 1: Initialize a CEO Agent directly using base Agent class
        console.log('📋 Step 1: Initializing CEO agent (direct mode)...');
        
        const ceoAgent = new Agent(
            'lil_Boss_CEO',
            'CEO',
            [
                'Strategic Planning',
                'Market Analysis',
                'Business Intelligence',
                'Executive Decision Making',
                'Team Coordination',
                'Risk Assessment'
            ]
        );
        
        // Load knowledge base
        await ceoAgent.loadSharedKnowledge();
        console.log('✅ CEO agent initialized successfully!');
        console.log('');

        // Step 2: Define the test task
        console.log('📝 Step 2: Preparing market analysis task...');
        const taskDescription = `As a strategic business consultant, analyze betting market opportunities in Eastern Europe focusing on:
        
1. Regulatory environment - Current laws and licensing requirements
2. Market size - Revenue potential and customer demographics  
3. Competition level - Major operators and market share
4. Growth potential - Emerging trends and opportunities

Provide strategic recommendations for market entry including:
- Entry strategy options
- Key regulatory considerations
- Competitive positioning
- Risk mitigation approaches
- Timeline and investment requirements`;

        console.log('✅ Task prepared: Eastern European betting market analysis');
        console.log('');

        // Step 3: Process the task directly
        console.log('🚀 Step 3: Processing task with CEO agent...');
        console.log('⏳ AI is analyzing the market data...');
        
        const startTime = Date.now();
        
        // Process the task directly using the agent's processTask method
        const result = await ceoAgent.processTask(
            'ceo-market-analysis-test',
            taskDescription,
            {
                priority: 'high',
                analysis_type: 'strategic_market_analysis',
                region: 'Eastern Europe',
                industry: 'Gaming/Betting'
            }
        );
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        // Step 4: Display results
        console.log('✅ Analysis completed!');
        console.log(`⏱️  Processing time: ${duration} seconds`);
        console.log('');

        if (result.success) {
            console.log('🎉 STRATEGIC ANALYSIS COMPLETED SUCCESSFULLY!');
            console.log('='.repeat(60));
            console.log('');
            
            console.log('📈 EASTERN EUROPEAN BETTING MARKET ANALYSIS:');
            console.log('-'.repeat(50));
            console.log(result.result);
            console.log('');
            console.log('-'.repeat(50));
            
            console.log('✅ Strategic insights generated successfully!');
            console.log(`📋 Task ID: ${result.taskId}`);
            console.log(`🤖 Processed by: ${result.agent}`);
            
        } else {
            console.log('❌ ANALYSIS FAILED');
            console.log('Error details:', result.error);
        }

        // Step 5: Display agent status
        console.log('');
        console.log('📊 Agent Performance Summary:');
        console.log('-'.repeat(30));
        const status = ceoAgent.getStatus();
        console.log(`Agent: ${status.name}`);
        console.log(`Role: ${status.role}`);
        console.log(`Status: ${status.status}`);
        console.log(`Current Tasks: ${status.current_tasks}`);
        console.log(`Completed Tasks: ${status.completed_tasks}`);
        console.log(`Specializations: ${status.specialization.join(', ')}`);

        // Step 6: Generate a report
        console.log('');
        console.log('📋 Generating performance report...');
        const report = await ceoAgent.generateReport();
        
        if (report && !report.error) {
            console.log('✅ Report generated successfully!');
            console.log(`📊 Tasks analyzed: ${report.tasks_analyzed}`);
            console.log(`✅ Successful tasks: ${report.successful_tasks}`);
            console.log(`❌ Failed tasks: ${report.failed_tasks}`);
        }

    } catch (error) {
        console.error('❌ ERROR OCCURRED DURING TEST:');
        console.error('Error message:', error.message);
        console.error('');
        
        // Provide troubleshooting tips
        console.log('🔍 TROUBLESHOOTING TIPS:');
        console.log('1. Verify CLAUDE_API_KEY is set correctly in .env file');
        console.log('2. Check internet connection');
        console.log('3. Ensure Claude API key has sufficient credits');
        console.log('4. Verify all dependencies are installed');
        console.log('');
        
        if (process.env.NODE_ENV === 'development') {
            console.log('Full error stack:');
            console.error(error);
        }
    }
}

// Display test information
console.log('🎯 SIMPLE CEO AGENT TEST');
console.log('This test demonstrates:');
console.log('• Direct CEO agent processing (no team delegation)');
console.log('• Strategic market analysis using Claude AI');
console.log('• Real-time business intelligence generation');
console.log('• Performance monitoring and reporting');
console.log('');
console.log('⚡ Expected outcome:');
console.log('Comprehensive betting market analysis for Eastern Europe');
console.log('with strategic recommendations for business entry.');
console.log('');

// Run the test
testCEOAgentDirect();