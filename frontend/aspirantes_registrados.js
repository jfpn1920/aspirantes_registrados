//------------------------------------------//
//--|funcionalidad_aspirantes_registrados|--//
//------------------------------------------//
const CLAVE = "aspirantesRegistrados";
const CAMPOS = ["nombre", "edad", "correo"];
const nuevoEstado = () => ({
    borrador: {
        nombre: "",
        edad: "",
        correo: ""
    }, aspirantes: [], busqueda: ""
});
let estado = nuevoEstado();
const $ = (id) => document.getElementById(id);
//------------------------------------------//
//--|guarda_el_estado_usando_localstorage|--//
//------------------------------------------//
function guardar() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
//-----------------------------------//
//--|recuperar_los_datos_guardados|--//
//-----------------------------------//
function cargar() {
    const g = localStorage.getItem(CLAVE);
    if (!g) {
        return;
    }
    const d = JSON.parse(g);
    estado = {
        ...nuevoEstado(), ...d, borrador: {
            ...nuevoEstado().borrador, ...d.borrador
        }
    };
    if (!Array.isArray(estado.aspirantes)) {
        estado.aspirantes = [];
    }
}
//---------------------------------------------//
//--|validar_los_campos_y_devolver_el_objeto|--//
//---------------------------------------------//
function validar() {
    const b = estado.borrador;
    const errores = {};
    const edad = Number(b.edad);
    const correo = b.correo.trim().toLowerCase();
    if (b.nombre.trim().length < 3) {
        errores.nombre = "Escribe al menos 3 letras.";
    }
    if (b.edad === "" || !Number.isInteger(edad) || edad < 16 || edad > 80) {
        errores.edad = "La edad debe estar entre 16 y 80 años.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        errores.correo = "Escribe un correo válido, como nombre@correo.com.";
    } 
    else if (estado.aspirantes.some((a) => a.correo.toLowerCase() === correo)) {
        errores.correo = "Ese correo ya está registrado.";
    }
    return errores;
}
//------------------------------------------//
//--|muestra_u_oculta_el_mensaje_de_error|--//
//------------------------------------------//
function mostrarErrores(errores) {
    CAMPOS.forEach((c) => {
        $("error-" + c).textContent = errores[c] || "";
        $("campo-" + c).classList.toggle("invalido", Boolean(errores[c]));
    });
}
//------------------------------//
//--|crea_una_celda_del_tabla|--//
//------------------------------//
function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}
//--------------------------------------------//
//--|crea_la_fila_y_eliminar_a_un_aspirante|--//
//--------------------------------------------//
function crearFila(a, i) {
    const tr = document.createElement("tr");
    [i + 1, a.nombre, a.edad, a.correo, a.fecha].forEach((dato) => {
        tr.appendChild(celda(dato));
    });
    const boton = document.createElement("button");
    boton.className = "eliminar";
    boton.textContent = "Eliminar";
    boton.dataset.id = a.id;
    const td = document.createElement("td");
    td.appendChild(boton);
    tr.appendChild(td);
    return tr;
}
//----------------------------------------//
//--|dibuja_la_tabla_para_los_aspirante|--//
//----------------------------------------//
function pintar() {
    const q = estado.busqueda.trim().toLowerCase();
    const todos = estado.aspirantes;
    const lista = todos.filter((a) => {
        return (a.nombre + " " + a.correo).toLowerCase().includes(q);
    });
    $("cuerpo").innerHTML = "";
    lista.forEach((a, i) => {
        $("cuerpo").appendChild(crearFila(a, i));
    });
    const promedio = todos.length ? (todos.reduce((s, a) => s + a.edad, 0) / todos.length).toFixed(1).replace(".", ",") : "0";
    $("resumen").textContent = (todos.length === 1 ? "1 aspirante registrado" : todos.length + " aspirantes registrados") + ". Edad promedio: " + promedio + " años.";
    $("vacio").textContent = todos.length ? "Ningún aspirante coincide con la búsqueda." : "Aún no hay aspirantes registrados.";
    $("vacio").classList.toggle("oculto", lista.length > 0);
}
//----------------------------------------------//
//--|accionar_guarda_el_borrador_al_refrescar|--//
//----------------------------------------------//
function alEscribir(e) {
    CAMPOS.forEach((c) => {
        estado.borrador[c] = $("campo-" + c).value;
    });
    const campo = e.target.id.replace("campo-", "");
    $("error-" + campo).textContent = "";
    e.target.classList.remove("invalido");
    $("exito").textContent = "";
    guardar();
}
//------------------------------------//
//--|valida_y_registra_al_aspirante|--//
//------------------------------------//
function registrar(e) {
    e.preventDefault(); 
    CAMPOS.forEach((c) => {
        estado.borrador[c] = $("campo-" + c).value;
    });
    const errores = validar();
    mostrarErrores(errores);
    const primero = CAMPOS.find((c) => errores[c]);
    if (primero) {
        return $("campo-" + primero).focus();
    }
    const b = estado.borrador;
    const id = Math.max(0, ...estado.aspirantes.map((a) => a.id)) + 1;
    estado.aspirantes.push({
        id: id,
        nombre: b.nombre.trim(),
        edad: Number(b.edad),
        correo: b.correo.trim(),
        fecha: new Date().toLocaleDateString("es-CO")
    });
    $("exito").textContent = "¡Listo! Se registró a " + b.nombre.trim() + ".";
    estado.borrador = nuevoEstado().borrador;
    CAMPOS.forEach((c) => {
        $("campo-" + c).value = "";
    });
    guardar();
    pintar();
}
//-----------------------//
//--|evento_a_un_click|--//
//-----------------------//
$("formulario").addEventListener("submit", registrar);
CAMPOS.forEach((c) => {
    $("campo-" + c).addEventListener("input", alEscribir);
});
$("campo-buscar").addEventListener(
    "input", (e) => {
        estado.busqueda = e.target.value;
        guardar();
        pintar();
    }
);
//-------------------------------------//
//--|evento_click_del_boton_eliminar|--//
//-------------------------------------//
$("cuerpo").addEventListener(
    "click", (e) => {
        if (!e.target.classList.contains("eliminar")) {
            return;
        }
        estado.aspirantes = estado.aspirantes.filter(
            (a) => a.id !== Number(e.target.dataset.id)
        );
        guardar();
        pintar();
    }
);
$("btn-borrar").addEventListener(
    "click", () => {
        if (estado.aspirantes.length && confirm("¿Seguro que quieres borrar a todos los aspirantes?")) {
            estado.aspirantes = [];
            guardar();
            pintar();
        }
    }
);
//---------------------------------//
//--|arranque_al_cargar_programa|--//
//---------------------------------//
cargar();
CAMPOS.forEach((c) => {
    $("campo-" + c).value = estado.borrador[c];
});
$("campo-buscar").value = estado.busqueda;
pintar();