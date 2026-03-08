# Contributor Compass - Design Document

**Team:** Twice the Caffeine  
**Team Leader:** Shashank Sharma  
**Version:** 1.0  
**Last Updated:** February 15, 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Component Design](#3-component-design)
4. [Data Flow](#4-data-flow)
5. [API Design](#5-api-design)
6. [Database Schema](#6-database-schema)
7. [Algorithm Design](#7-algorithm-design)
8. [UI/UX Design](#8-uiux-design)
9. [Security Design](#9-security-design)
10. [Performance Optimization](#10-performance-optimization)
11. [Error Handling](#11-error-handling)
12. [Deployment Strategy](#12-deployment-strategy)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────────────────────────────┐
│         Vercel Edge Network         │
│  (CDN + Edge Functions + Routing)   │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ↓                ↓
┌──────────────┐  ┌──────────────────┐
│   Frontend   │  │  API Routes      │
│  (Next.js)   │  │  (Serverless)    │
│              │  │                  │
│ - React      │  │ - Analysis API   │
│ - React Flow │  │ - Chat API       │
│ - Shadcn UI  │  │ - Challenge API  │
└──────────────┘  └────────┬─────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ↓                 ↓
         ┌────────────────┐  ┌──────────────┐
         │  External APIs │  │  Redis Cache │
         │                │  │  (Vercel KV) │
         │ - GitHub API   │  │              │
         │ - Claude API   │  │ - Analyses   │
         │ - Tree-sitter  │  │ - Embeddings │
         └────────────────┘  └──────────────┘
```

### 1.2 Technology Decisions

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend Framework** | Next.js 14 (App Router) | React-based, great DX, serverless functions, excellent Vercel integration |
| **UI Library** | Shadcn UI + Tailwind | Modern, accessible, customizable, great defaults |
| **Visualization** | React Flow | Best-in-class for node graphs, performant, interactive |
| **Backend** | Next.js API Routes | Collocated with frontend, serverless, scales to zero |
| **AI Model** | Claude 3.7 Sonnet | 200K context window (fits entire repos), best code understanding |
| **Code Parsing** | Tree-sitter | Industry standard, fast, supports many languages |
| **Caching** | Vercel KV (Redis) | Managed Redis, low latency, integrated with Vercel |
| **Deployment** | Vercel | Zero-config, automatic previews, excellent DX, scales automatically |

---

## 2. Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Pages     │  │  Components  │  │    Hooks     │         │
│  │              │  │              │  │              │         │
│  │ - Home       │  │ - Dashboard  │  │ - useRepo    │         │
│  │ - Dashboard  │  │ - FileTree   │  │ - useChat    │         │
│  │              │  │ - ChatBox    │  │ - useCache   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │ API Calls (fetch)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND LAYER                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │            API Routes (Serverless)               │          │
│  │                                                  │          │
│  │  /api/analyze    - Analyze repository           │          │
│  │  /api/chat       - Chat with codebase           │          │
│  │  /api/challenge  - Generate PR challenge        │          │
│  │  /api/health     - Health check                 │          │
│  └──────────────────────────────────────────────────┘          │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────┐          │
│  │              Service Layer                       │          │
│  │                                                  │          │
│  │  - GitHubService     - Fetch repos              │          │
│  │  - ParserService     - Parse code with Tree-sit │          │
│  │  - AnalysisService   - Score files, dependencies│          │
│  │  - ClaudeService     - AI integration           │          │
│  │  - CacheService      - Redis operations         │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ↓                     ↓
        ┌─────────────────┐   ┌─────────────────┐
        │  External APIs  │   │  Redis Cache    │
        │                 │   │  (Vercel KV)    │
        │ - GitHub        │   │                 │
        │ - Claude        │   │ - repo metadata │
        └─────────────────┘   │ - analysis data │
                              │ - chat history  │
                              └─────────────────┘
```

### 2.2 Component Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── dashboard/
│   │   └── [repoId]/
│   │       └── page.tsx          # Dashboard page
│   └── api/                      # API routes
│       ├── analyze/
│       │   └── route.ts
│       ├── chat/
│       │   └── route.ts
│       └── challenge/
│           └── route.ts
│
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── dashboard/
│   │   ├── Dashboard.tsx         # Main dashboard layout
│   │   ├── FileTree.tsx          # File browser with heatmap
│   │   ├── ArchitectureView.tsx  # Architecture visualization
│   │   ├── ChatInterface.tsx     # Chat UI
│   │   └── ChallengeCard.tsx     # PR challenge display
│   ├── analysis/
│   │   ├── DependencyGraph.tsx   # React Flow graph
│   │   ├── FolderTree.tsx        # Expandable tree
│   │   └── Heatmap.tsx           # Color-coded overlay
│   └── shared/
│       ├── LoadingState.tsx
│       ├── ErrorBoundary.tsx
│       └── Header.tsx
│
├── lib/                          # Business logic
│   ├── services/
│   │   ├── github.ts             # GitHub API client
│   │   ├── parser.ts             # Tree-sitter wrapper
│   │   ├── analysis.ts           # Code analysis logic
│   │   ├── claude.ts             # Claude API client
│   │   └── cache.ts              # Redis operations
│   ├── utils/
│   │   ├── scoring.ts            # Contribution readiness algorithm
│   │   ├── graphBuilder.ts       # Dependency graph construction
│   │   └── validators.ts         # Input validation
│   └── types/
│       ├── repo.ts
│       ├── analysis.ts
│       └── api.ts
│
├── hooks/                        # Custom React hooks
│   ├── useRepositoryAnalysis.ts
│   ├── useChat.ts
│   └── useChallenge.ts
│
└── config/
    ├── constants.ts              # App constants
    └── env.ts                    # Environment variables
```

---

## 3. Component Design

### 3.1 Frontend Components

#### 3.1.1 Dashboard Component

**Responsibility:** Main layout for analyzed repository

**Props:**
```typescript
interface DashboardProps {
  repoId: string;
  initialData?: AnalysisResult;
}
```

**State:**
```typescript
interface DashboardState {
  activeTab: 'files' | 'architecture' | 'dependencies';
  selectedFile: FileNode | null;
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
}
```

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│                     Header                           │
│  [Logo]  [Repo Name]  [Star Count]  [GitHub Link]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┬─────────────────────┬──────────────┐  │
│  │          │                     │              │  │
│  │  File    │   Architecture      │    Chat      │  │
│  │  Tree    │   Visualization     │  Interface   │  │
│  │          │                     │              │  │
│  │  [Files] │   [Folder Tree]     │  [Messages]  │  │
│  │  with    │   [Dep Graph]       │  [Input]     │  │
│  │  heatmap │   [Entry Points]    │              │  │
│  │          │                     │  [Challenge] │  │
│  │          │                     │  [Card]      │  │
│  └──────────┴─────────────────────┴──────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### 3.1.2 FileTree Component

**Responsibility:** Display files with contribution readiness colors

**Features:**
- Expandable/collapsible folders
- Color-coded files (green/yellow/red)
- Search and filter
- Click to view file details
- Tooltips explaining scores

**Implementation:**
```typescript
interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  readinessScore: 'green' | 'yellow' | 'red';
  children?: FileNode[];
  metadata: {
    linesOfCode: number;
    complexity: number;
    testCoverage: number;
    dependencies: string[];
  };
}

const FileTree: React.FC<{ 
  files: FileNode[]; 
  onSelectFile: (file: FileNode) => void;
}> = ({ files, onSelectFile }) => {
  // Recursive tree rendering
  // Color coding based on readinessScore
  // Search/filter logic
};
```

#### 3.1.3 DependencyGraph Component

**Responsibility:** Visualize module dependencies using React Flow

**Features:**
- Nodes: Files/modules
- Edges: Import/export relationships
- Interactive: drag, zoom, pan
- Hover: show details
- Click: highlight connected nodes
- Color by type (component, utility, test)

**Implementation:**
```typescript
interface GraphNode {
  id: string;
  type: 'component' | 'utility' | 'test' | 'config';
  data: {
    label: string;
    path: string;
    dependencies: string[];
  };
  position: { x: number; y: number };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'export';
}

const DependencyGraph: React.FC<{
  nodes: GraphNode[];
  edges: GraphEdge[];
}> = ({ nodes, edges }) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      nodeTypes={customNodeTypes}
      edgeTypes={customEdgeTypes}
    />
  );
};
```

#### 3.1.4 ChatInterface Component

**Responsibility:** Conversational AI interface

**Features:**
- Message history
- Typing indicator
- Code snippet rendering
- File path links (open in GitHub)
- Example questions

**Implementation:**
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  fileReferences?: FileReference[];
  confidenceScore?: number;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    // Append user message
    // Call /api/chat endpoint
    // Stream response
    // Append assistant message
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <ExampleQuestions onSelect={setInput} />
      <MessageInput 
        value={input}
        onChange={setInput}
        onSubmit={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};
```

### 3.2 Backend Services

#### 3.2.1 GitHubService

**Responsibility:** Fetch repository data from GitHub API

```typescript
class GitHubService {
  private client: Octokit;

  async fetchRepository(owner: string, repo: string): Promise<RepoData> {
    // GET /repos/{owner}/{repo}
    // Returns metadata (stars, description, language)
  }

  async fetchFileTree(owner: string, repo: string, branch: string = 'main'): Promise<FileNode[]> {
    // GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1
    // Returns complete file tree
    // Filter out binary files, node_modules, .git
    // Limit to 500 files
  }

  async fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
    // GET /repos/{owner}/{repo}/contents/{path}
    // Returns file content (base64 decoded)
  }

  async fetchMultipleFiles(files: string[]): Promise<Map<string, string>> {
    // Batch fetch with concurrency limit (10)
    // Returns map of path -> content
  }
}
```

**Error Handling:**
- Rate limit exceeded → Return 429 with retry-after
- Repository not found → Return 404
- Private repository → Return 403
- Network error → Retry with exponential backoff

#### 3.2.2 ParserService

**Responsibility:** Parse code using Tree-sitter

```typescript
class ParserService {
  private parsers: Map<string, Parser>;

  constructor() {
    // Initialize parsers for JS, TS, Python
    this.parsers.set('javascript', Parser.javascript);
    this.parsers.set('typescript', Parser.typescript);
    this.parsers.set('python', Parser.python);
  }

  parseFile(content: string, language: string): ParsedFile {
    const parser = this.parsers.get(language);
    const tree = parser.parse(content);
    
    return {
      imports: this.extractImports(tree),
      exports: this.extractExports(tree),
      functions: this.extractFunctions(tree),
      classes: this.extractClasses(tree),
      complexity: this.calculateComplexity(tree),
    };
  }

  private extractImports(tree: Tree): Import[] {
    // Walk AST to find import statements
    // Return { module, specifiers }
  }

  private calculateComplexity(tree: Tree): number {
    // Cyclomatic complexity
    // Count decision points (if, while, for, case, &&, ||)
  }
}
```

#### 3.2.3 AnalysisService

**Responsibility:** Analyze repository and generate insights

```typescript
class AnalysisService {
  async analyzeRepository(repoData: RepoData): Promise<AnalysisResult> {
    // 1. Parse all files
    const parsedFiles = await this.parseFiles(repoData.files);
    
    // 2. Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(parsedFiles);
    
    // 3. Score contribution readiness
    const scoredFiles = this.scoreFiles(parsedFiles, dependencyGraph);
    
    // 4. Identify entry points
    const entryPoints = this.findEntryPoints(parsedFiles);
    
    // 5. Generate architecture overview (with Claude)
    const architectureOverview = await this.generateOverview(
      repoData, 
      parsedFiles, 
      dependencyGraph
    );
    
    return {
      repository: repoData,
      files: scoredFiles,
      dependencyGraph,
      entryPoints,
      architectureOverview,
      analyzedAt: new Date(),
    };
  }

  private scoreFiles(
    files: ParsedFile[], 
    graph: DependencyGraph
  ): ScoredFile[] {
    return files.map(file => {
      const score = this.calculateReadinessScore(file, graph);
      return { ...file, readinessScore: score };
    });
  }

  private calculateReadinessScore(
    file: ParsedFile, 
    graph: DependencyGraph
  ): 'green' | 'yellow' | 'red' {
    // Implementation in Algorithm Design section
  }
}
```

#### 3.2.4 ClaudeService

**Responsibility:** Interact with Claude API

```typescript
class ClaudeService {
  private client: Anthropic;

  async analyzeCodebase(
    files: Map<string, string>,
    query: string
  ): Promise<ClaudeResponse> {
    // Build context from files
    const context = this.buildContext(files);
    
    // Send to Claude with prompt caching
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: context,
          cache_control: { type: 'ephemeral' } // Cache for 5 minutes
        }
      ],
      messages: [
        {
          role: 'user',
          content: query
        }
      ]
    });

    return this.parseResponse(response);
  }

  private buildContext(files: Map<string, string>): string {
    // Format: "File: path/to/file.js\n{content}\n\n---\n\n"
    let context = "You are analyzing this codebase:\n\n";
    
    for (const [path, content] of files.entries()) {
      context += `File: ${path}\n${content}\n\n---\n\n`;
    }
    
    return context;
  }

  async chat(
    codebaseContext: string,
    question: string,
    history: ChatMessage[]
  ): Promise<ChatMessage> {
    // Similar to analyzeCodebase but includes conversation history
  }

  async generateChallenge(
    analysis: AnalysisResult,
    skillLevel: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<PRChallenge> {
    const prompt = this.buildChallengePrompt(analysis, skillLevel);
    const response = await this.analyzeCodebase(
      analysis.filesAsMap,
      prompt
    );
    return this.parseChallengeResponse(response);
  }
}
```

#### 3.2.5 CacheService

**Responsibility:** Redis caching operations

```typescript
class CacheService {
  private redis: Redis;

  async getAnalysis(repoId: string): Promise<AnalysisResult | null> {
    const key = `analysis:${repoId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setAnalysis(
    repoId: string, 
    analysis: AnalysisResult, 
    ttl: number = 3600
  ): Promise<void> {
    const key = `analysis:${repoId}`;
    await this.redis.set(key, JSON.stringify(analysis), 'EX', ttl);
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const key = `chat:${sessionId}`;
    const messages = await this.redis.lrange(key, 0, -1);
    return messages.map(m => JSON.parse(m));
  }

  async appendChatMessage(
    sessionId: string, 
    message: ChatMessage
  ): Promise<void> {
    const key = `chat:${sessionId}`;
    await this.redis.rpush(key, JSON.stringify(message));
    await this.redis.expire(key, 3600); // 1 hour TTL
  }
}
```

---

## 4. Data Flow

### 4.1 Repository Analysis Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Submit GitHub URL
     ↓
┌────────────┐
│  Frontend  │
└─────┬──────┘
      │ 2. POST /api/analyze { url }
      ↓
┌──────────────┐
│  API Route   │──→ 3. Check cache (Redis)
└──────┬───────┘         │
       │                 │ Cache hit? Return cached
       │ 4. Cache miss   ↓
       ↓              [Return]
┌──────────────────┐
│ GitHubService    │
└────────┬─────────┘
         │ 5. Fetch repo metadata
         │ 6. Fetch file tree
         │ 7. Fetch file contents (batch)
         ↓
┌──────────────────┐
│ ParserService    │
└────────┬─────────┘
         │ 8. Parse each file (Tree-sitter)
         │ 9. Extract imports, exports, complexity
         ↓
┌──────────────────┐
│ AnalysisService  │
└────────┬─────────┘
         │ 10. Build dependency graph
         │ 11. Score contribution readiness
         │ 12. Identify entry points
         ↓
┌──────────────────┐
│ ClaudeService    │
└────────┬─────────┘
         │ 13. Send full codebase to Claude
         │ 14. Generate architecture overview
         ↓
┌──────────────────┐
│ CacheService     │
└────────┬─────────┘
         │ 15. Cache analysis result (1 hour TTL)
         ↓
┌──────────────────┐
│  API Route       │
└────────┬─────────┘
         │ 16. Return AnalysisResult JSON
         ↓
┌──────────────────┐
│  Frontend        │
└────────┬─────────┘
         │ 17. Render Dashboard
         ↓
┌──────────────────┐
│  User sees viz   │
└──────────────────┘
```

### 4.2 Chat Interaction Flow

```
User types question
        ↓
Frontend captures input
        ↓
POST /api/chat { 
  repoId, 
  question, 
  history 
}
        ↓
Get cached analysis from Redis
        ↓
Build codebase context
        ↓
Call Claude API with:
  - Cached codebase context
  - Conversation history
  - New question
        ↓
Stream response back to frontend
        ↓
Frontend displays answer
  - Render code snippets
  - Create file path links
  - Show confidence score
        ↓
Append to chat history in Redis
```

### 4.3 Challenge Generation Flow

```
User clicks "Generate Challenge"
        ↓
POST /api/challenge { 
  repoId, 
  skillLevel: 'beginner'
}
        ↓
Get cached analysis
        ↓
Filter to green/yellow files only
        ↓
Call Claude with prompt:
  "Given this codebase and these beginner-friendly files,
   generate 3 starter task options with file locations,
   coding patterns, tests needed, and time estimates."
        ↓
Parse structured response
        ↓
Return PRChallenge[]
        ↓
Frontend displays challenge cards
```

---

## 5. API Design

### 5.1 REST API Endpoints

#### POST /api/analyze

**Request:**
```typescript
{
  url: string; // GitHub repo URL
  skipCache?: boolean; // Force re-analysis
}
```

**Response (200):**
```typescript
{
  repoId: string;
  repository: {
    owner: string;
    name: string;
    description: string;
    stars: number;
    language: string;
    url: string;
  };
  files: ScoredFile[];
  dependencyGraph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  entryPoints: EntryPoint[];
  architectureOverview: string;
  analyzedAt: string; // ISO 8601
  cached: boolean;
}
```

**Error Responses:**
- 400: Invalid URL format
- 403: Private repository
- 404: Repository not found
- 413: Repository too large (>500 files)
- 429: Rate limit exceeded
- 500: Internal server error

#### POST /api/chat

**Request:**
```typescript
{
  repoId: string;
  question: string;
  history?: ChatMessage[]; // Optional conversation history
}
```

**Response (200):**
```typescript
{
  message: {
    id: string;
    role: 'assistant';
    content: string;
    timestamp: string;
    fileReferences: Array<{
      path: string;
      lineNumbers: [number, number];
      snippet: string;
      githubUrl: string;
    }>;
    confidenceScore: number; // 0-100
  };
}
```

**Streaming Response:**
```
data: {"type":"token","content":"The"}
data: {"type":"token","content":" authentication"}
data: {"type":"token","content":" is"}
data: {"type":"reference","path":"src/auth.ts"}
data: {"type":"done"}
```

#### POST /api/challenge

**Request:**
```typescript
{
  repoId: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}
```

**Response (200):**
```typescript
{
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number; // minutes
    files: Array<{
      path: string;
      lineNumbers?: [number, number];
      action: 'create' | 'modify' | 'delete';
    }>;
    codingPatterns: string[];
    testRequirements: string[];
    acceptanceCriteria: string[];
    githubFileLinks: string[];
  }>;
}
```

### 5.2 API Rate Limiting

```typescript
// Rate limit configuration
const rateLimits = {
  '/api/analyze': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many analyses. Please try again later.'
  },
  '/api/chat': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many messages. Please slow down.'
  }
};

// Implementation using Vercel Edge Config or Upstash Rate Limit
```

---

## 6. Database Schema

### 6.1 Redis Data Structure

**Analysis Cache:**
```
Key: analysis:{owner}/{repo}
Type: String (JSON)
TTL: 3600 seconds (1 hour)
Value: {
  repository: {...},
  files: [...],
  dependencyGraph: {...},
  entryPoints: [...],
  architectureOverview: "...",
  analyzedAt: "2026-02-15T10:30:00Z"
}
```

**Chat History:**
```
Key: chat:{sessionId}
Type: List
TTL: 3600 seconds (1 hour)
Values: [
  '{"id":"msg1","role":"user","content":"...","timestamp":"..."}',
  '{"id":"msg2","role":"assistant","content":"...","timestamp":"..."}'
]
```

**Rate Limit Counters:**
```
Key: ratelimit:analyze:{ip}
Type: String (counter)
TTL: 3600 seconds
Value: "3" (number of requests)
```

---

## 7. Algorithm Design

### 7.1 Contribution Readiness Scoring Algorithm

```typescript
function calculateReadinessScore(
  file: ParsedFile,
  graph: DependencyGraph,
  testCoverage: Map<string, number>
): 'green' | 'yellow' | 'red' {
  let score = 0;
  
  // Factor 1: Cyclomatic Complexity (30%)
  if (file.complexity < 5) score += 30;
  else if (file.complexity < 10) score += 20;
  else if (file.complexity < 20) score += 10;
  // else 0
  
  // Factor 2: Test Coverage (25%)
  const coverage = testCoverage.get(file.path) || 0;
  if (coverage > 80) score += 25;
  else if (coverage > 60) score += 15;
  else if (coverage > 40) score += 5;
  // else 0
  
  // Factor 3: Number of Dependents (20%)
  const dependents = graph.getDependents(file.path).length;
  if (dependents === 0) score += 20; // Leaf node
  else if (dependents < 3) score += 15;
  else if (dependents < 5) score += 10;
  else if (dependents < 10) score += 5;
  // else 0 (core infrastructure)
  
  // Factor 4: Lines of Code (15%)
  if (file.linesOfCode < 50) score += 15;
  else if (file.linesOfCode < 100) score += 10;
  else if (file.linesOfCode < 200) score += 5;
  // else 0
  
  // Factor 5: File Type (10%)
  if (file.type === 'utility' || file.type === 'component') score += 10;
  else if (file.type === 'config') score += 5;
  // Core files (routing, auth, db) get 0
  
  // Classification
  if (score >= 70) return 'green';      // Beginner-friendly
  if (score >= 40) return 'yellow';     // Intermediate
  return 'red';                          // Critical/Advanced
}
```

**Score Breakdown:**
- **Green (70-100):** Low complexity, well-tested, few dependents, small, utility/component
- **Yellow (40-69):** Moderate complexity, some tests, moderate dependents
- **Red (0-39):** High complexity, poor tests, many dependents, large, core infrastructure

### 7.2 Dependency Graph Builder

```typescript
function buildDependencyGraph(files: ParsedFile[]): DependencyGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // Create nodes
  for (const file of files) {
    nodes.push({
      id: file.path,
      type: classifyFileType(file),
      data: {
        label: file.name,
        path: file.path,
        dependencies: file.imports.map(i => i.module)
      },
      position: { x: 0, y: 0 } // Will be laid out by force-directed algorithm
    });
  }
  
  // Create edges
  for (const file of files) {
    for (const importStmt of file.imports) {
      const targetFile = resolveImport(importStmt.module, file.path, files);
      if (targetFile) {
        edges.push({
          id: `${file.path}-${targetFile.path}`,
          source: file.path,
          target: targetFile.path,
          type: 'import'
        });
      }
    }
  }
  
  // Apply force-directed layout (Dagre or similar)
  const laidOutGraph = applyLayout(nodes, edges);
  
  return {
    nodes: laidOutGraph.nodes,
    edges: laidOutGraph.edges,
    clusters: detectClusters(laidOutGraph) // Group related files
  };
}

function resolveImport(
  importPath: string,
  sourceFile: string,
  allFiles: ParsedFile[]
): ParsedFile | null {
  // Handle relative imports: './utils/helper'
  // Handle aliased imports: '@/components/Button'
  // Handle node_modules (ignore for simplicity)
  
  if (importPath.startsWith('.')) {
    const resolved = path.resolve(path.dirname(sourceFile), importPath);
    return allFiles.find(f => f.path === resolved);
  }
  
  if (importPath.startsWith('@/')) {
    const resolved = importPath.replace('@/', 'src/');
    return allFiles.find(f => f.path.startsWith(resolved));
  }
  
  return null; // External dependency
}
```

### 7.3 Entry Point Detection

```typescript
function findEntryPoints(files: ParsedFile[]): EntryPoint[] {
  const entryPoints: EntryPoint[] = [];
  
  // Strategy 1: Look for common entry file names
  const entryFileNames = [
    'index.js', 'index.ts', 'main.js', 'main.ts',
    'app.js', 'app.ts', 'server.js', 'server.ts',
    '__init__.py', 'main.py'
  ];
  
  for (const file of files) {
    if (entryFileNames.includes(file.name)) {
      entryPoints.push({
        path: file.path,
        type: 'main',
        description: 'Application entry point'
      });
    }
  }
  
  // Strategy 2: Find package.json main/scripts
  const packageJson = files.find(f => f.name === 'package.json');
  if (packageJson) {
    const pkg = JSON.parse(packageJson.content);
    if (pkg.main) {
      entryPoints.push({
        path: pkg.main,
        type: 'package',
        description: 'Package entry point (main field)'
      });
    }
    if (pkg.scripts?.dev) {
      // Parse script to find entry file
    }
  }
  
  // Strategy 3: Files with no imports (leaf nodes that aren't imported)
  const graph = buildSimpleGraph(files);
  for (const file of files) {
    if (file.imports.length === 0 && graph.getDependents(file.path).length === 0) {
      entryPoints.push({
        path: file.path,
        type: 'standalone',
        description: 'Standalone script or utility'
      });
    }
  }
  
  return entryPoints;
}
```

---

## 8. UI/UX Design

### 8.1 Design System

**Colors:**
```css
:root {
  /* Primary */
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
  
  /* Contribution Readiness Colors */
  --green: 142 76% 36%;    /* Beginner-friendly */
  --yellow: 38 92% 50%;    /* Intermediate */
  --red: 0 72% 51%;        /* Critical */
  
  /* Semantic */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --border: 214 32% 91%;
}
```

**Typography:**
```css
--font-sans: 'Inter', sans-serif;
--font-mono: 'Fira Code', monospace;

/* Heading Styles: size / weight */
h1: 2.5rem / 700;
h2: 2rem / 600;
h3: 1.5rem / 600;
body: 1rem / 400;
code: 0.875rem / 400;
```

**Spacing Scale:**
```css
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

### 8.2 Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: '0px',      // < 640px
  tablet: '640px',    // 640px - 1024px
  desktop: '1024px',  // 1024px - 1280px
  wide: '1280px'      // > 1280px
};
```

**Layout Adjustments:**
- Mobile: Stack vertically, bottom tabs
- Tablet: 2-column layout (files + main content)
- Desktop: 3-column layout (files + viz + chat)
- Wide: Same as desktop with more breathing room

### 8.3 Interaction Patterns

**Loading States:**
- Repository analysis: Progress bar with steps
- Chat response: Typing indicator with dots
- File tree: Skeleton loaders
- Dependency graph: Fade in nodes sequentially

**Empty States:**
- No files found: "This directory is empty"
- No chat history: Show example questions
- Analysis failed: Error message + retry button

**Hover States:**
- File tree items: Highlight + show tooltip
- Graph nodes: Highlight + show dependencies
- Chat messages: Show timestamp + actions (copy, regenerate)

### 8.4 Accessibility

**Keyboard Navigation:**
- Tab through all interactive elements
- Arrow keys to navigate file tree
- Enter to select/expand
- Escape to close modals/dialogs

**Screen Reader Support:**
- ARIA labels on all interactive elements
- Live regions for dynamic content (chat messages)
- Skip links to main content
- Alt text for visualizations (describe structure)

**Color Contrast:**
- Text: 4.5:1 minimum (WCAG AA)
- UI elements: 3:1 minimum
- Green/Yellow/Red heatmap: Include icons (not just color)

---

## 9. Security Design

### 9.1 Input Validation

```typescript
// URL validation
function validateGitHubUrl(url: string): boolean {
  const pattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/;
  return pattern.test(url);
}

// Sanitize user input
function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['code', 'pre'],
    ALLOWED_ATTR: []
  });
}
```

### 9.2 Rate Limiting

**Per-IP Limits:**
- Analysis: 10 per hour
- Chat: 30 per minute
- Challenge: 5 per hour

**Implementation:**
```typescript
// Using Vercel Edge Config or Upstash
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for');
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // Process request...
}
```

### 9.3 API Key Management

**Environment Variables:**
```bash
# .env.local (never commit!)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
REDIS_URL=redis://default:xxxxx@redis.upstash.io:6379
```

**Key Rotation:**
- Rotate GitHub token monthly
- Rotate API keys on leak detection
- Use Vercel environment variables (encrypted at rest)

### 9.4 Content Security Policy

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires these
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.anthropic.com https://api.github.com",
              "frame-ancestors 'none'"
            ].join('; ')
          }
        ]
      }
    ];
  }
};
```

---

## 10. Performance Optimization

### 10.1 Caching Strategy

**Levels of Caching:**

1. **CDN Cache (Vercel Edge):**
   - Static assets: 1 year
   - HTML pages: 1 hour
   - API responses: No cache (dynamic)

2. **Redis Cache:**
   - Analyzed repos: 1 hour
   - Chat history: 1 hour
   - Rate limit counters: Per window

3. **Claude Prompt Cache:**
   - Codebase context: 5 minutes
   - Reduces repeat analysis cost by 10x

4. **Browser Cache:**
   - Service worker for offline file tree
   - LocalStorage for UI preferences

### 10.2 Code Splitting

```typescript
// Lazy load heavy components
const DependencyGraph = dynamic(
  () => import('@/components/analysis/DependencyGraph'),
  { 
    loading: () => <GraphSkeleton />,
    ssr: false // Client-side only
  }
);

