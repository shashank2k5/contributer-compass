# Contributor Compass - Requirements Document

**Team:** Twice the Caffeine  
**Team Leader:** Shashank Sharma  
**Problem Statement:** AI for Learning & Developer Productivity  
**Last Updated:** February 15, 2026

---

## 1. Executive Summary

Contributor Compass is an AI-powered platform that transforms how developers understand and contribute to open-source projects by providing intelligent codebase analysis, interactive visualizations, and personalized contribution guidance.

**Key Metrics:**
- Reduce time-to-first-PR from 4-6 hours to under 1 hour (73% reduction)
- Increase OSS contribution rate among new developers by 3x
- Enable enterprises to onboard developers 60% faster
- Target 10,000 repo analyses in first 6 months

---

## 2. Functional Requirements

### 2.1 Core Features

#### 2.1.1 Smart Repository Analysis
**Priority:** P0 (Must Have)

**Description:** Analyze GitHub repositories and generate comprehensive architectural insights.

**User Stories:**
- As a developer, I want to paste a GitHub URL and receive an architectural overview so I can understand the project structure quickly
- As a contributor, I want to see entry points and key modules highlighted so I know where to start exploring

**Acceptance Criteria:**
- System accepts any public GitHub repository URL
- Analysis completes within 60 seconds for repos < 500 files
- Generates folder structure visualization with descriptions
- Identifies and highlights entry points (main.js, index.py, etc.)
- Creates dependency flow diagram showing how modules connect
- Supports JavaScript, TypeScript, and Python codebases

**Technical Requirements:**
- GitHub API integration for repository fetching
- Tree-sitter for AST (Abstract Syntax Tree) parsing
- File filtering: exclude node_modules, .git, build artifacts
- Size limit: 500 files, 100MB total

---

#### 2.1.2 Contribution Readiness Heatmap
**Priority:** P0 (Must Have)

**Description:** Color-code files by how safe they are for beginners to edit.

**User Stories:**
- As a new contributor, I want to see which files are safe to edit so I don't accidentally break critical infrastructure
- As a maintainer, I want newcomers directed to appropriate contribution areas

**Acceptance Criteria:**
- Every file receives a readiness score: Green (beginner-friendly), Yellow (intermediate), Red (critical)
- Scoring considers: test coverage, complexity, number of dependencies, change frequency
- Visual heatmap overlays the file browser
- Tooltips explain why each file received its score
- Filters to show only green/yellow zones

**Scoring Algorithm:**
```
Beginner-Friendly (Green) if:
- Well-tested (>80% coverage)
- Low cyclomatic complexity (<10)
- Few dependencies (<5)
- Isolated component/utility
- Has clear inline documentation

Critical (Red) if:
- Core infrastructure (auth, routing, database)
- Many dependents (>10 files import it)
- High complexity (>20)
- Low/no test coverage
- Recent frequent changes

Intermediate (Yellow): Everything else
```

---

#### 2.1.3 Conversational Code Expert
**Priority:** P0 (Must Have)

**Description:** Chat interface that answers questions about the entire codebase.

**User Stories:**
- As a developer, I want to ask "Where is authentication handled?" and get specific file locations and code snippets
- As a contributor, I want to understand how to add a new feature by asking the AI

**Acceptance Criteria:**
- Chat interface with message history
- AI has context of entire codebase (up to 500 files)
- Responses include:
  - Specific file paths
  - Relevant code snippets
  - Line number references
  - Confidence scores
- Handles questions like:
  - "Where is X feature implemented?"
  - "How do I add Y functionality?"
  - "What does this module do?"
  - "Show me the test setup"
- Links directly to GitHub file locations
- "I'm not sure" responses when confidence is low (<70%)

**Technical Requirements:**
- Claude 3.7 Sonnet API integration
- Full codebase sent as context (200K token window)
- Prompt caching to reduce costs
- Response time < 3 seconds

---

#### 2.1.4 First PR Challenge Generator
**Priority:** P1 (Should Have)

**Description:** Generate personalized starter tasks for new contributors.

**User Stories:**
- As a new contributor, I want a specific task suggestion so I know exactly what to work on
- As a developer, I want tasks matched to my skill level

**Acceptance Criteria:**
- Analyzes codebase and user's stated skill level
- Generates 3 task options: easy, medium, hard
- Each task includes:
  - Clear description (1-2 sentences)
  - Files to modify (with line numbers)
  - Code patterns to follow
  - Test requirements
  - Estimated time (15min, 30min, 1hr)
  - Acceptance criteria (what "done" looks like)
- Tasks are in beginner-friendly (green) zones
- Real, actionable improvements (not make-work)

