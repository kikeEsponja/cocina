const fs = require('fs').promises;
const path = require('path');
const { parseStringPromise } = require('xml2js');
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.findAll();
        res.json(recipes);
    } catch (error) {
        console.error('Error al obtener libros:', error);
        res.status(500).send('Error al obtener libros');
    }
});

const recipeSchema = new mongoose.Schema({
  title: String,
  ingredientes: String,
  preparacion: String,
  dificultad: String,
  cover: String,
});
recipeSchema.plugin(findOrCreate);

const Recipe = mongoose.model('Recipe', recipeSchema);

async function readMetadata(jsonFilePath) {
  const metadataContent = await fs.readFile(jsonFilePath, 'utf-8');
  const metadata = JSON.parse(metadataContent);
  
  return {
    title: metadata.title || '',
    ingredientes: metadata.ingredientes || '',
    preparacion: metadata.preparacion || '',
    dificultad: metadata.dificultad || '',
    cover: metadata.cover || ''
  };
}

async function processRecipes() {
  try {
    const recipesDir = path.join(__dirname, 'src', 'recipes');
    console.log(`Leyendo directorio: ${recipesDir}`);
    const recipeFolders = await fs.readdir(recipesDir);
    console.log(`Carpetas encontradas: ${recipeFolders.length}`);

    for (const folderName of recipeFolders) {
      console.log(`Procesando carpeta: ${folderName}`);
      const metadataPath = path.join(recipesDir, folderName, 'metadata.json');
      const metadata = await readMetadata(metadataPath);
      console.log(`Metadatos leídos: ${metadata.title}`);

      if (metadata.title) {
        // Buscar receta existente por título
        const existingRecipe = await Recipe.findOne({ title: metadata.title });
        if (!existingRecipe) {
          console.log(`Creando nueva receta: ${metadata.title}`);
          const recipe = new Recipe(metadata);
          const created = await recipe.save();
          if (created) {
            console.log("Receta guardada:", recipe.title);
          } else {
            console.log("No se pudo guardar la receta");
          }
        } else {
          console.log(`La receta ya existe, omitiendo: ${metadata.title}`);
        }
      } else {
        console.log("Archivo JSON sin título");
      }
    }
    console.log('Proceso de recetas finalizado.');
  } catch (error) {
    console.error('Ocurrió un error durante el procesamiento de las recetas:', error);
  }
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return processRecipes()
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
  });

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});