// Split by route
const DashboardPage = dynamic(() => import('@/app/dashboard/page'));
```

### 10.3 Bundle Optimization

```javascript
// next.config.js
module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Replace React with Preact in production
      Object.assign(config.resolve.alias, {
        'react': 'preact/compat',
        'react-dom': 'preact/compat',
      });
    }
    return config;
  },
  
  // Tree-shaking and minification
  swcMinify: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

### 10.4 API Optimizations

**Batch Requests:**
```typescript
// Instead of 500 individual GitHub API calls
async function fetchMultipleFiles(paths: string[]): Promise<Map<string, string>> {
  // Batch into groups of 10
  const chunks = chunk(paths, 10);
  
  const results = await Promise.all(
    chunks.map(chunk => 
      Promise.all(chunk.map(path => fetchFile(path)))
    )
  );
  
  return new Map(results.flat());
}
```

**Parallel Processing:**
```typescript
// Parse files in parallel (limit concurrency to 10)
const parsePromises = files.map((file, i) => 
  new Promise(resolve => {
    setTimeout(() => {
      resolve(parseFile(file));
    }, (i % 10) * 50); // Stagger by 50ms
  })
);

const parsedFiles = await Promise.all(parsePromises);
```

---

## 11. Error Handling

### 11.1 Error Types

