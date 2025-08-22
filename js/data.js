// Variable global
window.CATALOGO = [];
const FECHA_ACTUALIZACION = "28 de mayo de 2025"; // Cambia esta fecha cada vez que actualices

/**
 * Carga el catálogo desde el JSON y actualiza la colección
 */
async function loadCatalogo() {
  try {
    const res = await fetch('./data/catalogo.json?' + new Date().getTime());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const nuevoCatalogo = await res.json();
    window.CATALOGO = nuevoCatalogo;

    // Mostrar mensaje de bienvenida
    const welcome = document.getElementById("welcome-message");
    if (welcome) {
      welcome.innerHTML = `
        <p class="text-sm text-green-600 font-medium">
          ✅ Última actualización: <strong>${FECHA_ACTUALIZACION}</strong>
        </p>
      `;
    }

    // Actualizar colección con nuevos datos del catálogo
    actualizarColeccionConCatalogo();

    // Renderizar
    if (typeof renderCatalogo === 'function') {
      renderCatalogo();
    }
    if (typeof renderColeccion === 'function') {
      renderColeccion();
    }
  } catch (error) {
    console.error("❌ Error al cargar el catálogo:", error);
    const container = document.getElementById("section-catalogo");
    if (container) container.innerHTML = `<p class="text-red-500 text-center py-10">Error al cargar el catálogo.</p>`;
  }
}

// Cargar al iniciar
document.addEventListener("DOMContentLoaded", loadCatalogo);
