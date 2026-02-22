# Contributing to NexLab

Thank you for your interest in contributing to NexLab!

## Getting Started

1.  **Fork the repository**.
2.  **Clone your fork**:
    ```bash
    git clone https://github.com/your-username/nexlab.git
    cd nexlab
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```

## Development Workflow

1.  **Create a branch** for your feature or fix:
    ```bash
    git checkout -b feature/amazing-feature
    ```
2.  **Make your changes**.
3.  **Run linting and tests** to ensure quality:
    ```bash
    npm run lint
    npm test
    ```
4.  **Commit your changes** with descriptive messages.
5.  **Push to your fork** and submit a **Pull Request**.

## Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) to automatically generate changelogs and version releases. Every commit message must follow this format:

`<type>(<optional scope>): <description>`

### Allowed Types:

-   **`feat`**: A new feature (triggers a **Minor** release)
-   **`fix`**: A bug fix (triggers a **Patch** release)
-   **`docs`**: Documentation only changes
-   **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
-   **`refactor`**: A code change that neither fixes a bug nor adds a feature
-   **`perf`**: A code change that improves performance
-   **`test`**: Adding missing tests or correcting existing tests
-   **`build`**: Changes that affect the build system or external dependencies
-   **`ci`**: Changes to our CI configuration files and scripts
-   **`chore`**: Other changes that don't modify `src` or test files

**Breaking Changes**: If a commit introduces a breaking change, add a `!` after the type/scope, or include `BREAKING CHANGE:` in the footer. This triggers a **Major** version release.

**Example:**
`feat(system-stats): add ram usage widget`

## Code Style

-   We use **ESLint** and **Prettier** (via ESLint) for code formatting.
-   Ensure no `any` types are used unless absolutely necessary (suppressed with reason).
-   Remove all `console.log` statements before submitting.

## Reporting Issues

If you find a bug or have a feature request, please open an issue in the repository. Provide as much detail as possible.
