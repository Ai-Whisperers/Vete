# Implementation Plan: Project Modernization and Enhancement Roadmap

This is a master plan that consolidates 22 individual tracks into a single, sequential workflow.

---

### Phase 1: Standardize Data Fetching
- [ ] **Task:** Evaluate Client-Side Fetching Libraries
  - [ ] Sub-task: Create a small proof-of-concept for SWR.
  - [ ] Sub-task: Create a small proof-of-concept for TanStack Query.
  - [ ] Sub-task: Write a brief comparison document outlining pros and cons.
  - [ ] Sub-task: Make and record a final decision.
- [ ] **Task:** Document the Standard
  - [ ] Sub-task: Write the first draft of `DATA_FETCHING_STANDARD.md`.
  - [ ] Sub-task: Review the document with the team and incorporate feedback.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Foundation and Standardization' (Protocol in workflow.md)
- [ ] **Task:** Refactor Dashboard Data Loading (Server Components)
  - [ ] Sub-task: Write tests for the current dashboard server-side data fetching logic.
  - [ ] Sub-task: Refactor the data loading to use `async` Server Components with native `fetch`.
  - [ ] Sub-task: Ensure all tests pass.
- [ ] **Task:** Refactor Dashboard Interactive Components (Client Components)
  - [ ] Sub-task: Write tests for a component that requires client-side fetching.
  - [ ] Sub-task: Refactor the component to use the chosen client library (SWR or TanStack Query).
  - [ ] Sub-task: Ensure all tests pass.
- [ ] **Task:** Refactor Dashboard Data Mutations (Server Actions)
  - [ ] Sub-task: Write tests for a form or action on the dashboard.
  - [ ] Sub-task: Refactor the mutation logic to use a Server Action.
  - [ ] Sub-task: Ensure all tests pass.
- [ ] **Task:** Finalize Documentation
  - [ ] Sub-task: Update `DATA_FETCHING_STANDARD.md` with examples from the dashboard refactor.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Reference Implementation (Clinic Dashboard)' (Protocol in workflow.md)
- [ ] **Task:** Refactor the entire Authentication flow (Login, Signup, Profile pages).
- [ ] **Task:** Refactor the entire Appointment Management flow (Scheduling, Viewing, etc.).
- [ ] **Task:** Refactor the entire Pet Records flow.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Application Rollout - Core Features' (Protocol in workflow.md)
- [ ] **Task:** Refactor the Product Listing and Product Details pages.
- [ ] **Task:** Refactor the Shopping Cart and Checkout flow.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 4: Application Rollout - E-commerce Features' (Protocol in workflow.md)
- [ ] **Task:** Refactor the Lost & Found Pets feature pages.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 5: Application Rollout - Community Features' (Protocol in workflow.md)
- [ ] **Task:** Audit the codebase for any remaining legacy data fetching patterns.
- [ ] **Task:** Perform a final refactoring pass to address any missed files.
- [ ] **Task:** Remove any old data fetching utilities or libraries that are no longer needed.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 6: Final Sweep and Cleanup' (Protocol in workflow.md)

---

### Phase 2: Evaluate and Adopt a State Management Library
- [ ] **Task:** Research Zustand
  - [ ] Sub-task: Create a minimal proof-of-concept branch using Zustand.
  - [ ] Sub-task: Explore key features: store creation, state update, selector usage, middleware integration (if any).
  - [ ] Sub-task: Document findings and developer experience.
- [ ] **Task:** Research Jotai
  - [ ] Sub-task: Create a minimal proof-of-concept branch using Jotai.
  - [ ] Sub-task: Explore key features: atom creation, derived atoms, update mechanisms.
  - [ ] Sub-task: Document findings and developer experience.
- [ ] **Task:** Final Decision & Documentation
  - [ ] Sub-task: Compare Zustand and Jotai based on POCs and project needs.
  - [ ] Sub-task: Write a decision record (e.g., in `documentation/architecture/state-management-decision.md`).
  - [ ] Sub-task: Get team approval for the chosen library.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Library Evaluation and Decision' (Protocol in workflow.md)
- [ ] **Task:** Install and Configure Library
  - [ ] Sub-task: Install the chosen state management library.
  - [ ] Sub-task: Integrate it into the Next.js project structure.
  - [ ] Sub-task: Verify basic functionality with a simple test component.
- [ ] **Task:** Identify Target Page for Refactoring & Baseline Measurement
  - [ ] Sub-task: Based on existing code, identify the most complex page with significant prop drilling (e.g., clinic dashboard).
  - [ ] Sub-task: Create a baseline performance measurement for the chosen page before refactoring.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Setup and Initial Integration' (Protocol in workflow.md)
- [ ] **Task:** Refactor Page to Use New State Management
  - [ ] Sub-task: Write new tests for the page's components using the new state management.
  - [ ] Sub-task: Migrate all relevant local state and prop-drilled state to the new global store.
  - [ ] Sub-task: Remove redundant props and `useEffect` hooks related to state.
  - [ ] Sub-task: Ensure all tests pass and functionality is identical.
- [ ] **Task:** Performance Benchmarking
  - [ ] Sub-task: Measure the performance of the refactored page (e.g., render times, re-renders) using browser dev tools.
  - [ ] Sub-task: Compare against the baseline performance measurement.
  - [ ] Sub-task: Document the performance improvements (or lack thereof).
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Page Refactoring and Performance Benchmarking' (Protocol in workflow.md)

---

