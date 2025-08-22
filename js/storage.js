/**
 * Obtiene la colección personal desde localStorage
 * @returns {Array} Colección de piezas
 */
function getColeccion() {
  try {
    const coleccion = localStorage.getItem('coleccion');
    return coleccion ? JSON.parse(coleccion) : [];
  } catch (e) {
    console.error("❌ Error al leer colección:", e);
    return [];
  }
}

/**
 * Guarda la colección personal en localStorage
 * @param {Array} coleccion - Colección a guardar
 */
function saveColeccion(coleccion) {
  try {
    localStorage.setItem('coleccion', JSON.stringify(coleccion));
  } catch (e) {
    console.error("❌ Error al guardar colección:", e);
    alert("No se pudo guardar. Asegúrate de que tu navegador permite localStorage.");
  }
}

/**
 * Añade una nueva pieza a la colección
 * @param {Object} pieza - Pieza a añadir
 */
function addPieza(pieza) {
  const coleccion = getColeccion();
  coleccion.push(pieza);
  saveColeccion(coleccion);
}

/**
 * Elimina una pieza de la colección por su ID
 * @param {string} id - ID de la pieza
 */
function removePieza(id) {
  let coleccion = getColeccion();
  coleccion = coleccion.filter(p => p.id !== id);
  saveColeccion(coleccion);
}

/**
 * Sube una imagen y la convierte a base64
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string|null>} URL de la imagen o null
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
 * Edita una pieza existente (opcional)
 * @param {string} id - ID de la pieza
 */
function editarPieza(id) {
  const coleccion = getColeccion();
  const pieza = coleccion.find(p => p.id === id);
  if (!pieza) return;

  // Aquí podrías abrir un modal de edición
  alert("✏️ Función de edición de pieza no implementada aún.");
}