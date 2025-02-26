declare module "playwright-ai-tools" {
  export function selfHealingLocator(page: any, selector: string): Promise<any>;
  export function generateAndSaveTest(test: string): void;
}