### Phase 3: Evaluate and Adopt a TypeScript ORM
- [ ] **Task:** Research Drizzle ORM
  - [ ] Sub-task: Create a minimal proof-of-concept branch using Drizzle ORM with Supabase.
  - [ ] Sub-task: Explore key features: schema definition, query builder, migrations, type generation.
  - [ ] Sub-task: Document findings, RLS compatibility, and developer experience.
- [ ] **Task:** Research Prisma
  - [ ] Sub-task: Create a minimal proof-of-concept branch using Prisma with Supabase.
  - [ ] Sub-task: Explore key features: schema definition, client generation, migrations, type safety.
  - [ ] Sub-task: Document findings, RLS compatibility, and developer experience.
- [ ] **Task:** Final Decision & Documentation
  - [ ] Sub-task: Compare Drizzle ORM and Prisma based on POCs, RLS compatibility, and project needs.
  - [ ] Sub-task: Write a decision record (e.g., in `documentation/architecture/orm-decision.md`).
  - [ ] Sub-task: Get team approval for the chosen ORM.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: ORM Evaluation and Decision' (Protocol in workflow.md)
- [ ] **Task:** Install and Configure Chosen ORM
  - [ ] Sub-task: Install the chosen ORM and its dependencies.
  - [ ] Sub-task: Configure the ORM to connect to the Supabase database.
  - [ ] Sub-task: Set up schema definition and migration tools (e.g., Drizzle Kit or Prisma Migrate).
  - [ ] Sub-task: Generate initial types from the existing Supabase schema.
- [ ] **Task:** Develop a Small New Feature with ORM
  - [ ] Sub-task: Identify a small, new feature (e.g., a simple CRUD operation on a new table) that requires database interaction.
  - [ ] Sub-task: Write tests for the new feature's database interactions using the ORM.
  - [ ] Sub-task: Implement the new feature's database logic entirely using the ORM.
  - [ ] Sub-task: Ensure all tests pass.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: ORM Setup and New Feature Integration' (Protocol in workflow.md)
- [ ] **Task:** Identify and Migrate Existing Feature
  - [ ] Sub-task: Identify an existing feature closely related to the new ORM-powered feature.
  - [ ] Sub-task: Write integration tests to cover the existing feature's Supabase client database interactions.
  - [ ] Sub-task: Refactor the existing feature's database logic, migrating it from the Supabase client to the chosen ORM.
  - [ ] Sub-task: Ensure all tests pass and functionality remains identical.
- [ ] **Task:** Documentation Update
  - [ ] Sub-task: Update any relevant documentation or code examples to reflect the ORM usage.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Existing Feature Migration' (Protocol in workflow.md)

---

### Phase 4: Adopt a Schema Validation Library
- [ ] **Task:** Evaluate and Decide on Library
  - [ ] Sub-task: Briefly evaluate Zod against one alternative (e.g., Valibot/Yup) for fit within our Next.js/TypeScript stack.
  - [ ] Sub-task: Document the decision and reasoning (e.g., in `documentation/architecture/validation-decision.md`).
- [ ] **Task:** Install and Configure Library
  - [ ] Sub-task: Install the chosen schema validation library (e.g., Zod).
  - [ ] Sub-task: Set up basic configuration for use in both backend (API routes) and frontend (React components).
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Library Evaluation and Setup' (Protocol in workflow.md)
- [ ] **Task:** Identify Critical API Endpoint
  - [ ] Sub-task: Select a critical API endpoint that receives user input and requires validation (e.g., a `POST /api/user` or `PUT /api/settings` route).
- [ ] **Task:** Implement Backend Validation
  - [ ] Sub-task: Write new tests for the selected API endpoint that specifically target invalid input scenarios (e.g., missing fields, incorrect types).
  - [ ] Sub-task: Define a schema for the API endpoint's input using the chosen library.
  - [ ] Sub-task: Integrate the schema validation into the API endpoint to parse and validate incoming requests.
  - [ ] Sub-task: Ensure invalid requests return appropriate error responses.
  - [ ] Sub-task: Ensure all tests pass.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Backend API Integration' (Protocol in workflow.md)
- [ ] **Task:** Identify Corresponding Frontend Form
  - [ ] Sub-task: Select the frontend form that interacts with the API endpoint chosen in Phase 2.
- [ ] **Task:** Implement Frontend Validation
  - [ ] Sub-task: Write new UI tests for the frontend form focusing on client-side validation errors (e.g., form submission with empty fields).
  - [ ] Sub-task: Integrate client-side validation into the form using the chosen schema validation library.
  - [ ] Sub-task: Display clear and user-friendly error messages for invalid input.
  - [ ] Sub-task: Ensure all tests pass.
- [ ] **Task:** Establish Schema Sharing
  - [ ] Sub-task: Refactor schema definitions to be shared and reused across the backend API and frontend form.
  - [ ] Sub-task: Verify that changes to the shared schema automatically update type safety in both environments.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Frontend Form Integration and Schema Sharing' (Protocol in workflow.md)

---

### Phase 5: Set Up a Component Documentation System
- [ ] **Task:** Evaluate Component Documentation Tools
  - [ ] Sub-task: Set up a minimal proof-of-concept for Storybook with one sample component.
  - [ ] Sub-task: Set up a minimal proof-of-concept for Ladle with one sample component.
  - [ ] Sub-task: Compare performance, ease of setup, and features. Document the decision.
