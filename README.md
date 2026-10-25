# Property Aggregator – Frontend

Next.js frontend of the real-estate offers aggregator. It talks to the
[backend](https://github.com/property-aggregator/backend) API from the Next.js server only (BFF):
the browser holds an encrypted session cookie and never sees the access token.

> **Status:** early development

## Requirements

- Node.js 20+
- The backend running on `http://localhost:5209` (only for `npm run api:types` and for pages that call the API)
- An Auth0 **Regular Web Application** with:
    - Allowed Callback URLs: `http://localhost:3000/auth/callback`
    - Allowed Logout URLs: `http://localhost:3000`

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The app runs on `http://localhost:3000`.

## Scripts

| Script              | What                                                                      |
| ------------------- | ------------------------------------------------------------------------- |
| `npm run dev`       | Development server                                                        |
| `npm run build`     | Production build                                                          |
| `npm run lint`      | ESLint                                                                    |
| `npm run typecheck` | TypeScript check                                                          |
| `npm run format`    | Prettier (also sorts Tailwind classes)                                    |
| `npm run api:types` | Regenerates `src/lib/api/schema.d.ts` from the backend's OpenAPI document |

Run `npm run api:types` after every API change and commit the generated file.

## Configuration

All variables are required and validated at startup (`src/lib/env.ts`). See `.env.example`.

| Variable              | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `API_BASE_URL`        | Backend URL                                                       |
| `AUTH0_DOMAIN`        | Auth0 tenant domain                                               |
| `AUTH0_CLIENT_ID`     | Client ID of the Regular Web Application                          |
| `AUTH0_CLIENT_SECRET` | Client secret of the Regular Web Application                      |
| `AUTH0_AUDIENCE`      | API identifier; the backend rejects tokens without it             |
| `AUTH0_SECRET`        | Encrypts the session cookie; generate with `openssl rand -hex 32` |
| `APP_BASE_URL`        | URL the app runs on                                               |

## Structure

```
src/
  app/            routing only: (public) pages, (onboarding) consents, (app) signed-in pages
  features/       one folder per API area (properties, favorites, account): api.ts, actions, components
  components/     shared UI without domain logic (ui/, layout/)
  lib/
    api/          generated schema, typed clients, error handling
    auth0.ts      Auth0 client
    env.ts        validated environment variables
    routes.ts     route paths and the list of public pages
  proxy.ts        Auth0 routes (/auth/*) and redirect to sign-in for private pages
```

Pages are private unless listed in `src/lib/routes.ts` (`/`, `/najnowsze`, `/regulamin`,
`/polityka-prywatnosci`, `/artykuly/*`).

### API errors

`unwrap()` in `src/lib/api/errors.ts` handles every API response: 401 redirects to sign-in,
403 `terms_not_accepted` redirects to the consents screen, and any other error throws `ApiError`
with the backend's `code`.
