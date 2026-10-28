# Recipe Box

A small, single-user local app for saving recipes with one photo each. Build the data and API first, then connect a React interface and style it with Tailwind CSS.

## Goal and timebox

Finish the main local workflow in at most three calendar days, working about two to three hours per day. The main new skill is handling an image from a browser form through an API into file storage. The UI goal is a clear, responsive recipe form and list made with Tailwind.

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

Decide whether `ingredients` and `instructions` should be single text fields or structured lists. For this timebox, start with text fields unless you have a clear reason to add more structure. Show me your proposed Prisma schema before you migrate the database; this is checkpoint 1.

## API contract

- `GET /api/recipes`: return saved recipes, newest first.
- `POST /api/recipes`: create one recipe from title, ingredients, instructions, and optionally one photo. Return the saved recipe.
- Reject blank required text with a useful 400 response.
- Accept only an image type you explicitly support, such as JPEG, PNG, or WebP, and set a small file-size limit. Return a useful error for a rejected upload.

Start with a text-only JSON request so the database flow is easy to check. Once that works, change the create request to `multipart/form-data` for the photo. The server receives the file, stores it, and saves its storage path with the recipe. Decide how the browser will receive a usable photo URL when you reach the upload checkpoint.

## Roadmap and reviews

### Day 1 — Schema and text API

1. Sketch the model and request/response shape. **Checkpoint 1:** review the schema and API contract before migration.
2. Set up Prisma and Express. Add the list and create routes for text-only recipes, including validation.
3. Check with Postman or another API client that creating a recipe, listing it, and restarting the API preserve the data. **Checkpoint 2:** review the schema, routes, and actual responses.

### Day 2 — Image upload

1. Add a single-image upload to the create route with Multer.
2. Store the file in Supabase Storage and save its path in the recipe row.
3. Check valid and invalid uploads. **Checkpoint 3:** review the file flow, limits, error handling, and saved path.

### Day 3 — UI and full flow

1. Build the add form and recipe list in React. Use Tailwind for mobile and desktop layouts, labels, and clear loading and error states.
2. Connect the form and list to the API. Show saved photos.
3. In the browser, create a recipe with a photo and refresh. Check an invalid upload. **Final checkpoint:** review the running local workflow. Add one focused automated test if time remains.

## Completion criteria

- The local app saves and lists recipes through the API and database.
- A recipe with a valid photo displays that photo after refresh.
- Blank required text and an unsupported or oversized photo produce clear errors.
- The form and list are usable at phone and desktop widths.

## First task

Draft the Prisma `Recipe` model and the shape of the create and list responses. Bring those to checkpoint 1 before setting up the database migration. Write the code yourself; I will review it and guide the next step.

POST api/recipes will recieve title, ingredients, instructions, and optionally an image and description.

GET api/recipes will return an array of recipes
