/**
 * Generates a Playwright test case based on a requirement and saves it inside the Playwright test suite.
 * @param requirement - The feature description or user story.
 * @returns Path to the generated test file.
 */
export declare function generateAndSaveTest(requirement: string): Promise<string>;
export default generateAndSaveTest;
