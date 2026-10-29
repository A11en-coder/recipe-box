import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { prisma } from "./db";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { getPhotoUrl, getSupabaseStorage } from "./supabase";
const app: Express = express();

const allowedOrigins = new Set(["http://localhost:5173"]);
if (process.env.CLIENT_ORIGIN) {
  allowedOrigins.add(process.env.CLIENT_ORIGIN.replace(/\/$/, ""));
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// middleware to parse JSON bodies
app.use(express.json());

// Create a recipe. Multer reads multipart text and the optional photo before this handler runs.
app.post("/api/recipes", upload.single("photo"), async (req: Request, res: Response) => {
  const { title, description, ingredients, instructions } = req.body ?? {};

  // check if the required fields are strings before trimming them, then check if the trimmed values are empty strings
  if (
    typeof title !== "string" ||
    typeof ingredients !== "string" ||
    typeof instructions !== "string" ||
    title.trim() === "" ||
    ingredients.trim() === "" ||
    instructions.trim() === ""
  ) {
    return res.status(400).json({
      error:
        "Title, ingredients and instructions are required and must be non-empty strings.",
    });
  }

  // if provided, check if description is a string
  if (description && typeof description !== "string") {
    return res.status(400).json({
      error: "Description must be a string.",
    });
  }

  const photo = req.file;
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (photo && !extensions[photo.mimetype]) {
    return res.status(400).json({ error: "Photo must be a JPEG, PNG, or WebP image." });
  }

  let imagePath: string | null = null;
  try {
    if (photo) {
      imagePath = `${randomUUID()}.${extensions[photo.mimetype]}`;
      const { error } = await getSupabaseStorage().upload(imagePath, photo.buffer, {
        contentType: photo.mimetype,
        upsert: false,
      });
      if (error) {
        console.error("Error uploading photo:", error);
        return res.status(502).json({ error: "Could not store the photo. Please try again." });
      }
    }

    // save the recipe to the database
    const recipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
        imagePath,
      },
    });
    res.status(201).json({ ...recipe, imageUrl: getPhotoUrl(recipe.imagePath) });
  } catch (error) {
    console.error("Error creating recipe:", error);
    if (imagePath) {
      try {
        await getSupabaseStorage().remove([imagePath]);
      } catch (cleanupError) {
        console.error("Error removing an unused photo:", cleanupError);
      }
    }
    res
      .status(500)
      .json({ error: "An error occurred while creating the recipe." });
  }
});

// create a get api/recipes route that returns all recipes from the database
app.get("/api/recipes", async (req: Request, res: Response) => {
  try {
    // fetch all recipes from the database, order them by createdAt in descending order
    const recipes = await prisma.recipe.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(recipes.map((recipe) => ({
      ...recipe,
      imageUrl: getPhotoUrl(recipe.imagePath),
    })));
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the recipes." });
  }
});

// create a new route for the health check
app.get("/health", (req: Request, res: Response) => {
  res.send("Server is healthy!");
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "Photo must be 5 MB or smaller." });
    }
    return res.status(400).json({ error: "Invalid photo upload." });
  }
  next(error);
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Recipe Box API listening on port ${port}`);
});
