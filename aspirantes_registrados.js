// ===== CONFIGURACIÓN =====
const CLAVE = "aspirantesRegistrados"; // clave con la que se guarda en localStorage
const CAMPOS = ["nombre", "edad", "correo"]; // nombres de los tres campos del formulario
// "borrador" es lo que está escrito en el formulario; "aspirantes" es la lista ya registrada
const nuevoEstado = () => ({ borrador: { nombre: "", edad: "", correo: "" }, aspirantes: [], busqueda: "" });
let estado = nuevoEstado();
const $ = (id) => document.getElementById(id); // atajo para buscar elementos por id
// ===== LOCALSTORAGE =====
// Guarda el estado completo como texto JSON
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(estado)); }
// Recupera lo guardado (si existe) y corrige datos que no sean válidos
function cargar() {
    const g = localStorage.getItem(CLAVE);
    if (!g) return;
    const d = JSON.parse(g);
    estado = { ...nuevoEstado(), ...d, borrador: { ...nuevoEstado().borrador, ...d.borrador } };
    if (!Array.isArray(estado.aspirantes)) estado.aspirantes = [];
}
// ===== VALIDACIÓN =====
// Revisa los tres campos y devuelve un objeto con los mensajes de error (vacío si todo está bien)
function validar() {
    const b = estado.borrador, errores = {}, edad = Number(b.edad), correo = b.correo.trim().toLowerCase();
    if (b.nombre.trim().length < 3) errores.nombre = "Escribe al menos 3 letras.";
    if (b.edad === "" || !Number.isInteger(edad) || edad < 16 || edad > 80) errores.edad = "La edad debe estar entre 16 y 80 años.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.correo = "Escribe un correo válido, como nombre@correo.com.";
    else if (estado.aspirantes.some((a) => a.correo.toLowerCase() === correo)) errores.correo = "Ese correo ya está registrado.";
    return errores;
}
// Muestra u oculta el mensaje de error de cada campo y marca el campo en rojo
function mostrarErrores(errores) {
    CAMPOS.forEach((c) => {
        $("error-" + c).textContent = errores[c] || "";
        $("campo-" + c).classList.toggle("invalido", Boolean(errores[c]));
    });
}
// ===== LISTA =====
// Crea una celda de tabla con texto (textContent evita que se ejecute código escrito por el usuario)
function celda(texto) { const td = document.createElement("td"); td.textContent = texto; return td; }
// Crea la fila de un aspirante, con su botón de eliminar
function crearFila(a, i) {
    const tr = document.createElement("tr");
    [i + 1, a.nombre, a.edad, a.correo, a.fecha].forEach((dato) => tr.appendChild(celda(dato)));
    const boton = document.createElement("button");
    boton.className = "eliminar"; boton.textContent = "Eliminar"; boton.dataset.id = a.id;
    const td = document.createElement("td");
    td.appendChild(boton); tr.appendChild(td);
    return tr;
}
// Dibuja la tabla (aplicando la búsqueda) y el resumen
function pintar() {
    const q = estado.busqueda.trim().toLowerCase(), todos = estado.aspirantes;
    const lista = todos.filter((a) => (a.nombre + " " + a.correo).toLowerCase().includes(q));
    $("cuerpo").innerHTML = "";
    lista.forEach((a, i) => $("cuerpo").appendChild(crearFila(a, i)));
    const promedio = todos.length ? (todos.reduce((s, a) => s + a.edad, 0) / todos.length).toFixed(1).replace(".", ",") : "0";
    $("resumen").textContent = (todos.length === 1 ? "1 aspirante registrado" : todos.length + " aspirantes registrados") + ". Edad promedio: " + promedio + " años.";
    $("vacio").textContent = todos.length ? "Ningún aspirante coincide con la búsqueda." : "Aún no hay aspirantes registrados.";
    $("vacio").classList.toggle("oculto", lista.length > 0);
}
// ===== ACCIONES =====
// Al escribir se guarda el borrador, para no perderlo al refrescar
function alEscribir(e) {
    CAMPOS.forEach((c) => (estado.borrador[c] = $("campo-" + c).value));
    $("error-" + e.target.id.replace("campo-", "")).textContent = ""; // quita el error del campo que se edita
    e.target.classList.remove("invalido");
    $("exito").textContent = "";
    guardar();
}
// Valida y, si todo está bien, registra al aspirante
function registrar(e) {
    e.preventDefault(); // evita que el formulario recargue la página
    CAMPOS.forEach((c) => (estado.borrador[c] = $("campo-" + c).value));
    const errores = validar();
    mostrarErrores(errores);
    const primero = CAMPOS.find((c) => errores[c]);
    if (primero) return $("campo-" + primero).focus(); // lleva el cursor al primer campo con error
    const b = estado.borrador, id = Math.max(0, ...estado.aspirantes.map((a) => a.id)) + 1; // id único
    estado.aspirantes.push({ id: id, nombre: b.nombre.trim(), edad: Number(b.edad), correo: b.correo.trim(), fecha: new Date().toLocaleDateString("es-CO") });
    $("exito").textContent = "¡Listo! Se registró a " + b.nombre.trim() + ".";
    estado.borrador = nuevoEstado().borrador;
    CAMPOS.forEach((c) => ($("campo-" + c).value = ""));
    guardar(); pintar();
}
// ===== EVENTOS =====
$("formulario").addEventListener("submit", registrar);
CAMPOS.forEach((c) => $("campo-" + c).addEventListener("input", alEscribir));
$("campo-buscar").addEventListener("input", (e) => { estado.busqueda = e.target.value; guardar(); pintar(); });
// Un solo "escucha" en la tabla sirve para todos los botones de eliminar
$("cuerpo").addEventListener("click", (e) => {
    if (!e.target.classList.contains("eliminar")) return;
    estado.aspirantes = estado.aspirantes.filter((a) => a.id !== Number(e.target.dataset.id));
    guardar(); pintar();
});
$("btn-borrar").addEventListener("click", () => {
    if (estado.aspirantes.length && confirm("¿Seguro que quieres borrar a todos los aspirantes?")) { estado.aspirantes = []; guardar(); pintar(); }
});
// ===== ARRANQUE =====
// Al cargar la página se recupera lo guardado y se muestra de nuevo
cargar();
CAMPOS.forEach((c) => ($("campo-" + c).value = estado.borrador[c]));
$("campo-buscar").value = estado.busqueda;
pintar();