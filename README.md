# WhatTheRuck (WTRuck)
A simple web app to live track rugby statistics from the sideline

## HowTo

1. Local Testing
  * Run `npm run dev` for development
  * Run `npm run build` to create a production build
  * Run `serve -s dist` to test the production build locally
2. Deployment Options
  * Netlify (Recommended):
  ```
  npm install -g netlify-cli
  netlify deploy
  ```
  * Vercel:
  ```
  npm install -g vercel
  vercel
  ```
  * GitHub Pages:
    * Push to GitHub
    * Enable GitHub Pages in repository settings
    * Set build directory to `dist`

  ## Firebase Authentication (FirebaseUI)

  This project can use Firebase Authentication with FirebaseUI for a secure, maintained auth flow.

  1. Install required packages:

  ```powershell
  npm install firebase firebaseui
  ```

  2. Add environment variables for Firebase (create a `.env` or `.env.local` in the project root):

  ```
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  ```

  3. Supported sign-in providers configured in the app: Email/Password and Google. Enable them in the Firebase Console -> Authentication -> Sign-in method.

  4. Run the app and visit the login route:

  ```powershell
  npm run dev
  # open http://localhost:5173/WhatTheRuck/login
  ```

  Notes:
  - The app uses `src/firebase.ts` to read the config from `import.meta.env`.
  - FirebaseUI CSS is imported globally in `src/main.tsx`.

  ### GitHub Pages / CI

  To deploy to GitHub Pages while keeping Firebase credentials secret, store the `VITE_FIREBASE_*` values as GitHub repository secrets and use a CI workflow that injects them at build time. A sample GitHub Actions workflow is provided at `.github/workflows/gh-pages-deploy.yml`.

  Steps:

  1. In your repository on GitHub, go to Settings → Secrets → Actions and add the following secrets:
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_STORAGE_BUCKET`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`
    - `VITE_FIREBASE_APP_ID`

  2. The included workflow will read those secrets during the build and deploy the `dist` folder to the `gh-pages` branch.

  If you prefer to build locally and push static files, keep in mind building locally will bake the env values into the build — do not commit any files that contain secrets.


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
