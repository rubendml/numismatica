// --- CONFIGURACIÓN ---
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let editandoId = null;

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

// --- RENDER CATÁLOGO ---
function renderCatalogo() {
  const container = document.getElementById('section-catalogo');
  container.classList.remove('hidden');
  container.innerHTML = '';

  const filtered = (window.CATALOGO || []).filter(item => {
    const tipo = document.getElementById('filter-tipo')?.value || '';
    const denom = (document.getElementById('filter-denominacion')?.value || '').toLowerCase();
    const anio = document.getElementById('filter-anio')?.value || '';
    const search = (document.getElementById('search-input')?.value || '').toLowerCase();

    return (!tipo || item.tipo === tipo) &&
           (!denom || item.denominacion.toLowerCase().includes(denom)) &&
           (!anio || item.anio == anio) &&
           (!search || item.denominacion.toLowerCase().includes(search) ||
            (item.tema && item.tema.toLowerCase().includes(search)));
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const items = filtered.slice(start, start + ITEMS_PER_PAGE);

  // Filtros
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

  if (items.length === 0) {
    container.innerHTML += '<p class="text-gray-500 text-center py-10">No se encontraron piezas.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  container.appendChild(grid);

  items.forEach(item => {
    const tiene = getColeccion().some(p => p.catalogoId === item.id);
    const card = document.createElement('div');
    card.className = `bg-white rounded-xl shadow-md overflow-hidden border-4 ${tiene ? 'border-green-500' : 'border-gray-200'} card`;
    card.innerHTML = `
      <div class="p-5">
        <div class="flex justify-between items-start">
          <h3 class="text-xl font-bold ${tiene ? 'text-green-700' : 'text-gray-800'}">${item.denominacion} (${item.anio})</h3>
          <span class="px-3 py-1 text-sm font-semibold rounded-full ${tiene ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">${tiene ? '✅ Tienes' : '❌ Falta'}</span>
        </div>
        <p class="text-sm text-gray-500"><strong>Tipo:</strong> ${item.tipo}</p>
        <p class="text-sm text-gray-500"><strong>Tema:</strong> ${item.tema || 'General'}</p>
        <p class="text-sm text-gray-500"><strong>Material:</strong> ${item.material}</p>
        <p class="text-sm text-gray-500"><strong>Rareza:</strong> ${item.rareza}</p>
        <p class="text-sm text-gray-600 mt-2">${item.observaciones}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button onclick="editarDenominacion('${item.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">✏️ Editar</button>
          <button onclick="eliminarDenominacion('${item.id}')" class="text-red-600 hover:text-red-800 text-sm font-medium">🗑️ Eliminar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  const pagination = document.createElement('div');
  pagination.className = 'mt-8 flex justify-center items-center gap-4';
  pagination.innerHTML = `
    <button onclick="prevPage(${totalPages})" class="px-4 py-2 bg-gray-300 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}">← Anterior</button>
    <span class="text-gray-700">Página ${currentPage} de ${totalPages || 1}</span>
    <button onclick="nextPage(${totalPages})" class="px-4 py-2 bg-gray-300 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}">Siguiente →</button>
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

// --- EDITAR / ELIMINAR DENOMINACIÓN ---
function editarDenominacion(id) {
  const item = window.CATALOGO.find(d => d.id === id);
  if (!item) return;

  editandoId = id;
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

  showSection('add-denominacion');
}

function eliminarDenominacion(id) {
  if (confirm('¿Eliminar esta denominación?')) {
    window.CATALOGO = window.CATALOGO.filter(d => d.id !== id);
    localStorage.setItem('catalogoPersonalizado', JSON.stringify(window.CATALOGO));
    alert('🗑️ Eliminado');
    renderCatalogo();
  }
}

// --- EXPORTAR / IMPORTAR ---
function exportarCatalogo() {
  const dataStr = JSON.stringify(window.CATALOGO, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'catalogo.json';
  a.click();
  URL.revokeObjectURL(url);
  alert('✅ Archivo exportado. ¡Súbelo a GitHub!');
}

async function importarDesdeGitHub() {
  if (!confirm('¿Actualizar desde GitHub? Se perderán cambios locales no exportados.')) return;

  try {
    const res = await fetch('./data/catalogo.json?' + new Date().getTime());
    const nuevo = await res.json();
    window.CATALOGO = nuevo;
    localStorage.setItem('catalogoPersonalizado', JSON.stringify(window.CATALOGO));
    actualizarColeccionConCatalogo();
    alert('✅ Actualizado desde GitHub');
    renderCatalogo();
    renderColeccion();
  } catch (error) {
    alert('❌ Error al actualizar desde GitHub.');
  }
}

// --- MIS COLECCIÓN ---
function renderColeccion() {
  const container = document.getElementById('coleccion-items');
  container.innerHTML = '';

  const coleccion = getColeccion();
  if (coleccion.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No tienes ninguna pieza aún.</p>';
    return;
  }

  coleccion.forEach(item => {
    const catalogo = window.CATALOGO.find(c => c.id === item.catalogoId);
    const denominacion = catalogo ? catalogo.denominacion : item.denominacion;

    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-lg shadow border-l-4 border-amber-500';
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

function populateAddForm() {
  const select = document.getElementById('add-denominacion');
  if (!select) return;
  select.innerHTML = '';
  window.CATALOGO.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `${item.denominacion} (${item.anio})`;
    select.appendChild(opt);
  });
}

// --- EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
  // Añadir/editar denominación
  const form = document.getElementById('add-denominacion-form');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const tipo = document.getElementById('denom-tipo').value;
      const denominacion = document.getElementById('denom-denominacion').value;
      const anio = parseInt(document.getElementById('denom-anio').value);
      const material = document.getElementById('denom-material').value;
      const tema = document.getElementById('denom-tema').value || 'General';
      const rareza = document.getElementById('denom-rareza').value;
      const obs = document.getElementById('denom-observaciones').value || '';
      const valor = parseFloat(denominacion.replace(/[^0-9.]/g, '')) || 0;
      const id = `custom-${tipo.toLowerCase()}-${denominacion.replace(/\$/g, '').replace(',', '')}-${anio}`;

      if (editandoId) {
        const index = window.CATALOGO.findIndex(d => d.id === editandoId);
        if (index !== -1) window.CATALOGO[index] = { ...window.CATALOGO[index], tipo, denominacion, anio, material, tema, rareza, observaciones: obs, valor };
        const btn = form.querySelector('button[type="submit"]');
        btn.textContent = 'Añadir al Catálogo';
        btn.classList.remove('bg-blue-600');
        btn.classList.add('bg-purple-600');
        editandoId = null;
        alert('✅ Actualizado');
      } else {
        window.CATALOGO.push({ id, tipo, denominacion, anio, material, tema, rareza, observaciones: obs, valor });
        alert('✅ Añadido');
      }

      localStorage.setItem('catalogoPersonalizado', JSON.stringify(window.CATALOGO));
      showSection('catalogo');
    };
  }

  // Añadir a colección
  const addForm = document.getElementById('add-form');
  if (addForm) {
    addForm.onsubmit = async function(e) {
      e.preventDefault();
      const id = Date.now().toString();
      const file = document.getElementById('add-imagen')?.files[0];
      const imagen = file ? await uploadImage(file) : null;

      const pieza = {
        id,
        catalogoId: document.getElementById('add-denominacion').value,
        anio: document.getElementById('add-anio').value,
        grado: document.getElementById('add-grado').value,
        cantidad: document.getElementById('add-cantidad').value,
        precioCompra: document.getElementById('add-precio').value,
        imagen
      };

      addPieza(pieza);
      alert('✅ Añadido a tu colección');
      addForm.reset();
      showSection('coleccion');
    };
  }
});
