# MemeBot

An intelligent Telegram bot for managing autonomous social media posting with AI-powered content generation, context management, and safety controls.

## Overview

MemeBot enables project-based social media management through Telegram, allowing admins to:
- Manage versioned context layers for AI persona consistency
- Generate and approve post suggestions with AI
- Control autonomous posting to X (Twitter)
- Track ephemeral vibes and maintain brand voice
- Maintain comprehensive audit trails

## Project Status

🚧 **Phase 1: Discovery & Planning** - In Progress

See [EXECUTION_PLAN.md](docs/EXECUTION_PLAN.md) for the complete development roadmap.

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd memebot

# Install dependencies (coming in Phase 2)
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server (coming in Phase 3)
npm run dev
```

## Documentation

- [Execution Plan](docs/EXECUTION_PLAN.md) - Complete development roadmap
- [Technical Specification](docs/phase1/TECHNICAL_SPECIFICATION.md) - API specs and database schema
- [Risk Assessment](docs/phase1/RISK_ASSESSMENT.md) - Security and compliance analysis
- [System Architecture](docs/phase1/SYSTEM_ARCHITECTURE.md) - Architecture diagrams and design decisions
- [Tech Stack](docs/TECH_STACK.md) - Technology choices and rationale
- [Contributing](CONTRIBUTING.md) - Development guidelines and git workflow

## Tech Stack

- **Backend:** Node.js + TypeScript
- **Database:** PostgreSQL
- **Cache:** Redis
- **Queue:** Bull (Redis-based)
- **APIs:** Telegram Bot API, X API, OpenAI API

See [TECH_STACK.md](docs/TECH_STACK.md) for detailed information.

## License

[To be determined]

