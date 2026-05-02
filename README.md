![Dailyscape Banner](assets/screenshots/banner.png)

# 🌌 Dailyscape

**Dailyscape** is a premium, configuration-first task management ecosystem for RuneScape players. It is built on an atomic, single-owner architecture that prioritizes content authorship, visual excellence, and architectural purity.

---

## 🏛️ The Dailyscape Philosophy

Dailyscape is not just a checklist; it is a **Runtime Content Engine**. 

Instead of hardcoded UI elements, the entire application is generated dynamically from a centralized content layer. This allows for rapid iteration across different games (RS3 & OSRS) and ensures that the UI always reflects the current game meta without touching core rendering logic.

### Core Principles
- **SSoT (Single Source of Truth)**: Every concept has one authoritative owner.
- **Content-Driven**: Pages, sections, and tasks are authored as pure data.
- **Atomic Rendering**: UI components are broken down into their smallest functional units.
- **Game-Aware**: A unified shell that adapts its personality based on the selected game environment.

---

## 🛰️ System Topology

![Topology Icon](assets/screenshots/topology.png)

The project follows a strict anatomical topology, ensuring that logic, state, and UI are never entangled.

### 📂 Directory Breakdown

| Directory | Purpose | Ownership |
| :--- | :--- | :--- |
| `src/app/` | **The Brain** | Runtime orchestration, registries, and the boot lifecycle. |
| `src/content/` | **The Heart** | Canonical authored tasks, section definitions, and page layouts. |
| `src/core/` | **The Skeleton** | Shared infrastructure: storage migrations, game-aware resolution, and DOM helpers. |
| `src/features/` | **The Muscle** | Domain-specific logic for Timers, Sections, and Profiles. |
| `src/ui/` | **The Skin** | Design tokens, atomic components, and pure renderers. |
| `tools/` | **The Audit** | Scripts to ensure the topology remains pristine and verified. |

---

## 🔄 The Life of a Task: Start to Finish

How does a simple JS object become a sleek, interactive tracker row?

1.  **Authorship**: A task is defined in `src/content/rs3/tasks/`.
2.  **Resolution**: The `Content Resolver` in `src/core/domain/content/` hydrates the task definition, applying game-specific filters.
3.  **Registration**: The `Unified Registry` maps the task to a specific section and page.
4.  **Orchestration**: The `Render Orchestrator` triggers the `Section Orchestrator` to iterate through the active page layout.
5.  **Rendering**: The `Standard Renderer` or `Timer Renderer` transforms the task data into a DOM node using atomic row templates.
6.  **Attachment**: Action handlers and state listeners are attached, connecting the UI to `localStorage` through the storage layer.

---

## ✨ Core Features

### ⏱️ Precision Timers
Advanced growth and activity tracking with game-accurate math. Supports Speedy Growth modifiers and category-based grouping.

### 📑 Dynamic Sections
Collapsible, sortable, and reset-aware sections. Subgroups support "attached" headers for a premium, unified table aesthetic.

### 👤 Profile Management
Switch between different accounts or playstyles with zero-latency profile swapping, each with its own isolated task state and settings.

### 🌓 Game-Aware Shell
A single codebase powering both RS3 and OSRS experiences. The UI adapts its tokens and content based on the active game registry.

---

## 🛠️ Technical Stack

- **Engine**: [Vite](https://vitejs.dev/) (Lightning-fast HMR and optimized production builds)
- **Logic**: Vanilla JavaScript (Modern ES6+, modular, and highly performant)
- **Aesthetics**: Custom Vanilla CSS (Design tokens, glassmorphism, and responsive layouts)
- **Verification**: [Playwright](https://playwright.dev/) & Node Test Runner (Full E2E and unit test coverage)

---

## 🚀 Getting Started

### Development
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Verification & Audit
We maintain a strict quality gate. Before every commit, we run a full audit.
```bash
# Run all tests, audits, and builds
npm run verify:full
```

`verify:full` executes:
- `npm test`: Runs the full unit test suite.
- `npm run audit`: Verifies topology, imports, content schemas, and timer math.
- `npm run build`: Validates the production bundle integrity.
- `npm run test:e2e`: Executes Playwright smoke tests.

---

## ⚖️ Legal

RuneScape is a trademark of Jagex Ltd. **Dailyscape** is an independent community project and is not affiliated with, endorsed by, or associated with Jagex Ltd.