- [ ] **Task:** Install and Configure Chosen Tool
  - [ ] Sub-task: Install the chosen tool (Storybook or Ladle) and its dependencies into the main project.
  - [ ] Sub-task: Configure the tool to work with Next.js, TypeScript, and Tailwind CSS.
  - [ ] Sub-task: Create a dedicated `npm` script (e.g., `npm run docs`) to launch the documentation system.
  - [ ] Sub-task: Verify the setup by creating a story for a single, simple component (e.g., a Button).
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Tool Evaluation and Setup' (Protocol in workflow.md)
- [ ] **Task:** Identify 10 Key Components for Documentation
  - [ ] Sub-task: Analyze the codebase to find components that are atomic, complex, frequently reused, and/or stateful.
  - [ ] Sub-task: Create a checklist of the 10 components to be documented.
- [ ] **Task:** Document Atomic Components (e.g., 3-4 components)
  - [ ] Sub-task: Write stories for the selected atomic components (e.g., Button, Input, Checkbox, Tag), covering all states and variations.
- [ ] **Task:** Document Complex/Organism Components (e.g., 3-4 components)
  - [ ] Sub-task: Write stories for the selected complex components (e.g., Navbar, AppointmentCard, Modal), demonstrating different configurations and states.
- [ ] **Task:** Document Reused/Stateful Components (e.g., 2-3 components)
  - [ ] Sub-task: Write stories for the remaining components, focusing on their reuse and complex internal logic.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Initial Component Documentation' (Protocol in workflow.md)
- [ ] **Task:** Team Review
  - [ ] Sub-task: Conduct a team walkthrough of the new component documentation system.
  - [ ] Sub-task: Gather feedback on the clarity and usefulness of the stories.
- [ ] **Task:** Documentation
  - [ ] Sub-task: Create a brief guide in the project's main `README.md` or a new `documentation/component-library.md` on how to run and add to the component documentation.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Review and Finalization' (Protocol in workflow.md)

---

### Phase 6: Implement API Mocking
- [ ] **Task:** Install MSW
  - [ ] Sub-task: Install `msw` and `@mswjs/data` (if needed for data modeling) as development dependencies.
- [ ] **Task:** Configure MSW for Vitest
  - [ ] Sub-task: Create MSW setup file(s) for the Vitest test environment (e.g., `vitest.setup.ts`).
  - [ ] Sub-task: Integrate MSW into the Vitest configuration, ensuring handlers are started/stopped correctly.
- [ ] **Task:** Configure MSW for Playwright
  - [ ] Sub-task: Create MSW setup file(s) for the Playwright E2E test environment.
  - [ ] Sub-task: Integrate MSW into the Playwright configuration, ensuring handlers are started/stopped correctly per test run.
- [ ] **Task:** Create Initial Global Mock Handlers
  - [ ] Sub-task: Define a small set of generic mock handlers (e.g., for common authentication checks) that return default success responses.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: MSW Setup and Basic Handlers' (Protocol in workflow.md)
- [ ] **Task:** Identify Target User Flow's API Endpoints
  - [ ] Sub-task: Confirm the specific user flow (e.g., "Appointment Booking") for which to implement comprehensive mocks.
  - [ ] Sub-task: List all relevant API endpoints (GET, POST, PUT, DELETE) and their expected request/response formats involved in this user flow.
- [ ] **Task:** Implement Success Path Mock Handlers
  - [ ] Sub-task: Create MSW handlers for all identified API endpoints to return expected success responses for the target user flow.
- [ ] **Task:** Implement Error/Edge Case Mock Handlers
  - [ ] Sub-task: For critical endpoints within the user flow, create handlers to simulate common error states (e.g., 400 Bad Request, 401 Unauthorized, 500 Internal Server Error) and specific edge cases (e.g., empty data sets).
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Mock Handlers for Target User Flow' (Protocol in workflow.md)
- [ ] **Task:** Refactor Vitest Tests for User Flow
  - [ ] Sub-task: Identify existing Vitest tests related to the target user flow.
  - [ ] Sub-task: Modify these tests to effectively utilize MSW handlers for API requests, removing direct network calls.
  - [ ] Sub-task: Ensure all refactored Vitest tests pass reliably and are deterministic.
- [ ] **Task:** Refactor Playwright E2E Tests for User Flow
  - [ ] Sub-task: Identify existing Playwright E2E tests related to the target user flow.
  - [ ] Sub-task: Modify these tests to configure and use MSW handlers for API requests, ensuring consistent and isolated test runs.
  - [ ] Sub-task: Ensure all refactored Playwright tests pass reliably and are deterministic.
- [ ] **Task:** Document MSW Usage
  - [ ] Sub-task: Create a brief guide (e.g., `testing/msw-guide.md`) on how to add new MSW handlers, override them per test, and use them effectively in both Vitest and Playwright.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Test Refactoring' (Protocol in workflow.md)

---

### Phase 7: Fix Tenant Access Control
- [ ] **Task:** Develop Cross-Tenant E2E Test
  - [ ] Sub-task: Set up a test scenario with at least two separate tenants and one user belonging to each.
  - [ ] Sub-task: Write a Playwright test where a user from Tenant A logs in and attempts to access a protected dashboard URL for Tenant B.
  - [ ] Sub-task: Assert that the test fails with a "not found" or "unauthorized" error, indicating the middleware is blocking access.
- [ ] **Task:** Harden `middleware.ts`
  - [ ] Sub-task: Refactor the middleware logic to strictly enforce that the user's `tenant_id` from their session matches the `clinic` (tenant) slug from the URL parameters on every request.
  - [ ] Sub-task: Ensure the new logic correctly blocks unauthorized access and makes the new E2E test pass.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Middleware Hardening & Testing' (Protocol in workflow.md)
