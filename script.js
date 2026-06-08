const datosGeograficos = {
  "Distrito Capital": { "Libertador": ["Antímano", "La Pastora", "San Juan", "El Paraíso", "Caricuao", "San Pedro", "La Vega", "San Agustín", "Catedral", "23 de Enero"] },
  "Miranda": { "Chacao": ["Chacao (San José de Chacao)"], "Zamora": ["Guatire", "Bolívar"], "Sucre": ["La Dolorita", "Petare"] },
  "La Guaira": { "Vargas": ["Carayaca", "La Guaira", "Maiquetía"] }
};

let cuentasUsuarios = JSON.parse(localStorage.getItem('cuentasUsuarios')) || {
  "Maria": { pass: "0713", role: "admin" },
  "Angel": { pass: "2025", role: "user" }
};

let usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo')) || null;

function cambiarVista(idVista) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(idVista).classList.add('active');
  
  if(idVista === 'view-listado') cargarTarjetasBuses();
  if(idVista === 'view-config') evaluarRolConfiguracion();
}

// ==================== INICIO DE SESIÓN ====================
document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errorLbl = document.getElementById('errorLogin');

  if (cuentasUsuarios[user] && cuentasUsuarios[user].pass === pass) {
    usuarioActivo = { username: user, role: cuentasUsuarios[user].role };
    localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo));
    errorLbl.textContent = "";
    document.getElementById('avatarUser').textContent = user.charAt(0).toUpperCase();
    cambiarVista('view-listado');
    document.getElementById('formLogin').reset();
  } else {
    errorLbl.textContent = "Usuario o contraseña inválidos.";
  }
});

document.getElementById('btnCerrarSesion').addEventListener('click', () => {
  usuarioActivo = null;
  localStorage.removeItem('usuarioActivo');
  cambiarVista('view-login');
});

function evaluarRolConfiguracion() {
  const adminSec = document.getElementById('secAdminOptions');
  adminSec.style.display = (usuarioActivo && usuarioActivo.role === 'admin') ? 'block' : 'none';
}

// Modo Oscuro
document.getElementById('chkDarkMode').addEventListener('change', (e) => {
  if(e.target.checked) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
});

// Enrutamientos
document.getElementById('btnConfig').addEventListener('click', () => cambiarVista('view-config'));
document.getElementById('btnVolverConfig').addEventListener('click', () => cambiarVista('view-listado'));
document.getElementById('lnkCambiarPass').addEventListener('click', () => cambiarVista('view-cambiar-pass'));
document.getElementById('lnkCrearUsuario').addEventListener('click', () => cambiarVista('view-crear-usuario'));
document.getElementById('btnBackConfig1').addEventListener('click', () => cambiarVista('view-config'));
document.getElementById('btnBackConfig2').addEventListener('click', () => cambiarVista('view-config'));
document.getElementById('btnBackConfig3').addEventListener('click', () => cambiarVista('view-config'));
document.getElementById('btnBackConfig4').addEventListener('click', () => cambiarVista('view-config'));

// ==================== REGISTRO DE BUSES ====================
const tipoEntidad = document.getElementById('tipoEntidad');
const inicialesColegio = document.getElementById('inicialesColegio');

tipoEntidad.addEventListener('change', (e) => {
  if (e.target.value === 'Colegio') {
    inicialesColegio.disabled = false;
    inicialesColegio.required = true;
  } else {
    inicialesColegio.disabled = true;
    inicialesColegio.required = false;
    inicialesColegio.value = "";
  }
});

const selectEstado = document.getElementById('selectEstado');
const selectMunicipio = document.getElementById('selectMunicipio');
const selectParroquia = document.getElementById('selectParroquia');

function initGeografia() {
  selectEstado.innerHTML = '<option value="" disabled selected>Seleccione Estado</option>';
  Object.keys(datosGeograficos).forEach(e => { selectEstado.innerHTML += `<option value="${e}">${e}</option>`; });
}

