---
name: crear-modulo
description: Crea un nuevo módulo en una rama dedicada de Git, incluyendo su implementación documentada en español, un archivo de pruebas básicas y un resumen final de los archivos generados. Úsala cuando el usuario pida crear un módulo o componente nuevo siguiendo el flujo estándar del proyecto.
---

# Crear Módulo

Sigue estos pasos en orden cada vez que el usuario solicite crear un nuevo módulo:

## 1. Crear una rama nueva en Git
- Verifica el estado del repositorio con `git status` antes de crear la rama.
- Crea y cambia a una nueva rama descriptiva usando el prefijo `feat/` (por ejemplo: `git checkout -b feat/<nombre-del-modulo>`), utilizando minúsculas y guiones medios en el nombre del módulo.
- Si el repositorio tiene cambios sin confirmar que interfieran, informa al usuario antes de continuar.

## 2. Generar el archivo de código documentado en español
- Crea el archivo del módulo en la ubicación adecuada según la estructura y lenguaje del proyecto.
- **Documentación obligatoria en español:** Cada función, clase o método que crees debe incluir un comentario o docstring en español en el formato estándar del lenguaje (docstrings en Python, JSDoc en JS/TS, etc.) que especifique:
  - Descripción breve de su propósito.
  - Parámetros (nombre, tipo y descripción).
  - Valor de retorno.
  - Excepciones o errores que pueda lanzar (si aplica).

## 3. Crear un archivo de prueba básica
- Genera un archivo de pruebas unitarias básicas asociado al módulo (por ejemplo, `test_<modulo>.py` o `<modulo>.test.js` / `<modulo>.test.ts`, según el stack del proyecto).
- Incluye al menos un caso de prueba para el comportamiento principal esperado y un caso de borde o error si corresponde.
- Si existe un ejecutor de pruebas configurado en el proyecto, ejecútalo para verificar que las pruebas pasen.

## 4. Mostrar un resumen de los archivos creados
- Al finalizar, presenta al usuario un resumen claro en español que incluya:
  - El nombre de la rama Git creada.
  - La lista de archivos creados con enlaces clicables y una breve descripción de cada uno.
  - El resultado de la ejecución de las pruebas (o indicar si no se ejecutaron).
