const test = require('node:test');
const assert = require('node:assert/strict');
const {
  obtenerAreasDisponibles,
  filtrarEjerciciosPorArea,
  obtenerProtocolosPorArea,
  obtenerTecnicaEjercicio,
  generarRutinaMilitar,
  calcularMetricasRutina
} = require('../src/calisteniaMilitar');

/**
 * Ejecuta la prueba del listado de áreas localizadas disponibles.
 *
 * @returns {void}
 */
function probarAreasDisponibles() {
  const areas = obtenerAreasDisponibles();
  assert.deepEqual(areas, ['tren_superior', 'core', 'tren_inferior', 'cuerpo_completo']);
}

/**
 * Ejecuta la prueba de generación de rutina localizada para perfil hombre y mujer.
 *
 * @returns {void}
 */
function probarGeneracionRutinaHombreYMujer() {
  const rutinaHombre = generarRutinaMilitar({
    genero: 'hombre',
    area: 'tren_superior',
    nivel: 'operativo'
  });

  const rutinaMujer = generarRutinaMilitar({
    genero: 'mujer',
    area: 'tren_inferior',
    nivel: 'fuerzas_especiales'
  });

  assert.equal(rutinaHombre.perfil, 'hombre');
  assert.equal(rutinaHombre.areaLocalizada, 'tren_superior');
  assert.ok(rutinaHombre.totalEjercicios >= 3);
  assert.ok(rutinaHombre.repeticionesTotales > 0);

  assert.equal(rutinaMujer.perfil, 'mujer');
  assert.equal(rutinaMujer.areaLocalizada, 'tren_inferior');
  assert.equal(rutinaMujer.nivelMilitar, 'fuerzas_especiales');
  assert.ok(rutinaMujer.ejercicios.every((e) => e.area === 'tren_inferior'));
}

/**
 * Ejecuta la prueba de consulta de técnica biomecánica (animación SVG, pasos y errores comunes).
 *
 * @returns {void}
 */
function probarGuiaTecnicaEjercicio() {
  const tecnica = obtenerTecnicaEjercicio('flexiones-tacticas');
  assert.equal(tecnica.id, 'flexiones-tacticas');
  assert.equal(tecnica.tipoAnimacion, 'flexion');
  assert.ok(Array.isArray(tecnica.pasos) && tecnica.pasos.length === 4);
  assert.ok(Array.isArray(tecnica.erroresComunes) && tecnica.erroresComunes.length >= 3);
}

/**
 * Ejecuta la prueba de protocolos de calentamiento (5 min) y recuperación/estiramiento adaptados por área.
 *
 * @returns {void}
 */
function probarProtocolosCalentamientoYRecuperacion() {
  for (const area of ['tren_superior', 'core', 'tren_inferior', 'cuerpo_completo']) {
    const protocolos = obtenerProtocolosPorArea(area);
    assert.equal(protocolos.area, area);
    assert.equal(protocolos.calentamiento.duracionTotalSegundos, 300);
    assert.ok(protocolos.calentamiento.movimientos.length >= 3);
    assert.equal(protocolos.recuperacion.duracionTotalSegundos, 180);
    assert.ok(protocolos.recuperacion.movimientos.length >= 3);
  }
}

/**
 * Ejecuta las pruebas de validación de errores y casos de borde (género, área, nivel o id inválidos).
 *
 * @returns {void}
 */
function probarCasosDeErrorYBorde() {
  assert.throws(
    () => generarRutinaMilitar({ genero: 'otro', area: 'core' }),
    /Género inválido/
  );

  assert.throws(
    () => filtrarEjerciciosPorArea('brazo_aislado'),
    /Área localizada inválida/
  );

  assert.throws(
    () => generarRutinaMilitar({ genero: 'mujer', area: 'core', nivel: 'general' }),
    /Nivel militar inválido/
  );

  assert.throws(
    () => calcularMetricasRutina(null),
    /debe ser un arreglo/
  );

  assert.throws(
    () => obtenerTecnicaEjercicio('ejercicio-inexistente'),
    /No se encontró ningún ejercicio/
  );
}

test('Debe devolver las 4 áreas localizadas disponibles', probarAreasDisponibles);
test('Debe generar rutinas adaptadas para hombre y mujer por área localizada', probarGeneracionRutinaHombreYMujer);
test('Debe devolver los pasos de ejecución y errores comunes de la técnica de un ejercicio', probarGuiaTecnicaEjercicio);
test('Debe devolver protocolos de calentamiento (5 min) y recuperación adaptados a cada área', probarProtocolosCalentamientoYRecuperacion);
test('Debe lanzar errores descriptivos ante parámetros inválidos o casos de borde', probarCasosDeErrorYBorde);
