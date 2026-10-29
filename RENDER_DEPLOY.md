# Recipe Box demo on Render

The repository contains two Render services. The API is a **Web Service** from `server/`; the React app is a **Static Site** from `client/`. Keep the existing Neon PostgreSQL database and Supabase Storage bucket.

Push your latest code to the `main` branch of `https://github.com/A11en-coder/recipe-box` before creating the services.

## 1. Create the API

In Render, choose **New → Web Service**, connect the `recipe-box` GitHub repository, and use:

| Setting | Value |
| --- | --- |
| Name | `recipe-box-api` (or another available name) |
| Branch | `main` |
| Language | `Node` |
| Root Directory | `server` |
| Build Command | `npm ci --include=dev && npm run build && npx prisma migrate deploy` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Instance Type | `Free` for a personal demo |

Add these **Environment** values to the API service:

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `24.16.0` |
| `DATABASE_URL` | Your current Neon connection string from `server/.env` |
| `SUPABASE_URL` | Your Supabase project URL (the value currently named `NEXT_PUBLIC_SUPABASE_URL` locally) |
| `SUPABASE_SECRET_KEY` | Your Supabase secret API key from `server/.env` |

Do not add `SUPABASE_SECRET_KEY` to the Static Site. Render provides `PORT`, so you do not need to set it. Deploy the API and copy its full `https://...onrender.com` URL. Visit `<API_URL>/health` and check that it says `Server is healthy!`.

## 2. Create the frontend

Choose **New → Static Site**, connect the same repository, and use:

| Setting | Value |
| --- | --- |
| Name | `recipe-box-client` (or another available name) |
| Branch | `main` |
| Root Directory | `client` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |

Add these **Environment** values to the Static Site **before** its first build:

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `24.16.0` |
| `VITE_API_URL` | The full API URL, such as `https://recipe-box-api.onrender.com`, with no `/api` suffix |

The API URL is public and is bundled into the frontend. Never put `DATABASE_URL` or `SUPABASE_SECRET_KEY` in a `VITE_` variable. Deploy the Static Site and copy its full `https://...onrender.com` URL.

## 3. Allow the frontend to call the API

On the API Web Service, add one more Environment value:

| Key | Value |
| --- | --- |
| `CLIENT_ORIGIN` | The frontend's full origin, such as `https://recipe-box-client.onrender.com`, with no trailing slash or path |

Choose **Save, rebuild, and deploy**. The API accepts browser requests from this origin and from `http://localhost:5173` during local development.

## 4. Check the demo

1. Open the frontend URL and confirm the saved recipes load.
2. Add a small JPEG, PNG, or WebP photo with a recipe.
3. Refresh and confirm the photo and text remain.
4. Check an unsupported file shows an error.

The demo currently has no user accounts or write protection: anyone with its URL can add recipes and upload photos to your Supabase bucket. Use a dedicated demo database and bucket if you intend to share the link widely. Free Render web services may take time to wake after being idle.