```typescript
enum ErrorCode {
  // Client errors (4xx)
  INVALID_URL = 'INVALID_URL',
  REPO_NOT_FOUND = 'REPO_NOT_FOUND',
  REPO_PRIVATE = 'REPO_PRIVATE',
  REPO_TOO_LARGE = 'REPO_TOO_LARGE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  GITHUB_API_ERROR = 'GITHUB_API_ERROR',
  CLAUDE_API_ERROR = 'CLAUDE_API_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
  }
}
```

### 11.2 Error Responses

```typescript
// API error response format
interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// Example
{
  "error": {
    "code": "REPO_TOO_LARGE",
    "message": "Repository has 1,234 files. Maximum is 500.",
    "details": {
      "fileCount": 1234,
      "maxFiles": 500
    },
    "timestamp": "2026-02-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### 11.3 Frontend Error Handling

```typescript
// Error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('Caught error:', error, errorInfo);
    
    // Show fallback UI
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// API error handling
async function analyzeRepository(url: string) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new AppError(
        error.error.code,
        error.error.message,
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof AppError) {
      // Show user-friendly error message
      showToast(error.message, 'error');
    } else {
      // Network or unknown error
      showToast('Something went wrong. Please try again.', 'error');
    }
    throw error;
  }
}
```

---

## 12. Deployment Strategy

### 12.1 Environment Setup

**Development:**
```bash
# Local environment
npm run dev

