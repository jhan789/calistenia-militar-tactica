const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CLAVE_HISTORIAL,
  formatearFechaLocal,
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
} = require('../src/progresoEntrenamiento');

/**
 * Crea un almacenamiento en memoria compatible con la API Storage para las pruebas.
 *
 * @returns {{ getItem: Function, setItem: Function }} Almacenamiento simulado.
 */
function crearAlmacenamientoSimulado() {
  const datos = new Map();
  return {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, String(valor))
  };
}

/**
 * Crea un registro mínimo de prueba para una fecha dada.
 *
 * @param {string} fecha - Fecha 'AAAA-MM-DD'.
 * @returns {Object} Registro de entrenamiento.
 */
function registro(fecha) {
  return crearRegistroEntrenamiento({ fecha, area: 'core', repeticionesTotales: 100 });
}

test('Debe formatear fechas locales como AAAA-MM-DD', () => {
  assert.equal(formatearFechaLocal(new Date(2026, 0, 5)), '2026-01-05');
});

test('Debe guardar y recuperar registros del almacenamiento', () => {
  const almacenamiento = crearAlmacenamientoSimulado();
  guardarRegistro(almacenamiento, registro('2026-11-18'));
  const historial = cargarHistorial(almacenamiento);
  assert.equal(historial.length, 1);
  assert.equal(historial[0].area, 'core');
  assert.equal(historial[0].repeticionesTotales, 100);
});

test('Debe devolver historial vacío si los datos guardados están corruptos', () => {
  const almacenamiento = crearAlmacenamientoSimulado();
  almacenamiento.setItem(CLAVE_HISTORIAL, '{no es json');
  assert.deepEqual(cargarHistorial(almacenamiento), []);
});

test('Debe contar días únicos aunque haya varios entrenamientos el mismo día', () => {
  const historial = [registro('2026-11-17'), registro('2026-11-18'), registro('2026-11-18')];
  assert.equal(calcularDiasEntrenados(historial), 2);
});

test('Debe calcular la racha actual de días consecutivos', () => {
  const historial = [registro('2026-11-10'), registro('2026-11-16'), registro('2026-11-17'), registro('2026-11-18')];
  assert.equal(calcularRachaActual(historial, '2026-11-18'), 3);
  // Si hoy no se ha entrenado pero ayer sí, la racha sigue viva
  assert.equal(calcularRachaActual(historial, '2026-11-19'), 3);
  // Si pasaron 2 días sin entrenar, la racha se rompe
  assert.equal(calcularRachaActual(historial, '2026-11-20'), 0);
  assert.equal(calcularRachaActual([], '2026-11-18'), 0);
});

test('Debe mantener la racha al cruzar meses y años', () => {
  const historial = [registro('2025-12-31'), registro('2026-01-01')];
  assert.equal(calcularRachaActual(historial, '2026-01-01'), 2);
});

test('Debe asignar el rango militar según los días entrenados', () => {
  assert.equal(determinarRangoMilitar(0).nombre, 'Recluta');
  assert.equal(determinarRangoMilitar(9).diasParaSiguiente, 1);
  assert.equal(determinarRangoMilitar(10).nombre, 'Operativo');
  assert.equal(determinarRangoMilitar(20).porcentajeProgreso, 50);
  const elite = determinarRangoMilitar(30);
  assert.equal(elite.nombre, 'Élite');
  assert.equal(elite.siguiente, null);
  assert.equal(elite.porcentajeProgreso, 100);
});

test('Debe generar el resumen de progreso completo', () => {
  const resumen = calcularResumenProgreso([registro('2026-11-17'), registro('2026-11-18')], '2026-11-18');
  assert.equal(resumen.diasEntrenados, 2);
  assert.equal(resumen.rachaActual, 2);
  assert.equal(resumen.entrenadoHoy, true);
  assert.equal(resumen.rango.nombre, 'Recluta');
  assert.equal(resumen.totalEntrenamientos, 2);
});

test('Debe rechazar registros y valores inválidos', () => {
  assert.throws(() => crearRegistroEntrenamiento({ fecha: '18/11/2026', area: 'core', repeticionesTotales: 10 }), /Formato de fecha inválido/);
  assert.throws(() => crearRegistroEntrenamiento({ fecha: '2026-11-18', area: '', repeticionesTotales: 10 }), /área trabajada/);
  assert.throws(() => crearRegistroEntrenamiento({ fecha: '2026-11-18', area: 'core', repeticionesTotales: -5 }), /repeticiones totales/);
  assert.throws(() => determinarRangoMilitar(-1), /días entrenados/);
});