- [ ] **Task:** Audit Data Access Functions
  - [ ] Sub-task: Scan the entire codebase (`web/` directory) for all functions that use the Supabase client to query the database.
  - [ ] Sub-task: Create a checklist of all functions that need to be refactored to enforce tenant ID checks.
- [ ] **Task:** Develop Cross-Tenant Integration Tests
  - [ ] Sub-task: For a critical data access function (e.g., `getAppointments`), write a Vitest integration test that calls it with a valid user but an incorrect `tenant_id`.
  - [ ] Sub-task: Assert that the test fails because the function returns no data or throws an error.
- [ ] **Task:** Refactor Data Access Functions
  - [ ] Sub-task: Go through the checklist and refactor each data access function to require a non-optional `tenant_id` parameter and use it in the `WHERE` clause of the query.
  - [ ] Sub-task: Ensure all refactored functions pass their new integration tests and that existing tests are updated as needed.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Data Access Layer Audit & Refactoring' (Protocol in workflow.md)
- [ ] **Task:** Manual Security Audit
  - [ ] Sub-task: Manually perform the steps outlined in the E2E test to confirm the fix works in a real browser environment.
  - [ ] Sub-task: Attempt to call API endpoints for Tenant B while authenticated as a user from Tenant A using developer tools.
- [ ] **Task:** Code Review
  - [ ] Sub-task: Create a Pull Request with all the changes from this track.
  - [ ] Sub-task: Ensure the PR is reviewed and approved by at least one other developer, specifically checking the security logic.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Final Verification and Review' (Protocol in workflow.md)

---

### Phase 8: Implement Global API Rate Limiting
- [ ] **Task:** Select and Set Up Rate Limiting Provider
  - [ ] Sub-task: Set up an account with a provider compatible with the chosen library (e.g., Upstash Redis).
  - [ ] Sub-task: Install the chosen library (e.g., `@upstash/ratelimit`).
  - [ ] Sub-task: Configure necessary environment variables for the provider connection and define initial rate limits.
- [ ] **Task:** Implement and Test Auth Rate Limiting
  - [ ] Sub-task: Write a Playwright test that repeatedly hits an auth endpoint (e.g., `/api/auth/login`) and asserts it fails with a `429` status after a low, test-specific limit.
  - [ ] Sub-task: Implement the strict rate-limiting logic in `middleware.ts` for all auth-related routes.
  - [ ] Sub-task: Ensure the Playwright test passes.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Setup and Authentication Rate Limiting' (Protocol in workflow.md)
- [ ] **Task:** Implement and Test General API Rate Limiting
  - [ ] Sub-task: Write a Playwright test for a regular API endpoint (e.g., `/api/clinics`) that asserts a `429` status after its limit is hit.
  - [ ] Sub-task: Implement the general rate-limiting logic in `middleware.ts` for all other `/api/*` routes.
  - [ ] Sub-task: Ensure the Playwright test passes.
- [ ] **Task:** Implement and Test Global Rate Limiting
  - [ ] Sub-task: Write a Playwright test that rapidly reloads a standard page and asserts a `429` status after its limit is hit.
  - [ ] Sub-task: Implement the global failsafe rate-limiting logic in `middleware.ts` for all requests.
  - [ ] Sub-task: Ensure the Playwright test passes.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: API and Global Rate Limiting' (Protocol in workflow.md)
- [ ] **Task:** Refine Configuration and Documentation
  - [ ] Sub-task: Set appropriate, production-level rate limits in the project's environment variable configuration files (e.g., `.env.production`).
  - [ ] Sub-task: Ensure all new environment variables are documented in the environment variable reference file (e.g., `.env.example`).
- [ ] **Task:** Manual Verification
  - [ ] Sub-task: Deploy the changes to a staging environment.
  - [ ] Sub-task: Manually confirm the rate limits are active using browser developer tools or a tool like `curl`.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Finalization and Verification' (Protocol in workflow.md)

---

### Phase 9: Conduct a Full Authorization Audit
- [ ] **Task:** Establish Audit Framework
  - [ ] Sub-task: Write a script or use code search tools to scan the codebase and generate a master checklist of all API routes and Server Actions. Save this as `AUDIT_ENDPOINT_CHECKLIST.md`.
  - [ ] Sub-task: Create the `testing/authorization-audit-guide.md` document outlining the Test-Driven Audit process for future tracks.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Foundation and Discovery' (Protocol in workflow.md)
- [ ] **Task:** Identify Authentication Endpoints
  - [ ] Sub-task: From the master checklist, create a specific checklist for all endpoints related to user accounts and authentication.
- [ ] **Task:** Test and Secure User Profile Endpoints
  - [ ] Sub-task: For each endpoint related to managing a user's own profile (e.g., `PUT /api/users/{id}`), write a test to ensure an unauthenticated user and a different authenticated user are blocked. Fix if necessary.
- [ ] **Task:** Test and Secure Admin-Only Auth Endpoints
  - [ ] Sub-task: For each endpoint related to administrative user management, write tests to ensure both unauthenticated users and standard (non-admin) users are blocked. Fix if necessary.
- [ ] **Task:** Final Review
  - [ ] Sub-task: Ensure all authorization tests written for the Authentication module are passing and have been committed.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Authentication Module Audit' (Protocol in workflow.md)

---

### Phase 10: Resolve TypeScript and ESLint Errors
- [ ] **Task:** Configure Pre-Commit Hooks
  - [ ] Sub-task: Install and configure `husky` and `lint-staged`.
  - [ ] Sub-task: Create a `pre-commit` hook that runs `lint-staged`.
  - [ ] Sub-task: Configure `lint-staged` to run `tsc --noEmit` and `eslint --fix` on staged files.
  - [ ] Sub-task: Manually test that a commit with a new error is blocked, and a commit with auto-fixable errors succeeds with the fixes applied.
