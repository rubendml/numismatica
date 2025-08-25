// --- AÑADIR A COLECCIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  const addForm = document.getElementById('add-form');
  if (addForm) {
    addForm.onsubmit = async function(e) {
      e.preventDefault();

      // Validar que se haya seleccionado una denominación
      const catalogoId = document.getElementById('add-denominacion').value;
      if (!catalogoId) {
        alert('❌ Debes seleccionar una denominación');
        return;
      }

      const id = Date.now().toString();
      const file = document.getElementById('add-imagen')?.files[0];
      const imagen = file ? await uploadImage(file) : null;

      const pieza = {
        id,
        catalogoId,
        anio: document.getElementById('add-anio').value,
        grado: document.getElementById('add-grado').value,
        cantidad: document.getElementById('add-cantidad').value,
        precioCompra: document.getElementById('add-precio').value,
        imagen
      };

      addPieza(pieza);
      alert('✅ Pieza añadida a tu colección');
      addForm.reset();
      showSection('coleccion');
    };
  }

  // --- MARCAR COMO "TIENES" DESDE EL CATÁLOGO ---
  // Esta función se llama cuando se hace clic en "Tienes" en el catálogo
  window.marcarComoTengo = function(catalogoId) {
    const coleccion = getColeccion();
    const yaTiene = coleccion.some(p => p.catalogoId === catalogoId);

    if (yaTiene) {
      alert('⚠️ Ya tienes esta pieza en tu colección.');
      return;
    }

    // Añadir como una pieza con cantidad 1 y grado BU por defecto
    const nuevaPieza = {
      id: Date.now().toString(),
      catalogoId,
      cantidad: '1',
      grado: 'BU',
      precioCompra: '0',
      imagen: null
    };

    addPieza(nuevaPieza);
    alert('✅ Pieza marcada como "Tienes"');
    renderCatalogo(); // Actualizar vista
    renderColeccion(); // Actualizar colección
  };
});
