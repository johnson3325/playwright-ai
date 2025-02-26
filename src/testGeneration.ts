import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const aiProvider = process.env.AI_PROVIDER || "ollama"; // Default to Ollama
const aiModel = process.env.OLLAMA_MODEL || "llama3"; // Default to Llama3 for Ollama

const openai = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || "gpt-4-turbo",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const ollama = new ChatOllama({
  model: aiModel,
});

const aiClient = aiProvider === "openai" ? openai : ollama;

/**
 * Generates a Playwright test case based on a requirement and saves it inside the Playwright test suite.
 * @param requirement - The feature description or user story.
 * @returns Path to the generated test file.
 */
export async function generateAndSaveTest(requirement: string): Promise<string> {
    try {
        const prompt = `
        Generate a Playwright test case in TypeScript based on the following requirement:
        "${requirement}"
        Ensure the test follows best practices and uses Playwright’s built-in assertions.
        `;

        const response = await aiClient.invoke([
            { role: "system", content: "You are an AI that generates Playwright automation test cases based on user requirements." },
            { role: "user", content: prompt }
        ]);

        const testCode = typeof response.content === "string" ? response.content.trim() : "No valid test case generated.";

        // Save to Playwright test folder
        const fileName = `generatedTest_${Date.now()}.spec.ts`;
        const filePath = path.join(__dirname, "../tests", fileName);

        // Ensure the directory exists
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        fs.writeFileSync(filePath, testCode);
        console.log(`✅ AI-generated test saved: ${filePath}`);
        console.log("⚠️ Please review the generated test before running it!");

        return filePath;
    } catch (error) {
        console.error("❌ Error generating test:", error);
        return "Error in generating test case.";
    }
}

export default generateAndSaveTest;