import { useEffect, useState } from "react";
import "./App.css";

type Recipe = {
  id: number;
  title: string;
  description: string | null;
  ingredients: string;
  instructions: string;
  imageUrl: string | null;
};

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const response = await fetch("/api/recipes");
        if (!response.ok) throw new Error("Unable to load recipes");

        const data: unknown = await response.json();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load recipes",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadRecipes();
  }, []);

  function submitRecipe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitError("");

    const submitRecipeAsync = async () => {
      try {
        const response = await fetch("/api/recipes", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const result = await response.json() as { error?: string };
          throw new Error(result.error || "Unable to submit recipe");
        }

        const newRecipe: Recipe = await response.json();
        setRecipes((prevRecipes) => [newRecipe, ...prevRecipes]);
      } catch (requestError) {
        setSubmitError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to submit recipe",
        );
      }
    };

    void submitRecipeAsync();
  }

  return (
    <>
      <main>
        <h1>Recipe Box</h1>
        {loading && <p>Loading recipes...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && (
          recipes.length === 0 ? (
            <p>No recipes saved yet.</p>
          ) : (
            <ul>
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <h2>{recipe.title}</h2>
                  {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} />}
                  {recipe.description && <p>{recipe.description}</p>}
                  <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
                  <p><strong>Instructions:</strong> {recipe.instructions}</p>
                </li>
              ))}
            </ul>
          )
        )}
      </main>
      <aside>
        <h2>Add a New Recipe</h2>
        <form onSubmit={submitRecipe}>
          <label>
            Title:
            <input type="text" name="title" required />
          </label>
          <label>
            Description:
            <textarea name="description"></textarea>
          </label>
          <label>
            Ingredients:
            <textarea name="ingredients" required></textarea>
          </label>
          <label>
            Instructions:
            <textarea name="instructions" required></textarea>
          </label>
          <label>
            Photo:
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" />
          </label>
          <button type="submit">Add Recipe</button>
          {submitError && <p role="alert">{submitError}</p>}
        </form>
      </aside>
    </>
  );
}

export default App;
