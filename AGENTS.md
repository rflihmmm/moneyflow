# Agent Instructions

This repository is a React application built with Vite and packaged for mobile devices using Capacitor. It is designed to track personal finances (expenses, incomes, transfers) using local device storage.

## Architecture

This project strictly follows the **Feature-Sliced Design (FSD)** architecture.
The `src` directory is divided into the following layers:
- `app`: Application initialization, global styles, providers, and routing (`app.tsx`, `main.tsx`).
- `pages`: Composition of pages (e.g., `transactions`, `statistics`, `settings`).
- `widgets`: Independent blocks combining entities and features (e.g., `header`, `navigation`, `transaction-list`).
- `features`: User interactions and actions (e.g., `create-expense`, `search-transactions`, `filter-transactions`).
- `entities`: Business entities (e.g., `account`, `category`, `currency`, `transaction`).
- `shared`: Reusable functionality, UI components, API, and configuration.

When creating or modifying components, ensure they are placed in the correct layer and follow the dependency rules of FSD (layers can only import from layers below them).
Aliases for layers are configured in `tsconfig.json` (e.g., `@app/`, `@shared/`, etc.).

## Tech Stack

- **Framework:** React 18, TypeScript
- **Bundler:** Vite
- **Mobile runtime:** Capacitor
- **Styling:** Tailwind CSS, `@headlessui/react`
- **State Management:** Zustand (Stores are typically found in the `model/` folders of entities or features)
- **Routing:** React Router v6
- **Forms & Validation:** `react-hook-form`, `zod`
- **Date Handling:** `luxon`
- **Testing:** Vitest

## Data Storage & API

- The application works offline and stores data locally using `@capacitor/preferences`.
- The `src/shared/api` directory contains interfaces and implementations for interacting with this local storage (e.g., `accounts-api`, `expenses-api`).
- Data structure updates are handled via a migration system located in `src/shared/api/migrations`.

## Development Guidelines

1. **Filesystem, file modification, data loss:**
   - Read Before Writing: Always load and analyze the current contents of a file before modifying it, unless you are certain it's a new or empty file. Never assume a file is empty.
   - Use Targeted Operations: Prefer methods that modify specific parts of a file (e.g., append, insert lines, search and replace specific patterns) over whole-file overwrites.
   - Scope Replacements Carefully: When using search and replace, ensure the pattern is not overly broad.
   - Preserve Existing Content: When adding new code or sections, make sure to merge with existing content, not replace it entirely.

2. **Styling:**
   - Use Tailwind CSS for all styling.
   - Utilize existing shared UI components (`src/shared/ui`) before creating new ones.

3. **State Management:**
   - Use Zustand for global state. Keep stores focused and modularized by entity or feature.

4. **Testing:**
   - Write tests using Vitest. Test files are named `*.test.ts` or `*.test.tsx` and reside next to the code they test.
   - Run tests with `npm run test` or `npm test`.

5. **Code Style:**
   - Follow the established Prettier and ESLint configurations.
   - Check styling via `npm run lint` and `npm run lint:style`.