test('Debe calcular el progreso semanal y el mapa de calor muscular combinando área e historial', () => {
  const historial = [
    crearRegistroEntrenamiento({ fecha: '2026-11-17', area: 'tren_inferior', repeticionesTotales: 215 }),
    crearRegistroEntrenamiento({ fecha: '2026-11-19', area: 'core', repeticionesTotales: 259 })
  ];
  const semanal = calcularProgresoSemanal(historial, '2026-11-19');
  assert.equal(semanal.diasEntrenadosSemana, 2);
  assert.equal(semanal.repeticionesSemana, 474);
  assert.equal(semanal.actividadUltimos7Dias.length, 7);

  const mapa = calcularMapaCalorMuscular('tren_superior', historial, '2026-11-19');
  assert.equal(mapa.musculos.pectoral.estado, 'primario');
  assert.equal(mapa.musculos.hombros.estado, 'primario');
  assert.equal(mapa.musculos.espalda.estado, 'primario');
  assert.equal(mapa.musculos.core.estado, 'secundario');
  assert.equal(mapa.musculos.cuadriceps.estado, 'historial');
  assert.equal(mapa.musculos.gluteos.estado, 'historial');
});

test('Debe generar el resumen limpio de entrenamiento para compartir por WhatsApp', () => {
  const texto = generarTextoCompartibleWhatsApp({
    fecha: '2026-11-19',
    areaNombre: 'Tren Superior',
    nivelNombre: 'Operativo',
    rangoNombre: 'Recluta',
    duracionMinutos: 24,
    repeticionesTotales: 165,
    rachaActual: 3,
    musculosActivos: ['Pectoral', 'Hombros', 'Espalda', 'Core']
  });
  assert.ok(texto.includes('CALISTENIA MILITAR TÁCTICA'));
  assert.ok(texto.includes('165 repeticiones'));
  assert.ok(texto.includes('Pectoral, Hombros, Espalda, Core'));
});

test('Debe devolver porcentaje de activación en los 10 músculos detallados y filtrar ejercicios asociados', () => {
  const mapa = calcularMapaCalorMuscular('tren_superior', [], '2026-11-19');
  assert.equal(mapa.musculos.pectoral.porcentajeActivacion, 95);
  assert.equal(mapa.musculos.biceps.porcentajeActivacion, 80);
  assert.equal(mapa.musculos.triceps.porcentajeActivacion, 85);
  assert.equal(mapa.musculos.isquiotibiales.porcentajeActivacion, 0);
  assert.equal(mapa.musculos.pantorrillas.porcentajeActivacion, 0);

  const ejercicios = [
    { id: 'flexiones-tacticas', musculos: ['Pectoral', 'Tríceps', 'Deltoides anterior'] },
    { id: 'dominadas-pronas', musculos: ['Dorsal ancho', 'Bíceps', 'Trapecio medio'] }
  ];
  assert.deepEqual(obtenerEjerciciosPorMusculo('pectoral', ejercicios), ['flexiones-tacticas']);
  assert.deepEqual(obtenerEjerciciosPorMusculo('biceps', ejercicios), ['dominadas-pronas']);
  assert.deepEqual(obtenerEjerciciosPorMusculo('triceps', ejercicios), ['flexiones-tacticas']);
});

test('Debe persistir el perfil de usuario, objetivo activo y meta semanal', () => {
  const almacenamiento = crearAlmacenamientoSimulado();
  const inicial = cargarPerfilUsuario(almacenamiento);
  assert.equal(inicial.nombreUsuario, 'Operador Táctico');
  assert.equal(inicial.metaSemanalDias, 4);

  const actualizado = guardarPerfilUsuario(almacenamiento, {
    nombreUsuario: 'Jhan',
    objetivoActivo: 'fuerza_maxima',
    metaSemanalDias: 5
  });
  assert.equal(actualizado.nombreUsuario, 'Jhan');
  assert.equal(actualizado.objetivoActivo, 'fuerza_maxima');
  assert.equal(actualizado.metaSemanalDias, 5);
});

