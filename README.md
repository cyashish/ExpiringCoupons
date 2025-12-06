# Generative AI Project Template

A structured template for building robust generative AI applications, with modular organization and best practices built-in.




## 🌟 Features

- Modular project structure for scalability
- Pre-configured support for multiple LLM providers (Claude, GPT)
- Built-in prompt engineering utilities
- Rate limiting and token management
- Robust error handling
- Caching mechanism for API responses
- Example implementations and notebooks

## 📁 Project Structure

```
generative_ai_project/
├── config/                  # Configuration directory
│   ├── __init__.py
│   ├── model_config.yaml    # Model-specific configurations
│   ├── prompt_templates.yaml # Prompt templates
│   └── logging_config.yaml  # Logging settings
│
├── src/                     # Source code
│   ├── llm/                # LLM clients
│   │   ├── base.py         # Base LLM client
│   │   ├── claude_client.py # Anthropic Claude client
│   │   ├── gpt_client.py   # OpenAI GPT client
│   │   └── utils.py        # Shared utilities
│   │
│   ├── prompt_engineering/ # Prompt engineering tools
│   │   ├── templates.py    # Template management
│   │   ├── few_shot.py    # Few-shot prompt utilities
│   │   └── chain.py       # Prompt chaining logic
│   │
│   ├── utils/             # Utility functions
│   │   ├── rate_limiter.py # API rate limiting
│   │   ├── token_counter.py # Token counting
│   │   ├── cache.py       # Response caching
│   │   └── logger.py      # Logging utilities
│   │
│   └── handlers/          # Error handling
│       └── error_handler.py
│
├── data/                   # Data directory
│   ├── cache/             # Cache storage
│   ├── prompts/           # Prompt storage
│   ├── outputs/           # Output storage
│   └── embeddings/        # Embedding storage
│
├── examples/              # Example implementations
│   ├── basic_completion.py
│   ├── chat_session.py
│   └── chain_prompts.py
│
└── notebooks/            # Jupyter notebooks
    ├── prompt_testing.ipynb
    ├── response_analysis.ipynb
    └── model_experimentation.ipynb
```

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/generative_ai_project.git
cd generative_ai_project
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure your environment:
   - Copy `config/model_config.yaml.example` to `config/model_config.yaml`
   - Add your API keys and configurations

4. Review the examples in `examples/` directory

5. Start with the notebooks in `notebooks/` for experimentation

## 📘 Documentation

### Configuration

- `model_config.yaml`: Configure API keys and model parameters
- `prompt_templates.yaml`: Define reusable prompt templates
- `logging_config.yaml`: Configure logging behavior

### Key Components

1. **LLM Clients** (`src/llm/`)
   - Base client with common functionality
   - Specific implementations for different providers
   - Utility functions for token counting and rate limiting

2. **Prompt Engineering** (`src/prompt_engineering/`)
   - Template management system
   - Few-shot prompt utilities
   - Prompt chaining capabilities

3. **Utilities** (`src/utils/`)
   - Rate limiting for API calls
   - Token counting
   - Response caching
   - Logging

## 🛠️ Development

### Best Practices

1. Keep configuration in YAML files
2. Implement proper error handling
3. Use rate limiting for APIs
4. Maintain separation between model clients
5. Cache results when appropriate
6. Document your code
7. Use notebooks for experimentation
