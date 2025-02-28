# LLM Benchmarking Platform

A comprehensive platform for testing, benchmarking, and comparing Large Language Models (LLMs) across various metrics and generating detailed reports and rankings.

## Project Structure

```
LLM-Benchmarking/
├── frontend/                # Next.js frontend application
├── backend/                 # Node.js backend API
├── infrastructure/          # Docker and Kubernetes configurations
│   ├── docker/
│   └── k8s/
├── scripts/                 # Utility scripts
├── shared/                  # Shared code between frontend and backend
└── docs/                    # Project documentation
```

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Infrastructure**: Docker, Kubernetes
- **LLM Integrations**: OpenAI, Anthropic, and more

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose (for local development)
- Kubernetes (for production deployment)
- Supabase account

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/llm-benchmarking.git
   cd llm-benchmarking
   ```

2. Set up environment variables:
   ```
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```
   Edit the `.env` files with your configuration.

3. Install dependencies:
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```

4. Start the development servers:
   ```
   # In one terminal
   cd frontend && npm run dev
   
   # In another terminal
   cd backend && npm run dev
   ```

### Using Docker

To run the entire stack with Docker Compose:

```
docker-compose up
```

## Features

- LLM model registration and management
- Comprehensive test suite creation
- Benchmark execution engine
- Result storage and analysis
- Report generation
- Model ranking and comparison
- Interactive visualizations

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
