# Branching Strategy

This document outlines the branching strategy used for this project to ensure smooth development, testing, and release cycles.

## Branch Types

### Master
- **Purpose**: Used for product releases.
- **State**: The code in this branch is always stable and ready for production deployment.

### Dev
- **Purpose**: Used for ongoing development.
- **State**: Contains the latest delivered development changes for the next release. 

### Feature Branches
- **Created from**: `dev`
- **Purpose**: Used to work on specific features or enhancements.
- **Workflow**: Once a feature is completely developed and tested, the branch is merged back into `dev`.

### Release Branches
- **Created from**: `dev`
- **Purpose**: Used to prepare for production releases and bug fixes.
- **Workflow**: Allows for final polishing, minor bug fixes, and preparing meta-data for a release without interrupting ongoing feature development on `dev`. Once ready to ship, it is merged into `master` and tagged with a version number, as well as merged back into `dev`.

### Hotfix Branches
- **Created from**: `master`
- **Purpose**: Used to address urgent issues directly in production.
- **Workflow**: Helps in addressing discovered bugs smoothly, allowing developers to continue their work on the `dev` branch while the issue is resolved. Once fixed, the branch is merged into both `master` (and tagged with an updated version number) and `dev` to ensure the fix is included in future releases.
