"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selfHealingLocator = selfHealingLocator;
const openai_1 = require("@langchain/openai");
const dotenv_1 = __importDefault(require("dotenv"));
const ollama_1 = require("@langchain/ollama");
const mistralai_1 = require("@langchain/mistralai");
dotenv_1.default.config();
// Read AI provider from environment variables, default to Ollama
const aiProvider = process.env.AI_PROVIDER || "ollama"; // Default: Local AI (Ollama)
let aiModel;
if (aiProvider === "openai") {
    console.log("🔹 Using OpenAI (gpt-4o-mini)");
    aiModel = new openai_1.ChatOpenAI({
        modelName: "gpt-4o-mini",
        openAIApiKey: process.env.OPENAI_API_KEY,
    });
}
else if (aiProvider === "mistral") {
    console.log("🔹 Using Mistral AI (Cloud API)");
    aiModel = new mistralai_1.ChatMistralAI({
        modelName: "mistral-small",
        apiKey: process.env.MISTRAL_API_KEY,
    });
}
else if (aiProvider === "ollama") {
    console.log("🔹 Using Ollama (Local AI)");
    aiModel = new ollama_1.ChatOllama({
        model: process.env.OLLAMA_MODEL || "mistral",
        temperature: 0.3, // ✅ Less randomness for faster responses
        numCtx: 512, // Limit context to 512 tokens (default is often 2048+)
    });
}
else {
    throw new Error("❌ Invalid AI_PROVIDER. Use 'openai', 'mistral', or 'ollama'.");
}
/**
 * Extracts only the CSS selector from an AI response.
 */
function extractCssSelector(aiResponse) {
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
function selfHealingLocator(page, selector) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const element = yield page.$(selector);
            if (element) {
                console.log("✅ Found element without healing.");
                return element;
            }
            console.warn(`⚠️ Selector not found: ${selector}. Attempting AI healing...`);
            // Get all similar elements
            // const elements = await page.$$("*");
            const elements = yield page.$$("a, button, div, span"); // ✅ Only relevant elements
            const elementData = yield Promise.all(elements.slice(0, 10).map((el) => __awaiter(this, void 0, void 0, function* () {
                return ({
                    tag: yield el.evaluate((node) => node.tagName),
                    text: yield el.evaluate((node) => { var _a; return ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; }),
                    // class: await el.evaluate((node) => node.className.split(" ").slice(0, 2).join(" ")), // ✅ Limit to 2 class names
                });
            })));
            // Construct AI prompt
            const prompt = `The selector "${selector}" is broken. Based on the following elements:
        ${JSON.stringify(elementData.slice(0, 5), null, 2)}  // Send only 5 elements for faster processing
        Return ONLY the best alternative selector. No explanations.`;
            // AI suggests a new selector using LangChain's invoke() method
            const response = yield aiModel.invoke([
                { role: "system", content: "You are an AI that suggests alternative web selectors. Keep your responses short and return only the best selector." },
                { role: "user", content: prompt }
            ]);
            const newSelector = typeof response.content === 'string' ? response.content.trim() : null;
            console.log(`✅ AI Suggested Selector: ${newSelector}`);
            return newSelector ? yield page.$(newSelector) : null;
        }
        catch (error) {
            console.error("❌ Self-healing failed:", error);
            return null;
        }
    });
}
// ✅ Properly exporting the function
exports.default = selfHealingLocator;
