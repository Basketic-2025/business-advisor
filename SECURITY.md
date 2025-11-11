# Security

- Operate with anonymous sessions by default; never collect PII unless the user explicitly opts into sync features.
- Keep AI provider API keys on the server only; never expose secrets in frontend bundles.
- Wrap AI endpoints with express-rate-limit to mitigate abuse.
- Run a lightweight content moderation hook (keyword filter) before relaying user prompts to AI providers to avoid unsafe outputs.
- Validate all inputs with Zod, parameterize every SQL statement, and sanitize strings for display.
- Use helmet, cors, and compression in Express plus HTTPS when deployed.
