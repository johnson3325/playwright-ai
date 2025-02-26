import { Page } from "playwright";
import { ChatOpenAI } from "@langchain/openai";
import { Ollama } from "@langchain/community/llms/ollama";
import dotenv from "dotenv";
import { ChatOllama } from "@langchain/ollama";
import { ChatMistralAI } from "@langchain/mistralai";

dotenv.config();

// Read AI provider from environment variables, default to Ollama
const aiProvider = process.env.AI_PROVIDER || "ollama"; // Default: Local AI (Ollama)
let aiModel: ChatOpenAI | ChatMistralAI | ChatOllama;

if (aiProvider === "openai") {
    console.log("🔹 Using OpenAI (gpt-4o-mini)");
    aiModel = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        openAIApiKey: process.env.OPENAI_API_KEY,
    });
} else if (aiProvider === "mistral") {
    console.log("🔹 Using Mistral AI (Cloud API)");
    aiModel = new ChatMistralAI({
        modelName: "mistral-small",
        apiKey: process.env.MISTRAL_API_KEY,
    });
} else if (aiProvider === "ollama") {
    console.log("🔹 Using Ollama (Local AI)");
    aiModel = new ChatOllama({
        model: process.env.OLLAMA_MODEL || "mistral",
        temperature: 0.3,   // ✅ Less randomness for faster responses
        numCtx: 512,  // Limit context to 512 tokens (default is often 2048+)
    });
} else {
    throw new Error("❌ Invalid AI_PROVIDER. Use 'openai', 'mistral', or 'ollama'.");
}
/**
 * Extracts only the CSS selector from an AI response.
 */
function extractCssSelector(aiResponse: string): string {
    // Match CSS selectors inside triple backticks or inline backticks
    const match = aiResponse.match(/```css\s*([\s\S]+?)\s*```|`([^`]+)`/);
    
    if (match) {
        return match[1] || match[2] || ''; // Extract selector
    }
    
    throw new Error("❌ No valid CSS selector found in AI response.");
}
/**
 * AI-powered self-healing locator.
 * If a selector is broken, the AI suggests an alternative.
 */
export async function selfHealingLocator(page: Page, selector: string) {
    try {
        const element = await page.$(selector);
        if (element) {
            console.log("✅ Found element without healing.");
            return element;
        }
        console.warn(`⚠️ Selector not found: ${selector}. Attempting AI healing...`);

        // Get all similar elements
        // const elements = await page.$$("*");
        const elements = await page.$$("a, button, div, span"); // ✅ Only relevant elements
        const elementData = await Promise.all(
            elements.slice(0, 10).map(async (el) => ({  // ✅ Limit to 10 elements max
                tag: await el.evaluate((node) => node.tagName),
                text: await el.evaluate((node) => node.textContent?.trim() || ""),
                // class: await el.evaluate((node) => node.className.split(" ").slice(0, 2).join(" ")), // ✅ Limit to 2 class names
            }))
        );

        // Construct AI prompt
        const prompt = `The selector "${selector}" is broken. Based on the following elements:
        ${JSON.stringify(elementData.slice(0, 5), null, 2)}  // Send only 5 elements for faster processing
        Return ONLY the best alternative selector. No explanations.`;

        // AI suggests a new selector using LangChain's invoke() method
        const response = await aiModel.invoke([
            { role: "system", content: "You are an AI that suggests alternative web selectors. Keep your responses short and return only the best selector." },
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
