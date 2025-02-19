# Playwright-AI

## 🚀 Overview
Playwright-AI is an AI-powered extension for Playwright that enhances test automation by integrating Generative AI features. It improves efficiency, reduces maintenance, and makes test execution more intelligent with self-healing locators, AI-driven test generation, and error analysis.

## ✨ Features
- **Self-Healing Locators**: Detects broken selectors and dynamically suggests replacements using AI.
- **AI-Powered Test Generation**: Auto-generates test cases based on requirements.
- **Smart Test Selection**: Uses AI to prioritize important test cases.
- **AI-Powered Error Analysis**: Identifies patterns in failures and suggests fixes.
- **Enhanced Reporting**: Provides detailed insights with AI-driven analytics.
- **Multi-Model AI Support**: Choose between OpenAI (GPT-4-Turbo), Mistral AI, or local Ollama models.

## 🛠 Installation
To install the package, use npm:
```sh
npm install playwright-ai
```
Or with yarn:
```sh
yarn add playwright-ai
```

## 🏗️ Setup
1. **Install Dependencies:** Ensure you have Playwright installed.
   ```sh
   npm install playwright @langchain/openai dotenv
   ```
2. If using Ollama for local AI inference, install Ollama:
   ```sh 
    curl -fsSL https://ollama.ai/install.sh | sh
   ```

***Setting Up AI Model***
Choose your AI provider by setting the `AI_PROVIDER` environment variable:

- `openai` for OpenAI GPT models (requires `OPENAI_API_KEY`)
- `mistral` for Mistral AI models (requires `MISTRAL_API_KEY`)
- `ollama` for local AI models (default, requires `OLLAMA_MODEL` installed via Ollama)

Example `.env`:
```typescript
AI_PROVIDER=ollama
OLLAMA_MODEL=mistral
```

## 🎯 Usage
### **Self-Healing Locators**
Replace static locators with AI-powered self-healing locators:
```typescript
import { test } from "@playwright/test";
import selfHealingLocator from "playwright-ai";

test("Self-Healing Test", async ({ page }) => {
    await page.goto("https://example.com");
    const button = await selfHealingLocator(page, "button#old-id");
    await button?.click();
});
```

### **AI-Powered Test Generation** *(Coming Soon)*

## 📝 Configuration
Modify `playwright.config.ts` to integrate AI-powered features:
```typescript
import { defineConfig } from "@playwright/test";
export default defineConfig({
    use: {
        baseURL: "https://example.com",
    },
});
```

## 🛠 Roadmap
- [x] Self-Healing Locators
- [x] Multi-Model AI Support
- 🔜 AI-Powered Test Generation
- 🔜 AI-Based Smart Test Selection
- 🔜 AI-Powered Error Analysis
- 🔜 Enhanced Reporting

## 🤝 Contributing
We welcome contributions! Feel free to fork the repository and submit a pull request.

## 📜 License
MIT License

## 📞 Support
For questions, open an issue or contact [johnson3325@gmail.com].

