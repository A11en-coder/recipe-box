# Recipe Box demo on Render

Recipe Box uses **one Render Web Service**. Express serves both the API and the built React page from the same URL. The browser keeps calling `/api/recipes`, so no proxy, CORS, or frontend URL setting is needed in production.

Push the latest repository code to GitHub first. Then choose **New → Web Service**, connect `A11en-coder/recipe-box`, and enter:

| Setting | Value |
| --- | --- |
| Name | `recipe-box` (or another available name) |
| Project | Optional; your `recipe box / Demo` selection is fine |
| Language | `Node` |
| Branch | `main` |
| Region | `Singapore` is a sensible choice for the existing Neon database in Sydney's region |
| Root Directory | **Leave blank** |
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Instance Type | `Free` for a personal demo |

The root directory must be blank because the build needs both `server/` and `client/`. The root `build` script installs each app's dependencies and builds both. The server uses Render's `PORT` automatically.

Add these environment variables on the **same Web Service**:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | The current Neon connection string from `server/.env` |
| `SUPABASE_URL` | Your Supabase project URL (currently named `NEXT_PUBLIC_SUPABASE_URL` locally) |
| `SUPABASE_SECRET_KEY` | Your Supabase secret API key from `server/.env` |

Do not copy `server/.env` into Git. The existing Neon database already has the Prisma migration applied, so this demo build does not need to run a migration. If you switch to a fresh database, run `npx prisma migrate deploy` from `server/` against that database before using the app.

After the deploy, open the single Render URL. You can check `/health`, then add a recipe with a photo and refresh the page. The page and API should both be available from that one URL.

This demo has no user accounts or write protection: anyone with its URL can add recipes and upload photos. Use a dedicated demo database and bucket if you share the link widely. A Free web service can take time to wake after being idle.
