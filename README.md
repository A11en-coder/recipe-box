# Recipe Box

A small, single-user local app for saving recipes with one photo each. Build the data and API first, then connect a React interface and style it with Tailwind CSS.

## Main workflows

1. Add a recipe with a title, ingredients, instructions, and an optional photo.
2. See saved recipes in a list with their text and photo when present.
3. Refresh and see the same saved recipes.
4. Receive a clear error for missing text or an invalid photo.

The final local check must include at least one recipe with a photo. A simple “Cook this week” marker is a stretch task after the main workflows work.

## Planned stack

- Frontend: React, TypeScript, Vite, and Tailwind CSS.
- Backend: Express and TypeScript; Multer for receiving one image upload.
- Database: PostgreSQL with Prisma for recipe data.
- File storage: Supabase Storage for image files.

## Supabase Storage setup

The Express server uploads recipe photos to Supabase Storage. In your Supabase project, create a **public** bucket named `recipe-photos`. Set its allowed MIME types to `image/jpeg`, `image/png`, and `image/webp`, and its maximum file size to 5 MB. The bucket must be public for the returned `imageUrl` to work in the browser.

In `server/.env`, set `SUPABASE_URL` to the project URL and `SUPABASE_SECRET_KEY` to a secret API key from the Supabase dashboard. The server also accepts the existing `NEXT_PUBLIC_SUPABASE_URL` value as the URL. Keep the secret key only in `server/.env`; never put it in frontend code or commit it. The publishable key alone cannot perform these server uploads unless you separately configure Storage access policies.

Send a `multipart/form-data` POST to `/api/recipes` with text fields `title`, `ingredients`, `instructions`, optional `description`, and an optional file field named `photo`. Responses contain `imagePath` (the stored object name) and `imageUrl` (a browser-ready public URL, or `null` when there is no photo).

## Backend design: first checkpoint

Before writing routes, sketch a `Recipe` model and explain each field. A starting shape is:

| Field | Purpose |
| --- | --- |
| `id` | Stable recipe identifier. |
| `title` | Name shown on the card. |
| `ingredients` | Recipe ingredients; plain text keeps this project small. |
| `instructions` | Steps to make the recipe; plain text keeps this project small. |
| `imagePath` | Optional path to the file in storage. Store a path, not image bytes. |
| `createdAt` | When the recipe was saved; useful for ordering. |


## API contract

- `GET /api/recipes`: return saved recipes, newest first.
- `POST /api/recipes`: create one recipe from title, ingredients, instructions, and optionally one photo. Return the saved recipe.
- Reject blank required text with a useful 400 response.
- Accept only an image type you explicitly support, such as JPEG, PNG, or WebP, and set a small file-size limit. Return a useful error for a rejected upload.