- [ ] **Task:** Update CI Pipeline
  - [ ] Sub-task: Modify the `.github/workflows/test.yml` file.
  - [ ] Sub-task: Add a new job or step named "Lint & Type Check" that runs `npm run lint` and `npm run type-check`.
  - [ ] Sub-task: Ensure this step runs in parallel with tests and will fail the CI build if any errors are found.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Enforcement Setup' (Protocol in workflow.md)
- [ ] **Task:** Identify Errors
  - [ ] Sub-task: Run `tsc --noEmit` and `eslint` and filter the results to only show errors within the Authentication module's files (e.g., `web/app/auth`, `web/lib/auth`, etc.).
  - [ ] Sub-task: Create a checklist of files to be fixed.
- [ ] **Task:** Fix TypeScript Errors
  - [ ] Sub-task: Go through the checklist and resolve all TypeScript errors (e.g., replace `any` types, fix nullability issues, add missing types).
- [ ] **Task:** Fix ESLint Errors
  - [ ] Sub-task: Go through the checklist and resolve all ESLint errors (e.g., dependency array issues, unused variables, formatting rules).
- [ ] **Task:** Final Verification
  - [ ] Sub-task: Run the type-check and lint commands again, confirming zero errors in the Authentication module.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Authentication Module Cleanup' (Protocol in workflow.md)

---

### Phase 11: Analyze and Optimize Database Queries
- [ ] **Task:** Document the Optimization Process
  - [ ] Sub-task: Draft the `documentation/backend/database-optimization-process.md` document, detailing the steps from identification with the Supabase Dashboard to analysis with `EXPLAIN ANALYZE` and final verification.
- [ ] **Task:** Identify Target Query
  - [ ] Sub-task: Navigate to the Supabase dashboard -> Reports -> Query Performance.
  - [ ] Sub-task: Identify the top query listed under "Most time consuming" or "Most frequent".
  - [ ] Sub-task: Document the problematic query, its current performance metrics, and a link to it in the Supabase dashboard.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Process Definition and Query Identification' (Protocol in workflow.md)
- [ ] **Task:** Analyze the Query Plan
  - [ ] Sub-task: In the Supabase SQL Editor, run `EXPLAIN ANALYZE` on the target query.
  - [ ] Sub-task: Analyze the output to determine the bottleneck (e.g., a `Seq Scan` on a large table).
  - [ ] Sub-task: Determine the appropriate optimization, most likely creating a new B-tree index on a key column.
- [ ] **Task:** Implement the Optimization
  - [ ] Sub-task: Create a new Supabase migration file in the `supabase/migrations` directory.
  - [ ] Sub-task: In the new migration file, write the `CREATE INDEX` SQL command to add the necessary index to the relevant table.
  - [ ] Sub-task: Apply the migration to the local database and ensure it succeeds without errors.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Analysis and Optimization' (Protocol in workflow.md)
- [ ] **Task:** Deploy and Verify
  - [ ] Sub-task: Deploy the new migration to staging and production environments.
  - [ ] Sub-task: After a period of activity (e.g., 24 hours), revisit the Supabase Query Performance dashboard.
  - [ ] Sub-task: Confirm that the target query's performance has improved and it is no longer at the top of the "Most time consuming" list.
  - [ ] Sub-task: Add a screenshot of the improved performance to the track's records for posterity.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Verification' (Protocol in workflow.md)

---

### Phase 12: Develop a Robust Background Job System
- [ ] **Task:** Evaluate Queueing Services
  - [ ] Sub-task: Briefly review the documentation, pricing, and Next.js integration guides for Inngest and Upstash QStash.
  - [ ] Sub-task: Make a decision and document it in a new `documentation/architecture/background-jobs-decision.md` file.
- [ ] **Task:** Set Up Chosen Provider
  - [ ] Sub-task: Create an account with the chosen provider.
  - [ ] Sub-task: Install the necessary SDK package.
  - [ ] Sub-task: Add the provider's API keys and other required values to the project's environment variables and `.env.example`.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Provider Evaluation and Setup' (Protocol in workflow.md)
- [ ] **Task:** Create the Job Handler Function
  - [ ] Sub-task: Create a new API route (e.g., `/api/inngest` or a dedicated job handler route) as specified by the provider's documentation.
  - [ ] Sub-task: Move the logic for sending the "welcome" email from the signup endpoint into this new job handler function.
