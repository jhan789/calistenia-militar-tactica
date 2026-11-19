/**
 * Módulo de Progreso y Racha de Entrenamiento.
 * Gestiona el historial de entrenamientos completados (persistido en localStorage),
 * calcula los días entrenados, la racha actual de días consecutivos y el rango militar alcanzado.
 * Las funciones de cálculo son puras y reciben el almacenamiento por parámetro para poder probarse en Node.
 */

const CLAVE_HISTORIAL = 'calisteniaMilitar.historial';
const MS_POR_DIA = 24 * 60 * 60 * 1000;

const RANGOS_MILITARES = [
  { id: 'recluta', nombre: 'Recluta', diasMinimos: 0 },
  { id: 'operativo', nombre: 'Operativo', diasMinimos: 10 },
  { id: 'elite', nombre: 'Élite', diasMinimos: 30 }
];

const GRUPOS_MUSCULARES_MAPA = [
  'pectoral',
  'hombros',
  'biceps',
  'triceps',
  'espalda',
  'core',
  'cuadriceps',
  'gluteos',
  'isquiotibiales',
  'pantorrillas'
];

const MAPA_MUSCULOS_POR_AREA = {
  tren_superior: {
    primarios: ['pectoral', 'hombros', 'espalda', 'triceps', 'biceps'],
    secundarios: ['core'],
    porcentajes: {
      pectoral: 95,
      hombros: 85,
      espalda: 90,
      triceps: 85,
      biceps: 80,
      core: 45
    }
  },
  core: {
    primarios: ['core'],
    secundarios: ['hombros', 'gluteos', 'cuadriceps'],
    porcentajes: {
      core: 100,
      hombros: 50,
      gluteos: 40,
      cuadriceps: 35
    }
  },
  tren_inferior: {
    primarios: ['cuadriceps', 'gluteos', 'isquiotibiales', 'pantorrillas'],
    secundarios: ['core'],
    porcentajes: {
      cuadriceps: 95,
      gluteos: 95,
      isquiotibiales: 85,
      pantorrillas: 75,
      core: 45
    }
  },
  cuerpo_completo: {
    primarios: ['pectoral', 'hombros', 'core', 'cuadriceps', 'triceps'],
    secundarios: ['espalda', 'gluteos', 'isquiotibiales', 'pantorrillas', 'biceps'],
    porcentajes: {
      pectoral: 85,
      hombros: 85,
      core: 90,
      cuadriceps: 90,
      triceps: 75,
      espalda: 60,
      gluteos: 70,
      isquiotibiales: 60,
      pantorrillas: 65,
      biceps: 50
    }
  }
};

const ETIQUETAS_DIAS_SEMANA = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const NOMBRES_LEGIBLES_MUSCULOS = {
  pectoral: 'Pectorales',
  hombros: 'Deltoides',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  espalda: 'Dorsales',
  core: 'Abdominales',
  cuadriceps: 'Cuádriceps',
  gluteos: 'Glúteos',
  isquiotibiales: 'Isquiotibiales',
  pantorrillas: 'Pantorrillas'
};

const PALABRAS_CLAVE_MUSCULOS = {
  pectoral: ['pectoral', 'cuerpo completo'],
  hombros: ['deltoides', 'hombro', 'cuerpo completo'],
  biceps: ['biceps', 'cuerpo completo'],
  triceps: ['triceps', 'cuerpo completo'],
  espalda: ['dorsal', 'trapecio', 'espalda', 'cuerpo completo'],
  core: ['abdominal', 'transverso', 'oblicuo', 'core', 'cadera', 'cuerpo completo'],
  cuadriceps: ['cuadriceps', 'cuerpo completo'],
  gluteos: ['gluteo', 'cuerpo completo'],
  isquiotibiales: ['isquiotibiales', 'cuerpo completo'],
  pantorrillas: ['pantorrillas', 'cuerpo completo']
};

