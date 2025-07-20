import { Agent } from '../base/Agent.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * CEO Agent - Main coordinator for the AI agents team
 * Responsible for task delegation, monitoring, and strategic oversight
 */
class CEOAgent extends Agent {
  constructor() {
    super(
      'lil_Boss_CEO',
      'CEO',
      [
        'Strategic Planning',
        'Team Coordination',
        'Task Delegation',
        'Performance Monitoring',
        'Executive Decision Making',
        'Resource Allocation'
      ]
    );
    
    this.teamAgents = new Map();
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.taskHistory = [];
    this.performanceMetrics = {
      tasksCompleted: 0,
      tasksAssigned: 0,
      averageCompletionTime: 0,
      successRate: 0
    };
  }

  /**
   * Initialize the CEO agent and load team
   */
  async initialize() {
    await this.loadSharedKnowledge();
    await this.loadSpecializedKnowledge();
    console.log(`${this.name}: CEO Agent initialized and ready for team coordination`);
  }

  /**
   * Register a team agent under CEO's management
   */
  registerTeamAgent(agent) {
    this.teamAgents.set(agent.name, agent);
    this.registerCollaborator(agent);
    agent.registerCollaborator(this);
    console.log(`${this.name}: Registered team agent ${agent.name} (${agent.role})`);
  }

