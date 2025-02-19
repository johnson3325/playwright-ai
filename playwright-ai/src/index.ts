import dotenv from "dotenv";
dotenv.config();

import selfHealingLocator from "./selfHealing";
export { selfHealingLocator };

export { generateAndSaveTest } from "./testGeneration";

export * from "./testSelection";
export * from "./errorAnalysis";
export * from "./visualTesting";
