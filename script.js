// Base de datos jerárquica para la cascada de Venezuela
const datosGeograficos = {
  "Distrito Capital": {
    "Libertador": [
      "Altagracia", "Antímano", "Caricuao", "Catedral", "El Junquito", 
      "El Paraíso", "El Recreo", "El Valle", "La Candelaria", "La Pastora", 
      "La Vega", "Macarao", "San Agustín", "San Bernardino", "San José", 
      "San Juan", "San Pedro", "Santa Rosalía", "Santa Teresa", "Sucre (Catia)", "23 de Enero"
    ]
  },
  "Miranda": {
    "Chacao": ["Chacao (San José de Chacao)"],
    "Plaza": ["Guarenas"],
    "Sucre": ["Petare", "Leoncio Martínez", "Caucagüita", "Filas de Mariche", "La Dolorita"],
    "Zamora": ["Guatire", "Bolívar"],
    "Cristóbal Rojas": ["Charallave", "Las Brisas"],
    "Urdaneta": ["Cúa", "Nueva Cúa"],
    "Lander": ["Ocumare del Tuy"]
  },
  "La Guaira": {
    "Vargas": [
      "Carayaca", "Caruao", "Catia La Mar", "El Junko", "La Guaira", 
      "Macuto", "Maiquetía", "Naiguatá", "Urimare", "Carlos Soublette"
    ]
  }
};

// Referencias del DOM
const bodyApp = document.body;
const tipoEntidad = document.getElementById('tipoEntidad');
const inicialesColegio = document.getElementById('inicialesColegio');
const selectEstado = document.getElementById('selectEstado');
const selectMunicipio = document.getElementById('selectMunicipio');
const selectParroquia = document.getElementById('parroquia');
const formNuevoBus = document.getElementById('formNuevoBus');
const btnVolver = document.getElementById('btnVolver');

// 1. Persistencia y aplicación global de Temas (Local Storage)
function aplicarTema() {
  const temaGuardado = localStorage.getItem('theme');
  if (temaGuardado === 'dark') {
    bodyApp.classList.add('dark-theme');
  } else {
    bodyApp.classList.remove('dark-theme'); // Por defecto modo claro la primera vez
  }
}

// 2. Control Lógico: Habilitar Iniciales si es Colegio
tipoEntidad.addEventListener('change', (e) => {
  const valor = e.target.value;
  
  if (valor === 'Colegio') {
    inicialesColegio.disabled = false;
    inicialesColegio.required = true;
  } else {
    inicialesColegio.disabled = true;
    inicialesColegio.required = false;
    inicialesColegio.value = ""; // Limpiar selección previa
  }
});

// 3. Inicialización del selector de Estados
function cargarEstados() {
  Object.keys(datosGeograficos).forEach(estado => {
    const opt = document.createElement('option');
    opt.value = estado;
    opt.textContent = estado;
    selectEstado.appendChild(opt);
  });
}

// 4. Cascada: Estado -> Municipios
selectEstado.addEventListener('change', (e) => {
  const estadoSeleccionado = e.target.value;
  
  // Resetear hijos
  selectMunicipio.innerHTML = '<option value="" disabled selected>Seleccione Municipio</option>';
  selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione Parroquia</option>';
  selectMunicipio.disabled = true;
  selectParroquia.disabled = true;
  
  if (estadoSeleccionado) {
    const municipios = Object.keys(datosGeograficos[estadoSeleccionado]);
    municipios.forEach(mun => {
      const opt = document.createElement('option');
      opt.value = mun;
      opt.textContent = mun;
      selectMunicipio.appendChild(opt);
    });
    selectMunicipio.disabled = false;
  }
});

// 5. Cascada: Municipio -> Parroquias
selectMunicipio.addEventListener('change', (e) => {
  const estadoSeleccionado = selectEstado.value;
  const municipioSeleccionado = e.target.value;
  
  selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione Parroquia</option>';
  selectParroquia.disabled = true;
  
  if (municipioSeleccionado) {
    const parroquias = datosGeograficos[estadoSeleccionado][municipioSeleccionado];
    parroquias.forEach(parr => {
      const opt = document.createElement('option');
      opt.value = parr;
      opt.textContent = parr;
      selectParroquia.appendChild(opt);
    });
    selectParroquia.disabled = false;
  }
});

// 6. Envío del Formulario (Guardado Local simulando Base de Datos)
formNuevoBus.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Captura e integración de textos
  let nombreFinalEntidad = document.getElementById('nombreEntidad').value.trim();
  if (tipoEntidad.value === 'Colegio') {
    // Si es colegio concatenamos el prefijo (Ej: U.E.N.B. + Nombre)
    nombreFinalEntidad = `${inicialesColegio.value} ${nombreFinalEntidad}`;
  }

  const nuevoBus = {
    id: Date.now(), // ID único temporal
    numeroBus: document.getElementById('numeroBus').value,
    tipoEntidad: tipoEntidad.value,
    nombreEntidad: nombreFinalEntidad,
    ninos: parseInt(document.getElementById('cantNinos').value) || 0,
    adultos: parseInt(document.getElementById('cantAdultos').value) || 0,
    estado: selectEstado.value,
    municipio: selectMunicipio.value,
    parroquia: selectParroquia.value,
    fecha: new Date().toISOString().split('T')[0] // Guarda la fecha actual YYYY-MM-DD
  };

  // Obtener base temporal del almacenamiento local
  let listadoBuses = JSON.parse(localStorage.getItem('listadoBuses')) || [];
  listadoBuses.push(nuevoBus);
  localStorage.setItem('listadoBuses', JSON.stringify(listadoBuses));

  alert('¡Bus registrado con éxito!');
  
  // Redirección al panel del listado
  window.location.href = 'listado.html'; 
});

// Botón volver
btnVolver.addEventListener('click', () => {
  window.history.back();
});

// Ejecución al cargar
aplicarTema();
cargarEstados();