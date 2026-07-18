const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Imports
content = content.replace(
  'import { createServer as createViteServer } from "vite";',
  'import { createServer as createViteServer } from "vite";\nimport rateLimit from "express-rate-limit";\nimport compression from "compression";\nimport helmet from "helmet";'
);

// Middlewares
content = content.replace(
  'const PORT = 3000;\n\n  // API routes FIRST',
  `const PORT = 3000;

  // Enterprise Security & Optimization Middleware
  app.use(helmet({ contentSecurityPolicy: false })); // Basic security headers, CSP disabled for Vite HMR
  app.use(compression()); // Gzip compression for 500k CCU bandwidth reduction

  // Global Rate Limiter to prevent API abuse/DDoS
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: "Too many requests, please try again later." }
  });
  app.use("/api/", globalLimiter);
  app.use(express.json({ limit: "50mb" })); // Prevent large payload attacks

  // API routes FIRST`
);

// Wait, the original `server.ts` might not have `app.use(express.json())`?
// Let's check `server.ts`.
