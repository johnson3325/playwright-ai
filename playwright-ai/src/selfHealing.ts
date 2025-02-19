import { Page } from "playwright";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new ChatOpenAI({
  modelName: "gpt-4-turbo",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

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
        const response = await openai.invoke([
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
