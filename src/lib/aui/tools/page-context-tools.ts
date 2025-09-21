import aui, { z } from '@/lib/better-ui-wrapper';

// Tool to analyze current page context
export const analyzePageContext = aui
  .tool('analyzePageContext')
  .describe('Analyze the current page context and extract relevant information')
  .tag('page', 'context', 'analysis')
  .input(z.object({
    url: z.string().optional().describe('Current page URL'),
    userAgent: z.string().optional().describe('User agent string'),
    viewport: z.object({
      width: z.number(),
      height: z.number()
    }).optional().describe('Viewport dimensions')
  }))
  .execute(async ({ input }) => {
    // This runs on the client side to access page context
    const pageInfo = {
      url: input.url || (typeof window !== 'undefined' ? window.location.href : ''),
      title: typeof document !== 'undefined' ? document.title : '',
      userAgent: input.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      viewport: input.viewport || (typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : { width: 0, height: 0 }),
      timestamp: new Date().toISOString()
    };

    // Parse URL to extract meaningful information
    let parsedUrl;
    try {
      parsedUrl = new URL(pageInfo.url);
    } catch (e) {
      parsedUrl = null;
    }

    const context = {
      ...pageInfo,
      domain: parsedUrl?.hostname || '',
      pathname: parsedUrl?.pathname || '',
      searchParams: parsedUrl?.searchParams ? Object.fromEntries(parsedUrl.searchParams) : {},
      isGitHubPage: parsedUrl?.hostname?.includes('github') || false,
      isRepositoryPage: parsedUrl?.pathname?.match(/^\/[^\/]+\/[^\/]+\/?$/) ? true : false,
      repositoryInfo: null as any
    };

    // If this looks like a GitHub repository page, extract repo info
    if (context.isRepositoryPage && parsedUrl) {
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        context.repositoryInfo = {
          owner: pathParts[0],
          repo: pathParts[1],
          path: pathParts.slice(2).join('/') || null
        };
      }
    }

    return context;
  })
  .execute(async ({ input }) => {
    // Server-side fallback with limited context
    return {
      url: input.url || '',
      title: 'Server-side execution',
      userAgent: input.userAgent || '',
      viewport: input.viewport || { width: 0, height: 0 },
      timestamp: new Date().toISOString(),
      domain: '',
      pathname: '',
      searchParams: {},
      isGitHubPage: false,
      isRepositoryPage: false,
      repositoryInfo: null
    };
  });

// Tool to extract visible text content from the page
export const extractPageContent = aui
  .tool('extractPageContent')
  .describe('Extract and analyze visible text content from the current page')
  .tag('page', 'content', 'text')
  .input(z.object({
    selectors: z.array(z.string()).optional().describe('CSS selectors to focus on'),
    maxLength: z.number().default(5000).describe('Maximum content length')
  }))
  .execute(async ({ input }) => {
    if (typeof document === 'undefined') {
      throw new Error('This tool can only run in a browser environment');
    }

    let elements: Element[] = [];

    if (input.selectors && input.selectors.length > 0) {
      // Extract content from specific selectors
      input.selectors.forEach(selector => {
        try {
          const found = document.querySelectorAll(selector);
          elements.push(...Array.from(found));
        } catch (e) {
          console.warn(`Invalid selector: ${selector}`);
        }
      });
    } else {
      // Default to main content areas
      const defaultSelectors = [
        'main',
        'article',
        '[role="main"]',
        '.main-content',
        '#content',
        'body'
      ];

      for (const selector of defaultSelectors) {
        const found = document.querySelectorAll(selector);
        if (found.length > 0) {
          elements.push(...Array.from(found));
          break;
        }
      }
    }

    if (elements.length === 0) {
      elements = [document.body];
    }

    let extractedText = '';
    const metadata = {
      headings: [] as string[],
      links: [] as Array<{ text: string; href: string }>,
      images: [] as Array<{ alt: string; src: string }>,
      codeBlocks: [] as string[]
    };

    elements.forEach(element => {
      // Extract text content
      const textContent = element.textContent || '';
      extractedText += textContent + '\n';

      // Extract headings
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const text = heading.textContent?.trim();
        if (text) metadata.headings.push(text);
      });

      // Extract links
      const links = element.querySelectorAll('a[href]');
      links.forEach(link => {
        const text = link.textContent?.trim();
        const href = link.getAttribute('href');
        if (text && href) {
          metadata.links.push({ text, href });
        }
      });

      // Extract images
      const images = element.querySelectorAll('img[src]');
      images.forEach(img => {
        const alt = img.getAttribute('alt') || '';
        const src = img.getAttribute('src') || '';
        if (src) {
          metadata.images.push({ alt, src });
        }
      });

      // Extract code blocks
      const codeElements = element.querySelectorAll('pre, code');
      codeElements.forEach(code => {
        const text = code.textContent?.trim();
        if (text && text.length > 10) {
          metadata.codeBlocks.push(text);
        }
      });
    });

    // Truncate if necessary
    if (extractedText.length > input.maxLength) {
      extractedText = extractedText.substring(0, input.maxLength) + '...';
    }

    return {
      content: extractedText.trim(),
      contentLength: extractedText.length,
      metadata: {
        ...metadata,
        headings: metadata.headings.slice(0, 20),
        links: metadata.links.slice(0, 50),
        images: metadata.images.slice(0, 20),
        codeBlocks: metadata.codeBlocks.slice(0, 10)
      }
    };
  });

