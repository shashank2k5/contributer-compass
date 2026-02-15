# Contributor Compass 🧭

> **Zero to Contributor in Under 5 Minutes**

An AI-powered tool that transforms any GitHub repository into a guided tour, helping new developers become open-source contributors with intelligent analysis, interactive visualizations, and personalized challenges.

[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js%2014-black)](https://nextjs.org/)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%203.7-orange)](https://www.anthropic.com/)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy%20with-Vercel-black)](https://vercel.com)

---

## 🌟 Features

### 🎯 Smart Contribution Guidance
- **Color-coded file tree** indicates contribution difficulty
  - 🟢 **Green**: Beginner-friendly files (low complexity, well-tested)
  - 🟡 **Yellow**: Intermediate files (moderate complexity)
  - 🔴 **Red**: Critical/advanced files (core infrastructure)
- **Readiness scoring algorithm** analyzes:
  - Cyclomatic complexity
  - Test coverage
  - Dependency relationships
  - File size and type

### 🗺️ Architecture Visualization
- **Interactive dependency graphs** powered by React Flow
- **Expandable folder tree** with module clustering
- **Entry point detection** to understand code flow
- **Drag, zoom, and pan** to explore relationships

### 💬 AI-Powered Chat
- **Ask questions about the codebase** in natural language
- **Claude 3.7 Sonnet** with 200K context window (fits entire repos!)
- **File references** with direct GitHub links
- **Code snippets** and explanations
- **Confidence scoring** on answers

### 🎯 PR Challenge Generator
- **Personalized starter tasks** based on skill level
- **Beginner/Intermediate/Advanced** difficulty options
- **Includes**:
  - File locations and line numbers
  - Coding patterns to follow
  - Test requirements
  - Acceptance criteria
  - Time estimates

---

## 🚀 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework with serverless functions |
| **UI Library** | Shadcn UI + Tailwind CSS | Modern, accessible components |
| **Visualization** | React Flow | Interactive node-based graphs |
| **AI Model** | Claude 3.7 Sonnet | Code understanding and analysis |
| **Code Parsing** | Tree-sitter | AST-based code analysis |
| **Caching** | Vercel KV (Redis) | Fast analysis caching |
| **Deployment** | Vercel | Zero-config, auto-scaling |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GitHub Personal Access Token
- Anthropic API Key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/contributor-compass.git
   cd contributor-compass
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file:
   ```bash
   # GitHub API
   GITHUB_TOKEN=ghp_your_github_token_here
   
   # Anthropic API
   ANTHROPIC_API_KEY=sk-ant-your_api_key_here
   
   # Redis (Vercel KV)
   REDIS_URL=redis://default:xxxxx@redis.upstash.io:6379
   
   # Environment
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎯 Usage

### Analyze a Repository

1. **Paste a GitHub URL** on the landing page
   ```
   https://github.com/facebook/react
   ```

2. **Wait for analysis** (typically 30-60 seconds)
   - Fetches repository metadata
   - Parses code with Tree-sitter
   - Builds dependency graph
   - Scores contribution readiness
   - Generates AI overview

3. **Explore the dashboard**
   - Browse the color-coded file tree
   - View interactive architecture diagrams
   - Identify entry points

### Chat with the Codebase

1. **Ask questions** in natural language:
   - "Where is authentication handled?"
   - "Which files should I start with as a beginner?"
   - "How does the routing work?"

2. **Get AI-powered answers** with:
   - File references
   - Code snippets
   - GitHub direct links
   - Confidence scores

### Generate a PR Challenge

1. **Select your skill level**:
   - Beginner
   - Intermediate
   - Advanced

2. **Receive a curated challenge** with:
   - Task description
   - Files to modify
   - Coding patterns
   - Test requirements
   - Acceptance criteria

---

## 📁 Project Structure

```
contributor-compass/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Landing page
│   │   ├── dashboard/           # Dashboard routes
│   │   └── api/                 # API routes
│   │       ├── analyze/         # Repository analysis
│   │       ├── chat/            # AI chat endpoint
│   │       └── challenge/       # Challenge generation
│   │
│   ├── components/              # React components
│   │   ├── ui/                 # Shadcn UI primitives
│   │   ├── dashboard/          # Dashboard components
│   │   └── analysis/           # Visualization components
│   │
│   ├── lib/                    # Business logic
│   │   ├── services/           # External service clients
│   │   │   ├── github.ts       # GitHub API
│   │   │   ├── parser.ts       # Tree-sitter
│   │   │   ├── analysis.ts     # Code analysis
│   │   │   ├── claude.ts       # Claude API
│   │   │   └── cache.ts        # Redis operations
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   ├── scoring.ts      # Readiness algorithm
│   │   │   └── graphBuilder.ts # Dependency graphs
│   │   │
│   │   └── types/              # TypeScript types
│   │
│   └── hooks/                  # Custom React hooks
│
├── public/                     # Static assets
├── design.md                   # Design document
├── requirements.md             # Requirements specification
└── README.md                   # This file
```

---

## 🔒 Security

- **Input validation** on all GitHub URLs
- **Rate limiting** per IP address
  - Analysis: 10 per hour
  - Chat: 30 per minute
  - Challenge: 5 per hour
- **Content Security Policy** headers
- **Environment variable encryption** via Vercel
- **API key rotation** best practices

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy automatically

3. **Set up Vercel KV**
   - Add Redis integration
   - Update `REDIS_URL` in environment variables

### Environment Variables (Production)

Set these in your Vercel dashboard:
- `GITHUB_TOKEN`
- `ANTHROPIC_API_KEY`
- `REDIS_URL`
- `NODE_ENV=production`

---

## 🧪 API Endpoints

### `POST /api/analyze`
Analyze a GitHub repository

**Request:**
```json
{
  "url": "https://github.com/owner/repo",
  "skipCache": false
}
```

**Response:**
```json
{
  "repoId": "owner/repo",
  "repository": { ... },
  "files": [ ... ],
  "dependencyGraph": { ... },
  "entryPoints": [ ... ],
  "architectureOverview": "...",
  "cached": true
}
```

### `POST /api/chat`
Chat with the codebase

**Request:**
```json
{
  "repoId": "owner/repo",
  "question": "Where is authentication handled?",
  "history": [ ... ]
}
```

### `POST /api/challenge`
Generate PR challenge

**Request:**
```json
{
  "repoId": "owner/repo",
  "skillLevel": "beginner"
}
```

---

## 🎨 Design Philosophy

- **Beginner-first**: Optimized for newcomers to open source
- **AI-augmented**: Leverages Claude for intelligent insights
- **Visual learning**: Interactive diagrams over text walls
- **Action-oriented**: From exploration to contribution quickly

---

## 🤝 Contributing

We welcome contributions! This is an open-source project designed to help others contribute to open source. 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Twice the Caffeine**
- **Team Leader**: Shashank Sharma

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Anthropic](https://www.anthropic.com/) for Claude API
- [Tree-sitter](https://tree-sitter.github.io/) for code parsing
- [React Flow](https://reactflow.dev/) for graph visualization
- [Vercel](https://vercel.com/) for seamless deployment

---

**Built with ❤️ to democratize open-source contributions**