selectEstado.addEventListener('change', (e) => {
  selectMunicipio.innerHTML = '<option value="" disabled selected>Seleccione Municipio</option>';
  selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione Parroquia</option>';
  selectParroquia.disabled = true;
  const munis = Object.keys(datosGeograficos[e.target.value] || {});
  munis.forEach(m => { selectMunicipio.innerHTML += `<option value="${m}">${m}</option>`; });
  selectMunicipio.disabled = false;
});

selectMunicipio.addEventListener('change', (e) => {
  selectParroquia.innerHTML = '<option value="" disabled selected>Seleccione Parroquia</option>';
  const parrs = datosGeograficos[selectEstado.value][e.target.value] || [];
  parrs.forEach(p => { selectParroquia.innerHTML += `<option value="${p}">${p}</option>`; });
  selectParroquia.disabled = false;
});

document.getElementById('fabNuevoBus').addEventListener('click', () => { initGeografia(); cambiarVista('view-plantilla'); });
document.getElementById('btnVolverListado').addEventListener('click', () => cambiarVista('view-listado'));

document.getElementById('formNuevoBus').addEventListener('submit', (e) => {
  e.preventDefault();
  let nombre = document.getElementById('nombreEntidad').value.trim();
  if(tipoEntidad.value === 'Colegio') nombre = `${inicialesColegio.value} ${nombre}`;

  const bus = {
    numeroBus: document.getElementById('numeroBus').value.trim(),
    tipoEntidad: tipoEntidad.value,
    nombreEntidad: nombre,
    ninos: parseInt(document.getElementById('cantNinos').value) || 0,
    adultos: parseInt(document.getElementById('cantAdultos').value) || 0,
    estado: selectEstado.value,
    parroquia: selectParroquia.value,
    activo: true,
    fecha: new Date().toISOString().split('T')[0]
  };

  let listado = JSON.parse(localStorage.getItem('listadoBuses')) || [];
  listado.push(bus);  localStorage.setItem('listadoBuses', JSON.stringify(listado));
  document.getElementById('formNuevoBus').reset();
  cambiarVista('view-listado');
});

function cargarTarjetasBuses() {
  const container = document.getElementById('cardsContainer');
  const alertBanner = document.getElementById('alertDuplicados');
  container.innerHTML = "";
  
  let listado = JSON.parse(localStorage.getItem('listadoBuses')) || [];
  let activos = listado.filter(b => b.activo === true);

  let mapeoNumeros = {};
  activos.forEach(b => { mapeoNumeros[b.numeroBus] = (mapeoNumeros[b.numeroBus] || 0) + 1; });
  alertBanner.style.display = Object.values(mapeoNumeros).some(cant => cant > 1) ? 'block' : 'none';

  if(activos.length === 0) {
    container.innerHTML = `<p style="padding:20px; color:var(--text-muted); text-align:center;">No hay buses registrados hoy.</p>`;
    return;
  }

  activos.forEach(b => {
    let esDuplicado = mapeoNumeros[b.numeroBus] > 1;
    container.innerHTML += `
      <div class="bus-card ${esDuplicado ? 'duplicate-card' : ''}">
        <span class="bus-badge">Bus #${b.numeroBus}</span>
        <h4>${b.nombreEntidad}</h4>
        <p><strong>Ubicación:</strong> ${b.parroquia}, ${b.estado}</p>
        <p><strong>Pasajeros:</strong> ${b.ninos} Niños / ${b.adultos} Adultos</p>
      </div>`;
  });
}

// ==================== SEGURIDAD Y USUARIOS ====================
document.getElementById('formCambiarPass').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('chgUser').value.trim();
  const oldP = document.getElementById('chgOldPass').value;
  const newP = document.getElementById('chgNewPass').value;
  const confP = document.getElementById('chgConfPass').value;
  const errorLbl = document.getElementById('errorChgPass');

  if(!cuentasUsuarios[user] || cuentasUsuarios[user].pass !== oldP) { errorLbl.textContent = "Credenciales actuales incorrectas."; return; }
  if(newP.length < 6) { errorLbl.textContent = "La nueva contraseña debe tener mínimo 6 caracteres."; return; }
  if(newP !== confP) { errorLbl.textContent = "la contraseña no coincide"; return; }

  cuentasUsuarios[user].pass = newP;
  localStorage.setItem('cuentasUsuarios', JSON.stringify(cuentasUsuarios));
  alert("Contraseña modificada correctamente."); cambiarVista('view-config');
});

