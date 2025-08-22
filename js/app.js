// Configuración de paginación
const ITEMS_PER_PAGE = 20;
let currentPage = 1;

function showSection(section) {
  document.getElementById("section-catalogo").classList.add("hidden");
  document.getElementById("section-coleccion").classList.add("hidden");
  document.getElementById("section-add").classList.add("hidden");
  document.getElementById("section-add-denominacion").classList.add("hidden");

  document.getElementById(`section-${section}`).classList.remove("hidden");

  // Resaltar botón activo
  const tabs = document.querySelectorAll("header button");
  tabs.forEach(btn => {
    btn.classList.remove("bg-amber-600", "bg-blue-600", "bg-green-600", "bg-purple-600");
    btn.classList.add("bg-gray-300");
  });

  const activeTab = document.querySelector(`button[onclick="showSection('${section}')"]`);
  if (activeTab) {
    activeTab.classList.remove("bg-gray-300");
    if (section === "catalogo") activeTab.classList.add("bg-amber-600");
    if (section === "coleccion") activeTab.classList.add("bg-blue-600");
    if (section === "add") activeTab.classList.add("bg-green-600");
    if (section === "add-denominacion") activeTab.classList.add("bg-purple-600");
  }

  if (section === "catalogo") renderCatalogo();
  if (section === "coleccion") renderColeccion();
  if (section === "add") populateAddForm();
}

// --- FILTROS Y BÚSQUEDA ---
function getFilteredCatalogo() {
  const tipoFilter = document.getElementById("filter-tipo")?.value || "";
  const denomFilter = (document.getElementById("filter-denominacion")?.value || "").toLowerCase();
  const anioFilter = document.getElementById("filter-anio")?.value || "";
  const searchFilter = (document.getElementById("search-input")?.value || "").toLowerCase();

  return CATALOGO.filter(item => {
    const matchesTipo = !tipoFilter || item.tipo === tipoFilter;
    const matchesDenom = !denomFilter || item.denominacion.toLowerCase().includes(denomFilter);
    const matchesAnio = !anioFilter || item.anio == anioFilter;
    const matchesSearch = !searchFilter || 
      item.denominacion.toLowerCase().includes(searchFilter) ||
      item.tema?.toLowerCase().includes(searchFilter) ||
      item.material?.toLowerCase().includes(searchFilter);

    return matchesTipo && matchesDenom && matchesAnio && matchesSearch;
  }).sort((a, b) => a.valor - b.valor || a.anio - b.anio);
}

// --- PAGINACIÓN ---
function renderCatalogo() {
  const container = document.getElementById("section-catalogo");
  container.innerHTML = "";

  const filtered = getFilteredCatalogo();
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(start, end);

  // Filtros y búsqueda
  container.innerHTML = `
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <div class="relative">
            <input type="text" id="search-input" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" placeholder="Nombre, tema, material..." oninput="currentPage=1;renderCatalogo()">
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
    container.innerHTML += "<p class='text-gray-500 text-center py-10'>No se encontraron piezas con esos filtros.</p>";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
  container.appendChild(grid);

  paginatedItems.forEach(item => {
    const tiene = getColeccion().some(p => p.catalogoId === item.id);
    const card = document.createElement("div");
    card.className = `bg-white rounded-xl shadow-md overflow-hidden border-4 ${tiene ? "border-green-500" : "border-gray-200"} card`;
    card.innerHTML = `
      <div class="p-5">
        <div class="flex justify-between items-start">
          <h3 class="text-xl font-bold ${tiene ? "text-green-700" : "text-gray-800"}">${item.denominacion} (${item.anio})</h3>
          <span class="px-3 py-1 text-sm font-semibold rounded-full ${tiene ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}">${tiene ? "✅ Tienes" : "❌ Falta"}</span>
        </div>
        <p class="text-sm text-gray-500"><strong>Tema:</strong> ${item.tema || "General"}</p>
        <p class="text-sm text-gray-500"><strong>Material:</strong> ${item.material}</p>
        <p class="text-sm text-gray-500"><strong>Rareza:</strong> ${item.rareza}</p>
        <p class="text-sm text-gray-600 mt-2">${item.observaciones}</p>
      </div>
    `;
    grid.appendChild(card);
  });

  // Controles de paginación
  const pagination = document.createElement("div");
  pagination.className = "mt-8 flex justify-center items-center gap-4";
  pagination.innerHTML = `
    <button onclick="prevPage(${totalPages})" class="px-4 py-2 bg-gray-300 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}" ${currentPage === 1 ? 'disabled' : ''}>
      ← Anterior
    </button>
    <span class="text-gray-700">Página ${currentPage} de ${totalPages || 1}</span>
    <button onclick="nextPage(${totalPages})" class="px-4 py-2 bg-gray-300 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}" ${currentPage === totalPages ? 'disabled' : ''}>
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
  const container = document.getElementById("coleccion-items");
  container.innerHTML = "";
  const coleccion = getColeccion();

  if (coleccion.length === 0) {
    container.innerHTML = "<p class='text-gray-500'>No tienes ninguna pieza aún. Ve a 'Añadir Pieza'.</p>";
    return;
  }

  coleccion.forEach((item, index) => {
    const catalogoItem = CATALOGO.find(c => c.id === item.catalogoId);
    const denominacion = catalogoItem ? catalogoItem.denominacion : item.denominacion;

    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow border-l-4 border-amber-500";
    card.innerHTML = `
      <div class="flex justify-between">
        <div>
          <h4 class="font-semibold">${denominacion} (${item.anio})</h4>
          <p class="text-sm text-gray-600">Cantidad: ${item.cantidad} | Estado: ${item.grado}</p>
          <p class="text-sm text-green-600">Compra: $${item.precioCompra.toLocaleString()} COP</p>
          ${item.imagen ? `<img src="${item.imagen}" alt="Foto" class="w-20 h-20 object-cover rounded mt-2">` : ''}
        </div>
        <div class="flex gap-2">
          <button onclick="editarPieza('${item.id}')" class="text-blue-500 hover:text-blue-700 text-xl">✏️</button>
          <button onclick="removePieza('${item.id}'); renderColeccion()" class="text-red-500 hover:text-red-700 text-xl">×</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- AÑADIR PIEZA ---
function populateAddForm() {
  const select = document.getElementById("add-denominacion");
  select.innerHTML = "";

  CATALOGO.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.denominacion} (${item.anio})`;
    select.appendChild(opt);
  });
}

// --- AÑADIR DENOMINACIÓN ---
document.getElementById("add-denominacion-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const tipo = document.getElementById("denom-tipo").value;
  const denominacion = document.getElementById("denom-denominacion").value;
  const anio = parseInt(document.getElementById("denom-anio").value);
  const material = document.getElementById("denom-material").value;
  const tema = document.getElementById("denom-tema").value || "General";
  const rareza = document.getElementById("denom-rareza").value;
  const observaciones = document.getElementById("denom-observaciones").value || "";
  const valor = parseFloat(denominacion.replace(/[^0-9.]/g, ''));

  const id = `custom-${tipo.toLowerCase()}-${denominacion.replace(/\$/g, '').replace(',', '')}-${anio}`;

  const nuevaDenominacion = {
    id,
    tipo,
    denominacion,
    anio,
    material,
    tema,
    rareza,
    observaciones,
    valor
  };

  CATALOGO.push(nuevaDenominacion);
  localStorage.setItem('catalogoPersonalizado', JSON.stringify(CATALOGO));

  alert(`✅ Denominación "${denominacion} (${anio})" añadida al catálogo.`);
  document.getElementById("add-denominacion-form").reset();
  showSection("catalogo");
});