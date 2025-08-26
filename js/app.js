// --- CONFIGURACIÓN ---
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let editandoId = null;

// URL del proxy (sin espacios)
const PROXY_URL = 'https://proxy-numismatica.vercel.app';

// Inicializa CATALOGO
let CATALOGO = [];

// Fecha de actualización
const FECHA_ACTUALIZACION = "29 de mayo de 2025";

// --- CARGAR CATÁLOGO DESDE EL PROXY ---
async function importarDesdeGitHub() {
  const welcome = document.getElementById('welcome-message');

  try {
    const response = await fetch(`${PROXY_URL}/api/sync?path=data/catalogo.json`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar el archivo`);
    }

    const nuevoCatalogo = await response.json();
    
    if (!Array.isArray(nuevoCatalogo)) {
      throw new Error('El catálogo no tiene el formato esperado (debe ser un array)');
    }

    CATALOGO = nuevoCatalogo;

    // Guardar en localStorage
    localStorage.setItem('catalogoPersonalizado', JSON.stringify(CATALOGO));

    // Mostrar fecha de actualización
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

    alert('✅ Catálogo actualizado desde GitHub.');
    if (typeof renderCatalogo === 'function') renderCatalogo();
    if (typeof renderColeccion === 'function') renderColeccion();
    if (typeof populateAddForm === 'function') populateAddForm();
  } catch (error) {
    console.error('❌ Error al cargar desde el proxy:', error);

    if (welcome) {
      welcome.innerHTML = `<p class="text-sm text-red-600 font-medium">❌ Error al cargar el catálogo: ${error.message}</p>`;
    }

    const msg = document.getElementById('mensaje-sincronizacion');
    if (msg) {
      msg.classList.remove('hidden');
      msg.textContent = '❌ Error al cargar el catálogo';
      msg.className = 'text-xs text-red-600 mt-1';
    }

    const container = document.getElementById('section-catalogo');
    if (container) {
      container.innerHTML = `
        <p class="text-red-500 text-center py-10">
          No se pudo cargar el catálogo. Verifica tu conexión o que el archivo exista.
        </p>`;
    }
  }
}

// --- INICIALIZAR AL CARGAR ---
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('catalogoPersonalizado');
  if (saved) {
    try {
      CATALOGO = JSON.parse(saved);
    } catch (e) {
      console.warn('No se pudo cargar el catálogo local');
    }
  }
  importarDesdeGitHub();
});