**Example Tasks:**
- "Add input validation to the login form (30 min)"
- "Write missing unit tests for utils/dateFormatter.js (45 min)"
- "Add TypeScript types to legacy config parser (1 hr)"

---

### 2.2 Supporting Features

#### 2.2.1 Interactive Architecture Map
**Priority:** P1 (Should Have)

**Features:**
- Visual folder tree with expand/collapse
- Icons for file types (component, utility, test, config)
- Search and filter functionality
- Click to view file details
- Zoom and pan for large projects

#### 2.2.2 Dependency Graph Visualization
**Priority:** P1 (Should Have)

**Features:**
- Interactive node graph showing module connections
- Hover to see import/export details
- Filter by file type or directory
- Identify circular dependencies
- Export as PNG

#### 2.2.3 Example Question Prompts
**Priority:** P2 (Nice to Have)

**Features:**
- Pre-populate common questions:
  - "How do I run this locally?"
  - "Where is the API defined?"
  - "What's the testing strategy?"
- Learn from user questions to suggest better prompts

---

## 3. Non-Functional Requirements

### 3.1 Performance
- Page load time: < 2 seconds
- Repository analysis: < 60 seconds for 500 files
- Chat response time: < 3 seconds
- Support 100 concurrent users (MVP)

### 3.2 Scalability
- Handle repos up to 500 files (MVP)
- Cache analyzed repos for 1 hour
- Graceful degradation for larger repos (show size warning)

### 3.3 Reliability
- 99% uptime target
- Graceful error handling (no crashes)
- Fallback behavior when API limits hit

### 3.4 Security
- No authentication required for public repos (MVP)
- Rate limiting: 10 analyses per IP per hour
- No storage of GitHub tokens or credentials
- Sanitize all user inputs

### 3.5 Usability
- Mobile-responsive design
- Accessible (WCAG 2.1 Level AA)
- Works on Chrome, Firefox, Safari, Edge (latest 2 versions)
- Intuitive UI requiring no tutorial

### 3.6 Cost
- Target: < $0.50 per repository analysis
- Prompt caching reduces Claude API costs by 10x
- Redis caching prevents duplicate analyses

---

## 4. Technical Requirements

### 4.1 Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- React Flow (for visualizations)
- Shadcn UI (component library)
- Tailwind CSS (styling)

**Backend:**
- Next.js API Routes (serverless functions)
- GitHub REST API
- Tree-sitter (AST parsing)

**AI Layer:**
- Claude 3.7 Sonnet (200K context window)
- Anthropic SDK
- Prompt caching

**Caching/Storage:**
- Vercel KV (Redis)
- Cache TTL: 1 hour

**Deployment:**
- Vercel (frontend + serverless functions)
- CDN for static assets

### 4.2 API Integration Requirements

#### GitHub API
- Endpoints needed:
  - GET /repos/{owner}/{repo}
  - GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1
  - GET /repos/{owner}/{repo}/contents/{path}
- Rate limit: 5,000 requests/hour (authenticated)
- Fallback: Show error message when limit exceeded

#### Claude API
- Model: claude-sonnet-4-20250514
- Max tokens: 4096 (responses)
- Context window: 200K tokens
- Prompt caching enabled
- Estimated cost: $0.30-$0.50 per analysis

### 4.3 Data Flow

```
1. User Input
   ↓
2. GitHub API → Fetch repository
   ↓
3. Tree-sitter → Parse code structure
   ↓
4. Check Redis cache → If cached, return stored result
   ↓
5. Claude API → Analyze codebase (full context)
   ↓
6. Generate outputs → Architecture, heatmap, insights
   ↓
7. Store in Redis → Cache for 1 hour
   ↓
8. Return to Frontend → Display interactive dashboard
```

---

## 5. User Interface Requirements

### 5.1 Landing Page
- Hero section with value proposition
- URL input field (prominent)
- "Analyze Repository" CTA button
- Example repositories to try
- Feature highlights (3 cards)

### 5.2 Dashboard (Post-Analysis)
Layout (3 columns):

**Left Column (30%):**
- File browser with heatmap colors
- Search and filter
- File type icons

**Center Column (50%):**
- Architecture visualization (tabs):
  - Folder tree view
  - Dependency graph
  - Entry points list
- Toggle between views

**Right Column (20%):**
- Chat interface
- Example questions
- PR Challenge card (collapsible)

### 5.3 Mobile Layout
- Stack vertically
- Bottom navigation tabs:
  - Files
  - Architecture
  - Chat
  - Challenge

---

## 6. User Flows

### 6.1 Primary Flow: Analyze Repository

1. User lands on homepage
2. User pastes GitHub URL (e.g., `https://github.com/facebook/react`)
3. System validates URL format
4. "Analyzing..." loading state (progress bar)
5. System fetches repo, parses structure, analyzes with AI
6. Dashboard loads with results
7. User explores architecture, asks questions, receives PR challenge

