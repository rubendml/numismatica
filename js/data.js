window.CATALOGO = [];

async function loadCatalogo() {
  try {
    // Intentar cargar desde localStorage
    const saved = localStorage.getItem('catalogoPersonalizado');
    if (saved) {
      CATALOGO = JSON.parse(saved);
      console.log("Catálogo personalizado cargado desde localStorage");
      return;
    }

    // Si no, cargar desde JSON original
    const res = await fetch('data/catalogo.json');
    CATALOGO = await res.json();
    console.log("Catálogo cargado desde JSON");
  } catch (error) {
    console.error("Error al cargar catálogo:", error);
    alert("No se pudo cargar el catálogo. Verifica los archivos.");
  }
}

document.addEventListener("DOMContentLoaded", loadCatalogo);