  /**
   * Assign a task to the most suitable agent based on task requirements
   */
  async assignTask(taskDescription, priority = 'medium', requiredSkills = []) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`${this.name}: Assigning new task ${taskId}`);
    console.log(`Task: ${taskDescription}`);
    console.log(`Priority: ${priority}, Required skills: ${requiredSkills.join(', ')}`);

    // Find the best agent for this task
    const assignedAgent = this.selectBestAgent(requiredSkills, taskDescription);
    
    if (!assignedAgent) {
      console.error(`${this.name}: No suitable agent found for task ${taskId}`);
      return {
        success: false,
        error: 'No suitable agent available',
        taskId
      };
    }

    // Create task record
    const task = {
      id: taskId,
      description: taskDescription,
      priority,
      requiredSkills,
      assignedAgent: assignedAgent.name,
      assignedAt: new Date(),
      status: 'assigned',
      progress: 0
    };

    this.activeTasks.set(taskId, task);
    this.performanceMetrics.tasksAssigned++;

    try {
      // Execute task with the selected agent
      console.log(`${this.name}: Executing task ${taskId} with ${assignedAgent.name}`);
      
      const result = await assignedAgent.processTask(
        taskId,
        taskDescription,
        {
          priority,
          assignedBy: this.name,
          deadline: this.calculateDeadline(priority)
        }
      );

      // Update task status
      task.status = result.success ? 'completed' : 'failed';
      task.completedAt = new Date();
      task.result = result;
      task.progress = 100;

      if (result.success) {
        this.performanceMetrics.tasksCompleted++;
        console.log(`${this.name}: Task ${taskId} completed successfully by ${assignedAgent.name}`);
      } else {
        console.log(`${this.name}: Task ${taskId} failed: ${result.error}`);
      }

      // Move to history
      this.taskHistory.push(task);
      this.activeTasks.delete(taskId);
      
      // Update performance metrics
      this.updatePerformanceMetrics();

      return {
        success: result.success,
        taskId,
        assignedAgent: assignedAgent.name,
        result: result.result,
        error: result.error
      };

    } catch (error) {
      console.error(`${this.name}: Error executing task ${taskId}:`, error);
      
      task.status = 'failed';
      task.error = error.message;
      task.completedAt = new Date();
      
      this.taskHistory.push(task);
      this.activeTasks.delete(taskId);

      return {
        success: false,
        taskId,
        error: error.message
      };
    }
  }

  /**
   * Select the best agent for a task based on skills and availability
   */
  selectBestAgent(requiredSkills, taskDescription) {
    const availableAgents = Array.from(this.teamAgents.values())
      .filter(agent => agent.status === 'idle');

    if (availableAgents.length === 0) {
      console.log(`${this.name}: No agents available, will assign to least busy agent`);
      // If no agents are idle, find the one with least current tasks
      const agents = Array.from(this.teamAgents.values());
      return agents.reduce((leastBusy, agent) => 
        agent.currentTasks.size < leastBusy.currentTasks.size ? agent : leastBusy
      );
    }

    // Score agents based on skill match
    const scoredAgents = availableAgents.map(agent => {
      let score = 0;
      
      // Check for direct skill matches
      for (const skill of requiredSkills) {
        if (agent.specialKnowledge.some(knowledge => 
          knowledge.toLowerCase().includes(skill.toLowerCase())
        )) {
          score += 10;
        }
      }

      // Check for role-based suitability
      score += this.calculateRoleScore(agent.role, taskDescription);
      
      return { agent, score };
    });

    // Sort by score and return the best match
    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0]?.agent || availableAgents[0];
  }

  /**
   * Calculate role-based suitability score for a task
   */
  calculateRoleScore(role, taskDescription) {
    const taskLower = taskDescription.toLowerCase();
    const roleScores = {
      'SEO_Specialist': taskLower.includes('seo') || taskLower.includes('search') || taskLower.includes('keyword') ? 15 : 0,
      'Brand_Manager': taskLower.includes('brand') || taskLower.includes('identity') || taskLower.includes('image') ? 15 : 0,
      'Market_Analyst': taskLower.includes('market') || taskLower.includes('analysis') || taskLower.includes('trend') ? 15 : 0,
      'Finance_Analyst': taskLower.includes('finance') || taskLower.includes('budget') || taskLower.includes('cost') ? 15 : 0,
      'Product_Manager': taskLower.includes('product') || taskLower.includes('feature') || taskLower.includes('development') ? 15 : 0,
      'Marketing_Manager': taskLower.includes('marketing') || taskLower.includes('campaign') || taskLower.includes('promotion') ? 15 : 0,
      'Partnership_Manager': taskLower.includes('partnership') || taskLower.includes('collaboration') || taskLower.includes('alliance') ? 15 : 0
    };

    return roleScores[role] || 0;
  }

  /**
   * Calculate deadline based on task priority
   */
  calculateDeadline(priority) {
    const now = new Date();
    const deadlineHours = {
      'high': 2,
      'medium': 24,
      'low': 72
    };

    return new Date(now.getTime() + (deadlineHours[priority] || 24) * 60 * 60 * 1000);
  }

  /**
   * Monitor task execution and provide status updates
   */
  getTaskStatus(taskId) {
    const activeTask = this.activeTasks.get(taskId);
    if (activeTask) {
      return {
        found: true,
        status: 'active',
        ...activeTask
      };
    }

    const historicalTask = this.taskHistory.find(task => task.id === taskId);
    if (historicalTask) {
      return {
        found: true,
        status: 'completed',
        ...historicalTask
      };
    }

    return {
      found: false,
      error: 'Task not found'
    };
  }

  /**
   * Aggregate results from multiple agents for complex tasks
   */
  async aggregateResults(taskIds, aggregationType = 'summary') {
    console.log(`${this.name}: Aggregating results for ${taskIds.length} tasks`);

    const tasks = taskIds.map(id => this.getTaskStatus(id)).filter(task => task.found);
    const completedTasks = tasks.filter(task => task.status === 'completed' && task.result?.success);

    if (completedTasks.length === 0) {
      return {
        success: false,
        error: 'No completed tasks found for aggregation'
      };
    }

    // Prepare aggregation context
    const aggregationContext = {
      total_tasks: tasks.length,
      completed_tasks: completedTasks.length,
      aggregation_type: aggregationType,
      results: completedTasks.map(task => ({
        agent: task.assignedAgent,
        task_description: task.description,
        result: task.result.result
      }))
    };

    try {
      // Use CEO's processing capability to aggregate results
      const aggregationTaskId = `aggregation-${Date.now()}`;
      const aggregationPrompt = `Aggregate and synthesize the following task results into a comprehensive ${aggregationType}:

${JSON.stringify(aggregationContext, null, 2)}

Provide a coherent analysis that combines insights from all agents and identifies key patterns, conflicts, and recommendations.`;

      const result = await this.processTask(
        aggregationTaskId,
        aggregationPrompt,
        { type: 'aggregation', source_tasks: taskIds }
      );

      return {
        success: true,
        aggregated_result: result.result,
        source_tasks: taskIds,
        agents_involved: [...new Set(completedTasks.map(task => task.assignedAgent))],
        aggregation_type: aggregationType
      };

    } catch (error) {
      console.error(`${this.name}: Error aggregating results:`, error);
      return {
        success: false,
        error: error.message,
        raw_data: aggregationContext
      };
    }
  }

  /**
   * Update performance metrics based on task history
   */
  updatePerformanceMetrics() {
    const completedTasks = this.taskHistory.filter(task => task.status === 'completed');
    const failedTasks = this.taskHistory.filter(task => task.status === 'failed');

    this.performanceMetrics.successRate = this.taskHistory.length > 0 
      ? (completedTasks.length / this.taskHistory.length) * 100 
      : 0;

    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        return sum + (task.completedAt - task.assignedAt);
      }, 0);
      
      this.performanceMetrics.averageCompletionTime = totalTime / completedTasks.length / (1000 * 60); // in minutes
    }
  }

  /**
   * Generate comprehensive team performance report
   */
  async generateTeamReport() {
    console.log(`${this.name}: Generating comprehensive team performance report`);

    const teamStats = {
      total_agents: this.teamAgents.size,
      performance_metrics: this.performanceMetrics,
      active_tasks: this.activeTasks.size,
      completed_tasks: this.taskHistory.filter(task => task.status === 'completed').length,
      failed_tasks: this.taskHistory.filter(task => task.status === 'failed').length,
      agent_status: Array.from(this.teamAgents.values()).map(agent => agent.getStatus())
    };

    // Generate CEO-level insights
    const reportTaskId = `team-report-${Date.now()}`;
    const result = await this.processTask(
      reportTaskId,
      `Generate a comprehensive team performance report and strategic recommendations based on the following data: ${JSON.stringify(teamStats, null, 2)}`,
      { type: 'team_report' }
    );

    return {
      generated_at: new Date().toISOString(),
      team_statistics: teamStats,
      ceo_insights: result.result,
      recommendations: result.success ? 'Included in CEO insights' : 'Failed to generate insights'
    };
  }

  /**
   * Get overall system status
   */
  getSystemStatus() {
    return {
      ceo_status: this.getStatus(),
      team_agents: Array.from(this.teamAgents.values()).map(agent => agent.getStatus()),
      active_tasks: this.activeTasks.size,
      performance_metrics: this.performanceMetrics,
      system_health: this.calculateSystemHealth()
    };
  }

  /**
   * Calculate overall system health score
   */
  calculateSystemHealth() {
    const idleAgents = Array.from(this.teamAgents.values()).filter(agent => agent.status === 'idle').length;
    const totalAgents = this.teamAgents.size;
    const availabilityScore = totalAgents > 0 ? (idleAgents / totalAgents) * 50 : 0;
    const performanceScore = Math.min(this.performanceMetrics.successRate / 2, 50);
    
    return Math.round(availabilityScore + performanceScore);
  }
}

export { CEOAgent };