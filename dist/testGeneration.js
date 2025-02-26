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
exports.generateAndSaveTest = generateAndSaveTest;
const openai_1 = require("@langchain/openai");
const ollama_1 = require("@langchain/ollama");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const aiProvider = process.env.AI_PROVIDER || "ollama"; // Default to Ollama
const aiModel = process.env.OLLAMA_MODEL || "llama3"; // Default to Llama3 for Ollama
const openai = new openai_1.ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
});
const ollama = new ollama_1.ChatOllama({
    model: aiModel,
});
const aiClient = aiProvider === "openai" ? openai : ollama;
/**
 * Generates a Playwright test case based on a requirement and saves it inside the Playwright test suite.
 * @param requirement - The feature description or user story.
 * @returns Path to the generated test file.
 */
function generateAndSaveTest(requirement) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prompt = `
        Generate a Playwright test case in TypeScript based on the following requirement:
        "${requirement}"
        Ensure the test follows best practices and uses Playwright’s built-in assertions.
        `;
            const response = yield aiClient.invoke([
                { role: "system", content: "You are an AI that generates Playwright automation test cases based on user requirements." },
                { role: "user", content: prompt }
            ]);
            const testCode = typeof response.content === "string" ? response.content.trim() : "No valid test case generated.";
            // Save to Playwright test folder
            const fileName = `generatedTest_${Date.now()}.spec.ts`;
            const filePath = path_1.default.join(__dirname, "../tests", fileName);
            // Ensure the directory exists
            if (!fs_1.default.existsSync(path_1.default.dirname(filePath))) {
                fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
            }
            fs_1.default.writeFileSync(filePath, testCode);
            console.log(`✅ AI-generated test saved: ${filePath}`);
            console.log("⚠️ Please review the generated test before running it!");
            return filePath;
        }
        catch (error) {
            console.error("❌ Error generating test:", error);
            return "Error in generating test case.";
        }
    });
}
exports.default = generateAndSaveTest;
