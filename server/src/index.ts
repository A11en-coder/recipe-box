import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { prisma } from "./db";
import multer from "multer";
const app: Express = express();

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

  // Do not save a recipe with a photo until the file can be stored in Supabase.
  if (req.file) {
    return res.status(501).json({ error: "Photo storage is not connected yet." });
  }

  try {
    // save the recipe to the database
    const recipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
      },
    });
    res.status(201).json(recipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
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
    res.status(200).json(recipes);
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

app.listen(3000);
