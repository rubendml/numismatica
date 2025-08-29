// --- CONFIGURACIÓN DE SUPABASE ---
// ⚠️ Reemplaza con tus credenciales
const SUPABASE_URL = 'https://sicrjwhjbwmbmcohydyr.supabase.co'; // ← Cambia esto
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpY3Jqd2hqYndtYm1jb2h5ZHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MDAzNzksImV4cCI6MjA3MjA3NjM3OX0.fS7MONe-OE1hgT6qUVHBRhB-nR1da3I6UGs4n5VKVJk'; // ← Cambia esto

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONFIGURACIÓN ---
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let editandoId = null;
let CATALOGO = [];
let coleccion = [];

// --- MOSTRAR SECCIÓN ---
function showSection(section) {
  document.querySelectorAll('div[id^="section-"]').forEach(el => el.classList.add('hidden'));
  document.getElementById(`section-${section}`).classList.remove('hidden');

  // Botones activos
  document.querySelectorAll('header button').forEach(btn => {
    btn.classList.remove('bg-amber-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600');
    btn.classList.add('bg-gray-300');
  });

  const active = document.querySelector(`button[onclick="showSection('${section}')"]`);
  if (active) {
    active.classList.remove('bg-gray-300');
    if (section === 'catalogo') active.classList.add('bg-amber-600');
    if (section === 'coleccion') active.classList.add('bg-blue-600');
    if (section === 'add-denominacion') active.classList.add('bg-purple-600');
  }

  if (section === 'catalogo') renderCatalogo();
  if (section === 'coleccion') renderColeccion();
  if (section === 'add-denominacion') {
    // Reiniciar formulario
    if (editandoId) {
      document.querySelector('#add-denominacion-form button[type="submit"]').textContent = 'Guardar Cambios';
      document.querySelector('#add-denominacion-form button[type="submit"]').classList.remove('bg-purple-600');
      document.querySelector('#add-denominacion-form button[type="submit"]').classList.add('bg-blue-600');
    } else {
      document.querySelector('#add-denominacion-form button[type="submit"]').textContent = 'Añadir al Catálogo';
      document.querySelector('#add-denominacion-form button[type="submit"]').classList.remove('bg-blue-600');
      document.querySelector('#add-denominacion-form button[type="submit"]').classList.add('bg-purple-600');
    }
  }
}

// --- CARGAR CATÁLOGO DESDE SUPABASE ---
async function cargarCatalogo() {
  const { data, error } = await supabase.from('catalogo').select('*');
  if (error) {
    console.error('❌ Error al cargar catálogo:', error);
    document.getElementById('section-catalogo').innerHTML = `
      <p class="text-red-500 text-center py-10">
        No se pudo cargar el catálogo. Verifica tu conexión.
      </p>`;
    return;
  }
  CATALOGO = data;
  localStorage.setItem('catalogo', JSON.stringify(data));
  renderCatalogo();
}

// --- CARGAR COLECCIÓN DESDE SUPABASE ---
async function cargarColeccion() {
  const { data, error } = await supabase.from('coleccion').select('*');
  if (error) {
    console.error('❌ Error al cargar colección:', error);
    return;
  }
  coleccion = data;
  localStorage.setItem('miColeccion', JSON.stringify(data));
  renderColeccion();
}

// --- FILTROS Y PAGINACIÓN ---
function getFilteredCatalogo() {
  const tipo = document.getElementById('filter-tipo')?.value || '';
  const denom = (document.getElementById('search-input')?.value || '').toLowerCase();
  const anio = document.getElementById('filter-anio')?.value || '';

  return CATALOGO.filter(item => {
    const matchesTipo = !tipo || item.tipo === tipo;
    const matchesDenom = !denom || item.denominacion.toLowerCase().includes(denom);
    const matchesAnio = !anio || item.anio == anio;
    return matchesTipo && matchesDenom && matchesAnio;
  }).sort((a, b) => a.valor - b.valor || a.anio - b.anio);
}

