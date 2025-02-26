import { Page } from "playwright";
/**
 * AI-powered self-healing locator.
 * If a selector is broken, the AI suggests an alternative.
 */
export declare function selfHealingLocator(page: Page, selector: string): Promise<import("playwright-core").ElementHandle<SVGElement | HTMLElement> | null>;
export default selfHealingLocator;
