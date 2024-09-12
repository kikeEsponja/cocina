        // Función para cargar las recetas desde la API
        async function cargarRecetas() {
          const loader = document.getElementById('loader');
          loader.style.display = 'block';

        const response = await fetch('https://api.edamam.com/doc/open-api/food-db-v2.json');
          //const response = await fetch('https://recipesapi.online/v1/api/recipes');
          //const response = await fetch('https://localhost:3021/api/recipes');
          const recipes = await response.json();
          const recipesContainer = document.getElementById('recipesContainer');

          loader.style.display = 'none';

          recipes.forEach(recipes => {
            const recipeElement = document.createElement('div');
            recipeElement.classList.add('recipe')
            recipeElement.innerHTML = `
                <h4>${recipes.recipe.label}</h4>
                <img src="${recipes.recipe.image}" alt="${recipes.recipe.cautions}" class="recipeImg">
                <p><strong>Category:</strong> ${recipes.recipe.ingredients[0]["foodCategory"]}</p>
                <p><strong>Cautions:</strong> ${recipes.recipe.cautions}</p>
            `;

            recipeElement.addEventListener('click', () => {
                localStorage.setItem('recipeDetails', JSON.stringify(recipes));
                window.location.href = `./public/itemDetail.html?id=${recipes.recipe.label}`;
            });
            recipesContainer.appendChild(recipeElement);
    });
}

      // Función para cargar las recetas recién agregadas
      async function cargarRecetasRecientes() {
          // Lógica para obtener las recetas recién agregadas y mostrarlas en el contenedor correspondiente
      }

      // Cuando la página se carga, cargar las recetas
      window.onload = function() {
          cargarRecetas();
          cargarRecetasRecientes();
      };

      async function searchRecipes() {
          // Obtener el valor del input de búsqueda
          const query = document.getElementById('searchInput').value;
          
          try {
              // Realizar una solicitud GET al endpoint de búsqueda del backend
              const response = await fetch(`https://localhost:3012/api/search?query=${encodeURIComponent(query)}`);
              
              // Verificar si la solicitud fue exitosa
              if (response.ok) {
                  // Convertir la respuesta a formato JSON
                  const recipes = await response.json();

                  // Llamar a una función para mostrar las recetas en el frontend
                  displayRecipes(recipes);
              } else {
                  // Manejar el caso de error
                  console.error('Error al buscar recetas:', response.statusText);
              }
          } catch (error) {
              console.error('Error al buscar recetas:', error);
          }
      }

      // Función para mostrar las recetas en el frontend
      function displayRecipes(recipes) {
          const recipesContainer = document.getElementById('recipesContainer');
          recipesContainer.innerHTML = ''; // Limpiar el contenedor de recetas antes de agregar nuevas

          // Iterar sobre todas las recetas y agregarlas al contenedor
          recipes.forEach(recipes => {
              const recipeElement = document.createElement('div');
              recipeElement.classList.add('recipe');
              recipeElement.innerHTML = `
                  <h4>${recipes.recipe.label}</h4>
                  <p>Dificultad: ${recipes.recipe.cautions}</p>
                  <img src="${recipes.recipe.image}" alt="${recipes.recipe.label}" class="recipeImg">
              `;

              recipeElement.addEventListener('click', () => {
                  localStorage.setItem('recipeDetails', JSON.stringify(recipes));
                  window.location.href = `../public/itemDetail.html?id=${recipes.recipe.id}`;
              });
              recipesContainer.appendChild(recipeElement);
          });
      }