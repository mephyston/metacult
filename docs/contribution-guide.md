# Contribution Guide

## workflow

We use a standard Feature Branch workflow.

1.  Create a branch from `develop`: `git checkout -b feature/my-new-feature`
2.  Commit your changes: `git commit -m 'feat: add new feature'` (Use Conventional Commits)
3.  Push to the branch: `git push origin feature/my-new-feature`
4.  Open a Pull Request.

## Code Style

- **Linting**: We use `eslint` and `biome`. Run `bun run lint` before committing.
- **Formatting**: Prettier is enforced.

## Testing

All new features must include tests.

- **Unit/Integration**: `bun test`
- **E2E**: `playwright test` (in `apps/e2e`)

## Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: formatting, missing semi colons, etc; no code change
- `refactor`: Refactoring production code
- `test`: Adding missing tests, refactoring tests; no production code change
