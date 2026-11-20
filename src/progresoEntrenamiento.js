/**
 * Módulo de Progreso y Racha de Entrenamiento.
 * Gestiona el historial de entrenamientos completados (persistido en localStorage),
 * calcula los días entrenados, la racha actual de días consecutivos y el rango militar alcanzado.
 * Las funciones de cálculo son puras y reciben el almacenamiento por parámetro para poder probarse en Node.
 */

const CLAVE_HISTORIAL = 'calisteniaMilitar.historial';
const CLAVE_PERFIL = 'calisteniaMilitar.perfil';
const CLAVE_RETOS = 'calisteniaMilitar.retos';
const CLAVE_ONBOARDING = 'calisteniaMilitar.onboarding';
const MS_POR_DIA = 24 * 60 * 60 * 1000;

const PASOS_ONBOARDING = [
  {
    id: 'objetivo_elegido',
    titulo: '1. Elegir objetivo',
    descripcion: 'Selecciona tu enfoque táctico en Inicio.'
  },
  {
    id: 'sonido_probado',
    titulo: '2. Probar alerta sonora',
    descripcion: 'Activa o prueba el aviso acústico del temporizador.'
  },
  {
    id: 'tecnica_vista',
    titulo: '3. Abrir guía "Ver técnica"',
    descripcion: 'Inspecciona la biomecánica animada de un ejercicio.'
  },
  {
    id: 'primera_rutina',
    titulo: '4. Completar primera rutina',
    descripcion: 'Finaliza o registra tu primer entrenamiento.'
  }
];

const MODOS_INTENSIDAD_INSTANTANEA = {
  mas_facil: {
    id: 'mas_facil',
    nombre: 'Más fácil',
    icono: '🟢',
    descripcion: 'Energía baja o técnica: -25% repeticiones y +15 s de descanso para priorizar ejecución limpia.',
    factorReps: 0.75,
    deltaSeries: 0,
    deltaDescanso: 15
  },
  constante: {
    id: 'constante',
    nombre: 'Constante',
    icono: '🟠',
    descripcion: 'Energía estándar: 100% de las series, repeticiones y descansos prescritos para mantener tu racha.',
    factorReps: 1.0,
    deltaSeries: 0,
    deltaDescanso: 0
  },
  mas_dificil: {
    id: 'mas_dificil',
    nombre: 'Más difícil',
    icono: '🔴',
    descripcion: 'Pico de energía hoy: +25% repeticiones, +1 serie extra y -10 s de descanso para máxima exigencia.',
    factorReps: 1.25,
    deltaSeries: 1,
    deltaDescanso: -10
  },
  variedad: {
    id: 'variedad',
    nombre: 'Variedad',
    icono: '⚡',
    descripcion: 'Cadencia táctica dinámica: +10% repeticiones y -5 s de descanso para mayor estímulo metabólico.',
    factorReps: 1.1,
    deltaSeries: 0,
    deltaDescanso: -5
  }
};

const EQUIPAMIENTO_CASERO = [
  { id: 'peso_corporal', nombre: 'Sin equipo (Peso corporal)', icono: '🤸' },
  { id: 'barra_dominadas', nombre: 'Barra de dominadas', icono: '🔩' },
  { id: 'paralelas_banco', nombre: 'Paralelas / Banco', icono: '🪑' },
  { id: 'mochila_peso', nombre: 'Mochila con peso (Ruck)', icono: '🎒' },
  { id: 'bandas', nombre: 'Bandas de resistencia', icono: '➰' }
];

const RETOS_PREDEFINIDOS = [
  {
    id: 'reto_30_fuerza',
    titulo: 'Reto 30 días de fuerza',
    descripcion: 'Completa 30 días distintos de entrenamiento táctico.',
    icono: '🛡️',
    tipo: 'dias',
    meta: 30,
    esPersonalizado: false
  },
  {
    id: 'prueba_fisica_militar',
    titulo: 'Prueba física militar',
    descripcion: 'Acumula 1.000 repeticiones estrictas en tu historial.',
    icono: '🎖️',
    tipo: 'repeticiones',
    meta: 1000,
    esPersonalizado: false
  },
  {
    id: 'semana_acero',
    titulo: 'Semana de acero',
    descripcion: 'Entrena 5 días distintos en los últimos 7 días.',
    icono: '⚡',
    tipo: 'dias_semana',
    meta: 5,
    esPersonalizado: false
  }
];