# Environment variables
GITHUB_TOKEN=...
ANTHROPIC_API_KEY=...
REDIS_URL=localhost:6379
NODE_ENV=development
```

**Staging:**
```bash
# Vercel preview deployment
git push origin feature-branch

# Automatic preview URL
# https://contributor-compass-{hash}.vercel.app

# Environment variables (via Vercel dashboard)
```

**Production:**
```bash
# Deploy to production
git push origin main

# Live URL
# https://contributor-compass.vercel.app

# Custom domain
# https://contributorcompass.com
```

### 12.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 12.3 Monitoring

**Metrics to Track:**
- Request count per endpoint
- Response times (p50, p95, p99)
- Error rates
- Cache hit rates
- API costs (GitHub, Claude)
- Active users

**Tools:**
- Vercel Analytics (built-in)
- Sentry (error tracking)
- PostHog (product analytics)

**Alerts:**
- Error rate > 5% → Slack notification
- API cost > $50/day → Email alert
- Response time > 5s → PagerDuty

---

## Appendix A: Design Mockups

### Landing Page Wireframe

```
┌────────────────────────────────────────────────────┐
│  [Logo]  Contributor Compass        [GitHub] [Docs]│
├────────────────────────────────────────────────────┤
│                                                     │
│              Zero to Contributor                    │
│           in Under 5 Minutes                        │
│                                                     │
│  Paste any GitHub URL and get an AI-powered        │
│  guided tour of the codebase                        │
│                                                     │
│  ┌─────────────────────────────────────┐          │
│  │  https://github.com/owner/repo  [→] │          │
│  └─────────────────────────────────────┘          │
│                                                     │
│  Try: [React Router] [Vite] [FastAPI]             │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  ✓ Architecture Visualization                      │
│  ✓ Smart Contribution Guidance                     │
│  ✓ Chat with Codebase                              │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

**Document Status:** Draft v1.0  
**Next Review:** Post-Implementation  
**Owner:** Shashank Sharma (Team Lead)
