# Commit Messages

Use Conventional Commits with a required, narrow scope that reflects the part of the portfolio being changed.

Every commit must use the format `type(scope): short imperative summary`; unscoped messages such as `fix: ...` or `style: ...` are not allowed.

Preferred format:

```text
type(scope): short imperative summary
```

Rules:

- Use one of `feat`, `fix`, `style`, `refactor`, `docs`, `chore`, or `test`.
- Keep the scope concrete, such as `map`, `gallery`, `home`, `api`, `photo-form`, or `prisma`.
- Write the summary in imperative mood and keep it specific.
- Keep each commit focused on one concern. If style and behavior changes are separate concerns, prefer separate commits.
- Avoid vague summaries like `update app` or `improve UI`.

Examples for this repo:

```text
feat(map): add photo markers for gallery locations
feat(gallery): sync selected card with map center
fix(map): preserve selected marker after recenter
style(home): refine spacing for mobile gallery layout
docs(setup): document local sqlite workflow
```

When a change affects multiple layers, scope by the user-facing feature rather than the file type.

Prefer:

```text
feat(photo-form): submit manual photo entries to API
```

Avoid:

```text
feat(api): update route and form and page
```
