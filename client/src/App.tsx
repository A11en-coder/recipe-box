import { useEffect, useState } from "react";

type Recipe = {
  id: number;
  title: string;
  description: string | null;
  ingredients: string;
  instructions: string;
  imageUrl: string | null;
};

const labelClass = "mb-2 block text-sm font-semibold text-[#550527]";
const fieldClass = "w-full rounded-xl border border-[#688e26] bg-white px-4 py-3 text-sm text-[#550527] placeholder:text-[#688e26] outline-none transition focus:border-[#f44708] focus:ring-3 focus:ring-[#faa613]/35";
const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "";
const recipesUrl = `${apiBaseUrl}/api/recipes`;

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const response = await fetch(recipesUrl);
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
        const response = await fetch(recipesUrl, {
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
    <div className="min-h-screen bg-[#feedd0]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <header className="mb-10 border-b-4 border-[#688e26] pb-8 text-center sm:mb-12 sm:pb-10">
          <h1 className="text-5xl font-bold tracking-tight text-[#550527] sm:text-6xl">Recipe Box</h1>
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12">
          <main className="order-2 min-w-0 lg:order-1">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#52711e]">Saved collection</p>
                <h2 className="text-3xl font-semibold text-[#550527]">Your recipes</h2>
              </div>
              {!loading && !error && (
                <span className="rounded-full bg-[#feedd0]/50 px-3 py-1 text-sm font-medium text-[#550527]">
                  {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
                </span>
              )}
            </div>

            {loading && <p role="status" className="rounded-2xl border border-[#688e26]/35 bg-white p-6 text-[#550527]/75">Loading recipes...</p>}
            {error && <p role="alert" className="rounded-2xl border border-[#a10702] bg-[#febdba]/50 p-5 text-sm text-[#a10702]">{error}</p>}
            {!loading && !error && (
              recipes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#688e26]/50 bg-white p-10 text-center">
                  <p className="text-2xl text-[#550527]">Your first recipe starts here.</p>
                  <p className="mt-2 text-sm text-[#550527]/75">Use the form to save a dish you want to make again.</p>
                </div>
              ) : (
                <ul className="grid gap-5 xl:grid-cols-2">
                  {recipes.map((recipe) => (
                    <li key={recipe.id} className="min-w-0 overflow-hidden rounded-2xl border border-[#688e26]/35 bg-white shadow-sm">
                      {recipe.imageUrl ? (
                        <img className="h-52 w-full object-cover" src={recipe.imageUrl} alt={recipe.title} />
                      ) : (
                        <div className="flex h-32 items-center justify-center bg-[#faa613]/20 text-sm font-medium text-[#550527]" aria-hidden="true">From your kitchen</div>
                      )}
                      <div className="p-5 sm:p-6">
                        <h3 className="text-2xl leading-snug font-semibold text-[#550527]">{recipe.title}</h3>
                        {recipe.description && <p className="mt-2 text-sm leading-6 text-[#550527]/75">{recipe.description}</p>}
                        <div className="mt-5 border-t border-[#feedd0]/70 pt-5">
                          <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#550527]">Ingredients</h4>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#550527]">{recipe.ingredients}</p>
                        </div>
                        <div className="mt-5 border-t border-[#feedd0]/70 pt-5">
                          <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#550527]">Instructions</h4>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#550527]">{recipe.instructions}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}
          </main>

          <aside className="order-1 lg:sticky lg:top-8 lg:order-2">
            <div className="rounded-2xl border border-[#688e26]/35 bg-white p-5 shadow-sm sm:p-7">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#52711e]">Add to your collection</p>
              <h2 className="text-3xl font-semibold text-[#550527]">New recipe</h2>
              <p className="mt-2 text-sm leading-6 text-[#550527]/75">Save the details now so they are easy to find later.</p>

              <form onSubmit={submitRecipe} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="title" className={labelClass}>Title <span className="text-[#550527]">*</span></label>
                  <input id="title" className={fieldClass} type="text" name="title" placeholder="e.g. Sunday pasta" required />
                </div>
                <div>
                  <label htmlFor="description" className={labelClass}>Description <span className="font-normal text-[#688e26]">(optional)</span></label>
                  <textarea id="description" className={`${fieldClass} min-h-20 resize-y`} name="description" placeholder="What makes this one special?" />
                </div>
                <div>
                  <label htmlFor="ingredients" className={labelClass}>Ingredients <span className="text-[#550527]">*</span></label>
                  <textarea id="ingredients" className={`${fieldClass} min-h-28 resize-y`} name="ingredients" placeholder="One ingredient per line" required />
                </div>
                <div>
                  <label htmlFor="instructions" className={labelClass}>Instructions <span className="text-[#550527]">*</span></label>
                  <textarea id="instructions" className={`${fieldClass} min-h-36 resize-y`} name="instructions" placeholder="Write the steps in order" required />
                </div>
                <div>
                  <label htmlFor="photo" className={labelClass}>Photo <span className="font-normal text-[#688e26]">(optional)</span></label>
                  <input id="photo" className="block w-full cursor-pointer rounded-xl border border-[#688e26]/50 bg-white text-sm text-[#550527]/75 outline-none file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-[#688e26]/35 file:bg-[#feedd0]/30 file:px-4 file:py-3 file:font-semibold file:text-[#550527] focus:border-[#f44708] focus:ring-3 focus:ring-[#faa613]/35" type="file" name="photo" accept="image/jpeg,image/png,image/webp" />
                  <p className="mt-2 text-xs text-[#550527]/70">JPEG, PNG, or WebP. Up to 5 MB.</p>
                </div>
                {submitError && <p role="alert" className="rounded-xl border border-[#a10702] bg-[#febdba]/50 p-3 text-sm text-[#a10702]">{submitError}</p>}
                <button className="w-full rounded-xl bg-[#faa613] px-5 py-3.5 text-sm font-bold text-[#550527] shadow-sm transition hover:bg-[#c23806] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f44708]" type="submit">Save recipe</button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