document.getElementById('formCrearUsuario').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('newUserName').value.trim();
  const pass = document.getElementById('newUserPass').value;
  const conf = document.getElementById('newUserConfPass').value;
  const errorLbl = document.getElementById('errorNewUser');

  if(pass.length < 6) { errorLbl.textContent = "La contraseña debe tener al menos 6 caracteres."; return; }
  if(pass !== conf) { errorLbl.textContent = "la contraseña no coincide"; return; }

  cuentasUsuarios[name] = { pass: pass, role: "user" };
  localStorage.setItem('cuentasUsuarios', JSON.stringify(cuentasUsuarios));
  alert(`Usuario "${name}" creado exitosamente.`); cambiarVista('view-config');
});

// ==================== REPORTES EN TIEMPO REAL ====================
document.getElementById('lnkReporteTiempoReal').addEventListener('click', () => {
  let listado = JSON.parse(localStorage.getItem('listadoBuses')) || [];
  let activos = listado.filter(b => b.activo === true);

  document.getElementById('rtBuses').textContent = activos.length;
  document.getElementById('rtComunas').textContent = activos.filter(b => b.tipoEntidad === 'Comuna').length;
  document.getElementById('rtColegios').textContent = activos.filter(b => b.tipoEntidad === 'Colegio').length;
  document.getElementById('rtInstitutos').textContent = activos.filter(b => b.tipoEntidad === 'Institucion').length;
  document.getElementById('rtNinos').textContent = activos.reduce((sum, b) => sum + b.ninos, 0);
  document.getElementById('rtAdultos').textContent = activos.reduce((sum, b) => sum + b.adultos, 0);
  cambiarVista('view-rt-report');
});

// ==================== ALERTA INTERMEDIA Y VISTA DE DESCARGA EXCEL ====================
const modal = document.getElementById('modalReporteFinal');

document.getElementById('lnkReporteFinal').addEventListener('click', () => {
  modal.style.visibility = 'visible';
});
document.getElementById('btnCancelarCierre').addEventListener('click', () => {
  modal.style.visibility = 'hidden';
});

// Al presionar ACEPTAR en el cuadro de diálogo (reporte final.png)
document.getElementById('btnAceptarCierre').addEventListener('click', () => {
  modal.style.visibility = 'hidden';
  
  // Cargar métricas en la pantalla física final (reporte final2.png)
  let listado = JSON.parse(localStorage.getItem('listadoBuses')) || [];
  let activos = listado.filter(b => b.activo === true);

  document.getElementById('rfBuses').textContent = activos.length;
  document.getElementById('rfComunas').textContent = activos.filter(b => b.tipoEntidad === 'Comuna').length;
  document.getElementById('rfColegios').textContent = activos.filter(b => b.tipoEntidad === 'Colegio').length;
  document.getElementById('rfInstitutos').textContent = activos.filter(b => b.tipoEntidad === 'Institucion').length;
  document.getElementById('rfNinos').textContent = activos.reduce((sum, b) => sum + b.ninos, 0);
  document.getElementById('rfAdultos').textContent = activos.reduce((sum, b) => sum + b.adultos, 0);

  cambiarVista('view-final-report-download'); // Vamos a la vista de descarga
});

