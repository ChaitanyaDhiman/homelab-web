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

## Code Style

-   We use **ESLint** and **Prettier** (via ESLint) for code formatting.
-   Ensure no `any` types are used unless absolutely necessary (suppressed with reason).
-   Remove all `console.log` statements before submitting.

## Reporting Issues

If you find a bug or have a feature request, please open an issue in the repository. Provide as much detail as possible.
