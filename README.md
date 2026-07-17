# StadiumMind AI — Multi-Modal Operational Control Room

StadiumMind AI is a production-grade, full-stack, responsive web application designed for real-time crowd safety management, multi-agent AI task orchestration, and emergency response simulation at FIFA 2026 World Cup venues.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet Maps, and Framer Motion.
- **State Management**: React Context (`AuthProvider`) and component states.
- **Backend Services**: Express server proxy with local development Vite-middleware and native production static assets server.
- **Persistence**: Firebase Firestore database SDK & custom services.
- **AI Engine**: Server-side Google Gemini SDK (`@google/genai`) for multi-agent task planning, volunteer translation services, transport/fan guides, and emergency operations.

---

## 🧪 Testing Infrastructure & Strategy

StadiumMind AI comes with a comprehensive, production-grade testing suite designed to ensure the reliability and security of critical operations components.

### 1. Test Frameworks
- **Vitest**: Modern, fast runner utilizing ES modules and TypeScript.
- **React Testing Library**: Enforces user-centric queries, state updates, and DOM interactions.
- **jsdom**: Simulates a high-fidelity browser runtime environment.
- **v8 Coverage**: Integrated test coverage reporting with strict threshold gates.

### 2. Coverage Targets
- **Statements**: >90%
- **Functions**: >95%
- **Lines**: >90%
- **Branches**: >65%

### 3. Test Suites Breakdown
- **Unit Tests (`tests/unit/`)**:
  - `auth.test.tsx` / `auth_offline.test.tsx`: Validates offline auth fallback bypasses, Firebase login/register/logout states, Google single sign-on flows, and error handling.
  - `firestore.test.ts`: Validates typed collection wrapper functions, document creation, reads, updates, listing, querying, deletion, and robust Firestore connection failures.
  - `aiServices.test.ts`: Validates AI orchestration logic, task planner engines, multi-agent emergency/volunteer/fan operations, and Gemini fallback paths.
  - `validation.test.ts`: Covers operational form formats and password strength guidelines.
- **Component Tests (`tests/components/`)**:
  - `Components.test.tsx`: Validates visual layout rendering, active data-visualizer gauges, interactive tab switching, simulation triggers (Crowd Surge, Medical Alert, Transit Delays), dynamic StadiumMap coordinates, and NotificationCenter horizontal filters.
- **Integration Tests (`tests/integration/`)**:
  - `Integration.test.tsx`: Validates full user-state lifecycles, end-to-end admin simulator triggers directly syncing with Firestore, and dispatch feeds dynamically propagating notifications through the hub.

---

## 💻 Running Tests

Install dependencies first if you have not already:
```bash
npm install
```

### Run All Unit & Component Tests
```bash
npm run test:run
```

### Run Tests in Watch Mode
```bash
npm run test
```

### Run Coverage Diagnostics
```bash
npm run test:coverage
```

### Run E2E Integration (Playwright)
```bash
npm run test:e2e
```
