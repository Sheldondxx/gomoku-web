# CLAUDE.md - Project Configuration for Claude Code

This file provides context to Claude Code when operating in this repository, whether locally or in CI/CD.

## Project Overview

- **Name**: gomoku-web
- **Type**: Web-based Gomoku (five-in-a-row) game
- **Stack**: Vanilla JavaScript (ES6+), HTML5 Canvas, Vite

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | JavaScript (ES6 modules, no transpiler beyond Vite) |
| Build Tool | Vite |
| Testing | Vitest + jsdom + @testing-library/dom |
| Styling | Vanilla CSS (dark theme, see `src/style.css`) |
| Rendering | HTML5 Canvas 2D |

## Directory Structure

```
src/
  game.js      # Core game logic, board state, win detection, rendering
  main.js      # Entry point, initializes Game and mounts to DOM
  style.css    # All styles, dark theme
  game.test.js # Unit tests for game logic
tests/         # (if added in future)
public/
  favicon.svg
```

## Code Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Prefer **const** and **let**, avoid `var`
- Use **ES6 module syntax** (`import`/`export`)
- Avoid adding external dependencies unless absolutely necessary
- Keep functions small and focused
- Canvas rendering code lives in `Game` class methods

## Testing

```bash
npm test        # Run all tests (vitest run)
npm run dev     # Development server
npm run build   # Production build
```

## Review Criteria

When reviewing code in this project, pay special attention to:

1. **Game Logic Correctness**: Win detection (5 in a row) must be accurate in all directions
2. **Canvas Performance**: Avoid unnecessary redraws, use requestAnimationFrame for animations
3. **State Management**: Game state mutations should be predictable and centralized
4. **Test Coverage**: New game logic should have corresponding unit tests
5. **Browser Compatibility**: Target modern browsers, avoid legacy APIs

## Common Patterns

- Game state is managed by the `Game` class in `src/game.js`
- Board is a 2D array: `board[row][col]` where `0=empty, 1=black, 2=white`
- Canvas coordinates are calculated from grid positions
- Event listeners are bound in `start()` method and removed in cleanup
