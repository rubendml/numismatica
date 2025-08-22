function getColeccion() {
  try {
    return JSON.parse(localStorage.getItem('coleccion') || '[]');
  } catch (e) {
    console.warn('Error leyendo colección:', e);
    return [];
  }
}

function saveColeccion(coleccion) {
  try {
    localStorage.setItem('coleccion', JSON.stringify(coleccion));
  } catch (e) {
    alert('No se pudo guardar la colección.');
  }
}

function addPieza(pieza) {
  const coleccion = getColeccion();
  coleccion.push(pieza);
  saveColeccion(coleccion);
}

function removePieza(id) {
  const coleccion = getColeccion().filter(p => p.id !== id);
  saveColeccion(coleccion);
}

async function uploadImage(file) {
  if (!file) return null;
  const reader = new FileReader();
  return new Promise(resolve => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function actualizarColeccionConCatalogo() {
  const coleccion = getColeccion();
  if (coleccion.length === 0 || !window.CATALOGO) return;

  const catalogoMap = Object.fromEntries(window.CATALOGO.map(d => [d.id, d]));
  const actualizada = coleccion.map(p => {
    const nuevo = catalogoMap[p.catalogoId];
    return nuevo ? { ...p, ...nuevo } : p;
  });

  if (actualizada.some((p, i) => p !== coleccion[i])) {
    saveColeccion(actualizada);
    console.log('✅ Colección actualizada con datos del catálogo');
  }
}
