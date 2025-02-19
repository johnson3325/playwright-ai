import { Page } from "playwright";
import { ChatOpenAI } from "@langchain/openai";
import { Ollama } from "@langchain/community/llms/ollama";
import dotenv from "dotenv";
import { ChatOllama } from "@langchain/ollama";

dotenv.config();

// Read AI provider from environment variables, default to Ollama
const aiProvider = process.env.AI_PROVIDER || "ollama"; // Default: Local AI (Ollama)
let aiModel: ChatOpenAI | ChatOllama;

if (aiProvider === "openai") {
    console.log("🔹 Using OpenAI (GPT-4-Turbo)");
    aiModel = new ChatOpenAI({
        modelName: "gpt-4-turbo",
        openAIApiKey: process.env.OPENAI_API_KEY,
    });
} else if (aiProvider === "mistral") {
    console.log("🔹 Using Mistral AI (Cloud API)");
    aiModel = new ChatOpenAI({
        modelName: "mistral-tiny",
        openAIApiKey: process.env.MISTRAL_API_KEY,
    });
} else if (aiProvider === "ollama") {
    console.log("🔹 Using Ollama (Local AI)");
    aiModel = new ChatOllama({
        model: process.env.OLLAMA_MODEL || "mistral",
    });
} else {
    throw new Error("❌ Invalid AI_PROVIDER. Use 'openai', 'mistral', or 'ollama'.");
}

/**
 * AI-powered self-healing locator.
 * If a selector is broken, the AI suggests an alternative.
 */
export async function selfHealingLocator(page: Page, selector: string) {
    try {
        const element = await page.$(selector);
        if (element) return element;

        console.warn(`⚠️ Selector not found: ${selector}. Attempting AI healing...`);
        
        // Get all similar elements
        const elements = await page.$$("*");
        const elementData = await Promise.all(
            elements.map(async (el) => ({
                tag: await el.evaluate((node) => node.tagName),
                text: await el.evaluate((node) => node.textContent?.trim() || ""),
                class: await el.evaluate((node) => node.className),
            }))
        );

        // Construct AI prompt
        const prompt = `
        The selector "${selector}" is broken. Based on the following elements on the page:
        ${JSON.stringify(elementData, null, 2)}
        Suggest the best alternative CSS selector.
        `;

        // AI suggests a new selector using LangChain's invoke() method
        const response = await aiModel.invoke([
            { role: "system", content: "You are an AI that suggests the best alternative selectors for broken locators in web automation tests." },
            { role: "user", content: prompt }
        ]);

        const newSelector = typeof response.content === 'string' ? response.content.trim() : null;
        console.log(`✅ AI Suggested Selector: ${newSelector}`);

        return newSelector ? await page.$(newSelector) : null;
    } catch (error) {
        console.error("❌ Self-healing failed:", error);
        return null;
    }
}

// ✅ Properly exporting the function
export default selfHealingLocator;
