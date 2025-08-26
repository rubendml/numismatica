// data.js - Carga el catálogo usando el proxy
window.CATALOGO = [];
const FECHA_ACTUALIZACION = "29 de mayo de 2025";

// URL del proxy (sin espacios)
const PROXY_URL = 'https://numismatica-proxy.vercel.app';

async function loadCatalogo() {
  try {
    // ✅ Usa el proxy para cargar el catálogo
    const response = await fetch(`${PROXY_URL}/api/sync?path=data/catalogo.json`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar el catálogo`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('El catálogo no tiene formato de array');
    }

    window.CATALOGO = data;

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

    // Inicializar vistas
    if (typeof renderCatalogo === 'function') renderCatalogo();
    if (typeof renderColeccion === 'function') renderColeccion();
    if (typeof populateAddForm === 'function') populateAddForm();

  } catch (error) {
    console.error('❌ Error en data.js:', error);
    
    const container = document.getElementById('section-catalogo');
    if (container) {
      container.innerHTML = `
        <p class="text-red-500 text-center py-10">
          Error al cargar el catálogo. 
          <br>
          <small>Verifica tu conexión o que el archivo exista en GitHub.</small>
        </p>`;
    }

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