/**
 * Convierte un objeto Date en una cadena de fecha local con formato AAAA-MM-DD.
 *
 * @param {Date} [fecha=new Date()] - Fecha a formatear.
 * @returns {string} Fecha local en formato 'AAAA-MM-DD'.
 * @throws {Error} Si el parámetro no es una fecha válida.
 */
function formatearFechaLocal(fecha = new Date()) {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
    throw new Error('Se requiere una fecha válida.');
  }
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Convierte una fecha 'AAAA-MM-DD' en un número de día absoluto (días desde 1970-01-01),
 * usando UTC para evitar desfases por cambios de horario de verano.
 *
 * @param {string} fechaTexto - Fecha en formato 'AAAA-MM-DD'.
 * @returns {number} Número entero de día absoluto.
 * @throws {Error} Si el formato de la fecha no es válido.
 */
function convertirFechaANumeroDia(fechaTexto) {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fechaTexto));
  if (!coincidencia) {
    throw new Error(`Formato de fecha inválido: "${fechaTexto}". Se esperaba AAAA-MM-DD.`);
  }
  const [, anio, mes, dia] = coincidencia.map(Number);
  return Math.round(Date.UTC(anio, mes - 1, dia) / MS_POR_DIA);
}

/**
 * Crea y valida un registro de entrenamiento completado.
 *
 * @param {Object} datos - Datos del entrenamiento.
 * @param {string} datos.fecha - Fecha local en formato 'AAAA-MM-DD'.
 * @param {string} datos.area - Área muscular trabajada (p. ej. 'core').
 * @param {number} datos.repeticionesTotales - Repeticiones totales de la rutina (entero >= 0).
 * @param {string} [datos.genero] - Perfil usado ('hombre' o 'mujer').
 * @param {string} [datos.nivel] - Nivel de exigencia usado.
 * @param {number} [datos.seriesCompletadas] - Series marcadas como completadas.
 * @param {number} [datos.seriesTotales] - Series totales de la rutina.
 * @returns {Object} Registro normalizado listo para guardarse.
 * @throws {Error} Si la fecha, el área o las repeticiones no son válidas.
 */
function crearRegistroEntrenamiento(datos) {
  if (!datos || typeof datos !== 'object') {
    throw new Error('Se requieren los datos del entrenamiento.');
  }
  convertirFechaANumeroDia(datos.fecha);
  if (typeof datos.area !== 'string' || !datos.area.trim()) {
    throw new Error('Se requiere el área trabajada.');
  }
  if (!Number.isInteger(datos.repeticionesTotales) || datos.repeticionesTotales < 0) {
    throw new Error('Las repeticiones totales deben ser un entero mayor o igual a 0.');
  }

  return {
    fecha: datos.fecha,
    area: datos.area.trim(),
    repeticionesTotales: datos.repeticionesTotales,
    genero: datos.genero ?? null,
    nivel: datos.nivel ?? null,
    seriesCompletadas: Number.isInteger(datos.seriesCompletadas) ? datos.seriesCompletadas : 0,
    seriesTotales: Number.isInteger(datos.seriesTotales) ? datos.seriesTotales : 0,
    registradoEn: new Date().toISOString()
  };
}

/**
 * Lee el historial de entrenamientos desde el almacenamiento.
 * Si los datos están corruptos o no existen, devuelve un arreglo vacío.
 *
 * @param {Storage} almacenamiento - Objeto compatible con la API Storage (p. ej. window.localStorage).
 * @returns {Object[]} Lista de registros de entrenamiento guardados.
 */
function cargarHistorial(almacenamiento) {
  try {
    const crudo = almacenamiento.getItem(CLAVE_HISTORIAL);
    const datos = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    return [];
  }
}

/**
 * Agrega un registro al historial y lo persiste en el almacenamiento.
 *
 * @param {Storage} almacenamiento - Objeto compatible con la API Storage.
 * @param {Object} registro - Registro creado con crearRegistroEntrenamiento.
 * @returns {Object[]} Historial actualizado.
 * @throws {Error} Si el almacenamiento no permite guardar (p. ej. cuota excedida o modo privado).
 */