- [ ] **Task:** Modify Signup Process to Enqueue Job
  - [ ] Sub-task: Write an integration test that signs up a user and asserts that a job is sent to the queue (this may involve mocking the provider's SDK).
  - [ ] Sub-task: In the user signup API route, remove the direct email sending logic.
  - [ ] Sub-task: Replace it with a call to the job queue provider's SDK to enqueue the "send-welcome-email" job with the user's details.
  - [ ] Sub-task: Ensure the new integration test passes.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Job Creation and Migration' (Protocol in workflow.md)
- [ ] **Task:** Manual End-to-End Test
  - [ ] Sub-task: In a staging or local environment, create a new user.
  - [ ] Sub-task: Verify in the provider's dashboard that a new job was created and processed successfully.
  - [ ] Sub-task: Verify that the welcome email was actually received.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: End-to-End Verification' (Protocol in workflow.md)

---

### Phase 13: Refactor Large, Complex Pages
- [ ] **Task:** Identify Target Component
  - [ ] Sub-task: Use the React Profiler to record rendering performance for the main dashboard and other key pages.
  - [ ] Sub-task: Analyze the profiling data to find the slowest or most frequently re-rendering components.
  - [ ] Sub-task: Perform a code review of the top candidate component to confirm its complexity (lines of code, number of hooks, etc.).
  - [ ] Sub-task: Document the chosen component and the reasons for its selection.
- [ ] **Task:** Create Refactoring Plan
  - [ ] Sub-task: Map out the new component structure, defining the new child components and their responsibilities.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Analysis and Planning' (Protocol in workflow.md)
- [ ] **Task:** Create New Child Components
  - [ ] Sub-task: For each new child component in the plan, create the new file and move the relevant JSX and logic into it.
  - [ ] Sub-task: Add unit or integration tests for the new child components as they are created.
- [ ] **Task:** Recompose the Parent Page
  - [ ] Sub-task: In the original large page component, remove the extracted logic and JSX.
  - [ ] Sub-task: Import and render the new child components, passing down the necessary props.
- [ ] **Task:** Verification
  - [ ] Sub-task: Run all tests (unit, integration, and E2E) related to the page and ensure they all pass.
  - [ ] Sub-task: Manually test the refactored page in the browser to confirm all functionality is working as expected.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Refactoring' (Protocol in workflow.md)
- [ ] **Task:** Measure Post-Refactor Performance
  - [ ] Sub-task: Use the React Profiler on the refactored page under the same conditions as the initial analysis.
  - [ ] Sub-task: Compare the new performance data with the original baseline.
  - [ ] Sub-task: Document the improvements (e.g., with screenshots of the profiler before and after) in the track's records.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Performance Validation' (Protocol in workflow.md)

---

### Phase 14: Build MVP Super-Admin Panel
- [ ] **Task:** Implement Super-Admin Role & Route
  - [ ] Sub-task: Verify that a `super-admin` role can be assigned to a user in the database.
  - [ ] Sub-task: Update `middleware.ts` to protect a new `/super-admin/**` route path, allowing access only to users with the `super-admin` role.
  - [ ] Sub-task: Write an E2E test that confirms a non-super-admin user cannot access `/super-admin`.
- [ ] **Task:** Create Super-Admin Panel Layout
  - [ ] Sub-task: Create the basic page and layout components for the `/super-admin` section.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Security and Routing' (Protocol in workflow.md)
- [ ] **Task:** Build the Onboarding Form
  - [ ] Sub-task: Create a new React component for the "Create Clinic" form with fields for Clinic Name, Slug, Admin Email, etc.
  - [ ] Sub-task: Implement client-side validation for the form fields (using Zod, if available).
- [ ] **Task:** Implement the Provisioning Server Action
  - [ ] Sub-task: Create a new Server Action to be called by the form.
  - [ ] Sub-task: The action must first verify again that the caller has the `super-admin` role.
  - [ ] Sub-task: Write the logic to create the new clinic record in the database.
  - [ ] Sub-task: Write the logic to create the new administrator user account, linking them to the new clinic.
  - [ ] Sub-task: Write integration tests for this Server Action's success and failure cases.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Onboarding Form and Logic' (Protocol in workflow.md)
- [ ] **Task:** Manual End-to-End Test
  - [ ] Sub-task: As a super-admin user in a staging environment, create a new clinic using the form.
  - [ ] Sub-task: Verify in the database that the new clinic and user records were created correctly.
  - [ ] Sub-task: Log out and attempt to log in as the newly created clinic administrator to ensure their account is active.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: End-to-End Verification' (Protocol in workflow.md)

---

### Phase 15: Setup and Analyze Code Coverage
- [ ] **Task:** Configure Vitest Coverage
  - [ ] Sub-task: Update the `vitest.config.ts` to enable coverage reporting (using `v8` or `istanbul`).
  - [ ] Sub-task: Create a new `npm` script (e.g., `npm run coverage:unit`) that runs Vitest with the coverage flag.
  - [ ] Sub-task: Verify that an `lcov` report and HTML report are generated correctly in a temporary directory.
- [ ] **Task:** Configure Playwright Coverage
  - [ ] Sub-task: Update the `playwright.config.ts` and associated test scripts to enable code coverage collection. This may involve instrumenting the code when the development server is started for tests.
  - [ ] Sub-task: Create a new `npm` script (e.g., `npm run coverage:e2e`) that runs Playwright with the coverage flag.
  - [ ] Sub-task: Verify that a corresponding `lcov` report is generated.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Individual Coverage Reports' (Protocol in workflow.md)
- [ ] **Task:** Implement Report Merging
  - [ ] Sub-task: Install tooling required for merging coverage reports (e.g., `c8`).
  - [ ] Sub-task: Create a new top-level `npm` script (e.g., `npm run coverage`) that sequentially runs `coverage:unit`, `coverage:e2e`, and then invokes the merging tool on the generated reports.
  - [ ] Sub-task: Verify that a single, unified HTML report is generated in the final `coverage/` directory, reflecting the combined data from both test suites.
- [ ] **Task:** Analyze Report and Document Gaps
  - [ ] Sub-task: Review the unified report to identify critical application files with low (<50%) test coverage.
  - [ ] Sub-task: Create a new document (`testing/COVERAGE_GAPS.md`) listing the top 3-5 files/modules that need improved test coverage, with recommendations on whether unit or E2E tests are more appropriate for each.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Unified Reporting and Analysis' (Protocol in workflow.md)

---

### Phase 16: Create E2E Test for Authentication Flow
- [ ] **Task:** Create Test Scaffolding
  - [ ] Sub-task: Create the new Playwright test file `e2e/auth.spec.ts`.
  - [ ] Sub-task: Implement any necessary helper functions or API utility calls for programmatic user creation and deletion. This should leverage the MSW mocking infrastructure if available to make these calls fast and deterministic.
- [ ] **Task:** Implement Signup E2E Test
  - [ ] Sub-task: Write the test case for a new user successfully signing up via the UI.
  - [ ] Sub-task: Include assertions to verify redirection and the final authenticated state.
  - [ ] Sub-task: Ensure the test cleans up after itself by deleting the created user in an `afterEach` hook.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Test Setup and Signup Flow' (Protocol in workflow.md)
- [ ] **Task:** Implement Login E2E Test
  - [ ] Sub-task: In a `test.beforeEach` hook, programmatically create a test user via an API helper function.
  - [ ] Sub-task: Write the test case that navigates to the login page, fills the form with the test user's credentials, and submits.
  - [ ] Sub-task: Assert that the user is successfully logged in and redirected to their dashboard.
- [ ] **Task:** Implement Logout E2E Test
  - [ ] Sub-task: In a `test.beforeEach` hook, programmatically log in a user using a helper function.
  - [ ] Sub-task: Write the test case that finds and clicks the logout button.
  - [ ] Sub-task: Assert that the user is successfully logged out and redirected to a public page.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Login and Logout Flows' (Protocol in workflow.md)

---

### Phase 17: Document the Multi-Tenancy Architecture
- [ ] **Task:** Draft Data Model Section
  - [ ] Sub-task: Review the Supabase schema and document the key tables and columns that enforce multi-tenancy.
- [ ] **Task:** Draft Routing and Middleware Section
  - [ ] Sub-task: Review `middleware.ts` and the `web/app/[clinic]` directory structure.
  - [ ] Sub-task: Document how a request URL is mapped to a specific tenant and how access is controlled.
- [ ] **Task:** Draft Data Isolation Section
  - [ ] Sub-task: Review Supabase RLS policies and the data access functions in the codebase.
  - [ ] Sub-task: Document the primary mechanisms that prevent one tenant from accessing another's data.
- [ ] **Task:** Draft Onboarding Section
  - [ ] Sub-task: Briefly describe the process for creating a new tenant, referencing the Super-Admin panel track.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Content Creation' (Protocol in workflow.md)
- [ ] **Task:** Team Review
  - [ ] Sub-task: Create a Pull Request with the new `multi-tenancy.md` documentation file.
  - [ ] Sub-task: Request a review from another developer to check for technical accuracy and clarity.
  - [ ] Sub-task: Incorporate any feedback from the review and merge the document.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Review and Finalization' (Protocol in workflow.md)

---

### Phase 18: Generate API Documentation
- [ ] **Task:** Install Dependencies
  - [ ] Sub-task: Install `swagger-jsdoc` and `swagger-ui-react`.
- [ ] **Task:** Implement Generation Script
  - [ ] Sub-task: Create a new script (e.g., `scripts/generate-openapi.mjs`) that configures and runs `swagger-jsdoc` to scan the `web/app/api/**/*.ts` files and output a static `public/openapi.json` file.
  - [ ] Sub-task: Add a new `npm` script (e.g., `npm run docs:generate-api`) to execute this generation script.
- [ ] **Task:** Annotate First Endpoint
  - [ ] Sub-task: Add OpenAPI-compliant JSDoc comments to a single, simple GET endpoint.
  - [ ] Sub-task: Run the generation script and verify that the `openapi.json` file is created and contains the information for the annotated endpoint.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Setup and Generation' (Protocol in workflow.md)
- [ ] **Task:** Create API Docs Page
  - [ ] Sub-task: Create a new page at `/api-docs`.
  - [ ] Sub-task: Ensure this page is only rendered in development/staging environments, not in production.
  - [ ] Sub-task: Use the `swagger-ui-react` component on this page to load and display the generated `public/openapi.json` file.
- [ ] **Task:** Document Additional Endpoints
  - [ ] Sub-task: Identify and add OpenAPI annotations to at least one POST and one PUT/DELETE endpoint to demonstrate different HTTP methods and request bodies.
  - [ ] Sub-task: Re-run the generation script.
- [ ] **Task:** Verification
  - [ ] Sub-task: Load the `/api-docs` page in the browser and verify that all annotated endpoints appear correctly and can be interacted with via the UI.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: UI Rendering and Documentation' (Protocol in workflow.md)

---

### Phase 19: Improve UI/UX Consistency
- [ ] **Task:** Create `StandardPageLayout` Component
  - [ ] Sub-task: Create the component with standard containerization, padding, and responsive behavior for general content pages.
  - [ ] Sub-task: Add a story for this component to the documentation system.
- [ ] **Task:** Create `DashboardPageLayout` Component
  - [ ] Sub-task: Create the component, potentially including a slot for a sidebar and a main content area for dashboard pages.
  - [ ] Sub-task: Add a story for this component.
- [ ] **Task:** Refactor a Page with New Layout
  - [ ] Sub-task: Choose a simple, existing content page.
  - [ ] Sub-task: Refactor the page to use the new `StandardPageLayout` component.
  - [ ] Sub-task: Verify the page appears and functions correctly.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Layout Components' (Protocol in workflow.md)
- [ ] **Task:** Create Standardized Form Components
  - [ ] Sub-task: Create a `FormField` component that includes a `Label`, `Input` (or other form control), and a space for error messages, enforcing consistent styles and spacing.
  - [ ] Sub-task: Create or standardize basic `Input`, `Select`, and `Button` components, ensuring they have consistent styling for different states (focus, disabled, error).
  - [ ] Sub-task: Add stories for all new form components.
- [ ] **Task:** Refactor a Form with New Components
  - [ ] Sub-task: Choose an existing page with a form (e.g., the login or user profile page).
  - [ ] Sub-task: Refactor the form to use the new `FormField`, `Input`, and `Button` components.
  - [ ] Sub-task: Verify the form appears and functions correctly, including validation states.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Form Components & Refactoring' (Protocol in workflow.md)

---

### Phase 20: Automate Clinic Data Seeding
- [ ] **Task:** Create the Data Seeding Script
  - [ ] Sub-task: Create a new script or function (e.g., `lib/seeding/seed-clinic.ts`) that takes a `clinic_id` as input.
  - [ ] Sub-task: Implement the logic within the script to insert default roles into the `roles` table, linked to the `clinic_id`.
  - [ ] Sub-task: Implement the logic to insert a default list of services into the `services` table, linked to the `clinic_id`.
  - [ ] Sub-task: Write integration tests for this seeding script to ensure it correctly inserts data for a given `clinic_id`.
- [ ] **Task:** Create the Background Job Handler
  - [ ] Sub-task: Define a new job handler function (e.g., in `/api/inngest`) that receives a `clinic_id` in its payload.
  - [ ] Sub-task: The handler should call the new seeding script with the received `clinic_id`.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Seeding Script and Job Handler' (Protocol in workflow.md)
- [ ] **Task:** Trigger Job from Clinic Creation
  - [ ] Sub-task: Modify the Server Action that handles clinic creation from the super-admin panel.
  - [ ] Sub-task: After the clinic record is successfully created in the database, add a step to enqueue the `seed-new-clinic-data` job, passing the new `clinic_id`.
- [ ] **Task:** End-to-End Verification
  - [ ] Sub-task: In a staging environment, use the super-admin panel to create a new test clinic.
  - [ ] Sub-task: Check the background job dashboard to ensure the seeding job was triggered and completed successfully.
  - [ ] Sub-task: Query the database directly to verify that the default roles and services have been correctly created and associated with the new clinic.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Triggering and Verification' (Protocol in workflow.md)

---

### Phase 21: Create Component Library Roadmap
- [ ] **Task:** Audit Existing Components
  - [ ] Sub-task: Create a temporary spreadsheet or document to list every component found in the `web/components` directory and other relevant folders.
  - [ ] Sub-task: For each component, briefly note its purpose and where it is used in the application.
- [ ] **Task:** Identify Consolidation Opportunities
  - [ ] Sub-task: Analyze the list to find multiple components that serve a similar purpose and could be merged into a single, more flexible component (e.g., `PrimaryButton`, `SecondaryButton` -> `Button` with a `variant` prop).
- [ ] **Task:** Categorize and Prioritize
  - [ ] Sub-task: Assign an Atomic Design category (Atom, Molecule, Organism) to each component on the list.
  - [ ] Sub-task: Assign a priority (High, Medium, Low) to each component based on its frequency of use and importance for UI consistency.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Component Audit and Analysis' (Protocol in workflow.md)
- [ ] **Task:** Draft the Roadmap Document
  - [ ] Sub-task: Create the `documentation/frontend/component-library-roadmap.md` file.
  - [ ] Sub-task: Structure the document with sections for Atoms, Molecules, and Organisms.
  - [ ] Sub-task: Populate the document with the prioritized lists of components generated in Phase 1.
  - [ ] Sub-task: Add a dedicated section to highlight the top 3-5 recommended consolidation opportunities.
- [ ] **Task:** Team Review
  - [ ] Sub-task: Create a Pull Request with the new roadmap document.
  - [ ] Sub-task: Request a review from the development team to validate the analysis and prioritization.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Roadmap Documentation' (Protocol in workflow.md)

---

### Phase 22: Increase Unit Test Coverage
- [ ] **Task:** Identify Target File
  - [ ] Sub-task: Run the `npm run coverage` script to generate the unified coverage report.
  - [ ] Sub-task: Analyze the report for files in the `web/lib` directory and select the most critical file with low coverage.
  - [ ] Sub-task: Document the selected file (e.g., `web/lib/billing.ts`) and its current coverage score in the track notes.
- [ ] **Task:** Create Test File
  - [ ] Sub-task: Create a new test file (e.g., `web/lib/billing.test.ts`) if one doesn't already exist.
  - [ ] Sub-task: Add basic imports and a `describe` block for the module.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Analysis and Test Scaffolding' (Protocol in workflow.md)
- [ ] **Task:** Write Tests for Core Functions
  - [ ] Sub-task: For each exported function in the target file, write a series of `it` blocks covering its main success paths and expected outputs.
- [ ] **Task:** Write Tests for Edge Cases
  - [ ] Sub-task: For each function, add tests for edge cases, such as invalid inputs (null, undefined), empty arrays, zero values, etc., asserting the correct behavior.
- [ ] **Task:** Write Tests for Branch Coverage
  - [ ] Sub-task: Analyze any conditional logic (`if`/`else`, ternaries, switches) in the functions and write specific tests to ensure every logical branch is executed.
- [ ] **Task:** Final Coverage Check
  - [ ] Sub-task: Run the coverage report again and verify that the coverage for the target file now exceeds 90%.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Test Implementation' (Protocol in workflow.md)