// Tool to monitor user interactions
export const trackUserInteractions = aui
  .tool('trackUserInteractions')
  .describe('Monitor and track user interactions on the current page')
  .tag('page', 'interaction', 'tracking')
  .input(z.object({
    duration: z.number().default(30000).describe('Tracking duration in milliseconds'),
    trackClicks: z.boolean().default(true).describe('Track click events'),
    trackScrolling: z.boolean().default(true).describe('Track scroll events'),
    trackKeyboard: z.boolean().default(false).describe('Track keyboard events')
  }))
  .execute(async ({ input }) => {
    if (typeof window === 'undefined') {
      throw new Error('This tool can only run in a browser environment');
    }

    return new Promise((resolve) => {
      const interactions: Array<{
        type: string;
        timestamp: number;
        target?: string;
        data?: any;
      }> = [];

      const addInteraction = (type: string, target?: string, data?: any) => {
        interactions.push({
          type,
          timestamp: Date.now(),
          target,
          data
        });
      };

      const listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> = [];

      const addEventListener = (element: EventTarget, event: string, handler: EventListener) => {
        element.addEventListener(event, handler);
        listeners.push({ element, event, handler });
      };

      // Track clicks
      if (input.trackClicks) {
        const clickHandler = (e: Event) => {
          const target = e.target as Element;
          addInteraction('click', target?.tagName || 'unknown', {
            id: target?.id || null,
            className: target?.className || null,
            textContent: target?.textContent?.slice(0, 50) || null
          });
        };
        addEventListener(document, 'click', clickHandler);
      }

      // Track scrolling
      if (input.trackScrolling) {
        let lastScrollTime = 0;
        const scrollHandler = () => {
          const now = Date.now();
          if (now - lastScrollTime > 500) { // Throttle scroll events
            addInteraction('scroll', 'window', {
              scrollY: window.scrollY,
              scrollX: window.scrollX
            });
            lastScrollTime = now;
          }
        };
        addEventListener(window, 'scroll', scrollHandler);
      }

      // Track keyboard events
      if (input.trackKeyboard) {
        const keyHandler = (e: KeyboardEvent) => {
          addInteraction('keydown', 'document', {
            key: e.key,
            code: e.code,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey
          });
        };
        addEventListener(document, 'keydown', keyHandler);
      }

      // Stop tracking after specified duration
      setTimeout(() => {
        // Remove all event listeners
        listeners.forEach(({ element, event, handler }) => {
          element.removeEventListener(event, handler);
        });

        resolve({
          duration: input.duration,
          totalInteractions: interactions.length,
          interactions: interactions.slice(0, 100), // Limit results
          summary: {
            clicks: interactions.filter(i => i.type === 'click').length,
            scrolls: interactions.filter(i => i.type === 'scroll').length,
            keystrokes: interactions.filter(i => i.type === 'keydown').length
          }
        });
      }, input.duration);
    });
  });

// Export all page context tools
export const pageContextTools = {
  analyzePageContext,
  extractPageContent,
  trackUserInteractions
};