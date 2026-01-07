# Git Workflow Guidelines

This document outlines the standard Git workflow for the Vete project. Following these guidelines ensures a stable production environment for sales and marketing while enabling rapid development of new features.

## Branching Strategy

We follow a strategy that separates **development** from **production** stability.

### Primary Branches

| Branch    | Environment    | Purpose                                                          | CI/CD Behavior             |
| --------- | -------------- | ---------------------------------------------------------------- | -------------------------- |
| `main`    | **Production** | The source of truth for the live application. Restricted branch. | Deploys to Production URL. |
| `develop` | **Staging**    | Integration branch for testing features before release.          | Deploys to Staging URL.    |

### Supporting Branches

| Branch Type | Naming Convention      | Source    | Merge To           | Purpose                         |
| ----------- | ---------------------- | --------- | ------------------ | ------------------------------- |
| **Feature** | `feat/name-of-feature` | `develop` | `develop`          | Developing new functionality.   |
| **Bugfix**  | `fix/name-of-bug`      | `develop` | `develop`          | Fixing non-critical bugs.       |
| **Hotfix**  | `hotfix/name-of-issue` | `main`    | `main` & `develop` | Emergency fixes for Production. |

---

## Development Process

1.  **Start a Feature**:

    ```bash
    git checkout develop
    git pull origin develop
    git checkout -b feat/my-new-feature
    ```

2.  **Commit Changes**:
    Use [Conventional Commits](https://www.conventionalcommits.org/).

    Format: `<type>(<scope>): <description>`

    - `feat`: A new feature
    - `fix`: A bug fix
    - `docs`: Documentation only changes
    - `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
    - `refactor`: A code change that neither fixes a bug nor adds a feature
    - `perf`: A code change that improves performance
    - `test`: Adding missing tests or correcting existing tests
    - `chore`: Changes to the build process or auxiliary tools and libraries

    _Example_: `feat(auth): add google login support`

3.  **Open a Pull Request (PR)**:

    - Push your branch: `git push origin feat/my-new-feature`
    - Open PR targeting `develop`.
    - Fill out the PR Template.

4.  **Review & Merge**:
    - CI checks must pass (Lint, Test, Build).
    - At least one review approval is required.
    - Merge to `develop` (Squash & Merge recommended).

---

## Release Process

1.  **Staging Release**:

    - Merging to `develop` automatically deploys to the Staging environment.
    - Verification should happen here by the QA/Product team.

2.  **Production Release**:
    - When Staging is stable and ready for release.
    - Create a PR from `develop` to `main`.
    - Title: `chore(release): version x.x.x`
    - Upon merge, Production deployment triggers automatically.
    - A release tag is created automatically by the CI pipeline.
