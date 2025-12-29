# Contributing to MemeBot

## Development Workflow

This project follows a phase-by-phase development approach with git version control for each completed section.

### Git Workflow

1. **Work on one section at a time** - Complete each section fully before moving to the next
2. **Commit after each completed section** - Use descriptive commit messages
3. **Tag major milestones** - Tag each phase completion for easy reference
4. **Use feature branches for experiments** - Main branch should remain stable

### Commit Message Format

```
[Phase X] [Section] Brief description

Detailed explanation if needed
```

Examples:
- `[Phase 1] [Docs] Add technical specification document`
- `[Phase 2] [Setup] Initialize Node.js project with TypeScript`
- `[Phase 3] [Sprint 1] Implement database schema and migrations`

### Section-by-Section Development

When working through the execution plan:

1. **Mark section as in-progress** in your task tracker
2. **Implement the section** following the plan specifications
3. **Test the section** (if applicable)
4. **Commit with descriptive message**
5. **Mark section as complete**
6. **Move to next section**

### Reverting Changes

If errors are discovered:

1. **Identify the problematic commit** using `git log`
2. **Create a revert commit** or **reset to previous state**:
   ```bash
   # Option 1: Revert (preserves history)
   git revert <commit-hash>
   
   # Option 2: Reset (if not yet pushed)
   git reset --hard <commit-hash>
   ```
3. **Document the issue** in commit message or issue tracker
4. **Re-implement the section** with corrections

### Branch Strategy

- **main** - Stable, production-ready code
- **develop** - Integration branch for features
- **feature/phase-X-section-Y** - Individual section work
- **hotfix/** - Critical bug fixes

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier (configured in Phase 2)
- Write tests for all new features
- Document complex logic with comments
- Keep functions small and focused

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes following the plan
3. Write/update tests
4. Update documentation if needed
5. Create PR with clear description
6. Request review
7. Merge after approval

### Phase Completion Checklist

Before marking a phase complete:

- [ ] All sections implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Committed and tagged
- [ ] Next phase plan reviewed

## Getting Help

- Check existing documentation in `/docs`
- Review the execution plan for context
- Open an issue for questions or problems