function guardarRegistro(almacenamiento, registro) {
  const historial = cargarHistorial(almacenamiento);
  historial.push(registro);
  almacenamiento.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
  return historial;
}

/**
 * Obtiene los números de día únicos en los que se entrenó, ordenados de forma ascendente.
 *
 * @param {Object[]} historial - Lista de registros de entrenamiento.
 * @returns {number[]} Días absolutos únicos y ordenados (los registros con fecha inválida se ignoran).
 */
function obtenerDiasUnicos(historial) {
  const dias = new Set();
  for (const registro of historial || []) {
    try {
      dias.add(convertirFechaANumeroDia(registro.fecha));
    } catch (error) {
      // Registro con fecha inválida: se ignora
    }
  }
  return [...dias].sort((a, b) => a - b);
}

/**
 * Calcula cuántos días distintos se ha entrenado (varios entrenamientos el mismo día cuentan como uno).
 *
 * @param {Object[]} historial - Lista de registros de entrenamiento.
 * @returns {number} Cantidad de días entrenados.
 */
function calcularDiasEntrenados(historial) {
  return obtenerDiasUnicos(historial).length;
}

/**
 * Calcula la racha actual de días consecutivos entrenados.
 * La racha sigue viva si el último entrenamiento fue hoy o ayer; si fue antes, la racha es 0.
 *
 * @param {Object[]} historial - Lista de registros de entrenamiento.
 * @param {string} [fechaHoy=formatearFechaLocal()] - Fecha de referencia 'AAAA-MM-DD'.
 * @returns {number} Días consecutivos de la racha actual.
 */
function calcularRachaActual(historial, fechaHoy = formatearFechaLocal()) {
  const dias = obtenerDiasUnicos(historial);
  if (dias.length === 0) {
    return 0;
  }

  const hoy = convertirFechaANumeroDia(fechaHoy);
  let indice = dias.length - 1;
  // Ignorar registros con fecha futura respecto a hoy
  while (indice >= 0 && dias[indice] > hoy) {
    indice -= 1;
  }
  if (indice < 0 || hoy - dias[indice] > 1) {
    return 0;
  }

  let racha = 1;
  while (indice > 0 && dias[indice] - dias[indice - 1] === 1) {
    racha += 1;
    indice -= 1;
  }
  return racha;
}

/**
 * Determina el rango militar según los días entrenados y el progreso hacia el siguiente rango.
 * Umbrales: Recluta (0-9 días), Operativo (10-29 días), Élite (30+ días).
 *
 * @param {number} diasEntrenados - Cantidad de días entrenados (entero >= 0).
 * @returns {{ id: string, nombre: string, siguiente: (string|null), diasParaSiguiente: number, porcentajeProgreso: number }} Rango actual y progreso.
 * @throws {Error} Si diasEntrenados no es un entero mayor o igual a 0.
 */
function determinarRangoMilitar(diasEntrenados) {
  if (!Number.isInteger(diasEntrenados) || diasEntrenados < 0) {
    throw new Error('Los días entrenados deben ser un entero mayor o igual a 0.');
  }

  let indiceActual = 0;
  RANGOS_MILITARES.forEach((rango, indice) => {
    if (diasEntrenados >= rango.diasMinimos) {
      indiceActual = indice;
    }
  });

  const actual = RANGOS_MILITARES[indiceActual];
  const siguiente = RANGOS_MILITARES[indiceActual + 1] || null;

  if (!siguiente) {
    return { id: actual.id, nombre: actual.nombre, siguiente: null, diasParaSiguiente: 0, porcentajeProgreso: 100 };
  }

  const tramo = siguiente.diasMinimos - actual.diasMinimos;
  const avance = diasEntrenados - actual.diasMinimos;
  return {
    id: actual.id,
    nombre: actual.nombre,
    siguiente: siguiente.nombre,
    diasParaSiguiente: siguiente.diasMinimos - diasEntrenados,
    porcentajeProgreso: Math.round((avance / tramo) * 100)
  };
}

