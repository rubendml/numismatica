// Variable global para el catálogo
window.CATALOGO = [];

/**
 * Carga el catálogo desde el archivo JSON
 * y lo prepara para ser usado por la app.
 */
async function loadCatalogo() {
  try {
    // Intentar cargar desde localStorage primero
    const saved = localStorage.getItem('catalogoPersonalizado');
    if (saved) {
      CATALOGO = JSON.parse(saved);
      console.log("✅ Catálogo personalizado cargado desde localStorage");
      if (typeof renderCatalogo === 'function') {
        renderCatalogo();
      }
      return;
    }

    // Si no, cargar desde el archivo JSON
    const res = await fetch('./data/catalogo.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    CATALOGO = await res.json();
    console.log("✅ Catálogo cargado desde JSON:", CATALOGO.length, "piezas");

    // Ordenar por valor y año
    CATALOGO.sort((a, b) => a.valor - b.valor || a.anio - b.anio);

    // Renderizar si la función existe
    if (typeof renderCatalogo === 'function') {
      renderCatalogo();
    }
  } catch (error) {
    console.error("❌ Error al cargar el catálogo:", error);
    const container = document.getElementById("section-catalogo");
    if (container) {
      container.innerHTML = `
        <p class="text-red-500 text-center py-10">
          Error al cargar el catálogo. Verifica que 'data/catalogo.json' exista y sea accesible.
        </p>
      `;
    }
  }
}

// Cargar al iniciar
document.addEventListener("DOMContentLoaded", loadCatalogo);