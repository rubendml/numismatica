function showSection(section) {
  document.getElementById("section-monedas").classList.toggle("hidden", section !== "monedas");
  document.getElementById("section-billetes").classList.toggle("hidden", section !== "billetes");
  document.getElementById("section-coleccion").classList.toggle("hidden", section !== "coleccion");

  // Cambiar estilo de botones
  const tabs = document.querySelectorAll("header button");
  tabs.forEach(btn => {
    btn.classList.remove("tab-active");
    btn.classList.add("tab-inactive");
  });

  const activeTab = document.querySelector(`button[onclick="showSection('${section}')"]`);
  if (activeTab) activeTab.classList.add("tab-active");
}

function renderItems() {
  const monedasContainer = document.getElementById("section-monedas");
  const billetesContainer = document.getElementById("section-billetes");
  const coleccionContainer = document.getElementById("coleccion-items");

  // Limpiar contenedores
  monedasContainer.innerHTML = "";
  billetesContainer.innerHTML = "";
  coleccionContainer.innerHTML = "";

  // Renderizar monedas
  DATA.monedas.forEach(item => {
    const card = document.createElement("div");
    card.className = "card bg-white rounded-xl shadow-md overflow-hidden border border-gray-200";
    card.innerHTML = `
      <div class="p-5">
        <h3 class="text-xl font-bold text-amber-700">${item.denominacion}</h3>
        <p class="text-sm text-gray-500">${item.anios}</p>
        <ul class="mt-3 space-y-1 text-sm text-gray-700">
          <li><strong>Material:</strong> ${item.material}</li>
          <li><strong>Diámetro:</strong> ${item.diametro}</li>
          <li><strong>Peso:</strong> ${item.peso}</li>
          <li><strong>Tema:</strong> ${item.tema}</li>
          <li><strong>Rareza:</strong> 
            <span class="px-2 py-1 text-xs rounded-full ${
              item.rareza === 'Común' ? 'bg-green-100 text-green-800' :
              item.rareza === 'Menos común' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }">${item.rareza}</span>
          </li>
        </ul>
        <a href="${item.imagen}" target="_blank" class="mt-4 inline-block text-amber-600 text-sm hover:underline">Ver en Numista →</a>
      </div>
    `;
    monedasContainer.appendChild(card);
  });

  // Renderizar billetes
  DATA.billetes.forEach(item => {
    const card = document.createElement("div");
    card.className = "card bg-white rounded-xl shadow-md overflow-hidden border border-gray-200";
    card.innerHTML = `
      <div class="p-5">
        <h3 class="text-xl font-bold text-blue-700">${item.denominacion}</h3>
        <p class="text-sm text-gray-500">${item.anios}</p>
        <ul class="mt-3 space-y-1 text-sm text-gray-700">
          <li><strong>Material:</strong> ${item.material}</li>
          <li><strong>Tamaño:</strong> ${item.tamaño}</li>
          <li><strong>Serie:</strong> ${item.serie}</li>
          <li><strong>Tema:</strong> ${item.tema}</li>
        </ul>
        <a href="${item.imagen}" target="_blank" class="mt-4 inline-block text-blue-600 text-sm hover:underline">Ver en Numista →</a>
      </div>
    `;
    billetesContainer.appendChild(card);
  });

  // Renderizar colección
  DATA.coleccion.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow border-l-4 border-amber-500";
    card.innerHTML = `
      <h4 class="font-semibold">${item.tipo}: ${item.denominacion} (${item.año})</h4>
      <p class="text-sm text-gray-600">Cantidad: ${item.cantidad} | Estado: ${item.grado}</p>
      <p class="text-sm text-green-600">Compra: $${item.precioCompra.toLocaleString()} COP</p>
      ${item.precioEstimado ? `<p class="text-sm text-blue-600">Estimado: $${item.precioEstimado.toLocaleString()} COP</p>` : ''}
    `;
    coleccionContainer.appendChild(card);
  });
}

// Esperar a que los datos se carguen
window.addEventListener("load", () => {
  setTimeout(() => {
    if (DATA.monedas.length > 0 && DATA.billetes.length > 0 && DATA.coleccion.length > 0) {
      renderItems();
    }
  }, 100);
});