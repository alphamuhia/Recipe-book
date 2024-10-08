let apiUrl = "https://www.themealdb.com/api/json/v1/1/categories.php";
let mealApiUrl = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
let recipeDetailsApiUrl =
  "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
let savedRecipes = [];

// Show loader
function showLoader() {
  document.getElementById("loader").style.display = "block";
  document.getElementById("loader").setAttribute("aria-hidden", "false");
}

// Hide loader
function hideLoader() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("loader").setAttribute("aria-hidden", "true");
}
async function fetchCategories() {
  showLoader();
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    displayCategories(data.categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    alert("Failed to load categories. Please try again later.");
  } finally {
    hideLoader();
  }
}

// Fetch categories from API
function fetchCategories() {
  showLoader();
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      displayCategories(data.categories);
      hideLoader();
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
      hideLoader();
    });
}

// Display categories on the home page
function displayCategories(categories) {
  let categoriesList = document.getElementById("categoriesList");
  categoriesList.innerHTML = "";
  categories.forEach((category) => {
    let categoryItem = document.createElement("div");
    categoryItem.className = "category-item";
    categoryItem.innerHTML = `
                    <img src="${category.strCategoryThumb}" alt="${category.strCategory}">
                    <h3>${category.strCategory}</h3>
                    <button class="view-recipe-btn" onclick="fetchRandomRecipe('${category.strCategory}')">View Recipe</button>
                `;
    categoriesList.appendChild(categoryItem);
  });
}

// Fetch a random recipe
function fetchRandomRecipe(category) {
  showLoader();
  fetch(mealApiUrl + category)
    .then((response) => response.json())
    .then((data) => {
      const randomRecipe =
        data.meals[Math.floor(Math.random() * data.meals.length)];
      fetchRecipeDetails(randomRecipe.idMeal);
      hideLoader();
    })
    .catch((error) => {
      console.error("Error fetching recipe:", error);
      hideLoader();
    });
}

// Fetch recipe details using ID
function fetchRecipeDetails(id) {
  showLoader();
  fetch(recipeDetailsApiUrl + id)
    .then((response) => response.json())
    .then((data) => {
      if (data.meals && data.meals.length > 0) {
        displayRecipeDetails(data.meals[0]);
      } else {
        console.error("No recipe details found.");
      }
      hideLoader();
    })
    .catch((error) => {
      console.error("Error fetching recipe details:", error);
      hideLoader();
    });
}

// Display recipe details
function displayRecipeDetails(recipe) {
  document.getElementById("recipeTitle").innerText = recipe.strMeal;
  document.getElementById("recipeImage").src = recipe.strMealThumb;
  document.getElementById("recipeImage").alt = recipe.strMeal;
  document.getElementById("recipeIngredients").innerHTML =
    getIngredientsList(recipe);
  document.getElementById("recipeInstructions").innerText =
    recipe.strInstructions;
  document.getElementById("recipeDetails").style.display = "block";
  document.getElementById("homePage").style.display = "none";
  saveRecipeButton(recipe);
}

// ingredients list
function getIngredientsList(recipe) {
  let ingredientsList = "";
  for (let i = 1; i <= 20; i++) {
    if (recipe[`strIngredient${i}`]) {
      ingredientsList += `<li>${recipe[`strIngredient${i}`]} - ${
        recipe[`strMeasure${i}`]
      }</li>`;
    }
  }
  return ingredientsList;
}

// Create save button
function saveRecipeButton(recipe) {
  let recipeDetails = document.getElementById("recipeDetails");
  if (!recipeDetails) {
    console.error("Target element #recipeDetails not found.");
    return;
  }
  if (!document.querySelector(".save-recipe-btn")) {
    let saveButton = document.createElement("button");
    saveButton.className = "save-recipe-btn";
    saveButton.innerText = "Save Recipe";
    saveButton.onclick = function () {
      saveRecipe(recipe);
    };
    recipeDetails.appendChild(saveButton);
  }
}

// Search by ingredient
function searchRecipes() {
  let ingredient = document.getElementById("searchInput").value;
  if (ingredient) {
    showLoader();
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
      .then((response) => response.json())
      .then((data) => {
        displaySearchResults(data.meals);
        hideLoader();
      })
      .catch((error) => {
        console.error("Error searching for recipes:", error);
        hideLoader();
      });
  }
}

// Display search results
function displaySearchResults(meals) {
  let categoriesList = document.getElementById("categoriesList");
  categoriesList.innerHTML = "";
  if (meals) {
    meals.forEach((meal) => {
      const mealItem = document.createElement("div");
      mealItem.className = "category-item";
      mealItem.innerHTML = `
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <h3>${meal.strMeal}</h3>
                        <button class="view-recipe-btn" onclick="fetchRecipeDetails('${meal.idMeal}')">View Recipe</button>
                    `;
      categoriesList.appendChild(mealItem);
    });
  } else {
    categoriesList.innerHTML = "<p>No recipes found for this ingredient.</p>";
  }
}

// Save the recipe
function saveRecipe(recipe) {
  let recipeExists = savedRecipes.some(
    (savedRecipe) => savedRecipe.idMeal === recipe.idMeal
  );
  if (!recipeExists) {
    savedRecipes.push(recipe);
    alert(`${recipe.strMeal} has been saved to your favorites!`);
    console.log("Saved Recipes:", savedRecipes);
  } else {
    alert(`${recipe.strMeal} is already in your favorites.`);
  }
}

// Return to home
function hideRecipeDetails() {
  document.getElementById("recipeDetails").style.display = "none";
  document.getElementById("homePage").style.display = "block";
}

// View saved recipes
function viewSavedRecipes() {
  document.getElementById("homePage").style.display = "none";
  document.getElementById("savedRecipes").style.display = "block";
  displaySavedRecipes();
}
// saved recipe disply
function displaySavedRecipes() {
  let savedRecipesList = document.getElementById("savedRecipesList");
  savedRecipesList.innerHTML = "";
  if (savedRecipes.length > 0) {
    let uniqueRecipes = new set();
    savedRecipes.forEach((recipe) => {
      if (!uniqueRecipes.has(recipe.idMeal)) {
        uniqueRecipes.add(recipe.idMeal);

        let recipeItem = document.createElement("div");
        recipeItem.className = "category-item";
        recipeItem.innerHTML = `
          <img src="${recipe.strMealThumb || "default-image.jpg"}" alt="${
          recipe.strMeal
        }">
          <h3>${recipe.strMeal}</h3>
          <button class="view-recipe-btn" onclick="fetchRecipeDetails('${
            recipe.idMeal
          }')" aria-label="View details for ${
          recipe.strMeal
        }">View Recipe</button>
        `;
        savedRecipesList.appendChild(recipeItem);
      }
    });
  } else {
    savedRecipesList.innerHTML = "<p>No saved recipes found.</p>";
  }
}


// Return to home page
function hideSavedRecipes() {
  document.getElementById("savedRecipes").style.display = "none";
  document.getElementById("homePage").style.display = "block";
}
// initialize the page
fetchCategories();
