# AGENTS.md - Proyecto Clínica

## Project Overview

This is a full-stack clinic management application with:
- **Frontend**: Angular 16 with Angular Material
- **Backend**: Express.js with Babel (Node.js 16.14.0 recommended)
- **Database**: MySQL (configured in backend)

## Project Structure

```
Proyecto-Clinica/
├── ProyectoFrontend/clinica-front/    # Angular application
│   └── src/app/
│       ├── components/                 # Shared components
│       ├── modules/                    # Feature modules (admin, medico, operador, paciente)
│       ├── services/                  # HTTP services
│       ├── interfaces/                # TypeScript interfaces
│       └── interceptors/              # JWT interceptor
└── ProyectoBackend/                   # Express API
    └── src/
        ├── controllers/               # Request handlers
        ├── routes/                    # API routes
        ├── database/                  # Database connections
        └── config.js                  # App configuration
```

---

## Build / Lint / Test Commands

### Frontend (Angular)

| Command | Description |
|---------|-------------|
| `npm start` | Start Angular dev server (`ng serve`) |
| `npm run build` | Build for production (`ng build`) |
| `npm run watch` | Watch mode for development |
| `npm run test` | Run Karma/Jasmine tests |
| `npm run test -- --include="**/specific.spec.ts"` | Run single test file |

### Backend (Express)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon (`babel-node src/index.js`) |

**Note**: Backend uses Node.js 16.14.0 specifically.

---

## Code Style Guidelines

### TypeScript / Angular

**Formatting**
- Use 2-space indentation (enforced by `.editorconfig`)
- Use single quotes for strings
- Always use semicolons
- Use arrow functions for callbacks
- Maximum line length: 100 characters

**Imports**
- Group imports in this order:
  1. Angular core imports
  2. Third-party libraries
  3. Internal services/components
- Use path aliases where configured (check `tsconfig.json` `baseUrl`)
- Example:
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { MatDialog } from '@angular/material/dialog';
  import { Observable } from 'rxjs';
  import { Router } from '@angular/router';
  import { AuthService } from '../../services/auth.service';
  ```

**Naming Conventions**
- **Components**: `kebab-case` for filenames, `PascalCase` for class names
- **Services**: `*.service.ts` suffix, `PascalCase` class names
- **Interfaces**: `*.interface.ts` suffix, `PascalCase` with optional `I` prefix
- **Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Private properties**: Prefix with underscore `_` or use TypeScript private keyword

**Types**
- Always define return types for functions
- Use explicit types rather than `any` when possible
- Enable strict mode in `tsconfig.json` (already enabled)

**Components**
- Follow Angular component structure:
  ```typescript
  @Component({
    selector: 'app-component-name',
    templateUrl: './component-name.component.html',
    styleUrls: ['./component-name.component.css']
  })
  export class ComponentNameComponent implements OnInit {
    // Properties
    // Constructor
    // ngOnInit
    // Methods
  }
  ```

**Error Handling**
- Use try-catch blocks for async operations
- Return proper HTTP status codes in backend
- Use Observable error handling in services (`catchError`)
- Display user-friendly error messages with SweetAlert2

### Backend (JavaScript/Express)

**Formatting**
- Use 2-space indentation
- Use single quotes for strings
- Use ES6+ syntax (const/let, arrow functions, template literals)

**Imports**
- Use `require()` for CommonJS modules (e.g., `jsonwebtoken`, `express`)
- Use ES6 `import` for local modules

**Naming**
- Controllers: `*.controller.js` suffix
- Routes: `*.routes.js` suffix
- Database: `*.db.js` suffix

**Error Handling**
- Always wrap async controller logic in try-catch
- Return JSON responses with consistent structure:
  ```javascript
  res.json({ codigo: 200, mensaje: "OK", payload: [...] })
  ```
- Use proper HTTP status codes

**Database**
- Use parameterized queries to prevent SQL injection
- Always get connection from pool, use try-catch-finally for cleanup

---

## API Response Format

All backend API responses follow this structure:

```javascript
{
  codigo: number,    // 200 for success, -1 for client errors
  mensaje: string,  // Human-readable message
  payload: any      // Response data (array or object)
}
```

---

## Testing

### Frontend Tests
- Tests use Jasmine/Karma (Angular default)
- Test files: `*.spec.ts`
- Run specific test: `ng test --include="**/filename.spec.ts"`

---

## Important Notes

1. **JWT Authentication**: Backend uses JWT tokens with 8-hour expiration
2. **Database**: MySQL connection details in `.env` (backend)
3. **API Base URL**: Frontend calls `http://localhost:4000/api`
4. **Angular Material**: UI components use Angular Material library

---

## Common Development Tasks

### Adding a new component
```bash
cd ProyectoFrontend/clinica-front
ng generate component modules/<module-name>/<component-name>
```

### Adding a new service
```bash
ng generate service services/<service-name>
```

### Adding a new API endpoint
1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Register route in `src/app.js`