const OBJETIVOS_TACTICOS = {
  fuerza_maxima: {
    id: 'fuerza_maxima',
    nombre: 'Fuerza máxima',
    icono: '🏋️',
    descripcion: 'Prioriza tensión mecánica, control excéntrico lento (3 s) y pausas largas.',
    recomendacionRutina: 'Ejecuta cada repetición con bajada lenta de 3 s y añade +15 s de descanso entre series.',
    ajusteDescansoSegundos: 15,
    nivelSugerido: 'fuerzas_especiales'
  },
  prueba_militar: {
    id: 'prueba_militar',
    nombre: 'Prueba física militar',
    icono: '🎖️',
    descripcion: 'Enfocado en máxima cadencia, densidad y resistencia bajo cronómetro.',
    recomendacionRutina: 'Mantén cadencia estricta de examen físico, reduce descansos en -15 s y busca máxima limpieza técnica.',
    ajusteDescansoSegundos: -15,
    nivelSugerido: 'operativo'
  },
  constancia_diaria: {
    id: 'constancia_diaria',
    nombre: 'Constancia diaria',
    icono: '🔥',
    descripcion: 'Construye hábito sostenible manteniendo tu racha sin fatiga excesiva.',
    recomendacionRutina: 'Completa el volumen estándar con RPE controlado (6-7/10) para entrenar mañana al 100%.',
    ajusteDescansoSegundos: 0,
    nivelSugerido: 'operativo'
  },
  recuperacion_activa: {
    id: 'recuperacion_activa',
    nombre: 'Recuperación activa',
    icono: '🧘',
    descripcion: 'Descarga articular, movilidad y flujo sanguíneo para asimilar entrenamientos previos.',
    recomendacionRutina: 'Trabaja en rango Recluta (75%), no omitas el Calentamiento ni la Recuperación final (RPE 4-5/10).',
    ajusteDescansoSegundos: 15,
    nivelSugerido: 'recluta'
  }
};

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

  const rpeNumerico = Number(datos.rpe);
  const rpeValido =
    Number.isFinite(rpeNumerico) && rpeNumerico >= 1 && rpeNumerico <= 10
      ? Math.round(rpeNumerico)
      : 7;

  return {
    fecha: datos.fecha,
    area: datos.area.trim(),
    repeticionesTotales: datos.repeticionesTotales,
    genero: datos.genero ?? null,
    nivel: datos.nivel ?? null,
    seriesCompletadas: Number.isInteger(datos.seriesCompletadas) ? datos.seriesCompletadas : 0,
    seriesTotales: Number.isInteger(datos.seriesTotales) ? datos.seriesTotales : 0,
    rpe: rpeValido,
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
 * Carga la configuración del perfil táctico del usuario desde localStorage.
 * Devuelve valores por defecto seguros si no existe o está corrupto.
 *
 * @param {Storage} almacenamiento - Objeto compatible con Storage (p. ej. window.localStorage).
 * @returns {{ nombreUsuario: string, objetivoActivo: string, metaSemanalDias: number }} Perfil del usuario.
 */
function cargarPerfilUsuario(almacenamiento) {
  const porDefecto = {
    nombreUsuario: 'Operador Táctico',
    objetivoActivo: 'constancia_diaria',
    metaSemanalDias: 4,
    equipamiento: ['peso_corporal']
  };
  try {
    const crudo = almacenamiento.getItem(CLAVE_PERFIL);
    if (!crudo) return { ...porDefecto, equipamiento: [...porDefecto.equipamiento] };
    const parsed = JSON.parse(crudo);
    const nombre =
      typeof parsed.nombreUsuario === 'string' && parsed.nombreUsuario.trim()
        ? parsed.nombreUsuario.trim().slice(0, 40)
        : porDefecto.nombreUsuario;
    const objetivo = OBJETIVOS_TACTICOS[parsed.objetivoActivo]
      ? parsed.objetivoActivo
      : porDefecto.objetivoActivo;
    const meta =
      Number.isInteger(parsed.metaSemanalDias) && parsed.metaSemanalDias >= 1 && parsed.metaSemanalDias <= 7
        ? parsed.metaSemanalDias
        : porDefecto.metaSemanalDias;
    const idsValidos = EQUIPAMIENTO_CASERO.map((e) => e.id);
    const equipamiento = Array.isArray(parsed.equipamiento)
      ? parsed.equipamiento.filter((id) => idsValidos.includes(id))
      : [...porDefecto.equipamiento];
    return {
      nombreUsuario: nombre,
      objetivoActivo: objetivo,
      metaSemanalDias: meta,
      equipamiento: equipamiento.length > 0 ? equipamiento : ['peso_corporal']
    };
  } catch (error) {
    return { ...porDefecto, equipamiento: [...porDefecto.equipamiento] };
  }
}

/**
 * Guarda la configuración del perfil táctico (nombre, objetivo activo, meta semanal y equipamiento) en localStorage.
 *
 * @param {Storage} almacenamiento - Objeto compatible con Storage.
 * @param {Object} cambios - Propiedades a actualizar del perfil.
 * @returns {{ nombreUsuario: string, objetivoActivo: string, metaSemanalDias: number, equipamiento: string[] }} Perfil actualizado y persistido.
 */
function guardarPerfilUsuario(almacenamiento, cambios) {
  const actual = cargarPerfilUsuario(almacenamiento);
  const idsValidos = EQUIPAMIENTO_CASERO.map((e) => e.id);
  const equipamientoNuevo = Array.isArray(cambios.equipamiento)
    ? cambios.equipamiento.filter((id) => idsValidos.includes(id))
    : actual.equipamiento;

  const nuevo = {
    nombreUsuario:
      typeof cambios.nombreUsuario === 'string' && cambios.nombreUsuario.trim()
        ? cambios.nombreUsuario.trim().slice(0, 40)
        : actual.nombreUsuario,
    objetivoActivo: OBJETIVOS_TACTICOS[cambios.objetivoActivo]
      ? cambios.objetivoActivo
      : actual.objetivoActivo,
    metaSemanalDias:
      Number.isInteger(cambios.metaSemanalDias) && cambios.metaSemanalDias >= 1 && cambios.metaSemanalDias <= 7
        ? cambios.metaSemanalDias
        : actual.metaSemanalDias,
    equipamiento: equipamientoNuevo.length > 0 ? equipamientoNuevo : ['peso_corporal']
  };
  almacenamiento.setItem(CLAVE_PERFIL, JSON.stringify(nuevo));
  return nuevo;
}

/**
 * Carga la lista de retos personalizados creados por el usuario desde localStorage.
 *
 * @param {Storage} almacenamiento - Objeto compatible con Storage.
 * @returns {Object[]} Lista de retos personalizados.
 */
function cargarRetosPersonalizados(almacenamiento) {
  try {
    const crudo = almacenamiento.getItem(CLAVE_RETOS);
    const parsed = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

/**
 * Crea y guarda un nuevo reto personalizado en localStorage.
 *
 * @param {Storage} almacenamiento - Objeto compatible con Storage.
 * @param {{ titulo: string, tipo: ('dias'|'sesiones'|'repeticiones'|'dias_semana'), meta: number }} datosReto - Configuración del reto.
 * @returns {Object[]} Lista actualizada de retos personalizados.
 * @throws {Error} Si el título o la meta no son válidos.
 */
function guardarRetoPersonalizado(almacenamiento, datosReto) {
  if (!datosReto || typeof datosReto.titulo !== 'string' || !datosReto.titulo.trim()) {
    throw new Error('Debes indicar un título para tu reto personalizado.');
  }
  const metaNum = Number(datosReto.meta);
  if (!Number.isInteger(metaNum) || metaNum < 1) {
    throw new Error('La meta del reto debe ser un número entero positivo.');
  }
  const tiposValidos = ['dias', 'sesiones', 'repeticiones', 'dias_semana'];
  const tipo = tiposValidos.includes(datosReto.tipo) ? datosReto.tipo : 'sesiones';

  const retos = cargarRetosPersonalizados(almacenamiento);
  retos.push({
    id: `custom-${Date.now()}`,
    titulo: datosReto.titulo.trim().slice(0, 60),
    descripcion: `Reto personalizado: alcanzar ${metaNum} ${tipo === 'repeticiones' ? 'repeticiones' : tipo === 'dias' ? 'días entrenados' : tipo === 'dias_semana' ? 'días esta semana' : 'sesiones'}.`,
    icono: '🎯',
    tipo,
    meta: metaNum,
    esPersonalizado: true
  });
  almacenamiento.setItem(CLAVE_RETOS, JSON.stringify(retos));
  return retos;
}

/**
 * Evalúa el progreso actual de los 3 retos predefinidos más los retos personalizados del usuario.
 *
 * @param {Object[]} historial - Historial de entrenamientos completados.
 * @param {Object[]} [retosPersonalizados=[]] - Retos creados por el usuario.
 * @param {string} [fechaHoy=formatearFechaLocal()] - Fecha de referencia 'AAAA-MM-DD'.
 * @returns {Object[]} Lista de retos con su avance numérico, porcentaje y estado de completado.
 */
function evaluarRetosActivos(historial, retosPersonalizados = [], fechaHoy = formatearFechaLocal()) {
  const lista = Array.isArray(historial) ? historial : [];
  const diasTotales = calcularDiasEntrenados(lista);
  const sesionesTotales = lista.length;
  const repsTotales = lista.reduce(
    (acc, reg) => acc + (Number.isInteger(reg.repeticionesTotales) ? reg.repeticionesTotales : 0),
    0
  );
  const semanal = calcularProgresoSemanal(lista, fechaHoy);
  const todos = [...RETOS_PREDEFINIDOS, ...(Array.isArray(retosPersonalizados) ? retosPersonalizados : [])];

  return todos.map((reto) => {
    let actual = 0;
    let unidad = 'sesiones';
    if (reto.tipo === 'dias') {
      actual = diasTotales;
      unidad = 'días';
    } else if (reto.tipo === 'repeticiones') {
      actual = repsTotales;
      unidad = 'reps';
    } else if (reto.tipo === 'dias_semana') {
      actual = semanal.diasEntrenadosSemana;
      unidad = 'días (7d)';
    } else {
      actual = sesionesTotales;
      unidad = 'sesiones';
    }

    const porcentaje = Math.min(100, Math.round((actual / Math.max(1, reto.meta)) * 100));
    return {
      ...reto,
      actual,
      unidad,
      porcentaje,
      completado: actual >= reto.meta
    };
  });
}

/**
 * Exporta todos los datos guardados del usuario (historial, perfil y retos personalizados) como cadena JSON.
 *
 * @param {Storage} almacenamiento - Objeto compatible con Storage.
 * @returns {string} JSON formateado listo para descargar como respaldo.
 */
function exportarRespaldoCompleto(almacenamiento) {
  return JSON.stringify(
    {
      version: 1,
      exportadoEn: new Date().toISOString(),
      historial: cargarHistorial(almacenamiento),
      perfil: cargarPerfilUsuario(almacenamiento),
      retos: cargarRetosPersonalizados(almacenamiento)
    },
    null,
    2
  );
}

/**
 * Restaura un respaldo JSON exportado previamente en localStorage.
 *
 * @param {Storage} almacenamiento - Objeto compatible con Storage.
 * @param {string} jsonTexto - Contenido JSON del archivo de respaldo.
 * @returns {{ sesionesRestauradas: number, retosRestaurados: number }} Resumen de elementos restaurados.
 * @throws {Error} Si el JSON es inválido o no tiene el formato esperado.
 */
function importarRespaldoCompleto(almacenamiento, jsonTexto) {
  let datos;
  try {
    datos = JSON.parse(jsonTexto);
  } catch (error) {
    throw new Error('El archivo no contiene un JSON válido.');
  }
  if (!datos || typeof datos !== 'object' || !Array.isArray(datos.historial)) {
    throw new Error('El respaldo no tiene el formato de Calistenia Militar.');
  }

  almacenamiento.setItem(CLAVE_HISTORIAL, JSON.stringify(datos.historial));
  if (datos.perfil && typeof datos.perfil === 'object') {
    guardarPerfilUsuario(almacenamiento, datos.perfil);
  }
  const retos = Array.isArray(datos.retos) ? datos.retos : [];
  almacenamiento.setItem(CLAVE_RETOS, JSON.stringify(retos));

  return {
    sesionesRestauradas: datos.historial.length,
    retosRestaurados: retos.length
  };
}

/**
 * Calcula la serie de volumen de repeticiones agrupado por semana durante las últimas 12 semanas.
 *
 * @param {Object[]} historial - Lista de registros de entrenamiento.
 * @param {string} [fechaHoy=formatearFechaLocal()] - Fecha de referencia 'AAAA-MM-DD'.
 * @returns {Array<{ indice: number, etiqueta: string, repeticiones: number, sesiones: number }>} Arreglo de 12 semanas ordenadas cronológicamente.
 */
function calcularVolumen12Semanas(historial, fechaHoy = formatearFechaLocal()) {
  const lista = Array.isArray(historial) ? historial : [];
  const diaHoy = convertirFechaANumeroDia(fechaHoy);
  const semanas = [];

  for (let i = 11; i >= 0; i -= 1) {
    const fin = diaHoy - i * 7;
    const inicio = fin - 6;
    let repeticiones = 0;
    let sesiones = 0;

    for (const reg of lista) {
      try {
        const d = convertirFechaANumeroDia(reg.fecha);
        if (d >= inicio && d <= fin) {
          repeticiones += Number.isInteger(reg.repeticionesTotales) ? reg.repeticionesTotales : 0;
          sesiones += 1;
        }
      } catch (error) {
        // Ignorar fechas inválidas
      }
    }

    semanas.push({
      indice: 11 - i,
      etiqueta: i === 0 ? 'Actual' : `S-${i}`,
      repeticiones,
      sesiones
    });
  }

  return semanas;
}

/**
 * Calcula la mejor racha histórica de días consecutivos entrenados en todo el historial.
 *
 * @param {Object[]} historial - Lista de registros de entrenamiento.
 * @returns {number} Máximo número de días consecutivos alcanzados.
 */
function calcularMejorRachaHistorica(historial) {
  const dias = obtenerDiasUnicos(historial);
  if (dias.length === 0) return 0;

  let mejor = 1;
  let actual = 1;
  for (let i = 1; i < dias.length; i += 1) {
    if (dias[i] - dias[i - 1] === 1) {
      actual += 1;
      if (actual > mejor) mejor = actual;
    } else {
      actual = 1;
    }
  }
  return mejor;
}

/**
 * Evalúa el estado de desbloqueo de la Vitrina de Trofeos y Retos hexagonales.
 *
 * @param {Object[]} historial - Lista de registros de entrenamiento.
 * @param {string} [fechaHoy=formatearFechaLocal()] - Fecha de referencia 'AAAA-MM-DD'.
 * @returns {Array<{ id: string, titulo: string, descripcion: string, icono: string, desbloqueado: boolean, progresoTexto: string, porcentaje: number }>} Lista de trofeos evaluados.
 */
function evaluarTrofeos(historial, fechaHoy = formatearFechaLocal()) {
  const lista = Array.isArray(historial) ? historial : [];
  const totalSesiones = lista.length;
  const mejorRacha = Math.max(calcularRachaActual(lista, fechaHoy), calcularMejorRachaHistorica(lista));
  const repsTotales = lista.reduce(
    (acc, reg) => acc + (Number.isInteger(reg.repeticionesTotales) ? reg.repeticionesTotales : 0),
    0
  );

  return [
    {
      id: 'primera_sesion',
      titulo: 'Primera sesión',
      descripcion: 'Completa tu primera misión táctica.',
      icono: '🎖️',
      desbloqueado: totalSesiones >= 1,
      progresoTexto: `${Math.min(1, totalSesiones)} / 1 sesión`,
      porcentaje: Math.min(100, totalSesiones >= 1 ? 100 : 0)
    },
    {
      id: 'racha_3_dias',
      titulo: 'Racha de 3 días',
      descripcion: 'Entrena 3 días consecutivos sin fallar.',
      icono: '🔥',
      desbloqueado: mejorRacha >= 3,
      progresoTexto: `${Math.min(3, mejorRacha)} / 3 días`,
      porcentaje: Math.min(100, Math.round((mejorRacha / 3) * 100))
    },
    {
      id: 'reps_500',
      titulo: '500 repeticiones',
      descripcion: 'Acumula 500 repeticiones totales.',
      icono: '💪',
      desbloqueado: repsTotales >= 500,
      progresoTexto: `${Math.min(500, repsTotales)} / 500 reps`,
      porcentaje: Math.min(100, Math.round((repsTotales / 500) * 100))
    },
    {
      id: 'sesiones_10',
      titulo: '10 sesiones',
      descripcion: 'Completa 10 entrenamientos militares.',
      icono: '🏆',
      desbloqueado: totalSesiones >= 10,
      progresoTexto: `${Math.min(10, totalSesiones)} / 10 sesiones`,
      porcentaje: Math.min(100, Math.round((totalSesiones / 10) * 100))
    }
  ];
}

/**
 * Calcula la curva de Fitness y Fatiga (últimos 14 días) usando el volumen y el Esfuerzo Percibido (RPE 1-10)
 * de cada sesión mediante medias móviles exponenciales (modelo impulso-respuesta).
 *
 * @param {Object[]} historial - Lista de registros de entrenamiento con `fecha`, `repeticionesTotales` y `rpe`.
 * @param {string} [fechaHoy=formatearFechaLocal()] - Fecha de referencia 'AAAA-MM-DD'.
 * @returns {{ puntos: Array<{ fecha: string, etiqueta: string, carga: number, fitness: number, fatiga: number, forma: number }>, fitnessActual: number, fatigaActual: number, formaActual: number, estadoForma: string }} Curva de fitness y fatiga.
 */
function calcularCurvaFitnessFatiga(historial, fechaHoy = formatearFechaLocal()) {
  const lista = Array.isArray(historial) ? historial : [];
  const diaHoy = convertirFechaANumeroDia(fechaHoy);
  const cargaPorDia = new Map();

  for (const reg of lista) {
    try {
      const d = convertirFechaANumeroDia(reg.fecha);
      const reps = Number.isInteger(reg.repeticionesTotales) ? reg.repeticionesTotales : 0;
      const rpe = Number.isFinite(Number(reg.rpe)) && Number(reg.rpe) >= 1 && Number(reg.rpe) <= 10 ? Number(reg.rpe) : 7;
      const cargaSesion = Math.round((reps / 10) * rpe);
      cargaPorDia.set(d, (cargaPorDia.get(d) || 0) + cargaSesion);
    } catch (error) {
      // Ignorar registros con fecha inválida
    }
  }

  // Simular desde 27 días atrás para estabilizar la EWMA y devolver los últimos 14 días
  let fitness = 0;
  let fatiga = 0;
  const puntos = [];

  for (let d = diaHoy - 27; d <= diaHoy; d += 1) {
    const carga = cargaPorDia.get(d) || 0;
    fitness = fitness + (carga - fitness) / 14;
    fatiga = fatiga + (carga - fatiga) / 4;
    const forma = fitness - fatiga;

    if (d >= diaHoy - 13) {
      const fechaStr = convertirNumeroDiaAFecha(d);
      const [, mes, dia] = fechaStr.split('-');
      puntos.push({
        fecha: fechaStr,
        etiqueta: `${dia}/${mes}`,
        carga,
        fitness: Math.round(fitness),
        fatiga: Math.round(fatiga),
        forma: Math.round(forma)
      });
    }
  }

  const ultimo = puntos[puntos.length - 1] || { fitness: 0, fatiga: 0, forma: 0 };
  let estadoForma = 'Listo para entrenar';
  if (ultimo.fitness === 0 && ultimo.fatiga === 0) {
    estadoForma = 'Sin carga registrada';
  } else if (ultimo.forma < -25) {
    estadoForma = 'Alta fatiga — Prioriza recuperación';
  } else if (ultimo.forma >= -25 && ultimo.forma <= 10) {
    estadoForma = 'Zona óptima de progreso';
  } else {
    estadoForma = 'Fresco — Listo para pico de fuerza';
  }

  return {
    puntos,
    fitnessActual: ultimo.fitness,
    fatigaActual: ultimo.fatiga,
    formaActual: ultimo.forma,
    estadoForma
  };
}

/**
 * Carga y evalúa el progreso de la lista de iniciación "¡No pierdas el ritmo! (X/4)".
 * Si el historial ya contiene al menos una sesión, el paso 'primera_rutina' se marca automáticamente.
 *
 * @param {Storage|null} almacenamiento - Objeto compatible con Storage.
 * @param {Object[]} [historial=[]] - Historial de entrenamientos para sincronizar el paso 4.
 * @returns {{ pasos: Array<{ id: string, titulo: string, descripcion: string, completado: boolean }>, completados: number, total: number, porcentaje: number, todoCompletado: boolean }} Estado de iniciación.
 */
function cargarEstadoOnboarding(almacenamiento, historial = []) {
  let guardados = {};
  if (almacenamiento) {
    try {
      const crudo = almacenamiento.getItem(CLAVE_ONBOARDING);
      guardados = crudo ? JSON.parse(crudo) : {};
      if (!guardados || typeof guardados !== 'object') guardados = {};
    } catch (error) {
      guardados = {};
    }
  }

  const tieneSesiones = Array.isArray(historial) && historial.length > 0;
  if (tieneSesiones) {
    guardados.primera_rutina = true;
  }

  const pasos = PASOS_ONBOARDING.map((p) => ({
    ...p,
    completado: Boolean(guardados[p.id])
  }));
  const completados = pasos.filter((p) => p.completado).length;
  const total = PASOS_ONBOARDING.length;

  return {
    pasos,
    completados,
    total,
    porcentaje: Math.round((completados / total) * 100),
    todoCompletado: completados === total
  };
}

/**
 * Marca uno de los 4 pasos de la lista de iniciación como completado y lo persiste en localStorage.
 *
 * @param {Storage|null} almacenamiento - Objeto compatible con Storage.
 * @param {string} idPaso - Identificador del paso ('objetivo_elegido', 'sonido_probado', 'tecnica_vista', 'primera_rutina').
 * @param {Object[]} [historial=[]] - Historial actual de entrenamientos.
 * @returns {Object} Estado actualizado de la lista de iniciación.
 */
function marcarPasoOnboarding(almacenamiento, idPaso, historial = []) {
  const idsValidos = PASOS_ONBOARDING.map((p) => p.id);
  if (almacenamiento && idsValidos.includes(idPaso)) {
    let guardados = {};
    try {
      const crudo = almacenamiento.getItem(CLAVE_ONBOARDING);
      guardados = crudo ? JSON.parse(crudo) : {};
      if (!guardados || typeof guardados !== 'object') guardados = {};
    } catch (error) {
      guardados = {};
    }
    guardados[idPaso] = true;
    almacenamiento.setItem(CLAVE_ONBOARDING, JSON.stringify(guardados));
  }
  return cargarEstadoOnboarding(almacenamiento, historial);
}

/**
 * Ajusta al instante las series, repeticiones y descansos de una rutina base según el
 * modo de Intensidad Instantánea seleccionado ('mas_facil', 'constante', 'mas_dificil', 'variedad').
 *
 * @param {Object} rutinaBase - Objeto de rutina generado por generarRutinaMilitar.
 * @param {string} [idModo='constante'] - Identificador del modo de intensidad instantánea.
 * @returns {Object} Nueva rutina con series, repeticiones, descansos y métricas recalculadas.
 * @throws {Error} Si no se proporciona una rutina base válida.
 */
function ajustarRutinaPorIntensidadInstantanea(rutinaBase, idModo = 'constante') {
  if (!rutinaBase || typeof rutinaBase !== 'object' || !Array.isArray(rutinaBase.ejercicios)) {
    throw new Error('Se requiere una rutina base válida para ajustar la intensidad.');
  }

  const modo = MODOS_INTENSIDAD_INSTANTANEA[idModo] || MODOS_INTENSIDAD_INSTANTANEA.constante;
  let seriesTotales = 0;
  let repeticionesTotales = 0;
  let tiempoTotalSegundos = 0;

  const ejerciciosAjustados = rutinaBase.ejercicios.map((ej) => {
    const series = Math.max(1, ej.series + modo.deltaSeries);
    const repeticiones = Math.max(1, Math.round(ej.repeticiones * modo.factorReps));
    const descansoSegundos = Math.max(15, ej.descansoSegundos + modo.deltaDescanso);
    const volumenEjercicio = series * repeticiones;

    seriesTotales += series;
    repeticionesTotales += volumenEjercicio;
    tiempoTotalSegundos += series * (repeticiones * 3 + descansoSegundos);

    return {
      ...ej,
      series,
      repeticiones,
      descansoSegundos,
      volumenEjercicio
    };
  });

  return {
    ...rutinaBase,
    modoIntensidad: modo.id,
    descripcionIntensidad: modo.descripcion,
    seriesTotales,
    repeticionesTotales,
    duracionEstimadaMinutos: Math.max(1, Math.ceil(tiempoTotalSegundos / 60)),
    ejercicios: ejerciciosAjustados
  };
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
  CLAVE_PERFIL,
  CLAVE_RETOS,
  CLAVE_ONBOARDING,
  RANGOS_MILITARES,
  OBJETIVOS_TACTICOS,
  EQUIPAMIENTO_CASERO,
  RETOS_PREDEFINIDOS,
  PASOS_ONBOARDING,
  MODOS_INTENSIDAD_INSTANTANEA,
  GRUPOS_MUSCULARES_MAPA,
  MAPA_MUSCULOS_POR_AREA,
  formatearFechaLocal,
  convertirFechaANumeroDia,
  crearRegistroEntrenamiento,
  cargarHistorial,
  guardarRegistro,
  cargarPerfilUsuario,
  guardarPerfilUsuario,
  cargarRetosPersonalizados,
  guardarRetoPersonalizado,
  evaluarRetosActivos,
  exportarRespaldoCompleto,
  importarRespaldoCompleto,
  cargarEstadoOnboarding,
  marcarPasoOnboarding,
  ajustarRutinaPorIntensidadInstantanea,
  calcularDiasEntrenados,
  calcularRachaActual,
  determinarRangoMilitar,
  calcularProgresoSemanal,
  calcularMapaCalorMuscular,
  obtenerEjerciciosPorMusculo,
  calcularVolumen12Semanas,
  evaluarTrofeos,
  calcularCurvaFitnessFatiga,
  generarTextoCompartibleWhatsApp,
  calcularResumenProgreso
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_PROGRESO_ENTRENAMIENTO;
}

if (typeof window !== 'undefined') {
  window.ProgresoEntrenamiento = API_PROGRESO_ENTRENAMIENTO;
}
