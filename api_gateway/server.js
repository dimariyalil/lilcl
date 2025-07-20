import express from 'express';
import dotenv from 'dotenv';
import { CEOAgent } from '../agents/lil_Boss_CEO/index.js';
import { Agent } from '../agents/base/Agent.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize CEO and team agents
let ceoAgent;
let teamAgents = new Map();

/**
 * Initialize all agents in the system
 */
async function initializeAgents() {
  console.log('🤖 Initializing AI Agents Team Management System...');
  
  try {
    // Initialize CEO Agent
    ceoAgent = new CEOAgent();
    await ceoAgent.initialize();

    // Initialize specialized agents
    const agentConfigs = [
      {
        name: 'lil_SEO_Specialist',
        role: 'SEO_Specialist',
        specialKnowledge: ['Search Engine Optimization', 'Keyword Research', 'Technical SEO', 'Content Optimization', 'SERP Analysis']
      },
      {
        name: 'lil_Brand_Manager',
        role: 'Brand_Manager',
        specialKnowledge: ['Brand Strategy', 'Brand Identity', 'Brand Positioning', 'Brand Guidelines', 'Brand Monitoring']
      },
      {
        name: 'lil_Market_Analyst',
        role: 'Market_Analyst',
        specialKnowledge: ['Market Research', 'Competitive Analysis', 'Market Trends', 'Consumer Behavior', 'Industry Analysis']
      },
      {
        name: 'lil_Finance_Analyst',
        role: 'Finance_Analyst',
        specialKnowledge: ['Financial Analysis', 'Budget Planning', 'Cost Analysis', 'ROI Calculation', 'Financial Forecasting']
      },
      {
        name: 'lil_Product_Manager',
        role: 'Product_Manager',
        specialKnowledge: ['Product Strategy', 'Product Development', 'Feature Prioritization', 'User Research', 'Product Roadmap']
      },
      {
        name: 'lil_Marketing_Manager',
        role: 'Marketing_Manager',
        specialKnowledge: ['Marketing Strategy', 'Campaign Management', 'Digital Marketing', 'Content Marketing', 'Marketing Analytics']
      },
      {
        name: 'lil_Partnership_Manager',
        role: 'Partnership_Manager',
        specialKnowledge: ['Partnership Strategy', 'Business Development', 'Strategic Alliances', 'Collaboration Management', 'Deal Negotiation']
      }
    ];

    // Create and register all team agents
    for (const config of agentConfigs) {
      const agent = new Agent(config.name, config.role, config.specialKnowledge);
      await agent.loadSharedKnowledge();
      await agent.loadSpecializedKnowledge();
      
      teamAgents.set(config.name, agent);
      ceoAgent.registerTeamAgent(agent);
      
      console.log(`✅ Initialized ${config.name} (${config.role})`);
    }

    console.log(`🎉 Successfully initialized ${teamAgents.size + 1} agents (including CEO)`);
    console.log('🚀 AI Agents Team Management System is ready!');

  } catch (error) {
    console.error('❌ Error initializing agents:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agents_initialized: ceoAgent ? true : false,
    total_agents: teamAgents.size + (ceoAgent ? 1 : 0)
  });
});

// Get system status
app.get('/system/status', (req, res) => {
  if (!ceoAgent) {
    return res.status(503).json({
      error: 'System not initialized',
      message: 'CEO agent not available'
    });
  }

  try {
    const systemStatus = ceoAgent.getSystemStatus();
    res.json({
      success: true,
      data: systemStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      message: error.message
    });
  }
});

// List all agents and their availability
app.get('/agents', (req, res) => {
  if (!ceoAgent) {
    return res.status(503).json({
      error: 'System not initialized',
      message: 'Agents not available'
    });
  }

  try {
    const agents = [
      ceoAgent.getStatus(),
      ...Array.from(teamAgents.values()).map(agent => agent.getStatus())
    ];

    res.json({
      success: true,
      total_agents: agents.length,
      agents: agents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting agents list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agents list',
      message: error.message
    });
  }
});

