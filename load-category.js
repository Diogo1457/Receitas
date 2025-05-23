document.addEventListener("DOMContentLoaded", () => {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    // pega o nome da categoria da URL: ex: /pratos-principais/index.html -> categoryId = "pratos-principais"
    const categoryId = pathSegments[pathSegments.length - 2];

    // Busca categories.json para validar e pegar nome/descrição da categoria
    fetch("/Receitas/categories.json")
      .then(response => {
        if (!response.ok) throw new Error("Falha ao carregar categorias");
        return response.json();
      })
      .then(categories => {
        const category = categories[categoryId];
        if (!category) {
          // Categoria não encontrada - redireciona para 404
          window.location.href = "/Receitas/404-category.html";
          throw new Error("Categoria não encontrada");
        }

        // Atualiza título e meta description
        document.title = `${category.name} - Receitas Deliciosas`;
        const metaDescription = document.querySelector("meta[name='description']");
        if (metaDescription) {
          metaDescription.setAttribute("content", category.description || `Receitas da categoria ${category.name}`);
        }

        // Renderiza título da categoria no main
        document.getElementById("category-title").textContent = `${category.name}`;

        // Agora busca recipes.json e renderiza só as receitas dessa categoria
        return fetch("/Receitas/recipes.json");
      })
      .then(response => {
        if (!response.ok) throw new Error("Falha ao carregar receitas");
        return response.json();
      })
      .then(recipes => {
        const container = document.getElementById("recipes-container");

        // Filtra receitas que contenham a categoria (assumindo que recipe.category pode ser string ou array)
        const filteredRecipes = Object.entries(recipes).filter(([id, recipe]) => {
          if (Array.isArray(recipe.category)) {
            return recipe.category.includes(categoryId);
          } else {
            return recipe.category === categoryId;
          }
        });

        if (filteredRecipes.length === 0) {
          container.innerHTML = "<p>Nenhuma receita encontrada nesta categoria.</p>";
          return;
        }

        // Renderiza cards das receitas filtradas
        filteredRecipes.forEach(([id, recipe]) => {
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
      })
      .catch(error => {
        console.error("Erro ao carregar página da categoria:", error);
        document.getElementById("recipes-container").innerHTML = "<p>Erro ao carregar as receitas da categoria.</p>";
      });
  });