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