# Specification: Standardize Data Fetching

## 1. Overview
This track aims to standardize all data fetching patterns across the application to improve consistency, performance, and developer experience. The primary focus is a comprehensive refactoring of all existing code to a new, well-defined standard, which will be documented.

## 2. Functional Requirements
1.  **Technology Evaluation:** Briefly evaluate SWR and TanStack Query for client-side data fetching and caching, and select one as the official standard for the project.
2.  **Pattern Definition:** Formally define and document a clear set of rules for when to use:
    *   **Server-Side Fetching:** Native `fetch()` inside React Server Components for initial data loads.
    *   **Data Mutations:** Server Actions for all data creation, update, and deletion operations.
    *   **Client-Side Fetching:** The chosen library (SWR or TanStack Query) for dynamic, interactive, or real-time data needs on the client.
3.  **Reference Implementation:** Refactor a key, data-heavy page (e.g., the main clinic dashboard) to serve as a practical, reference implementation of the new standard.
4.  **Application-Wide Refactor:** Systematically refactor all existing data fetching logic throughout the entire application to comply with the new standard.
5.  **Documentation:** Create a brief `DATA_FETCHING_STANDARD.md` guide that outlines the chosen patterns and provides clear code examples.

## 3. Acceptance Criteria
1.  A `DATA_FETCHING_STANDARD.md` guide has been created and approved.
2.  The main clinic dashboard page (or a similar complex page) is fully refactored to the new standard.
3.  All data fetching logic across the entire application has been successfully refactored.
4.  The application is fully functional, all existing tests pass, and test coverage is maintained or improved.

## 4. Out of Scope
*   This track will not introduce any new user-facing features.
*   Architectural issues not directly related to data fetching will not be addressed.
