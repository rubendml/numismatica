window.DATA = {
  monedas: [],
  billetes: [],
  coleccion: []
};

async function loadData() {
  try {
    const monedasRes = await fetch('data/monedas.json');
    const billetesRes = await fetch('data/billetes.json');
    const coleccionRes = await fetch('data/coleccion_ruben.json');

    if (!monedasRes.ok || !billetesRes.ok || !coleccionRes.ok) {
      throw new Error("Error al cargar los datos");
    }

    DATA.monedas = await monedasRes.json();
    DATA.billetes = await billetesRes.json();
    DATA.coleccion = await coleccionRes.json();

    console.log("Datos cargados correctamente:", DATA);
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudieron cargar los datos. Verifica que los archivos JSON existen.");
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", loadData);