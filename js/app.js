function showSection(section) {
  document.getElementById("section-catalogo").classList.toggle("hidden", section !== "catalogo");
  document.getElementById("section-coleccion").classList.toggle("hidden", section !== "coleccion");
  document.getElementById("section-add").classList.toggle("hidden", section !== "add");

  const tabs = document.querySelectorAll("header button");
  tabs.forEach(btn => {
    btn.className = btn.textContent === "Catálogo" ? "tab-inactive" :
                   btn.textContent === "Mi Colección" ? "tab-inactive" : "tab-inactive";
  });

  document.querySelector(`button[onclick="showSection('${section}')"]`).className = "tab-active";

  if (section === "catalogo") renderCatalogo();
  if (section === "coleccion") renderColeccion();
  if (section === "add") populateAddForm();
}

function renderCatalogo() {
  const container = document.getElementById("section-catalogo");
  container.innerHTML = "";

  CATALOGO.forEach(item => {
    const tiene = getColeccion().some(p => p.catalogoId === item.id);
    const card = document.createElement("div");
    card.className = `bg-white rounded-xl shadow-md overflow-hidden border-4 ${tiene ? "border-green-500" : "border-gray-200"} card`;
    card.innerHTML = `
      <div class="p-5">
        <div class="flex justify-between items-start">
          <h3 class="text-xl font-bold ${tiene ? "text-green-700" : "text-gray-800"}">${item.denominacion}</h3>
          <span class="px-3 py-1 text-sm font-semibold rounded-full ${tiene ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}">${tiene ? "✅ Tienes" : "❌ Falta"}</span>
        </div>
        <p class="text-sm text-gray-500">${item.años}</p>
        <p class="text-sm text-gray-600"><strong>Tema:</strong> ${item.tema}</p>
        <p class="text-sm text-gray-600"><strong>Rareza:</strong> ${item.rareza}</p>
        <p class="text-sm text-gray-600"><strong>Material:</strong> ${item.material}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

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
        </div>
        <button onclick="removePieza('${item.id}')" class="text-red-500 hover:text-red-700 text-xl">×</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function populateAddForm() {
  const select = document.getElementById("add-denominacion");
  select.innerHTML = "";
  CATALOGO.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.denominacion} (${item.tipo})`;
    select.appendChild(opt);
  });
}

document.getElementById("add-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const id = Date.now().toString();
  const pieza = {
    id,
    catalogoId: document.getElementById("add-denominacion").value,
    anio: document.getElementById("add-anio").value,
    grado: document.getElementById("add-grado").value,
    cantidad: document.getElementById("add-cantidad").value,
    precioCompra: document.getElementById("add-precio").value
  };
  addPieza(pieza);
  alert("✅ Pieza añadida a tu colección");
  document.getElementById("add-form").reset();
  showSection("coleccion");
});