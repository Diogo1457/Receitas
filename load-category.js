document.addEventListener("DOMContentLoaded", () => {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const categoryId = pathSegments[pathSegments.length - 2];

  const categoryTitleEl = document.getElementById("category-title");
  const container = document.getElementById("recipes-container");

  let allRecipes = {};
  let filteredRecipes = [];

  fetch("/Receitas/categories.json")
    .then(response => {
      if (!response.ok) throw new Error("Falha ao carregar categorias");
      return response.json();
    })
    .then(categories => {
      const category = categories[categoryId];
      if (!category) {
        window.location.href = "/Receitas/404-category.html";
        throw new Error("Categoria não encontrada");
      }

      document.title = `${category.name} - Receitas Deliciosas`;
      const metaDescription = document.querySelector("meta[name='description']");
      if (metaDescription) {
        metaDescription.setAttribute("content", category.description || `Receitas da categoria ${category.name}`);
      }

      categoryTitleEl.textContent = `${category.name}`;
      return fetch("/Receitas/recipes.json");
    })
    .then(response => {
      if (!response.ok) throw new Error("Falha ao carregar receitas");
      return response.json();
    })
    .then(recipes => {
      allRecipes = recipes;

      filteredRecipes = Object.entries(allRecipes).filter(([id, recipe]) => {
        const cat = recipe.category;
        return Array.isArray(cat) ? cat.includes(categoryId) : cat === categoryId;
      });

      if (filteredRecipes.length === 0) {
        container.innerHTML = "<p>Nenhuma receita encontrada nesta categoria.</p>";
        return;
      }

      createSortDropdown();
      renderCards(filteredRecipes);
    })
    .catch(error => {
      console.error("Erro ao carregar página da categoria:", error);
      container.innerHTML = "<p>Erro ao carregar as receitas da categoria.</p>";
    });

  function createSortDropdown() {
    const filterBar = document.createElement("div");
    filterBar.className = "filter-bar";
    filterBar.innerHTML = `
      <label for="sort-select">Ordenar por:</label>
      <select id="sort-select">
        <option value="recommended">Recomendado</option>
        <option value="az">A-Z</option>
        <option value="za">Z-A</option>
        <option value="random">Aleatório</option>
      </select>
    `;
    categoryTitleEl.insertAdjacentElement("afterend", filterBar);

    const select = document.getElementById("sort-select");
    select.addEventListener("change", () => {
      sortAndRender(select.value);
    });
  }

  function sortAndRender(method) {
    let sorted = [...filteredRecipes];
    switch (method) {
      case "az":
        sorted.sort((a, b) => a[1].name.localeCompare(b[1].name));
        break;
      case "za":
        sorted.sort((a, b) => b[1].name.localeCompare(a[1].name));
        break;
      case "random":
        sorted.sort(() => Math.random() - 0.5);
        break;
      default:
        // recommended = keep original order
        break;
    }
    renderCards(sorted);
  }

  function renderCards(recipes) {
    container.innerHTML = "";
    recipes.forEach(([id, recipe]) => {
      const card = document.createElement("a");
      card.href = `/Receitas/${categoryId}/${id}/index.html`;
      card.className = "card";
      card.innerHTML = `
        <img src="/Receitas/images/${id}.png" alt="${recipe.name}" class="card-img" />
        <div class="card-content">
          <h4 class="card-title">${recipe.name}</h4>
          <p class="card-description">${recipe.description}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }
});
