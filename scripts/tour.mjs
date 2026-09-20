import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';





// Helper to wait
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Route discovery
function discoverRoutes(dir, baseRoute = '') {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
        // Route group, ignore in URL but traverse
        routes = routes.concat(discoverRoutes(path.join(dir, entry.name), baseRoute));
      } else {
        const newRoute = baseRoute + '/' + entry.name;
        routes = routes.concat(discoverRoutes(path.join(dir, entry.name), newRoute));
      }
    } else if (entry.name === 'page.tsx' || entry.name === 'page.js') {
      let route = baseRoute || '/';
      // Replace [id] with 1
      route = route.replace(/\[.*?\]/g, '1');
      if (!routes.includes(route)) {
        routes.push(route);
      }
    }
  }
  return routes;
}

const allRoutes = discoverRoutes(path.join(process.cwd(), 'app'));
console.log('Discovered routes:', allRoutes);

// Wait for port
async function waitForPort(port, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}`);
      if (res.ok || res.status === 404 || res.status === 200 || res.status === 500) {
        return true;
      }
    } catch (_e) {
      // ignore
    }
    await delay(1000);
  }
  throw new Error(`Timeout waiting for port ${port}`);
}

async function run() {
  console.log('Starting Next.js server...');
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'ignore',
    shell: true,
  });

  try {
    await waitForPort(3000, 60000);
    console.log('Server is ready on port 3000.');

    // Give Next.js an extra moment to fully initialize
    await delay(2000);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: 'videos/',
        size: { width: 1920, height: 1080 }
      }
    });

    const page = await context.newPage();

    // Inject virtual cursor
    await page.addInitScript(() => {
      const cursor = document.createElement('div');
      cursor.id = 'playwright-cursor';
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.4)';
      cursor.style.border = '2px solid rgba(239, 68, 68, 0.8)';
      cursor.style.position = 'fixed';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '999999';
      cursor.style.transition = 'transform 0.1s ease, background-color 0.1s ease, border-color 0.1s ease';
      cursor.style.top = '0';
      cursor.style.left = '0';
      document.documentElement.appendChild(cursor);

      document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;
      });
      document.addEventListener('mousedown', () => {
        cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
        cursor.style.border = '2px solid rgba(239, 68, 68, 1)';
        cursor.style.transform += ' scale(0.7)';
      });
      document.addEventListener('mouseup', () => {
        cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.4)';
        cursor.style.border = '2px solid rgba(239, 68, 68, 0.8)';
        cursor.style.transform = cursor.style.transform.replace(' scale(0.7)', '');
      });
    });

    for (const route of allRoutes) {
      console.log(`Navigating to ${route}...`);
      await page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: 'networkidle' });

      // Pause 2-3 seconds at the top
      await delay(2500);

      // Find interactive elements
      const interactives = await page.$$('a, button, [role="button"]');
      let elementsToHover = interactives.slice(0, 3); // Hover up to 3 elements to simulate natural behavior

      for (const el of elementsToHover) {
        try {
          const isVisible = await el.isVisible();
          if (isVisible) {
            const box = await el.boundingBox();
            if (box) {
              await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 });
              await delay(800); // Pause over element
            }
          }
        } catch (_e) {
          // Element might be detached or not interactable
        }
      }

      // Smooth scroll to bottom
      const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);

      let currentScroll = 0;
      while (currentScroll < scrollHeight - viewportHeight) {
        currentScroll += Math.min(200, scrollHeight - viewportHeight - currentScroll);
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), currentScroll);

        // Move mouse naturally during scroll
        await page.mouse.move(
          100 + Math.random() * (1700),
          100 + Math.random() * (800),
          { steps: 10 }
        );
        await delay(600);
      }

      // Final pause on the page
      await delay(2500);
    }

    await context.close();
    await browser.close();
    console.log('Video saved to videos/ directory.');

  } catch (error) {
    console.error('Error during execution:', error);
  } finally {
    console.log('Shutting down server...');
    server.kill();
  }
}

run();
