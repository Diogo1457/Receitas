document.addEventListener("DOMContentLoaded", function () {
  // Menu toggle
  const toggleBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  toggleBtn.addEventListener('click', () => nav.classList.toggle('active'));

  // Close menu on nav link click
  document.querySelectorAll('.nav-link').forEach(link =>
    link.addEventListener('click', () => nav.classList.remove('active'))
  );

  // Dark mode toggle
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark');
  }
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
      localStorage.setItem('dark-mode', 'enabled');
    } else {
      localStorage.setItem('dark-mode', 'disabled');
    }
  });

  // --- SEARCH BAR LOGIC ---

  const searchInput = document.getElementById('search-input');
  const resultsList = document.querySelector('.search-results');
  let recipes = {};
  let selectedIndex = -1;

  // Pega categoria atual da URL, exemplo: /pratos-principais/abc -> 'pratos-principais'
  function getCurrentCategory() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[0] : null;
  }
  const currentCategory = getCurrentCategory();

  // Carrega receitas JSON uma vez
  fetch('/recipes.json')
    .then(res => res.json())
    .then(data => { recipes = data; })
    .catch(() => { recipes = {}; });

  function clearResults() {
    resultsList.innerHTML = '';
    resultsList.classList.remove('show');
    selectedIndex = -1;
  }

  function updateSelection(newIndex) {
    const items = resultsList.querySelectorAll('li.result-item');
    if (items.length === 0) return;

    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].classList.remove('selected');
    }

    if (newIndex < 0) newIndex = items.length - 1;
    if (newIndex >= items.length) newIndex = 0;

    selectedIndex = newIndex;
    items[selectedIndex].classList.add('selected');

    // Scroll se necessário
    items[selectedIndex].scrollIntoView({ block: 'nearest' });
  }

  function showResults(matches) {
    resultsList.innerHTML = '';

    if (matches.length === 0) {
      const li = document.createElement('li');
      li.classList.add('no-results');
      li.textContent = 'Receita não encontrada';
      resultsList.appendChild(li);
      resultsList.classList.add('show');
      selectedIndex = -1;
      return;
    }

    matches.forEach(({ id, recipe }) => {
      const li = document.createElement('li');
      li.classList.add('result-item');
      li.tabIndex = 0;

      li.innerHTML = `
        <img src="/images/${id}.png" alt="${recipe.name}" class="result-img" />
        <span class="result-text">${recipe.name}</span>
      `;

      li.addEventListener('click', () => {
        window.location.href = `/${recipe.category}/${id}/index.html`;
      });

      resultsList.appendChild(li);
    });

    resultsList.classList.add('show');
    updateSelection(0); // Seleciona primeiro por padrão
  }

  // Fuzzy search com prioridade para a categoria atual
  function fuzzySearch(query, recipes, maxResults = 10, category = null) {
    query = query.trim().toLowerCase();
    if (!query) return [];

    let scored = Object.entries(recipes).map(([id, recipe]) => {
      const name = recipe.name.toLowerCase();
      const index = name.indexOf(query);
      if (index === -1) return null;

      // Score base é a posição da query no nome
      let score = index;

      // Prioriza receitas da categoria atual
      if (category && recipe.category === category) {
        score -= 1000;
      }

      return { id, recipe, score };
    }).filter(Boolean);

    scored.sort((a, b) => a.score - b.score);

    return scored.slice(0, maxResults);
  }

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      clearResults();
      return;
    }

    const matchedRecipes = fuzzySearch(query, recipes, 10, currentCategory);
    showResults(matchedRecipes);
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = resultsList.querySelectorAll('li.result-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateSelection(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateSelection(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].click();
      }
    } else if (e.key === 'Escape') {
      clearResults();
      searchInput.blur();
    }
  });

  // Fecha a lista de resultados ao clicar fora
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
      clearResults();
    }
  });
});