**Error Cases:**
- Invalid URL → Show inline error message
- Private repo → "This repo is private. Please use a public repo."
- Too large (>500 files) → "This repo is too large. Try a smaller project."
- GitHub API limit → "Too many requests. Please try again in 1 hour."

### 6.2 Secondary Flow: Ask Question

1. User types question in chat: "Where is authentication handled?"
2. System sends question + full codebase context to Claude
3. AI responds with file paths and code snippets
4. User clicks file path → Opens GitHub in new tab
5. User continues asking follow-up questions

### 6.3 Tertiary Flow: Accept PR Challenge

1. User views generated PR challenge
2. Reads task description and files to modify
3. Clicks "View Files on GitHub"
4. Opens multiple GitHub file links in tabs
5. User completes task locally
6. (Future: Submit PR directly from platform)

---

## 7. Success Criteria (MVP)

**Must Complete for Hackathon:**
- ✅ Accept GitHub URL and analyze < 500 file repos
- ✅ Generate architecture visualization (folder tree + dependency graph)
- ✅ Display contribution readiness heatmap
- ✅ Conversational chat with codebase context
- ✅ Generate at least 1 PR challenge
- ✅ Mobile-responsive UI
- ✅ Deploy to production (Vercel)

**Demo Requirements:**
- Pre-analyze 3-5 popular repos (React, Vue, Express, FastAPI, etc.)
- Instant load for demo repos (cached results)
- Video recording backup
- Works reliably for live demo

---

## 8. Future Enhancements (Post-Hackathon)

### Phase 2 (Month 2-3)
- Support larger repos (1000+ files) with RAG/vector DB
- User accounts and saved analyses
- Private repository support (OAuth)
- Multiple language support (Java, Go, Ruby, etc.)
- Browser extension (analyze from GitHub page)

### Phase 3 (Month 4-6)
- Team collaboration features
- PR submission directly from platform
- Contributor leaderboard
- AI-powered code review
- Integration with Linear, Jira for task tracking

### Phase 4 (Month 7-12)
- Enterprise features (SSO, private deployments)
- Analytics dashboard for maintainers
- Automated "good first issue" labeling
- Mentorship matching (pair experienced devs with newcomers)
- VS Code extension

---

## 9. Constraints and Assumptions

### Constraints
- Claude API rate limits (may hit 100 req/min limit)
- GitHub API rate limits (5,000/hour authenticated)
- Budget: $100 for MVP (API costs)
- Timeline: 24 hours (hackathon)
- Team size: 2 developers

### Assumptions
- Users have basic Git/GitHub knowledge
- Target repos are well-structured (not legacy spaghetti code)
- Users want to contribute but lack domain knowledge
- 80% of target repos are < 500 files
- Users will accept that larger repos aren't supported yet

---

## 10. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Claude API costs exceed budget | High | Medium | Aggressive caching, rate limiting, pre-compute popular repos |
| Large repos crash the system | High | Medium | Hard file limit (500), show clear error message |
| AI provides wrong file locations | Medium | Low | Show confidence scores, link to actual files for verification |
| GitHub API rate limit during demo | High | Medium | Pre-cache demo repos, use authenticated requests |
| Tree-sitter parsing fails | Medium | Low | Fallback to simple regex parsing, show partial results |

---

## 11. Testing Requirements

### 11.1 Unit Tests
- GitHub API client
- Tree-sitter parsing logic
- Contribution readiness scoring algorithm
- Redis cache operations

### 11.2 Integration Tests
- Full repository analysis flow
- Claude API integration
- Cache hit/miss scenarios

### 11.3 E2E Tests
- URL submission → Dashboard display
- Chat interaction
- PR challenge generation

### 11.4 Manual Testing
- Test with 10 diverse repositories:
  - Small (< 50 files)
  - Medium (100-300 files)
  - Large (400-500 files)
  - Different languages
  - Different structures (monorepo, microservices, etc.)

---

## 12. Documentation Requirements

- README.md (setup instructions)
- API documentation (if exposing public API)
- Contributing guide (dogfooding our own tool!)
- Deployment guide
- Architecture diagrams

---

## Appendix A: Sample Repositories for Testing

1. **React Router** (~300 files, JavaScript/TypeScript)
2. **FastAPI** (~200 files, Python)
3. **Vite** (~250 files, JavaScript/TypeScript)
4. **Zustand** (~50 files, TypeScript)
5. **Express.js** (~150 files, JavaScript)

---

**Document Status:** Draft v1.0  
**Next Review:** Post-Hackathon  
**Owner:** Shashank Sharma (Team Lead)