test('Debe calcular las 12 semanas, evaluar los 4 trofeos y generar la curva de Fitness y Fatiga con RPE', () => {
  const historial = [
    crearRegistroEntrenamiento({ fecha: '2026-11-17', area: 'tren_superior', repeticionesTotales: 200, rpe: 8 }),
    crearRegistroEntrenamiento({ fecha: '2026-11-18', area: 'core', repeticionesTotales: 180, rpe: 7 }),
    crearRegistroEntrenamiento({ fecha: '2026-11-19', area: 'tren_inferior', repeticionesTotales: 220, rpe: 9 })
  ];

  const semanas = calcularVolumen12Semanas(historial, '2026-11-19');
  assert.equal(semanas.length, 12);
  assert.equal(semanas[11].etiqueta, 'Actual');
  assert.equal(semanas[11].repeticiones, 600);

  const trofeos = evaluarTrofeos(historial, '2026-11-19');
  assert.equal(trofeos.length, 4);
  assert.equal(trofeos.find((t) => t.id === 'primera_sesion').desbloqueado, true);
  assert.equal(trofeos.find((t) => t.id === 'racha_3_dias').desbloqueado, true);
  assert.equal(trofeos.find((t) => t.id === 'reps_500').desbloqueado, true);
  assert.equal(trofeos.find((t) => t.id === 'sesiones_10').desbloqueado, false);

  const curva = calcularCurvaFitnessFatiga(historial, '2026-11-19');
  assert.equal(curva.puntos.length, 14);
  assert.ok(curva.fitnessActual > 0);
  assert.ok(curva.fatigaActual > 0);
});

test('Debe gestionar retos personalizados, equipamiento casero y respaldo/restauración JSON', () => {
  const almacenamiento = crearAlmacenamientoSimulado();
  guardarPerfilUsuario(almacenamiento, {
    nombreUsuario: 'Jhan',
    equipamiento: ['peso_corporal', 'barra_dominadas']
  });
  guardarRegistro(
    almacenamiento,
    crearRegistroEntrenamiento({ fecha: '2026-11-19', area: 'tren_superior', repeticionesTotales: 250, rpe: 8 })
  );
  guardarRetoPersonalizado(almacenamiento, {
    titulo: 'Dominar 500 flexiones',
    tipo: 'repeticiones',
    meta: 500
  });

  const retos = evaluarRetosActivos(
    cargarHistorial(almacenamiento),
    cargarRetosPersonalizados(almacenamiento),
    '2026-11-19'
  );
  assert.equal(retos.length, 4); // 3 predefinidos + 1 personalizado
  assert.equal(retos[3].titulo, 'Dominar 500 flexiones');
  assert.equal(retos[3].porcentaje, 50);

  const backupJSON = exportarRespaldoCompleto(almacenamiento);
  const otroStorage = crearAlmacenamientoSimulado();
  const restaurado = importarRespaldoCompleto(otroStorage, backupJSON);
  assert.equal(restaurado.sesionesRestauradas, 1);
  assert.equal(restaurado.retosRestaurados, 1);
  assert.deepEqual(cargarPerfilUsuario(otroStorage).equipamiento, ['peso_corporal', 'barra_dominadas']);
});

test('Debe gestionar la lista de iniciación (4/4) y ajustar rutinas con el selector de intensidad instantánea', () => {
  const almacenamiento = crearAlmacenamientoSimulado();
  assert.equal(cargarEstadoOnboarding(almacenamiento, []).completados, 0);

  marcarPasoOnboarding(almacenamiento, 'objetivo_elegido', []);
  marcarPasoOnboarding(almacenamiento, 'sonido_probado', []);
  marcarPasoOnboarding(almacenamiento, 'tecnica_vista', []);
  const final = cargarEstadoOnboarding(almacenamiento, [{ fecha: '2026-11-20', area: 'core', repeticionesTotales: 120 }]);
  assert.equal(final.completados, 4);
  assert.equal(final.todoCompletado, true);

  const rutinaBase = {
    areaLocalizada: 'tren_superior',
    seriesTotales: 4,
    repeticionesTotales: 80,
    duracionEstimadaMinutos: 10,
    ejercicios: [{ id: 'flexiones', series: 4, repeticiones: 20, descansoSegundos: 60, volumenEjercicio: 80 }]
  };
  const masDificil = ajustarRutinaPorIntensidadInstantanea(rutinaBase, 'mas_dificil');
  assert.equal(masDificil.ejercicios[0].series, 5);
  assert.equal(masDificil.ejercicios[0].repeticiones, 25);
  assert.equal(masDificil.ejercicios[0].descansoSegundos, 50);
  assert.equal(masDificil.repeticionesTotales, 125);
});