/**
 * Convierte un número de día absoluto (días desde 1970-01-01) en una cadena 'AAAA-MM-DD'.
 *
 * @param {number} numeroDia - Día absoluto entero.
 * @returns {string} Fecha en formato 'AAAA-MM-DD'.
 */
function convertirNumeroDiaAFecha(numeroDia) {
  const fechaUTC = new Date(numeroDia * MS_POR_DIA);
  const anio = fechaUTC.getUTCFullYear();
  const mes = String(fechaUTC.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(fechaUTC.getUTCDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Calcula las métricas de progreso de los últimos 7 días (panel semanal estilo Strava Strength).
 *
 * @param {Object[]} historial - Lista de registros de entrenamiento guardados.
 * @param {string} [fechaHoy=formatearFechaLocal()] - Fecha de referencia 'AAAA-MM-DD'.
 * @returns {{ diasEntrenadosSemana: number, repeticionesSemana: number, entrenamientosSemana: number, conteoPorAreaSemana: Object, actividadUltimos7Dias: Object[] }} Métricas semanales y detalle de los últimos 7 días.
 */
function calcularProgresoSemanal(historial, fechaHoy = formatearFechaLocal()) {
  const lista = Array.isArray(historial) ? historial : [];
  const diaHoy = convertirFechaANumeroDia(fechaHoy);
  const diaInicioVentana = diaHoy - 6;

  const registrosSemana = [];
  const diasUnicosSemana = new Set();
  const repeticionesPorDia = new Map();
  const conteoPorAreaSemana = {
    tren_superior: 0,
    core: 0,
    tren_inferior: 0,
    cuerpo_completo: 0
  };

  let repeticionesSemana = 0;

  for (const registro of lista) {
    try {
      const numDia = convertirFechaANumeroDia(registro.fecha);
      if (numDia >= diaInicioVentana && numDia <= diaHoy) {
        registrosSemana.push(registro);
        diasUnicosSemana.add(numDia);
        const reps = Number.isInteger(registro.repeticionesTotales) ? registro.repeticionesTotales : 0;
        repeticionesSemana += reps;
        repeticionesPorDia.set(numDia, (repeticionesPorDia.get(numDia) || 0) + reps);
        if (Object.prototype.hasOwnProperty.call(conteoPorAreaSemana, registro.area)) {
          conteoPorAreaSemana[registro.area] += 1;
        }
      }
    } catch (error) {
      // Registro con fecha inválida: se ignora
    }
  }

  const actividadUltimos7Dias = [];
  for (let d = diaInicioVentana; d <= diaHoy; d += 1) {
    const fechaUTC = new Date(d * MS_POR_DIA);
    const indiceDiaSemana = fechaUTC.getUTCDay();
    actividadUltimos7Dias.push({
      fecha: convertirNumeroDiaAFecha(d),
      etiquetaDia: ETIQUETAS_DIAS_SEMANA[indiceDiaSemana],
      entrenado: diasUnicosSemana.has(d),
      repeticiones: repeticionesPorDia.get(d) || 0
    });
  }

  return {
    diasEntrenadosSemana: diasUnicosSemana.size,
    repeticionesSemana,
    entrenamientosSemana: registrosSemana.length,
    conteoPorAreaSemana,
    actividadUltimos7Dias
  };
}

/**
 * Calcula el estado de activación y calor muscular para los 6 grupos principales
 * (pectoral, hombros, espalda, core, cuadriceps, gluteos) combinando el área seleccionada
 * actualmente y el historial de entrenamientos de los últimos 7 días.
 *
 * @param {string} areaActiva - Área seleccionada ('tren_superior', 'core', 'tren_inferior', 'cuerpo_completo').
 * @param {Object[]} historial - Historial de entrenamientos completados.
 * @param {string} [fechaHoy=formatearFechaLocal()] - Fecha de referencia 'AAAA-MM-DD'.
 * @returns {{ areaActiva: string, musculos: Object, listaActivos: string[] }} Mapa de calor por músculo.
 */
function calcularMapaCalorMuscular(areaActiva, historial, fechaHoy = formatearFechaLocal()) {
  const areaNormalizada = MAPA_MUSCULOS_POR_AREA[areaActiva] ? areaActiva : 'tren_superior';
  const configArea = MAPA_MUSCULOS_POR_AREA[areaNormalizada];
  const semanal = calcularProgresoSemanal(historial, fechaHoy);

  const sesionesPorMusculo = {};
  for (const grupo of GRUPOS_MUSCULARES_MAPA) {
    sesionesPorMusculo[grupo] = 0;
  }

  Object.entries(semanal.conteoPorAreaSemana).forEach(([area, cantidad]) => {
    if (cantidad <= 0 || !MAPA_MUSCULOS_POR_AREA[area]) return;
    MAPA_MUSCULOS_POR_AREA[area].primarios.forEach((m) => {
      sesionesPorMusculo[m] += cantidad;
    });
    MAPA_MUSCULOS_POR_AREA[area].secundarios.forEach((m) => {
      sesionesPorMusculo[m] += cantidad * 0.5;
    });
  });

  const musculos = {};
  const listaActivos = [];

  for (const grupo of GRUPOS_MUSCULARES_MAPA) {
    const esPrimario = configArea.primarios.includes(grupo);
    const esSecundario = configArea.secundarios.includes(grupo);
    const sesionesSemana = sesionesPorMusculo[grupo];

    let estado = 'inactivo';
    let nivelCalor = 0;
    let porcentajeActivacion = 0;

    if (esPrimario) {
      estado = 'primario';
      nivelCalor = 3;
      porcentajeActivacion = configArea.porcentajes[grupo] || 90;
      listaActivos.push(NOMBRES_LEGIBLES_MUSCULOS[grupo]);
    } else if (esSecundario) {
      estado = 'secundario';
      nivelCalor = 2;
      porcentajeActivacion = configArea.porcentajes[grupo] || 45;
      listaActivos.push(NOMBRES_LEGIBLES_MUSCULOS[grupo]);
    } else if (sesionesSemana > 0) {
      estado = 'historial';
      nivelCalor = 1;
      porcentajeActivacion = Math.min(60, Math.max(20, Math.round(sesionesSemana * 20)));
    }

    musculos[grupo] = {
      id: grupo,
      nombre: NOMBRES_LEGIBLES_MUSCULOS[grupo],
      estado,
      nivelCalor,
      porcentajeActivacion,
      sesionesSemana: Math.ceil(sesionesSemana)
    };
  }

  return {
    areaActiva: areaNormalizada,
    musculos,
    listaActivos
  };
}

/**
 * Normaliza un texto eliminando tildes y convirtiéndolo a minúsculas para comparaciones seguras.
 *
 * @param {string} texto - Cadena de texto a normalizar.
 * @returns {string} Cadena en minúsculas sin acentos diacríticos.
 */
function normalizarTextoMusculo(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Determina qué ejercicios de una lista trabajan el grupo muscular indicado.
 *
 * @param {string} idMusculo - Identificador del músculo del mapa anatómico (p. ej. 'pectoral', 'biceps', 'isquiotibiales').
 * @param {Object[]} ejercicios - Lista de ejercicios de la rutina activa (cada uno con `id` y `musculos`).
 * @returns {string[]} Arreglo con los identificadores (`id`) de los ejercicios que trabajan ese músculo.
 */
function obtenerEjerciciosPorMusculo(idMusculo, ejercicios) {
  if (!Array.isArray(ejercicios) || !PALABRAS_CLAVE_MUSCULOS[idMusculo]) {
    return [];
  }
  const claves = PALABRAS_CLAVE_MUSCULOS[idMusculo];
  return ejercicios
    .filter((ej) => {
      const listaMusculos = Array.isArray(ej.musculos) ? ej.musculos : [];
      return listaMusculos.some((m) => {
        const normalizado = normalizarTextoMusculo(m);
        return claves.some((clave) => normalizado.includes(clave));
      });
    })
    .map((ej) => ej.id);
}

/**
 * Genera el texto limpio y estructurado listo para copiar y compartir por WhatsApp
 * al finalizar un entrenamiento.
 *
 * @param {Object} datos - Datos de la tarjeta de entrenamiento completado.
 * @param {string} datos.fecha - Fecha del entrenamiento.
 * @param {string} datos.areaNombre - Nombre legible del área trabajada.
 * @param {string} datos.nivelNombre - Nombre legible del nivel ejecutado.
 * @param {string} datos.rangoNombre - Rango militar actual ('Recluta', 'Operativo', 'Élite').
 * @param {number} datos.duracionMinutos - Duración estimada en minutos.
 * @param {number} datos.repeticionesTotales - Repeticiones totales completadas.
 * @param {number} datos.rachaActual - Días consecutivos de racha activa.
 * @param {string[]} [datos.musculosActivos=[]] - Lista de grupos musculares activados.
 * @returns {string} Resumen formateado para WhatsApp.
 * @throws {Error} Si faltan los datos del resumen.
 */
function generarTextoCompartibleWhatsApp(datos) {
  if (!datos || typeof datos !== 'object') {
    throw new Error('Se requieren los datos del entrenamiento para generar el resumen compartible.');
  }

  const musculosTexto =
    Array.isArray(datos.musculosActivos) && datos.musculosActivos.length > 0
      ? datos.musculosActivos.join(', ')
      : 'Cuerpo Completo';

  return [
    '🎖️ *CALISTENIA MILITAR TÁCTICA — MISIÓN CUMPLIDA*',
    `📅 Fecha: ${datos.fecha}`,
    `🎯 Área: ${datos.areaNombre} (${datos.nivelNombre})`,
    `💪 Músculos: ${musculosTexto}`,
    `🔢 Volumen: ${datos.repeticionesTotales} repeticiones`,
    `⏱️ Tiempo total: ${datos.duracionMinutos} min`,
    `🔥 Racha activa: ${datos.rachaActual} ${datos.rachaActual === 1 ? 'día' : 'días'} | Rango: ${datos.rangoNombre}`
  ].join('\n');
}

/**
 * Genera el resumen completo de progreso a partir del historial.
 *
 * @param {Object[]} historial - Lista de registros de entrenamiento.
 * @param {string} [fechaHoy=formatearFechaLocal()] - Fecha de referencia 'AAAA-MM-DD'.
 * @returns {{ diasEntrenados: number, rachaActual: number, entrenadoHoy: boolean, rango: Object, ultimoRegistro: (Object|null), totalEntrenamientos: number }} Resumen de progreso.
 */
function calcularResumenProgreso(historial, fechaHoy = formatearFechaLocal()) {
  const lista = Array.isArray(historial) ? historial : [];
  const diasEntrenados = calcularDiasEntrenados(lista);
  const semanal = calcularProgresoSemanal(lista, fechaHoy);
  return {
    diasEntrenados,
    rachaActual: calcularRachaActual(lista, fechaHoy),
    entrenadoHoy: lista.some((registro) => registro.fecha === fechaHoy),
    rango: determinarRangoMilitar(diasEntrenados),
    ultimoRegistro: lista.length > 0 ? lista[lista.length - 1] : null,
    totalEntrenamientos: lista.length,
    semanal
  };
}

const API_PROGRESO_ENTRENAMIENTO = {
  CLAVE_HISTORIAL,
  RANGOS_MILITARES,
  GRUPOS_MUSCULARES_MAPA,
  MAPA_MUSCULOS_POR_AREA,
  formatearFechaLocal,
  convertirFechaANumeroDia,
  crearRegistroEntrenamiento,
  cargarHistorial,
  guardarRegistro,
  calcularDiasEntrenados,
  calcularRachaActual,
  determinarRangoMilitar,
  calcularProgresoSemanal,
  calcularMapaCalorMuscular,
  obtenerEjerciciosPorMusculo,
  generarTextoCompartibleWhatsApp,
  calcularResumenProgreso
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_PROGRESO_ENTRENAMIENTO;
}

if (typeof window !== 'undefined') {
  window.ProgresoEntrenamiento = API_PROGRESO_ENTRENAMIENTO;
}
