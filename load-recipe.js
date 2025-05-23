document.addEventListener("DOMContentLoaded", () => {
	const pathSegments = window.location.pathname.split("/").filter(seg => seg.length > 0);
	// Supondo estrutura /categoria/receita/index.html
	const categoryId = pathSegments[pathSegments.length - 3];
	const recipeId = pathSegments[pathSegments.length - 2];
  
	// 1. Verifica se categoria existe
	fetch("/Receitas/categories.json")
	  .then(response => {
		if (!response.ok) throw new Error("Falha ao carregar categorias");
		return response.json();
	  })
	  .then(categories => {
		if (!categories[categoryId]) {
		  // Categoria não existe - redireciona para 404 categoria
		  window.location.href = "/Receitas/404-category.html";
		  throw new Error("Categoria não encontrada");
		}
  
		// 2. Categoria existe, verifica receita
		return fetch("/Receitas/recipes.json");
	  })
	  .then(response => {
		if (!response.ok) throw new Error("Falha ao carregar receitas");
		return response.json();
	  })
	  .then(recipes => {
		const recipe = recipes[recipeId];
  
		if (!recipe) {
		  // Receita não encontrada
		  window.location.href = "/Receitas/404-receita.html";
		  throw new Error("Receita não encontrada");
		}
  
		// Opcional: verificar se recipe.category inclui categoryId
		// Se quiser garantir que receita pertence a categoria da URL:
		if (Array.isArray(recipe.category)) {
		  if (!recipe.category.includes(categoryId)) {
			window.location.href = "/Receitas/404-category.html";
			throw new Error("Receita não pertence a categoria informada");
		  }
		} else if (recipe.category !== categoryId) {
		  window.location.href = "/Receitas/404-category.html";
		  throw new Error("Receita não pertence a categoria informada");
		}
  
		// Renderiza receita normalmente
		document.title = `${recipe.name} - Receita Deliciosa`;
		const metaDescription = document.querySelector("meta[name='description']");
		if (metaDescription) {
		  metaDescription.setAttribute("content", recipe.description);
		}
  
		const content = `
		  <h2 class="hero-title mb-2">${recipe.name}</h2>
		  <p class="card-description mb-4">${recipe.description}</p>
		  <img src="/Receitas/images/${recipeId}.png" alt="${recipe.name}" class="recipe-img">
  
		  <section class="recipe-section">
			<h3 class="section-title">Ingredientes</h3>
			<ul class="recipe-list">
			  ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join("")}
			</ul>
		  </section>
  
		  <section class="recipe-section">
			<h3 class="section-title">Modo de Preparo</h3>
			<ol class="recipe-list numbered">
			  ${recipe.instructions.map(step => `<li>${step}</li>`).join("")}
			</ol>
		  </section>
  
		  ${recipe["side-dishes"] && recipe["side-dishes"].length > 0 ? `
		  <section class="recipe-section">
			<h3 class="section-title">Sugestões de Acompanhamento</h3>
			<ul class="recipe-list">
			  ${recipe["side-dishes"].map(item => `<li>${item}</li>`).join("")}
			</ul>
		  </section>
		  ` : ""}
		`;
		document.getElementById("recipe-content").innerHTML = content;
	  })
	  .catch(error => {
		console.error(error);
		// Caso tenha lançado erro, o redirecionamento já ocorreu.
		// Se quiser, pode colocar aqui fallback visual, mas é opcional.
	  });
  });
  