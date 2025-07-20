import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Base Agent class that all specialized agents inherit from
 * Provides core functionality for AI-powered task processing and collaboration
 */
export class Agent {
  constructor(name, role, specialKnowledge = []) {
    this.name = name;
    this.role = role;
    this.specialKnowledge = specialKnowledge;
    this.claude = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
    this.sharedKnowledge = null;
    this.currentTasks = new Map();
    this.collaborators = new Map();
    this.status = 'idle'; // idle, busy, offline
  }

  /**
   * Load shared knowledge base that all agents can access
   */
  async loadSharedKnowledge() {
    try {
      const knowledgeBasePath = path.join(__dirname, '../../knowledge_base/shared');
      const files = await fs.readdir(knowledgeBasePath);
      
      this.sharedKnowledge = {};
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(knowledgeBasePath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const key = file.replace('.json', '');
          this.sharedKnowledge[key] = JSON.parse(content);
        }
      }
      
      console.log(`${this.name}: Loaded shared knowledge base`);
    } catch (error) {
      console.warn(`${this.name}: Could not load shared knowledge base:`, error.message);
      this.sharedKnowledge = {};
    }
  }

  /**
   * Load specialized knowledge for this agent's role
   */
  async loadSpecializedKnowledge() {
    try {
      const specializedPath = path.join(__dirname, '../../knowledge_base/specialized', this.role);
      const files = await fs.readdir(specializedPath);
      
      this.specializedKnowledge = {};
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(specializedPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const key = file.replace('.json', '');
          this.specializedKnowledge[key] = JSON.parse(content);
        }
      }
      
      console.log(`${this.name}: Loaded specialized knowledge for ${this.role}`);
    } catch (error) {
      console.warn(`${this.name}: Could not load specialized knowledge:`, error.message);
      this.specializedKnowledge = {};
    }
  }

  /**
   * Process a task using Claude API with agent's specialized knowledge
   */
  async processTask(taskId, taskDescription, context = {}) {
    this.status = 'busy';
    this.currentTasks.set(taskId, {
      description: taskDescription,
      startTime: new Date(),
      status: 'processing',
      context
    });

    try {
      // Prepare context for Claude
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(taskDescription, context);

      const response = await this.claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const result = response.content[0].text;
      
      // Update task status
      const task = this.currentTasks.get(taskId);
      task.status = 'completed';
      task.result = result;
      task.completionTime = new Date();

      this.status = 'idle';
      
      console.log(`${this.name}: Completed task ${taskId}`);
      return {
        success: true,
        result,
        agent: this.name,
        taskId
      };

    } catch (error) {
      console.error(`${this.name}: Error processing task ${taskId}:`, error);
      
      const task = this.currentTasks.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = error.message;
        task.completionTime = new Date();
      }

      this.status = 'idle';
      
      return {
        success: false,
        error: error.message,
        agent: this.name,
        taskId
      };
    }
  }

  /**
   * Build system prompt based on agent's role and knowledge
   */
  buildSystemPrompt() {
    return `You are ${this.name}, a ${this.role} in an AI agents team management system.

Your specialized knowledge includes: ${this.specialKnowledge.join(', ')}

Your role responsibilities:
- Provide expert analysis and recommendations in your domain
- Collaborate effectively with other team agents
- Generate actionable insights and detailed reports
- Maintain professional communication standards

Available shared knowledge: ${this.sharedKnowledge ? Object.keys(this.sharedKnowledge).join(', ') : 'None loaded'}

Always provide specific, actionable recommendations and cite relevant data or analysis where applicable.`;
  }

  /**
   * Build user prompt with task description and context
   */
  buildUserPrompt(taskDescription, context) {
    let prompt = `Task: ${taskDescription}\n\n`;
    
    if (Object.keys(context).length > 0) {
      prompt += `Additional Context:\n`;
      for (const [key, value] of Object.entries(context)) {
        prompt += `- ${key}: ${value}\n`;
      }
      prompt += '\n';
    }

    prompt += `Please provide a detailed analysis and recommendations based on your expertise as a ${this.role}.`;
    
    return prompt;
  }

  /**
   * Collaborate with another agent on a shared task
   */
  async collaborateWith(otherAgent, taskDescription, myContribution) {
    console.log(`${this.name}: Starting collaboration with ${otherAgent.name}`);
    
    // Process own part of the task
    const myResult = await this.processTask(
      `collab-${Date.now()}-${this.name}`,
      taskDescription,
      { collaboration: true, myRole: this.role }
    );

    // Share results and get other agent's input
    const collaborationContext = {
      [`${this.role}_analysis`]: myResult.result,
      collaboration_request: `Please review and build upon the ${this.role}'s analysis`
    };

    const otherResult = await otherAgent.processTask(
      `collab-${Date.now()}-${otherAgent.name}`,
      taskDescription,
      collaborationContext
    );

    return {
      collaborative_result: {
        [`${this.role}_contribution`]: myResult.result,
        [`${otherAgent.role}_contribution`]: otherResult.result
      },
      participants: [this.name, otherAgent.name]
    };
  }

  /**
   * Generate a comprehensive report based on completed tasks
   */
  async generateReport(taskIds = [], reportType = 'summary') {
    const tasks = taskIds.length > 0 
      ? taskIds.map(id => this.currentTasks.get(id)).filter(Boolean)
      : Array.from(this.currentTasks.values());

    if (tasks.length === 0) {
      return {
        error: 'No tasks available for report generation'
      };
    }

    const reportData = {
      agent: this.name,
      role: this.role,
      report_type: reportType,
      generated_at: new Date().toISOString(),
      tasks_analyzed: tasks.length,
      successful_tasks: tasks.filter(t => t.status === 'completed').length,
      failed_tasks: tasks.filter(t => t.status === 'failed').length,
      tasks: tasks.map(task => ({
        description: task.description,
        status: task.status,
        duration: task.completionTime 
          ? Math.round((task.completionTime - task.startTime) / 1000)
          : null,
        result_summary: task.result ? task.result.substring(0, 200) + '...' : null
      }))
    };

    // Generate insights using Claude
    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: `You are ${this.name}, generating a ${reportType} report as a ${this.role}.`,
        messages: [
          {
            role: 'user',
            content: `Generate a comprehensive ${reportType} report based on this data:\n\n${JSON.stringify(reportData, null, 2)}\n\nProvide key insights, patterns, and recommendations.`
          }
        ]
      });

      reportData.insights = response.content[0].text;
      
      // Save report to file
      const reportsDir = path.join(__dirname, '../../reports');
      await fs.mkdir(reportsDir, { recursive: true });
      
      const filename = `${this.name}_${reportType}_${Date.now()}.json`;
      const reportPath = path.join(reportsDir, filename);
      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
      
      console.log(`${this.name}: Generated report saved to ${filename}`);
      return reportData;

    } catch (error) {
      console.error(`${this.name}: Error generating report:`, error);
      return {
        ...reportData,
        error: 'Failed to generate insights',
        raw_data: reportData
      };
    }
  }

  /**
   * Get agent status and current workload
   */
  getStatus() {
    return {
      name: this.name,
      role: this.role,
      status: this.status,
      current_tasks: this.currentTasks.size,
      completed_tasks: Array.from(this.currentTasks.values())
        .filter(task => task.status === 'completed').length,
      specialization: this.specialKnowledge
    };
  }

  /**
   * Register another agent for potential collaboration
   */
  registerCollaborator(agent) {
    this.collaborators.set(agent.name, agent);
    console.log(`${this.name}: Registered collaborator ${agent.name}`);
  }

  /**
   * Clear completed tasks (housekeeping)
   */
  clearCompletedTasks() {
    const completedTasks = Array.from(this.currentTasks.entries())
      .filter(([_, task]) => task.status === 'completed' || task.status === 'failed');
    
    completedTasks.forEach(([taskId, _]) => {
      this.currentTasks.delete(taskId);
    });

    console.log(`${this.name}: Cleared ${completedTasks.length} completed tasks`);
  }
}