// Submit a new task
app.post('/task', async (req, res) => {
  if (!ceoAgent) {
    return res.status(503).json({
      error: 'System not initialized',
      message: 'CEO agent not available'
    });
  }

  try {
    const { description, priority = 'medium', requiredSkills = [] } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Task description is required'
      });
    }

    // Validate priority
    const validPriorities = ['high', 'medium', 'low'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be one of: high, medium, low'
      });
    }

    console.log(`📝 New task received: ${description}`);
    console.log(`Priority: ${priority}, Required skills: ${requiredSkills.join(', ')}`);

    // Assign task through CEO
    const result = await ceoAgent.assignTask(description, priority, requiredSkills);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Task assigned successfully',
        data: {
          taskId: result.taskId,
          assignedAgent: result.assignedAgent,
          result: result.result
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Task assignment failed',
        message: result.error,
        taskId: result.taskId
      });
    }

  } catch (error) {
    console.error('Error processing task:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Check task status
app.get('/status/:taskId', (req, res) => {
  if (!ceoAgent) {
    return res.status(503).json({
      error: 'System not initialized',
      message: 'CEO agent not available'
    });
  }

  try {
    const { taskId } = req.params;
    const taskStatus = ceoAgent.getTaskStatus(taskId);

    if (taskStatus.found) {
      res.json({
        success: true,
        data: taskStatus,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Task not found',
        taskId: taskId
      });
    }

  } catch (error) {
    console.error('Error getting task status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get task status',
      message: error.message
    });
  }
});

// Get team performance report
app.get('/reports/team', async (req, res) => {
  if (!ceoAgent) {
    return res.status(503).json({
      error: 'System not initialized',
      message: 'CEO agent not available'
    });
  }

  try {
    console.log('📊 Generating team performance report...');
    const report = await ceoAgent.generateTeamReport();

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating team report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate team report',
      message: error.message
    });
  }
});

// Aggregate results from multiple tasks
app.post('/aggregate', async (req, res) => {
  if (!ceoAgent) {
    return res.status(503).json({
      error: 'System not initialized',
      message: 'CEO agent not available'
    });
  }

  try {
    const { taskIds, aggregationType = 'summary' } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'taskIds array is required and must not be empty'
      });
    }

    console.log(`📋 Aggregating results for ${taskIds.length} tasks...`);
    const result = await ceoAgent.aggregateResults(taskIds, aggregationType);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Aggregation failed',
        message: result.error,
        data: result.raw_data
      });
    }

  } catch (error) {
    console.error('Error aggregating results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to aggregate results',
      message: error.message
    });
  }
});

// Get agent-specific report
app.get('/reports/agent/:agentName', async (req, res) => {
  const { agentName } = req.params;
  
  try {
    let agent;
    if (agentName === 'lil_Boss_CEO') {
      agent = ceoAgent;
    } else {
      agent = teamAgents.get(agentName);
    }

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        agentName: agentName
      });
    }

    console.log(`📈 Generating report for ${agentName}...`);
    const report = await agent.generateReport();

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error generating report for ${agentName}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate agent report',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.path} is not available`
  });
});

// Start server
async function startServer() {
  try {
    // Initialize agents first
    await initializeAgents();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🌐 API Gateway server is running on port ${PORT}`);
      console.log(`📡 Available endpoints:`);
      console.log(`   GET  /health - System health check`);
      console.log(`   GET  /system/status - Overall system status`);
      console.log(`   GET  /agents - List all agents`);
      console.log(`   POST /task - Submit new task`);
      console.log(`   GET  /status/:taskId - Check task status`);
      console.log(`   GET  /reports/team - Team performance report`);
      console.log(`   GET  /reports/agent/:agentName - Agent-specific report`);
      console.log(`   POST /aggregate - Aggregate multiple task results`);
      console.log(`\n🎯 Ready to receive tasks and coordinate AI agents!`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;