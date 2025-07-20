# AI Agents Team Management System

A sophisticated Node.js application that coordinates multiple AI agents for various business tasks using Claude API. Each agent specializes in different domains and can collaborate to solve complex problems.

## 🤖 Meet the Team

### Management Layer
- **🏆 lil_Boss_CEO** - Main coordinator responsible for task delegation, monitoring, and strategic oversight

### Specialized Agents
- **🔍 lil_SEO_Specialist** - Search engine optimization, keyword research, content optimization
- **🎨 lil_Brand_Manager** - Brand strategy, identity management, brand positioning
- **📊 lil_Market_Analyst** - Market research, competitive analysis, trend identification
- **💰 lil_Finance_Analyst** - Financial analysis, budget planning, ROI calculations
- **📦 lil_Product_Manager** - Product strategy, feature prioritization, user research
- **📢 lil_Marketing_Manager** - Marketing campaigns, digital marketing, analytics
- **🤝 lil_Partnership_Manager** - Business development, strategic alliances, collaborations

## 🏗️ Architecture

```
ai-agents-team-management/
├── agents/                     # AI agent modules
│   ├── base/
│   │   └── Agent.js           # Base agent class
│   ├── lil_Boss_CEO/
│   │   └── index.js           # CEO coordinator agent
│   ├── lil_SEO_Specialist/
│   │   └── index.js           # SEO specialist agent
│   ├── lil_Brand_Manager/
│   ├── lil_Market_Analyst/
│   ├── lil_Finance_Analyst/
│   ├── lil_Product_Manager/
│   ├── lil_Marketing_Manager/
│   └── lil_Partnership_Manager/
├── knowledge_base/             # Shared and specialized knowledge
│   ├── shared/                # Knowledge accessible to all agents
│   │   ├── company_info.json
│   │   └── best_practices.json
│   └── specialized/           # Role-specific knowledge bases
│       ├── SEO_Specialist/
│       └── Brand_Manager/
├── telegram_bot/              # Telegram bot interface
│   └── bot.js
├── api_gateway/               # Express.js API server
│   └── server.js
├── reports/                   # Generated reports (auto-created)
├── package.json
├── .env.example
└── README.md
```

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** (v18 or higher)
- **NPM** or **Yarn**
- **Claude API Key** from Anthropic
- **Telegram Bot Token** (optional, for Telegram interface)

### 2. Installation

```bash
# Clone the repository
git clone <your-repository-url>
cd ai-agents-team-management

# Install dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
nano .env
```

Add your API keys to `.env`:
```env
CLAUDE_API_KEY=your_claude_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
PORT=3000
NODE_ENV=development
```

### 4. Start the System

```bash
# Start the API gateway server (initializes all agents)
npm start

# For development with auto-restart
npm run dev
```

The system will:
1. Initialize the CEO agent
2. Create and register all specialized agents
3. Load knowledge bases
4. Start the Express API server on port 3000

## 📡 API Endpoints

### Health & Status
- `GET /health` - System health check
- `GET /system/status` - Overall system status
- `GET /agents` - List all agents and their availability

### Task Management
- `POST /task` - Submit new task
- `GET /status/:taskId` - Check task status
- `POST /aggregate` - Aggregate results from multiple tasks

### Reporting
- `GET /reports/team` - Team performance report
- `GET /reports/agent/:agentName` - Agent-specific report

## 💬 Telegram Bot Interface

### Setup Telegram Bot (Optional)

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Add token to `.env` file
4. Start the bot:

```bash
# Create a simple bot starter (optional)
node -e "
import { AgentsTeamBot } from './telegram_bot/bot.js';
const bot = new AgentsTeamBot();
bot.start();
"
```

### Bot Commands
- `/start` - Welcome message and introduction
- `/task` - Submit a new task through interactive interface
- `/status <taskId>` - Check specific task status
- `/agents` - List all available agents
- `/report` - Generate team performance report
- `/help` - Show all available commands

## 🎯 Usage Examples

### 1. Submit Task via API

```bash
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Analyze SEO opportunities for our e-commerce website selling eco-friendly products",
    "priority": "high",
    "requiredSkills": ["SEO", "E-commerce"]
  }'
```

### 2. Check Task Status

```bash
curl http://localhost:3000/status/task-1234567890
```

### 3. Get System Status

```bash
curl http://localhost:3000/system/status
```

### 4. List Available Agents

```bash
curl http://localhost:3000/agents
```

## 🔧 Agent Capabilities

### CEO Agent
- Task delegation based on agent expertise
- Performance monitoring and metrics
- Result aggregation from multiple agents
- Strategic decision making
- Team coordination and reporting

### SEO Specialist
- Keyword research and analysis
- Technical SEO audits
- Content optimization recommendations
- Competitor analysis
- Local SEO strategy planning

### Brand Manager
- Brand strategy development
- Brand identity management
- Brand positioning analysis
- Brand consistency monitoring
- Brand perception tracking

### Market Analyst
- Market research and analysis
- Competitive landscape assessment
- Trend identification and forecasting
- Consumer behavior analysis
- Industry analysis and insights

## 📊 Knowledge Base System

### Shared Knowledge
All agents have access to:
- Company information and values
- Best practices and guidelines
- Communication standards
- Quality requirements

### Specialized Knowledge
Each agent has domain-specific knowledge:
- SEO guidelines and tools
- Brand management frameworks
- Market analysis methodologies
- Financial analysis templates

## 🔄 Task Flow

1. **Task Submission** - User submits task via API or Telegram
2. **Agent Selection** - CEO analyzes requirements and selects best agent
3. **Task Processing** - Selected agent processes task using Claude API
4. **Result Generation** - Agent generates comprehensive analysis
5. **Status Updates** - Real-time status tracking and notifications
6. **Report Generation** - Detailed reports with insights and recommendations

## 🔐 Security & Best Practices

### Environment Variables
- Store all sensitive keys in `.env` file
- Never commit `.env` to version control
- Use different environments for development/production

### API Security
- Add rate limiting for production use
- Implement authentication for sensitive endpoints
- Use HTTPS in production

### Error Handling
- Comprehensive error logging
- Graceful failure handling
- Automatic retry mechanisms

## 📈 Monitoring & Analytics

### Performance Metrics
- Task completion rates
- Average response times
- Agent utilization
- Success/failure ratios

### Health Monitoring
- System availability
- Agent status tracking
- Resource utilization
- Error rate monitoring

## 🛠️ Development

### Adding New Agents

1. Create agent folder: `agents/lil_New_Agent/`
2. Implement agent class extending base `Agent`
3. Add specialized knowledge files
4. Register agent in API gateway
5. Update documentation

### Extending Functionality

1. **Custom Knowledge** - Add JSON files to knowledge_base
2. **New Endpoints** - Extend API gateway with new routes
3. **Agent Methods** - Add specialized methods to agent classes
4. **Integrations** - Connect with external APIs and services

## 🐛 Troubleshooting

### Common Issues

1. **Agent Initialization Fails**
   - Check Claude API key validity
   - Verify internet connection
   - Review console logs for specific errors

2. **Tasks Not Processing**
   - Confirm agents are in 'idle' status
   - Check API rate limits
   - Verify task format and requirements

3. **Telegram Bot Not Responding**
   - Validate bot token
   - Check bot permissions
   - Ensure polling is active

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development npm start
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review agent logs for error details

---

**Built with ❤️ using Node.js, Claude AI, and Express.js**