window.CATALOGO = [];

async function loadCatalogo() {
  try {
    const res = await fetch('data/catalogo.json');
    CATALOGO = await res.json();
    console.log("Catálogo cargado:", CATALOGO);
  } catch (error) {
    console.error("Error al cargar catálogo:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadCatalogo);