// ==========================================================================
// tienda.js – Elixir Licorería
// Nuestro JavaScript. Se carga después de Bootstrap, por eso
// aquí ya existe el objeto «bootstrap».
// ==========================================================================

// Lista de productos destacados de la licorería
const productosLicores = [
  {
    id: 1,
    nombre: "Ron Añejo Imperial 8 Años",
    categoria: "Rones",
    precio: 90000,
    imagen: "img/images.jpeg",
    descripcion: "Añejado en barricas de roble blanco con notas de vainilla y frutos secos."
  },
  {
    id: 2,
    nombre: "Ron Extravaganza Reserva X.O.",
    categoria: "Rones Premium",
    precio: 120000,
    imagen: "img/images4.jpeg",
    descripcion: "Edición limitada de doble añejamiento. Sabor suave con toques caramelizados."
  },
  {
    id: 3,
    nombre: "Liqueur Spiced & Canela",
    categoria: "Licores",
    precio: 65000,
    imagen: "img/images2.jpeg",
    descripcion: "Perfecto para Shots y coctelería festiva. Especiado con canela natural."
  },
  {
    id: 4,
    nombre: "Ginebra Botánica Elixir",
    categoria: "Destilados",
    precio: 45000,
    imagen: "img/images3.jpeg",
    descripcion: "Destilada con enebro, frutos rojos y notas cítricas frescas."
  }
];

// Arreglo global para almacenar los ítems del carrito
let carrito = [];

// Evento que se ejecuta al cargar completamente la página
document.addEventListener("DOMContentLoaded", () => {
  renderizarProductosDestacados();
  inicializarValidacionFormularios();
});

/**
 * Renderiza dinámicamente las tarjetas de productos en la sección #productos
 */
function renderizarProductosDestacados() {
  const contenedor = document.querySelector("#productos .row");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  productosLicores.forEach((producto) => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 200px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <span class="badge text-bg-warning mb-2 align-self-start">${producto.categoria}</span>
          <h5 class="card-title fw-bold h6">${producto.nombre}</h5>
          <p class="card-text text-muted small flex-grow-1">${producto.descripcion}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <span class="fs-5 fw-bold text-dark">$${producto.precio.toLocaleString("es-CO")}</span>
            <button class="btn btn-dark btn-sm rounded-pill px-3" onclick="agregarDirectoAlCarrito(${producto.id})">
              <i class="bi bi-cart-plus"></i> Agregar
            </button>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(col);
  });
}

/**
 * Agrega un producto directamente desde la sección de Productos Destacados
 */
function agregarDirectoAlCarrito(idProducto) {
  const producto = productosLicores.find((p) => p.id === idProducto);
  if (!producto) return;

  carrito.push({
    id: Date.now(),
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad: 1,
    cupon: ""
  });

  actualizarContadorCarrito();
  alert(`¡Se agregó "${producto.nombre}" al carrito!`);
}

/**
 * Calcula en tiempo real el subtotal, descuentos y envío del módulo de ventas
 */
function calcularTotalVenta() {
  const select = document.getElementById("selectBebida");
  const precioBebida = parseFloat(select ? select.value : 0) || 0;
  const cantidadInput = document.getElementById("cantidadBebidas");
  const cantidad = parseInt(cantidadInput ? cantidadInput.value : 0) || 0;
  const cuponInput = document.getElementById("cuponDescuento");
  const cupon = cuponInput ? cuponInput.value.trim().toUpperCase() : "";

  if (precioBebida === 0 || cantidad <= 0) {
    actualizarVistaResumenVenta(0, 0, 0, 0);
    return { subtotal: 0, descuento: 0, envio: 0, total: 0 };
  }

  const subtotal = precioBebida * cantidad;
  let descuento = 0;

  // Descuento del 10% por volumen (5 o más botellas)
  if (cantidad >= 5) {
    descuento += subtotal * 0.10;
  }

  // Descuentos por cupones promocionales
  if (cupon === "ELIXIR10") {
    descuento += subtotal * 0.10;
  } else if (cupon === "FIESTA15") {
    descuento += subtotal * 0.15;
  }

  // Envío gratis a partir de $150.000 de subtotal
  const envio = subtotal >= 150000 ? 0 : 12000;
  const total = subtotal - descuento + envio;

  actualizarVistaResumenVenta(subtotal, descuento, envio, total);

  return { subtotal, descuento, envio, total };
}

/**
 * Pinta los totales en el resumen visual antes de confirmar la compra
 */
function actualizarVistaResumenVenta(subtotal, descuento, envio, total) {
  const subtotalElem = document.getElementById("subtotalVenta");
  const descuentoElem = document.getElementById("descuentoVenta");
  const envioElem = document.getElementById("envioVenta");
  const totalElem = document.getElementById("totalVenta");

  if (subtotalElem) subtotalElem.innerText = `$${subtotal.toLocaleString("es-CO")}`;
  if (descuentoElem) descuentoElem.innerText = `-$${descuento.toLocaleString("es-CO")}`;
  if (envioElem) envioElem.innerText = envio === 0 ? "¡GRATIS!" : `$${envio.toLocaleString("es-CO")}`;
  if (totalElem) totalElem.innerText = `$${total.toLocaleString("es-CO")}`;
}

/**
 * Registra el ítem seleccionado en el formulario y lo envía al carrito
 */
function realizarVenta(event) {
  event.preventDefault();

  const select = document.getElementById("selectBebida");
  if (!select || !select.value) {
    alert("Por favor selecciona una bebida válida.");
    return;
  }

  const opcionSeleccionada = select.options[select.selectedIndex];
  const nombre = opcionSeleccionada.getAttribute("data-nombre") || opcionSeleccionada.text;
  const precio = parseFloat(select.value);
  const cantidad = parseInt(document.getElementById("cantidadBebidas").value) || 1;
  const cupon = document.getElementById("cuponDescuento").value.trim().toUpperCase();

  carrito.push({
    id: Date.now(),
    nombre: nombre,
    precio: precio,
    cantidad: cantidad,
    cupon: cupon
  });

  actualizarContadorCarrito();
  alert(`¡${cantidad} botella(s) de "${nombre}" agregada(s) al carrito con éxito!`);

  document.getElementById("formVenta").reset();
  calcularTotalVenta();
}

/**
 * Actualiza la insignia (badge) del contador de ítems en el botón del carrito
 */
function actualizarContadorCarrito() {
  const contador = document.getElementById("contadorCarrito");
  if (!contador) return;
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  contador.innerText = totalItems;
}

/**
 * Dibuja el desglose de productos y la factura completa dentro del Modal
 */
function renderizarFactura() {
  const tbody = document.getElementById("tablaFacturaBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (carrito.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-muted">
          <i class="bi bi-cart-x fs-2 d-block mb-2 text-secondary"></i>
          El carrito está vacío. Agrega tus licores desde la sección de compras.
        </td>
      </tr>
    `;
    actualizarTotalesFactura(0, 0, 0, 0);
    return;
  }

  let subtotalGeneral = 0;
  let descuentoGeneral = 0;

  carrito.forEach((item, index) => {
    const subtotalItem = item.precio * item.cantidad;
    let descuentoItem = 0;

    if (item.cantidad >= 5) descuentoItem += subtotalItem * 0.10;
    if (item.cupon === "ELIXIR10") descuentoItem += subtotalItem * 0.10;
    if (item.cupon === "FIESTA15") descuentoItem += subtotalItem * 0.15;

    subtotalGeneral += subtotalItem;
    descuentoGeneral += descuentoItem;

    tbody.innerHTML += `
      <tr>
        <td>
          <span class="fw-semibold">${item.nombre}</span>
          ${item.cupon ? `<br><small class="badge bg-light text-dark border">Cupón: ${item.cupon}</small>` : ""}
        </td>
        <td class="text-center">${item.cantidad}</td>
        <td class="text-end">$${item.precio.toLocaleString("es-CO")}</td>
        <td class="text-end fw-bold">$${subtotalItem.toLocaleString("es-CO")}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger border-0" onclick="eliminarItem(${index})">
            <i class="bi bi-trash-fill"></i>
          </button>
        </td>
      </tr>
    `;
  });

  const envioGeneral = subtotalGeneral >= 150000 ? 0 : 12000;
  const totalNeto = subtotalGeneral - descuentoGeneral + envioGeneral;

  actualizarTotalesFactura(subtotalGeneral, descuentoGeneral, envioGeneral, totalNeto);
}

/**
 * Escribe los valores numéricos calculados de la factura en los elementos HTML
 */
function actualizarTotalesFactura(subtotal, descuento, envio, total) {
  const fechaElem = document.getElementById("facturaFecha");
  const subtotalElem = document.getElementById("facturaSubtotal");
  const descuentoElem = document.getElementById("facturaDescuento");
  const envioElem = document.getElementById("facturaEnvio");
  const totalElem = document.getElementById("facturaTotal");

  if (fechaElem) fechaElem.innerText = new Date().toLocaleDateString("es-CO");
  if (subtotalElem) subtotalElem.innerText = `$${subtotal.toLocaleString("es-CO")}`;
  if (descuentoElem) descuentoElem.innerText = `-$${descuento.toLocaleString("es-CO")}`;
  if (envioElem) envioElem.innerText = envio === 0 ? "¡GRATIS!" : `$${envio.toLocaleString("es-CO")}`;
  if (totalElem) totalElem.innerText = `$${total.toLocaleString("es-CO")}`;
}

/**
 * Elimina una fila individual del carrito según su índice
 */
function eliminarItem(index) {
  carrito.splice(index, 1);
  actualizarContadorCarrito();
  renderizarFactura();
}

/**
 * Vacía completamente el carrito de compras
 */
function vaciarCarrito() {
  if (carrito.length === 0) return;
  if (confirm("¿Estás seguro de que deseas vaciar tu carrito?")) {
    carrito = [];
    actualizarContadorCarrito();
    renderizarFactura();
  }
}

/**
 * Procesa y simula el pago de la factura
 */
function pagarFactura() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  alert("¡Factura procesada con éxito! Gracias por tu compra en Elixir Licorería.");
  carrito = [];
  actualizarContadorCarrito();

  const modalElement = document.getElementById("modalCarrito");
  if (modalElement && typeof bootstrap !== "undefined") {
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }
}

/**
 * Maneja las validaciones nativas de Bootstrap para formularios (e.g., Suscripción)
 */
function inicializarValidacionFormularios() {
  const forms = document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          if (form.id === "formSuscripcion") {
            event.preventDefault();
            alert("¡Gracias por suscribirte al Club del Elixir! Revisa tu correo para el cupón de bienvenida.");
            form.reset();
            form.classList.remove("was-validated");
            return;
          }
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
}