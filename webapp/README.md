# Philippine Eagle Conservation Analytics Web App

Interactive React/Vite application for exploring the repository's literature-benchmarked synthetic conservation datasets.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The build command regenerates `src/generated/data.json` from the repository CSV files and copies the infographic, notebook, and manuscript into `public/`.

## Vercel

Deploy from this directory:

```bash
vercel
vercel --prod
```

When importing the GitHub repository in the Vercel dashboard, set the project root directory to `webapp`.
