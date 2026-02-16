# Contributing to WhatsApp CRM

Thank you for your interest in contributing! 🎉

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to build something great together.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details

### Suggesting Features

1. Check if the feature has already been suggested
2. Use the feature request template
3. Explain:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions considered

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/WHATSAPP4PIXELSS.git
   cd WHATSAPP4PIXELSS/wahtsapp-main
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the code style
   - Add tests
   - Update documentation

4. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run format:check
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Use the PR template
   - Link related issues
   - Describe your changes
   - Add screenshots (if applicable)

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development
npm run dev:all
```

### Project Structure

```
wahtsapp-main/
├── server/           # Backend
│   ├── config/      # Configuration
│   ├── controllers/ # Request handlers
│   ├── db/          # Database
│   ├── jobs/        # Background jobs
│   ├── middleware/  # Middleware
│   ├── routes/      # API routes
│   ├── services/    # Business logic
│   └── utils/       # Utilities
├── src/             # Frontend
│   ├── components/  # React components
│   ├── config/      # Frontend config
│   └── context/     # React context
└── docs/            # Documentation
```

## Code Style

### JavaScript/JSX

- Use ES6+ features
- Use async/await over promises
- Use arrow functions
- Use template literals
- Use destructuring
- Use const/let (no var)

### Naming Conventions

- **Files:** kebab-case (e.g., `user-service.js`)
- **Functions:** camelCase (e.g., `getUserById`)
- **Classes:** PascalCase (e.g., `UserService`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Comments

```javascript
/**
 * Send message to WhatsApp contact
 * @param {string} phoneNumberId - WhatsApp phone number ID
 * @param {string} token - WhatsApp API token
 * @param {string} to - Recipient phone number
 * @param {string} text - Message text
 * @returns {Promise<Object>} WhatsApp API response
 */
async function sendMessage(phoneNumberId, token, to, text) {
  // Implementation
}
```

## Testing

### Writing Tests

```javascript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = doSomething(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Documentation

### Code Documentation

- Add JSDoc comments to functions
- Explain complex logic
- Document parameters and return values

### README Updates

- Update README.md if you add features
- Keep examples up to date
- Update screenshots if UI changes

### API Documentation

- Update docs/API.md for new endpoints
- Include request/response examples
- Document error codes

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**

```
feat(api): add rate limiting to webhooks

Added express-rate-limit middleware to prevent abuse
of webhook endpoints.

Closes #123
```

```
fix(validation): correct phone number formatting

Fixed issue where Egyptian phone numbers starting with 0
were not properly formatted.

Fixes #456
```

## Review Process

1. **Automated Checks**
   - Linting
   - Tests
   - Build

2. **Code Review**
   - At least one approval required
   - Address review comments
   - Keep PR focused and small

3. **Merge**
   - Squash and merge
   - Delete branch after merge

## Questions?

- Open an issue
- Ask in discussions
- Email: [your-email]

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🙏
