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
    if (section === 'add') active.classList.add('bg-green-600');
    if (section === 'add-denominacion') active.classList.add('bg-purple-600');
  }

  if (section === 'catalogo') renderCatalogo();
  if (section === 'coleccion') renderColeccion();
  if (section === 'add') populateAddForm();
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
  populateAddForm();
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
  const denom = (document.getElementById('filter-denominacion')?.value || '').toLowerCase();
  const anio = document.getElementById('filter-anio')?.value || '';
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();

  return CATALOGO.filter(item => {
    const matchesTipo = !tipo || item.tipo === tipo;
    const matchesDenom = !denom || item.denominacion.toLowerCase().includes(denom);
    const matchesAnio = !anio || item.anio == anio;
    const matchesSearch = !search ||
      item.denominacion.toLowerCase().includes(search) ||
      (item.tema && item.tema.toLowerCase().includes(search)) ||
      (item.material && item.material.toLowerCase().includes(search));

    return matchesTipo && matchesDenom && matchesAnio && matchesSearch;
  }).sort((a, b) => a.valor - b.valor || a.anio - b.anio);
}

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
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <div class="relative">
            <input type="text" id="search-input" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" placeholder="Buscar..." oninput="currentPage=1;renderCatalogo()">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div class="w-32">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select id="filter-tipo" class="w-full border-gray-300 rounded-md" onchange="currentPage=1;renderCatalogo()">
            <option value="">Todos</option>
            <option value="Moneda">Moneda</option>
            <option value="Billete">Billete</option>
          </select>
        </div>
        <div class="w-32">
          <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <input type="number" id="filter-anio" class="w-full border-gray-300 rounded-md" placeholder="2023" oninput="currentPage=1;renderCatalogo()">
        </div>
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Denominación</label>
          <input type="text" id="filter-denominacion" class="w-full border-gray-300 rounded-md" placeholder="$50" oninput="currentPage=1;renderCatalogo()">
        </div>
      </div>
    </div>
  `;

  if (paginatedItems.length === 0) {
    container.innerHTML += '<p class="text-gray-500 text-center py-10">No se encontraron piezas.</p>';
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
  container.appendChild(grid);

  paginatedItems.forEach(item => {
    const tiene = coleccion.some(p => p.catalogo_id === item.id);
    const card = document.createElement("div");
    card.className = `bg-white rounded-xl shadow-md overflow-hidden border-4 ${tiene ? "border-green-500" : "border-gray-200"} card`;
    card.innerHTML = `
      <div class="p-5">
        <div class="flex justify-between items-start">
          <h3 class="text-xl font-bold ${tiene ? "text-green-700" : "text-gray-800"}">${item.denominacion} (${item.anio})</h3>
          <button onclick="marcarComoTengo('${item.id}')" class="ml-2 px-3 py-1 text-sm font-semibold rounded-full ${tiene ? "bg-green-100 text-green-800 cursor-not-allowed" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}" ${tiene ? "disabled" : ""}>
            ${tiene ? "✅ Tienes" : "➕ Añadir"}
          </button>
        </div>
        <p class="text-sm text-gray-500"><strong>Tipo:</strong> ${item.tipo}</p>
        <p class="text-sm text-gray-500"><strong>Tema:</strong> ${item.tema || "General"}</p>
        <p class="text-sm text-gray-500"><strong>Material:</strong> ${item.material}</p>
        <p class="text-sm text-gray-500"><strong>Rareza:</strong> ${item.rareza}</p>
        <p class="text-sm text-gray-600 mt-2">${item.observaciones}</p>
      </div>
    `;
    grid.appendChild(card);
  });

  const pagination = document.createElement("div");
  pagination.className = "mt-8 flex justify-center items-center gap-4";
  pagination.innerHTML = `
    <button onclick="prevPage(${totalPages})" class="px-4 py-2 bg-gray-300 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}">
      ← Anterior
    </button>
    <span class="text-gray-700">Página ${currentPage} de ${totalPages || 1}</span>
    <button onclick="nextPage(${totalPages})" class="px-4 py-2 bg-gray-300 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}">
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

// --- ELIMINAR PIEZA ---
async function removePieza(id) {
  const { error } = await supabase.from('coleccion').delete().match({ id });
  if (error) {
    console.error('❌ Error al eliminar:', error);
  } else {
    coleccion = coleccion.filter(p => p.id !== id);
    localStorage.setItem('miColeccion', JSON.stringify(coleccion));
  }
}

// --- INICIALIZAR AL CARGAR ---
document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos desde localStorage (como respaldo)
  const savedCatalogo = localStorage.getItem('catalogo');
  if (savedCatalogo) CATALOGO = JSON.parse(savedCatalogo);

  const savedColeccion = localStorage.getItem('miColeccion');
  if (savedColeccion) coleccion = JSON.parse(savedColeccion);

  // Cargar desde Supabase
  cargarCatalogo();
  cargarColeccion();

  // Mostrar sección inicial
  showSection('catalogo');
});