// --- RENDERIZAR CATÁLOGO CON EDICIÓN Y ELIMINACIÓN ---
function renderCatalogo() {
  const container = document.getElementById("section-catalogo");
  if (!container) return;
  container.classList.remove("hidden");
  container.innerHTML = "";

  const filtered = getFilteredCatalogo();
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  container.innerHTML = `
    <h2 class="section-title">Catálogo Numismático</h2>
    <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex-1 max-w-md">
        <input type="text" id="search-input" placeholder="Buscar moneda o billete..." class="form-input w-full px-4 py-2 rounded-lg" oninput="currentPage=1;renderCatalogo()">
      </div>
      <select id="filter-tipo" class="form-select px-4 py-2 rounded-lg bg-gray-700" onchange="currentPage=1;renderCatalogo()">
        <option value="">Todos los tipos</option>
        <option value="Moneda">Monedas</option>
        <option value="Billete">Billetes</option>
      </select>
    </div>
  `;

  if (paginatedItems.length === 0) {
    container.innerHTML += '<p class="text-amber-200 text-center py-10">No se encontraron piezas.</p>';
    return;
  }

  const grid = document.createElement("div");
  grid.id = "catalogo-grid";
  grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
  container.appendChild(grid);

  paginatedItems.forEach(item => {
    const tiene = coleccion.some(p => p.catalogo_id === item.id);
    const card = document.createElement("div");
    card.className = `card bg-gray-800 border-2 rounded-xl shadow-lg overflow-hidden ${tiene ? "border-green-500" : "border-gray-600"}`;
    card.innerHTML = `
      <div class="p-5">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-xl font-bold ${tiene ? "text-green-300" : "text-amber-100"}">${item.denominacion} (${item.anio})</h3>
          <button onclick="marcarComoTengo('${item.id}')" class="ml-2 px-3 py-1 text-sm font-semibold rounded-full ${tiene ? "bg-green-700 text-green-100 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}" ${tiene ? "disabled" : ""}>
            ${tiene ? "✅ Tienes" : "➕ Añadir"}
          </button>
        </div>
        <p class="text-sm text-amber-200"><strong>Tipo:</strong> ${item.tipo}</p>
        <p class="text-sm text-amber-200"><strong>Material:</strong> ${item.material}</p>
        <p class="text-sm text-amber-200"><strong>Tema:</strong> ${item.tema || "General"}</p>
        <p class="text-sm text-amber-200"><strong>Rareza:</strong> ${item.rareza}</p>
        <p class="text-sm text-amber-300 mt-2">${item.observaciones}</p>

        <!-- Botones de editar/eliminar -->
        <div class="mt-4 flex justify-end gap-2">
          <button 
            onclick="editarDenominacionDesdeCatalogo('${item.id}')" 
            class="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition"
            title="Editar esta pieza">
            ✏️ Editar
          </button>
          <button 
            onclick="eliminarDenominacionDesdeCatalogo('${item.id}')" 
            class="text-red-400 hover:text-red-300 text-sm font-medium transition"
            title="Eliminar esta pieza">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Paginación
  const pagination = document.createElement("div");
  pagination.id = "catalogo-pagination";
  pagination.className = "flex justify-center mt-8 space-x-2";
  pagination.innerHTML = `
    <button onclick="prevPage(${totalPages})" class="px-4 py-2 bg-gray-600 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-500'}">
      ← Anterior
    </button>
    <span class="text-amber-200">Página ${currentPage} de ${totalPages || 1}</span>
    <button onclick="nextPage(${totalPages})" class="px-4 py-2 bg-gray-600 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-500'}">
      Siguiente →
    </button>
  `;
  container.appendChild(pagination);
}

function prevPage(totalPages) {
  if (currentPage > 1) {
    currentPage--;
    renderCatalogo();
  }
}

function nextPage(totalPages) {
  if (currentPage < totalPages) {
    currentPage++;
    renderCatalogo();
  }
}

// --- MIS COLECCIÓN ---
function renderColeccion() {
  const container = document.getElementById('coleccion-items');
  if (!container) return;

  container.innerHTML = '';

  if (!coleccion || coleccion.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No tienes ninguna pieza aún.</p>';
    return;
  }

  coleccion.forEach(item => {
    const catalogoItem = CATALOGO.find(c => c.id === item.catalogo_id);
    const denominacion = catalogoItem ? catalogoItem.denominacion : item.denominacion;

    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-lg shadow border-l-4 border-amber-500';
    card.innerHTML = `
      <div class="flex justify-between">
        <div>
          <h4 class="font-semibold">${denominacion} (${item.anio})</h4>
          <p class="text-sm text-gray-600">Cantidad: ${item.cantidad} | Estado: ${item.grado}</p>
          <p class="text-sm text-green-600">Compra: $${item.precio_compra?.toLocaleString() || 0} COP</p>
        </div>
        <button onclick="removePieza('${item.id}'); renderColeccion()" class="text-red-500 hover:text-red-700 text-xl">×</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- MARCAR COMO "TIENES" ---
async function marcarComoTengo(id) {
  const yaTiene = coleccion.some(p => p.catalogo_id === id);
  if (yaTiene) {
    alert('⚠️ Ya tienes esta pieza en tu colección.');
    return;
  }

  const nuevaPieza = {
    id: Date.now().toString(),
    catalogo_id: id,
    anio: '2024',
    grado: 'BU',
    cantidad: '1',
    precio_compra: '0'
  };

  const { data, error } = await supabase.from('coleccion').insert([nuevaPieza]);
  if (error) {
    console.error('❌ Error al guardar:', error);
    alert('No se pudo añadir la pieza');
  } else {
    coleccion.push(nuevaPieza);
    localStorage.setItem('miColeccion', JSON.stringify(coleccion));
    alert('✅ Pieza añadida a tu colección');
    renderCatalogo();
    renderColeccion();
  }
}

// --- ELIMINAR PIEZA DE LA COLECCIÓN ---
async function removePieza(id) {
  const { error } = await supabase.from('coleccion').delete().match({ id });
  if (error) {
    console.error('❌ Error al eliminar:', error);
  } else {
    coleccion = coleccion.filter(p => p.id !== id);
    localStorage.setItem('miColeccion', JSON.stringify(coleccion));
    renderColeccion();
  }
}

// --- EDITAR DENOMINACIÓN DESDE EL CATÁLOGO ---
function editarDenominacionDesdeCatalogo(id) {
  const item = CATALOGO.find(d => d.id === id);
  if (!item) return;

  document.getElementById('denom-tipo').value = item.tipo;
  document.getElementById('denom-denominacion').value = item.denominacion;
  document.getElementById('denom-anio').value = item.anio;
  document.getElementById('denom-material').value = item.material;
  document.getElementById('denom-tema').value = item.tema || '';
  document.getElementById('denom-rareza').value = item.rareza;
  document.getElementById('denom-observaciones').value = item.observaciones || '';

  const btn = document.querySelector('#add-denominacion-form button[type="submit"]');
  btn.textContent = 'Guardar Cambios';
  btn.classList.remove('bg-purple-600');
  btn.classList.add('bg-blue-600');

  editandoId = id;
  showSection('add-denominacion');
}

// --- ELIMINAR DENOMINACIÓN DESDE EL CATÁLOGO ---
async function eliminarDenominacionDesdeCatalogo(id) {
  const item = CATALOGO.find(d => d.id === id);
  if (!item) return;

  const confirmado = confirm(`¿Eliminar "${item.denominacion} (${item.anio})" del catálogo?`);
  if (!confirmado) return;

  const { error } = await supabase.from('catalogo').delete().match({ id });
  if (error) {
    console.error('❌ Error al eliminar:', error);
    alert('No se pudo eliminar la pieza');
  } else {
    CATALOGO = CATALOGO.filter(d => d.id !== id);
    localStorage.setItem('catalogo', JSON.stringify(CATALOGO));
    alert('🗑️ Denominación eliminada del catálogo.');
    renderCatalogo();
  }
}

// --- FORMULARIO DE AÑADIR/EDITAR ---
document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos desde localStorage
  const savedCatalogo = localStorage.getItem('catalogo');
  if (savedCatalogo) CATALOGO = JSON.parse(savedCatalogo);

  const savedColeccion = localStorage.getItem('miColeccion');
  if (savedColeccion) coleccion = JSON.parse(savedColeccion);

  // Cargar desde Supabase
  cargarCatalogo();
  cargarColeccion();

  // Formulario
  const form = document.getElementById('add-denominacion-form');
  form.onsubmit = async function (e) {
    e.preventDefault();

    const tipo = document.getElementById('denom-tipo').value;
    const denominacion = document.getElementById('denom-denominacion').value;
    const anio = parseInt(document.getElementById('denom-anio').value);
    const material = document.getElementById('denom-material').value;
    const tema = document.getElementById('denom-tema').value || 'General';
    const rareza = document.getElementById('denom-rareza').value;
    const observaciones = document.getElementById('denom-observaciones').value || '';
    const valor = parseFloat(denominacion.replace(/[^0-9.]/g, '')) || 0;

    const id = editandoId || `custom-${tipo.toLowerCase()}-${denominacion.replace(/\$/g, '').replace(',', '')}-${anio}`;

    const data = { id, tipo, denominacion, anio, material, tema, rareza, observaciones, valor };

    if (editandoId) {
      const { error } = await supabase.from('catalogo').update(data).match({ id });
      if (error) {
        alert('No se pudo actualizar');
      } else {
        const index = CATALOGO.findIndex(d => d.id === id);
        if (index !== -1) CATALOGO[index] = data;
        editandoId = null;
        alert('✅ Actualizada');
      }
    } else {
      const { error } = await supabase.from('catalogo').insert([data]);
      if (error) {
        alert('No se pudo insertar');
      } else {
        CATALOGO.push(data);
        alert('✅ Añadida al catálogo');
      }
    }

    localStorage.setItem('catalogo', JSON.stringify(CATALOGO));
    form.reset();
    document.querySelector('#add-denominacion-form button[type="submit"]').textContent = 'Añadir al Catálogo';
    document.querySelector('#add-denominacion-form button[type="submit"]').classList.remove('bg-blue-600');
    document.querySelector('#add-denominacion-form button[type="submit"]').classList.add('bg-purple-600');
    showSection('catalogo');
  };

  // Mostrar sección inicial
  showSection('catalogo');
});

