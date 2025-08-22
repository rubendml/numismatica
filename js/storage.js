/**
 * Obtiene la colección personal
 * @returns {Array} Colección
 */
function getColeccion() {
  try {
    const coleccion = localStorage.getItem('coleccion');
    return coleccion ? JSON.parse(coleccion) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Guarda la colección
 * @param {Array} coleccion
 */
function saveColeccion(coleccion) {
  try {
    localStorage.setItem('coleccion', JSON.stringify(coleccion));
  } catch (e) {
    alert("No se pudo guardar. Verifica tu navegador.");
  }
}

/**
 * Añade una pieza a la colección
 * @param {Object} pieza
 */
function addPieza(pieza) {
  const coleccion = getColeccion();
  coleccion.push(pieza);
  saveColeccion(coleccion);
}

/**
 * Elimina una pieza por ID
 * @param {string} id
 */
function removePieza(id) {
  let coleccion = getColeccion();
  coleccion = coleccion.filter(p => p.id !== id);
  saveColeccion(coleccion);
}

/**
 * Sube una imagen
 * @param {File} file
 * @returns {Promise<string|null>}
 */
async function uploadImage(file) {
  if (!file) return null;
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/**
 * Actualiza la colección con los datos más recientes del catálogo
 */
function actualizarColeccionConCatalogo() {
  const coleccion = getColeccion();
  if (coleccion.length === 0 || CATALOGO.length === 0) return;

  const catalogoMap = {};
  CATALOGO.forEach(item => {
    catalogoMap[item.id] = item;
  });

  const actualizada = coleccion.map(pieza => {
    const nuevoDatos = catalogoMap[pieza.catalogoId];
    if (nuevoDatos) {
      return {
        ...pieza,
        denominacion: nuevoDatos.denominacion,
        tipo: nuevoDatos.tipo,
        tema: nuevoDatos.tema,
        material: nuevoDatos.material,
        rareza: nuevoDatos.rareza,
        anio: nuevoDatos.anio
      };
    }
    return pieza;
  });

  if (actualizada.some((p, i) => p !== coleccion[i])) {
    saveColeccion(actualizada);
    console.log("✅ Colección actualizada con los últimos datos del catálogo.");
  }
}
