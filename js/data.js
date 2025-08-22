window.CATALOGO = [];

async function loadCatalogo() {
  try {
    const res = await fetch('./data/catalogo.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    CATALOGO = await res.json();
    console.log("✅ Catálogo cargado:", CATALOGO.length, "piezas");
    
    // Renderizar después de cargar
    if (typeof renderCatalogo === 'function') {
      renderCatalogo();
    }
  } catch (error) {
    console.error("❌ Error al cargar catálogo:", error);
    document.getElementById("section-catalogo").innerHTML = `
      <p class="text-red-500 text-center py-10">
        Error al cargar el catálogo. Verifica que 'data/catalogo.json' exista y sea accesible.
      </p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadCatalogo);