// ALGORITMO ALTA PRIORIDAD: CONSTRUCCIÓN DEL LIBRO DE EXCEL MULTI-PESTAÑA
document.getElementById('btnDescargarExcel').addEventListener('click', () => {
  let listado = JSON.parse(localStorage.getItem('listadoBuses')) || [];
  let activos = listado.filter(b => b.activo === true);

  if (activos.length === 0) {
    alert("No hay registros activos para exportar.");
    return;
  }

  // --- HOJA 1: RESUMEN DETALLADO (Agrupado por Estado y por Entidad) ---
  let rowsDetallado = [];
  rowsDetallado.push(["REPORTE DE ASISTENCIA DE COLEGIOS, COMUNAS E INSTITUCIONES"]);
  rowsDetallado.push([]); // Espacio en blanco

  const estadosFiltro = ["Distrito Capital", "Miranda", "La Guaira"];
  const entidadesFiltro = [
    { key: "Colegio", label: "COLEGIOS / ESCUELAS" },
    { key: "Comuna", label: "COMUNAS" },
    { key: "Institucion", label: "INSTITUCIONES" }
  ];

  estadosFiltro.forEach(est => {
    entidadesFiltro.forEach(ent => {
      // Filtrar registros específicos para este sub-bloque
      let filtrados = activos.filter(b => b.estado === est && b.tipoEntidad === ent.key);
      
      if (filtrados.length > 0) {
        // Encabezado del bloque
        rowsDetallado.push(["ITEMS", "FECHA", ent.label, ent.label, "PARROQUIA", "ESTADO"]);
        
        filtrados.forEach((b, index) => {
          rowsDetallado.push([
            index + 1,
            b.fecha,
            b.tipoEntidad === 'Colegio' ? b.nombreEntidad : "", // Si es colegio duplica o mantiene según mapeo csv
            b.nombreEntidad,
            b.parroquia.toUpperCase(),
            b.estado === "Distrito Capital" ? "DTTO. CAPITAL" : b.estado.toUpperCase()
          ]);
        });
        rowsDetallado.push([]); // Línea de separación entre bloques
      }
    });
  });

  let wsDetallado = XLSX.utils.aoa_to_sheet(rowsDetallado);

  // --- HOJA 2: RESUMEN GENERAL (Métricas Calculadas) ---
  let cBuses = activos.length;
  let cComunas = activos.filter(b => b.tipoEntidad === 'Comuna').length;
  let cColegios = activos.filter(b => b.tipoEntidad === 'Colegio').length;
  let cInstitutos = activos.filter(b => b.tipoEntidad === 'Institucion').length;
  let cNinos = activos.reduce((sum, b) => sum + b.ninos, 0);
  let cAdultos = activos.reduce((sum, b) => sum + b.adultos, 0);

  let rowsGeneral = [
    [],
    ["", "REPORTE FINAL DE MOVILIZACIÓN DIARIA"],
    ["", "Resumen consolidado de operaciones y transporte de pasajeros"],
    [],
    ["", "Indicador", "Valor Calculado"],
    ["", "Cantidad Total de Buses", cBuses],
    ["", "Cantidad Total de Comunas", cComunas],
    ["", "Cantidad Total de Colegios", cColegios],
    ["", "Cantidad Total de Institutos", cInstitutos],
    ["", "Cantidad Total de Niños", cNinos],
    ["", "Cantidad Total de Adultos", cAdultos]
  ];
  let wsGeneral = XLSX.utils.aoa_to_sheet(rowsGeneral);

  // Compilar el libro de trabajo (Workbook)
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsDetallado, "Resumen Detallado");
  XLSX.utils.book_append_sheet(wb, wsGeneral, "Resumen General");

  // Forzar descarga del binario Excel
  let fechaHoy = new Date().toLocaleDateString('es-VE').replace(/\//g, '-');
  XLSX.writeFile(wb, `REPORTE DE COLEGIOS Y COMUNAS ${fechaHoy}.xlsx`);

  // --- EJECUCIÓN DEL BORRADO LÓGICO ---
  listado.forEach(b => { if(b.activo === true) b.activo = false; });
  localStorage.setItem('listadoBuses', JSON.stringify(listado));

  alert("Archivo Excel generado con éxito. La jornada se ha cerrado y el listado se limpió.");
  cambiarVista('view-listado');
});

// Inicialización de arranque
if(localStorage.getItem('theme') === 'light') {
  document.body.classList.remove('dark-theme');
  document.getElementById('chkDarkMode').checked = false;
}
if(usuarioActivo) {
  document.getElementById('avatarUser').textContent = usuarioActivo.username.charAt(0).toUpperCase();
  cambiarVista('view-listado');
} else {
  cambiarVista('view-login');
}