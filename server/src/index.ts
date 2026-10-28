import express, { type Express, type Request, type Response } from "express";
import { prisma } from "./db";
const app: Express = express();

// create a new route for the health check
app.get("/health", (req: Request, res: Response) => {
  res.send("Server is healthy!");
});

// middleware to parse JSON bodies
app.use(express.json());

// create a post api/recipes route that accepts a JSON body with the recipe data and saves it to the database
app.post("/api/recipes", async (req: Request, res: Response) => {
  const { title, description, ingredients, instructions } = req.body;

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
      error: "Title, ingredients and instructions are required and must be non-empty strings.",
    });
  }

  // if provided, check if description is a string
  if (description && typeof description !== "string") {
    return res.status(400).json({
      error: "Description must be a string.",
    });
  }

  try {
    // save the recipe to the database
    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        ingredients,
        instructions,
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

app.listen(3000);
