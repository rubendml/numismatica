function getColeccion() {
  try {
    const coleccion = localStorage.getItem('coleccion');
    return coleccion ? JSON.parse(coleccion) : [];
  } catch (e) {
    console.error("Error al leer colección:", e);
    return [];
  }
}

function saveColeccion(coleccion) {
  try {
    localStorage.setItem('coleccion', JSON.stringify(coleccion));
  } catch (e) {
    console.error("Error al guardar colección:", e);
    alert("No se pudo guardar. Asegúrate de que tu navegador permite localStorage.");
  }
}

function addPieza(pieza) {
  const coleccion = getColeccion();
  coleccion.push(pieza);
  saveColeccion(coleccion);
}

function removePieza(id) {
  let coleccion = getColeccion();
  coleccion = coleccion.filter(p => p.id !== id);
  saveColeccion(coleccion);
}

async function uploadImage(file) {
  if (!file) return null;
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
