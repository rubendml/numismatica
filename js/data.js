window.CATALOGO = [];
const FECHA_ACTUALIZACION = "29 de mayo de 2025"; // Cambia cada vez que actualices

async function loadCatalogo() {
  try {
    const res = await fetch('./data/catalogo.json?' + new Date().getTime());
    if (!res.ok) throw new Error('No se pudo cargar catalogo.json');
    window.CATALOGO = await res.json();

    // Mostrar fecha
    const welcome = document.getElementById('welcome-message');
    if (welcome) {
      welcome.innerHTML = `<p class="text-sm text-green-600 font-medium">✅ Última actualización: <strong>${FECHA_ACTUALIZACION}</strong></p>`;
    }

    // Activar botón de sincronización
    const btn = document.getElementById('btn-sincronizar');
    const msg = document.getElementById('mensaje-sincronizacion');
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 Sincronizar Colección';
    }
    if (msg) {
      msg.classList.remove('hidden');
      msg.textContent = 'Listo para sincronizar';
      msg.className = 'text-xs text-green-600 mt-1';
    }

    // Inicializar
    if (typeof renderCatalogo === 'function') renderCatalogo();
    if (typeof renderColeccion === 'function') renderColeccion();
    if (typeof populateAddForm === 'function') populateAddForm();

  } catch (error) {
    console.error('❌ Error en data.js:', error);
    document.getElementById('section-catalogo').innerHTML = `<p class="text-red-500 text-center py-10">Error al cargar el catálogo. Verifica que 'data/catalogo.json' exista.</p>`;

    // Mostrar error en sincronización
    const msg = document.getElementById('mensaje-sincronizacion');
    if (msg) {
      msg.classList.remove('hidden');
      msg.textContent = '❌ Error al cargar el catálogo';
      msg.className = 'text-xs text-red-600 mt-1';
    }
  }
}

// Cargar al inicio
loadCatalogo();