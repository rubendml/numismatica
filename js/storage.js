// Colección personal
function getColeccion() {
  const coleccion = localStorage.getItem('coleccion');
  return coleccion ? JSON.parse(coleccion) : [];
}

function saveColeccion(coleccion) {
  localStorage.setItem('coleccion', JSON.stringify(coleccion));
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

// Subir imagen
async function uploadImage(file) {
  if (!file) return null;
  const reader = new FileReader();
  const result = await new Promise((resolve) => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
  return result;
}

// Editar pieza
function updatePieza(id, datos) {
  let coleccion = getColeccion();
  coleccion = coleccion.map(p => p.id === id ? { ...p, ...datos } : p);
  saveColeccion(coleccion);
}

// Borrar del catálogo
function removeDelCatalogo(id) {
  CATALOGO = CATALOGO.filter(item => item.id !== id);
  localStorage.setItem('catalogoPersonalizado', JSON.stringify(CATALOGO));
}