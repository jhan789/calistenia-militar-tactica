/**
 * Módulo de Calistenia Militar por Áreas Localizadas (Hombre y Mujer).
 * Permite consultar ejercicios tácticos/militares, adaptar series y repeticiones
 * según el perfil (hombre/mujer) y nivel físico, generar rutinas focalizadas
 * y obtener la guía biomecánica/técnica de cada ejercicio.
 */

const CATALOGO_EJERCICIOS = [
  {
    id: 'flexiones-tacticas',
    nombre: 'Flexiones Tácticas (Cadencia Militar)',
    area: 'tren_superior',
    musculos: ['Pectoral', 'Tríceps', 'Deltoides anterior'],
    descripcion: 'Flexiones estrictas con pecho a 2 cm del suelo y bloqueo completo de codos.',
    configuracion: {
      hombre: { series: 4, repeticiones: 20, descansoSegundos: 60 },
      mujer: { series: 4, repeticiones: 15, descansoSegundos: 60 }
    },
    tecnica: {
      tipoAnimacion: 'flexion',
      pasos: [
        'Posición inicial: Plancha alta con manos ligeramente más anchas que los hombros, abdomen y glúteos contraídos en línea recta.',
        'Fase excéntrica: Desciende en 2 segundos manteniendo los codos a 45° respecto al torso hasta quedar a 2 cm del suelo.',
        'Fase concéntrica: Empuja el suelo de forma explosiva hasta extender por completo los codos sin perder la alineación lumbar.',
        'Respiración: Inhala de forma controlada durante el descenso y exhala con fuerza al empujar hacia arriba.'
      ],
      erroresComunes: [
        'Abrir los codos a 90° (en forma de T), sobrecargando el manguito rotador.',
        'Dejar caer la cadera o arquear la zona lumbar por falta de tensión en el core.',
        'Recortar el rango de movimiento sin extender los codos arriba ni acercar el pecho al suelo.'
      ]
    }
  },
  {
    id: 'dominadas-pronas',
    nombre: 'Dominadas Estrictas / Australianas Tácticas',
    area: 'tren_superior',
    musculos: ['Dorsal ancho', 'Bíceps', 'Trapecio medio'],
    descripcion: 'Tracción vertical superando la barra con la barbilla sin balanceo (kipping).',
    configuracion: {
      hombre: { series: 4, repeticiones: 10, descansoSegundos: 90 },
      mujer: { series: 4, repeticiones: 8, descansoSegundos: 90 }
    },
    tecnica: {
      tipoAnimacion: 'dominada',
      pasos: [
        'Posición inicial: Suspensión completa (dead hang) con agarre prono ligeramente superior al ancho de hombros y depresión escapular activa.',
        'Fase concéntrica: Tracciona llevando los codos hacia las costillas hasta que la barbilla supere claramente el nivel de la barra.',
        'Fase excéntrica: Desciende en 2-3 segundos controlando el peso hasta extender los brazos sin soltar la tensión de los hombros.',
        'Respiración: Inhala antes de iniciar la tracción, mantén tensión abdominal y exhala al superar la barra.'
      ],
      erroresComunes: [
        'Impulsarse con patadas o balanceo de cadera (kipping) en lugar de tracción estricta.',
        'No bajar hasta la extensión completa de codos entre repeticiones.',
        'Adelantar los hombros o estirar excesivamente el cuello para intentar pasar la barbilla.'
      ]
    }
  },
  {
    id: 'fondos-triceps',
    nombre: 'Fondos Militares en Paralelas o Banco',
    area: 'tren_superior',
    musculos: ['Tríceps', 'Pectoral inferior', 'Hombros'],
    descripcion: 'Descenso controlado hasta 90 grados en codos y extensión explosiva.',
    configuracion: {
      hombre: { series: 3, repeticiones: 15, descansoSegundos: 60 },
      mujer: { series: 3, repeticiones: 12, descansoSegundos: 60 }
    },
    tecnica: {
      tipoAnimacion: 'fondo',
      pasos: [
        'Posición inicial: Apoyo firme sobre barras paralelas o borde de banco con brazos bloqueados, pecho alto y escápulas retraídas.',
        'Fase excéntrica: Flexiona los codos hacia atrás descendiendo el torso de forma controlada hasta formar un ángulo de 90° en el codo.',
        'Fase concéntrica: Extiende los codos con potencia presionando hacia abajo hasta recuperar el bloqueo inicial.',
        'Respiración: Inhala mientras desciendes el cuerpo y exhala al completar el empuje vertical.'
      ],
      erroresComunes: [
        'Encoger los hombros hacia las orejas perdiendo la estabilidad escapular.',
        'Separar los codos hacia los lados en vez de mantenerlos pegados al eje del cuerpo.',
        'Bajar más allá de la movilidad segura del hombro provocando tensión en la cápsula anterior.'
      ]
    }
  },
  {
    id: 'plancha-comando',
    nombre: 'Plancha Comando (Up-Down Plank)',
    area: 'core',
    musculos: ['Recto abdominal', 'Transverso', 'Estabilizadores de hombro'],
    descripcion: 'Transición continua de plancha de antebrazos a plancha alta manteniendo cadera estable.',
    configuracion: {
      hombre: { series: 4, repeticiones: 16, descansoSegundos: 45 },
      mujer: { series: 4, repeticiones: 14, descansoSegundos: 45 }
    },
    tecnica: {
      tipoAnimacion: 'plancha',
      pasos: [
        'Posición inicial: Plancha sobre antebrazos con codos bajo los hombros y pies separados al ancho de la cadera para mayor estabilidad.',
        'Fase concéntrica: Apoya la palma de una mano donde estaba el codo y extiende ambos brazos hasta quedar en plancha alta.',
        'Fase excéntrica: Regresa de forma controlada apoyando un antebrazo tras otro, alternando el brazo líder en cada repetición.',
        'Respiración: Respiración costal corta y continua manteniendo el abdomen rígido (bracing) durante toda la transición.'
      ],
      erroresComunes: [
        'Balancear excesivamente la cadera de lado a lado al subir y bajar.',
        'Subir siempre con el mismo brazo dominante sin alternar.',
        'Elevar los glúteos en forma de pirámide para aliviar el trabajo del abdomen.'
      ]
    }
  },
  {
    id: 'flutter-kicks',
    nombre: 'Patadas de Tijera a 4 Tiempos (Flutter Kicks)',
    area: 'core',
    musculos: ['Abdominal inferior', 'Flexores de cadera'],
    descripcion: 'Piernas extendidas a 15 cm del suelo alternando batidas con zona lumbar apoyada.',
    configuracion: {
      hombre: { series: 4, repeticiones: 30, descansoSegundos: 45 },
      mujer: { series: 4, repeticiones: 30, descansoSegundos: 45 }
    },
    tecnica: {
      tipoAnimacion: 'flutter',
      pasos: [
        'Posición inicial: Tendido supino (boca arriba), manos bajo los glúteos o a los lados, escápulas ligeramente despegadas y lumbar pegada al suelo.',
        'Fase excéntrica: Desciende una pierna recta hasta unos 15 cm del suelo mientras la otra sube a 45°.',
        'Fase concéntrica: Alterna el movimiento vertical de las piernas en cadencia militar de 4 tiempos manteniendo rodillas extendidas.',
        'Respiración: Respira de manera fluida y rítmica sin contener el aire (evita la maniobra de Valsalva prolongada).'
      ],
      erroresComunes: [
        'Despegar la zona lumbar del suelo generando hiperlordosis y dolor de espalda baja.',
        'Flexionar las rodillas convirtiendo el ejercicio en un pedaleo sin palanca abdominal.',
        'Golpear los talones contra el suelo para descansar entre batidas.'
      ]
    }
  },
  {
    id: 'abdominales-situp-militar',
    nombre: 'Abdominales de Prueba Física (Sit-Ups Tácticos)',
    area: 'core',
    musculos: ['Recto abdominal', 'Oblicuos'],
    descripcion: 'Elevación completa del tronco hasta tocar rodillas con los codos manteniendo control excéntrico.',
    configuracion: {
      hombre: { series: 3, repeticiones: 25, descansoSegundos: 45 },
      mujer: { series: 3, repeticiones: 22, descansoSegundos: 45 }
    },
    tecnica: {
      tipoAnimacion: 'situp',
      pasos: [
        'Posición inicial: Boca arriba con rodillas flexionadas a 90°, plantas de los pies firmes en el suelo y manos cruzadas sobre el pecho o sienes.',
        'Fase concéntrica: Contrae el recto abdominal enrollando el torso hacia arriba hasta que los codos alcancen las rodillas.',
        'Fase excéntrica: Desciende vértebra por vértebra de forma controlada hasta que las escápulas toquen nuevamente el suelo.',
        'Respiración: Inhala abajo con la espalda apoyada y exhala completamente durante la subida del tronco.'
      ],
      erroresComunes: [
        'Tirar con fuerza de la nuca o el cuello con las manos en lugar de usar el abdomen.',
        'Dejarse caer de golpe en la bajada usando el rebote de la espalda contra el suelo.',
        'Despegar los pies del suelo por falta de control en la fase concéntrica.'
      ]
    }
  },
  {
    id: 'sentadilla-explosiva',
    nombre: 'Sentadilla Táctica con Salto (Jump Squat)',
    area: 'tren_inferior',
    musculos: ['Cuádriceps', 'Glúteo mayor', 'Pantorrillas'],
    descripcion: 'Romper el paralelo y despegar verticalmente amortiguando la caída en media punta.',
    configuracion: {
      hombre: { series: 4, repeticiones: 18, descansoSegundos: 60 },
      mujer: { series: 4, repeticiones: 18, descansoSegundos: 60 }
    },
    tecnica: {
      tipoAnimacion: 'sentadilla',
      pasos: [
        'Posición inicial: Bipedestación con pies al ancho de hombros, puntas ligeramente hacia afuera (15°) y pecho erguido.',
        'Fase excéntrica: Lleva la cadera hacia atrás y abajo hasta romper el paralelo (muslos paralelos al suelo) con rodillas alineadas.',
        'Fase concéntrica: Impúlsate de forma explosiva extendiendo cadera, rodillas y tobillos para despegar verticalmente y aterriza amortiguando.',
        'Respiración: Inhala al bajar cargando las piernas y exhala de forma explosiva en el despegue.'
      ],
      erroresComunes: [
        'Colapsar las rodillas hacia adentro (valgo de rodilla) al impulsar o al aterrizar.',
        'Aterrizar con las piernas rígidas y los talones planos sin amortiguar la caída.',
        'Inclinar excesivamente el torso hacia adelante redondeando la espalda.'
      ]
    }
  },
  {
    id: 'zancadas-carga',
    nombre: 'Zancadas Alternas de Patrulla (Lunges)',
    area: 'tren_inferior',
    musculos: ['Glúteo mayor', 'Isquiotibiales', 'Cuádriceps'],
    descripcion: 'Paso amplio hacia adelante o atrás con torso erguido y rodilla trasera rozando el suelo.',
    configuracion: {
      hombre: { series: 4, repeticiones: 20, descansoSegundos: 60 },
      mujer: { series: 4, repeticiones: 22, descansoSegundos: 60 }
    },
    tecnica: {
      tipoAnimacion: 'zancada',
      pasos: [
        'Posición inicial: De pie con postura erguida, mirada al frente, manos en la cintura o frente al pecho y abdomen activo.',
        'Fase excéntrica: Da un paso amplio y flexiona ambas rodillas a 90° hasta que la rodilla trasera quede a 2 cm del suelo.',
        'Fase concéntrica: Empuja con el talón del pie delantero para regresar a la posición inicial y alterna de pierna.',
        'Respiración: Inhala al dar el paso y descender; exhala al empujar para volver a la vertical.'
      ],
      erroresComunes: [
        'Dar un paso demasiado corto o en línea cuerda floja, perdiendo el equilibrio lateral.',
        'Golpear bruscamente la rótula trasera contra el suelo en cada repetición.',
        'Despegar el talón del pie delantero sobrecargando el tendón rotuliano.'
      ]
    }
  },
  {
    id: 'puente-gluteo-isometrico',
    nombre: 'Puente de Glúteo Unilateral Táctico',
    area: 'tren_inferior',
    musculos: ['Glúteo mayor', 'Glúteo medio', 'Isquiotibiales'],
    descripcion: 'Elevación de cadera a una pierna con pausa isométrica de 2 segundos arriba.',
    configuracion: {
      hombre: { series: 3, repeticiones: 15, descansoSegundos: 45 },
      mujer: { series: 4, repeticiones: 18, descansoSegundos: 45 }
    },
    tecnica: {
      tipoAnimacion: 'puente',
      pasos: [
        'Posición inicial: Boca arriba con un talón firme cerca del glúteo y la otra pierna extendida a 45° alineada con el muslo de apoyo.',
        'Fase concéntrica: Empuja desde el talón de apoyo elevando la pelvis hasta alinear hombro, cadera y rodilla; sostén 2 segundos arriba.',
        'Fase excéntrica: Desciende la cadera de manera controlada sin relajar por completo la tensión al rozar el suelo.',
        'Respiración: Inhala abajo, exhala al empujar la cadera hacia arriba y mantén tensión abdominal en la pausa isométrica.'
      ],
      erroresComunes: [
        'Hiperextender la columna lumbar en lugar de extender la cadera contrayendo el glúteo.',
        'Dejar caer un lado de la pelvis por falta de activación del glúteo medio.',
        'Empujar con la punta del pie en vez del talón, transfiriendo el esfuerzo al gemelo.'
      ]
    }
  },
  {
    id: 'burpees-ocho-tiempos',
    nombre: 'Burpees Militares de 8 Tiempos (8-Count Bodybuilder)',
    area: 'cuerpo_completo',
    musculos: ['Cuerpo completo', 'Capacidad cardiovascular', 'Core'],
    descripcion: 'Secuencia militar de 8 tiempos: sentadilla, plancha, flexión, tijera de piernas y salto vertical.',
    configuracion: {
      hombre: { series: 4, repeticiones: 12, descansoSegundos: 75 },
      mujer: { series: 4, repeticiones: 10, descansoSegundos: 75 }
    },
    tecnica: {
      tipoAnimacion: 'burpee',
      pasos: [
        'Posición inicial (Tiempos 1-2): Desde posición firme, baja a cuclillas apoyando manos en el suelo y lanza los pies atrás a plancha alta.',
        'Fase excéntrica/táctica (Tiempos 3-6): Ejecuta una flexión estricta (3-4), abre las piernas en tijera horizontal (5) y ciérralas a plancha (6).',
        'Fase concéntrica (Tiempos 7-8): Recoge los pies de un salto hacia las manos (7) y elévate con salto vertical y palmada sobre la cabeza (8).',
        'Respiración: Coordina un ciclo de inhalación/exhalación en la flexión inferior y otro al saltar hacia arriba.'
      ],
      erroresComunes: [
        'Hundir la espalda baja al saltar hacia atrás a la posición de plancha.',
        'Aterrizar sobre las puntas de los pies al recoger las piernas en el tiempo 7, sobrecargando las rodillas.',
        'Omitir la pausa de control en cada uno de los 8 tiempos militares.'
      ]
    }
  },
  {
    id: 'bear-crawl',
    nombre: 'Desplazamiento del Oso (Bear Crawl Táctico - Pasos)',
    area: 'cuerpo_completo',
    musculos: ['Hombros', 'Core', 'Cuádriceps'],
    descripcion: 'Avance cuadrúpedo sin apoyar rodillas manteniendo la espalda paralela al suelo.',
    configuracion: {
      hombre: { series: 3, repeticiones: 24, descansoSegundos: 60 },
      mujer: { series: 3, repeticiones: 20, descansoSegundos: 60 }
    },
    tecnica: {
      tipoAnimacion: 'bear_crawl',
      pasos: [
        'Posición inicial: Cuadrupedia con manos bajo los hombros, rodillas a 90° bajo la cadera y despegadas 3-5 cm del suelo.',
        'Fase concéntrica: Avanza de forma simultánea y corta con mano derecha y pie izquierdo manteniendo el torso horizontal.',
        'Fase excéntrica/alternancia: Controla el apoyo sin balancear la pelvis y repite el paso con mano izquierda y pie derecho.',
        'Respiración: Respiración diafragmática controlada manteniendo la faja abdominal activa en cada paso.'
      ],
      erroresComunes: [
        'Subir demasiado la cadera perdiendo la tensión en cuádriceps y core.',
        'Dar pasos excesivamente largos que desalinean las muñecas respecto a los hombros.',
        'Avanzar mano y pie del mismo lado (paso de camello) en lugar del patrón cruzado.'
      ]
    }
  }
];

const AREAS_VALIDAS = ['tren_superior', 'core', 'tren_inferior', 'cuerpo_completo'];
const GENEROS_VALIDOS = ['hombre', 'mujer'];
const FACTORES_NIVEL = {
  recluta: 0.75,
  operativo: 1.0,
  fuerzas_especiales: 1.35
};

const PROTOCOLOS_CALENTAMIENTO_Y_RECUPERACION = {
  tren_superior: {
    calentamiento: {
      titulo: 'Calentamiento Táctico (5 min)',
      duracionTotalSegundos: 300,
      enfoque: 'Movilidad escapular, manguito rotador y activación de empuje',
      movimientos: [
        {
          id: 'cal-sup-1',
          nombre: 'Círculos articulares de hombros y muñecas',
          duracionSegundos: 90,
          indicacion: 'Rotaciones amplias hacia adelante y atrás controlando la retracción escapular.'
        },
        {
          id: 'cal-sup-2',
          nombre: 'Flexiones escapulares en plancha alta',
          duracionSegundos: 90,
          indicacion: 'Sin doblar codos, separa y junta las escápulas activando el serrato anterior.'
        },
        {
          id: 'cal-sup-3',
          nombre: 'Caminata de manos (Inchworms) con toque de hombros',
          duracionSegundos: 120,
          indicacion: 'Avanza con las manos hasta plancha, toca cada hombro y regresa extendiendo isquios.'
        }
      ]
    },
    recuperacion: {
      titulo: 'Recuperación / Estiramiento',
      duracionTotalSegundos: 180,
      enfoque: 'Descompresión pectoral, dorsal ancho y tríceps',
      movimientos: [
        {
          id: 'rec-sup-1',
          nombre: 'Apertura pectoral en marco o pared',
          duracionSegundos: 60,
          indicacion: 'Apoya el antebrazo a 90° y gira suavemente el torso30 s por lado respirando profundo.'
        },
        {
          id: 'rec-sup-2',
          nombre: 'Postura del niño con tracción dorsal (Child Pose)',
          duracionSegundos: 60,
          indicacion: 'Lleva glúteos a talones y alarga los brazos al frente bajando el pecho hacia el suelo.'
        },
        {
          id: 'rec-sup-3',
          nombre: 'Estiramiento de tríceps y deltoides cruzado',
          duracionSegundos: 60,
          indicacion: 'Lleva el codo tras la nuca y luego cruza el brazo frente al pecho (30 s por brazo).'
        }
      ]
    }
  },
  core: {
    calentamiento: {
      titulo: 'Calentamiento Táctico (5 min)',
      duracionTotalSegundos: 300,
      enfoque: 'Activación del transverso abdominal, columna torácica y flexores de cadera',
      movimientos: [
        {
          id: 'cal-core-1',
          nombre: 'Gato-Camello táctico (Movilidad espinal)',
          duracionSegundos: 90,
          indicacion: 'En cuadrupedia, alterna flexión y extensión segmentaria de la columna con la respiración.'
        },
        {
          id: 'cal-core-2',
          nombre: 'Bicho muerto controlado (Dead Bug)',
          duracionSegundos: 90,
          indicacion: 'Boca arriba, extiende brazo y pierna contrarios sellando la zona lumbar contra el suelo.'
        },
        {
          id: 'cal-core-3',
          nombre: 'Escaladores lentos con pausa isométrica (Mountain Climbers)',
          duracionSegundos: 120,
          indicacion: 'Lleva la rodilla al pecho en plancha alta sosteniendo 2 segundos la contracción abdominal.'
        }
      ]
    },
    recuperacion: {
      titulo: 'Recuperación / Estiramiento',
      duracionTotalSegundos: 180,
      enfoque: 'Elongación de la pared abdominal, oblicuos y descompresión lumbar',
      movimientos: [
        {
          id: 'rec-core-1',
          nombre: 'Extensión en Esfinge / Cobra suave',
          duracionSegundos: 60,
          indicacion: 'Tendido prono, apoya antebrazos y eleva el pecho alargando el recto abdominal sin forzar lumbar.'
        },
        {
          id: 'rec-core-2',
          nombre: 'Torsión espinal supina',
          duracionSegundos: 60,
          indicacion: 'Boca arriba, deja caer las rodillas juntas a cada lado manteniendo hombros apoyados (30 s por lado).'
        },
        {
          id: 'rec-core-3',
          nombre: 'Abrazo de rodillas al pecho con respiración diafragmática',
          duracionSegundos: 60,
          indicacion: 'Acerca ambas rodillas al pecho balanceando suavemente la pelvis para relajar el cuadrado lumbar.'
        }
      ]
    }
  },
  tren_inferior: {
    calentamiento: {
      titulo: 'Calentamiento Táctico (5 min)',
      duracionTotalSegundos: 300,
      enfoque: 'Movilidad de cadera, dorsiflexión de tobillo y activación de glúteos',
      movimientos: [
        {
          id: 'cal-inf-1',
          nombre: 'Balanceos dinámicos de pierna y apertura de cadera',
          duracionSegundos: 90,
          indicacion: 'Balancea cada pierna frontal y lateralmente aumentando el rango de forma progresiva.'
        },
        {
          id: 'cal-inf-2',
          nombre: 'Sentadilla profunda isométrica con movilidad de tobillos',
          duracionSegundos: 90,
          indicacion: 'En posición de sentadilla profunda, empuja rodillas afuera con los codos desplazando el peso.'
        },
        {
          id: 'cal-inf-3',
          nombre: 'Puente de glúteo bilateral + Sentadillas al aire a cadencia',
          duracionSegundos: 120,
          indicacion: 'Alterna 10 elevaciones de cadera en suelo y 10 sentadillas fluidas preparando rodillas y glúteos.'
        }
      ]
    },
    recuperacion: {
      titulo: 'Recuperación / Estiramiento',
      duracionTotalSegundos: 180,
      enfoque: 'Descarga de cuádriceps, isquiotibiales, psoas y pantorrillas',
      movimientos: [
        {
          id: 'rec-inf-1',
          nombre: 'Estiramiento del caballero (Flexores de cadera y psoas)',
          duracionSegundos: 60,
          indicacion: 'Rodilla en tierra, retroversión pélvica y avance suave de cadera (30 s por pierna).'
        },
        {
          id: 'rec-inf-2',
          nombre: 'Estiramiento de isquiotibiales y gemelos',
          duracionSegundos: 60,
          indicacion: 'Pierna extendida al frente con talón apoyado y punta hacia arriba inclinando el torso recto.'
        },
        {
          id: 'rec-inf-3',
          nombre: 'Figura 4 supina para glúteo mayor y piramidal',
          duracionSegundos: 60,
          indicacion: 'Cruza el tobillo sobre la rodilla opuesta y tracciona el muslo hacia el pecho (30 s por lado).'
        }
      ]
    }
  },
  cuerpo_completo: {
    calentamiento: {
      titulo: 'Calentamiento Táctico (5 min)',
      duracionTotalSegundos: 300,
      enfoque: 'Activación cardiorrespiratoria y movilidad multiarticular completa',
      movimientos: [
        {
          id: 'cal-full-1',
          nombre: 'Saltos de tijera tácticos (Jumping Jacks a 4 tiempos)',
          duracionSegundos: 90,
          indicacion: 'Coordina apertura de piernas y elevación de brazos elevando la temperatura corporal.'
        },
        {
          id: 'cal-full-2',
          nombre: 'El mejor estiramiento del mundo (Zancada con rotación torácica)',
          duracionSegundos: 105,
          indicacion: 'Zancada larga, apoya mano interna y rota el brazo contrario hacia el techo alternando lados.'
        },
        {
          id: 'cal-full-3',
          nombre: 'Sentadilla a plancha con activación de hombros',
          duracionSegundos: 105,
          indicacion: 'Baja en sentadilla, camina a plancha alta, activa abdomen y regresa poniéndote de pie.'
        }
      ]
    },
    recuperacion: {
      titulo: 'Recuperación / Estiramiento',
      duracionTotalSegundos: 180,
      enfoque: 'Retorno a la calma vagal y elongación global de cadenas musculares',
      movimientos: [
        {
          id: 'rec-full-1',
          nombre: 'Perro boca abajo con pedaleo de talones',
          duracionSegundos: 60,
          indicacion: 'En V invertida, alarga espalda, hombros y cadena posterior alternando presión en los talones.'
        },
        {
          id: 'rec-full-2',
          nombre: 'Flexión frontal relajada (Ragdoll) y apertura pectoral',
          duracionSegundos: 60,
          indicacion: 'Deja caer el torso con rodillas semidobladas y luego entrelaza manos detrás abriendo el pecho.'
        },
        {
          id: 'rec-full-3',
          nombre: 'Respiración táctica en caja (Box Breathing 4-4-4-4)',
          duracionSegundos: 60,
          indicacion: 'Inhala en 4 s, retén 4 s, exhala en 4 s y espera 4 s para reducir la frecuencia cardíaca.'
        }
      ]
    }
  }
};

/**
 * Obtiene la lista de áreas localizadas disponibles en el sistema.
 *
 * @returns {string[]} Arreglo con los identificadores de las áreas localizadas válidas.
 */
function obtenerAreasDisponibles() {
  return [...AREAS_VALIDAS];
}

/**
 * Valida que los parámetros de género, área localizada y nivel militar sean correctos.
 *
 * @param {string} genero - Perfil del usuario ('hombre' o 'mujer').
 * @param {string} area - Área muscular localizada ('tren_superior', 'core', 'tren_inferior', 'cuerpo_completo').
 * @param {string} [nivel='operativo'] - Nivel de exigencia ('recluta', 'operativo', 'fuerzas_especiales').
 * @returns {{ generoNormalizado: string, areaNormalizada: string, nivelNormalizado: string }} Parámetros normalizados en minúsculas.
 * @throws {Error} Si el género, el área localizada o el nivel no son válidos.
 */
function validarParametrosEntrenamiento(genero, area, nivel = 'operativo') {
  if (typeof genero !== 'string' || !GENEROS_VALIDOS.includes(genero.trim().toLowerCase())) {
    throw new Error(`Género inválido: "${genero}". Valores permitidos: ${GENEROS_VALIDOS.join(', ')}.`);
  }

  if (typeof area !== 'string' || !AREAS_VALIDAS.includes(area.trim().toLowerCase())) {
    throw new Error(`Área localizada inválida: "${area}". Valores permitidos: ${AREAS_VALIDAS.join(', ')}.`);
  }

  const nivelNormalizado = typeof nivel === 'string' ? nivel.trim().toLowerCase() : '';
  if (!Object.prototype.hasOwnProperty.call(FACTORES_NIVEL, nivelNormalizado)) {
    throw new Error(
      `Nivel militar inválido: "${nivel}". Valores permitidos: ${Object.keys(FACTORES_NIVEL).join(', ')}.`
    );
  }

  return {
    generoNormalizado: genero.trim().toLowerCase(),
    areaNormalizada: area.trim().toLowerCase(),
    nivelNormalizado
  };
}

/**
 * Filtra los ejercicios del catálogo según el área localizada solicitada.
 *
 * @param {string} area - Identificador del área localizada ('tren_superior', 'core', 'tren_inferior', 'cuerpo_completo').
 * @returns {Object[]} Lista de ejercicios que trabajan el área indicada.
 * @throws {Error} Si el área localizada no existe en el catálogo.
 */
function filtrarEjerciciosPorArea(area) {
  if (typeof area !== 'string' || !AREAS_VALIDAS.includes(area.trim().toLowerCase())) {
    throw new Error(`Área localizada inválida: "${area}". Valores permitidos: ${AREAS_VALIDAS.join(', ')}.`);
  }
  const areaNormalizada = area.trim().toLowerCase();
  return CATALOGO_EJERCICIOS.filter((ejercicio) => ejercicio.area === areaNormalizada);
}

/**
 * Obtiene los protocolos de Calentamiento Táctico (5 min) y Recuperación / Estiramiento
 * adaptados automáticamente al área muscular localizada.
 *
 * @param {string} area - Identificador del área localizada ('tren_superior', 'core', 'tren_inferior', 'cuerpo_completo').
 * @returns {{ area: string, calentamiento: Object, recuperacion: Object }} Protocolos de calentamiento y recuperación del área.
 * @throws {Error} Si el área localizada no es válida.
 */
function obtenerProtocolosPorArea(area) {
  if (typeof area !== 'string' || !AREAS_VALIDAS.includes(area.trim().toLowerCase())) {
    throw new Error(`Área localizada inválida: "${area}". Valores permitidos: ${AREAS_VALIDAS.join(', ')}.`);
  }
  const areaNormalizada = area.trim().toLowerCase();
  const protocolo = PROTOCOLOS_CALENTAMIENTO_Y_RECUPERACION[areaNormalizada];

  return {
    area: areaNormalizada,
    calentamiento: {
      titulo: protocolo.calentamiento.titulo,
      duracionTotalSegundos: protocolo.calentamiento.duracionTotalSegundos,
      enfoque: protocolo.calentamiento.enfoque,
      movimientos: protocolo.calentamiento.movimientos.map((m) => ({ ...m }))
    },
    recuperacion: {
      titulo: protocolo.recuperacion.titulo,
      duracionTotalSegundos: protocolo.recuperacion.duracionTotalSegundos,
      enfoque: protocolo.recuperacion.enfoque,
      movimientos: protocolo.recuperacion.movimientos.map((m) => ({ ...m }))
    }
  };
}

/**
 * Obtiene la guía técnica detallada (tipo de animación, pasos numerados y errores comunes)
 * de un ejercicio por su identificador único.
 *
 * @param {string} idEjercicio - Identificador del ejercicio en el catálogo (p. ej. 'flexiones-tacticas').
 * @returns {{ id: string, nombre: string, musculos: string[], tipoAnimacion: string, pasos: string[], erroresComunes: string[] }} Información técnica completa del ejercicio.
 * @throws {Error} Si el identificador no es válido o el ejercicio no existe.
 */
function obtenerTecnicaEjercicio(idEjercicio) {
  if (typeof idEjercicio !== 'string' || !idEjercicio.trim()) {
    throw new Error('Se requiere un identificador de ejercicio válido.');
  }
  const encontrado = CATALOGO_EJERCICIOS.find((item) => item.id === idEjercicio.trim());
  if (!encontrado) {
    throw new Error(`No se encontró ningún ejercicio con el id "${idEjercicio}".`);
  }

  return {
    id: encontrado.id,
    nombre: encontrado.nombre,
    musculos: [...encontrado.musculos],
    tipoAnimacion: encontrado.tecnica.tipoAnimacion,
    pasos: [...encontrado.tecnica.pasos],
    erroresComunes: [...encontrado.tecnica.erroresComunes]
  };
}

/**
 * Genera una rutina completa de calistenia militar adaptada por género, área localizada y nivel.
 *
 * @param {Object} opciones - Configuración para generar la rutina.
 * @param {string} opciones.genero - Perfil ('hombre' o 'mujer').
 * @param {string} opciones.area - Área localizada ('tren_superior', 'core', 'tren_inferior', 'cuerpo_completo').
 * @param {string} [opciones.nivel='operativo'] - Nivel físico ('recluta', 'operativo', 'fuerzas_especiales').
 * @returns {Object} Objeto con el detalle de la rutina, ejercicios adaptados, técnica, volumen total y duración estimada.
 * @throws {Error} Si faltan opciones obligatorias o si alguno de los parámetros es inválido.
 */
function generarRutinaMilitar(opciones) {
  if (!opciones || typeof opciones !== 'object') {
    throw new Error('Se requiere un objeto de opciones para generar la rutina militar.');
  }

  const { generoNormalizado, areaNormalizada, nivelNormalizado } = validarParametrosEntrenamiento(
    opciones.genero,
    opciones.area,
    opciones.nivel ?? 'operativo'
  );

  const factor = FACTORES_NIVEL[nivelNormalizado];
  const ejerciciosBase = filtrarEjerciciosPorArea(areaNormalizada);

  const ejerciciosAdaptados = ejerciciosBase.map((ejercicio) => {
    const baseGenero = ejercicio.configuracion[generoNormalizado];
    const repeticionesAdaptadas = Math.max(1, Math.round(baseGenero.repeticiones * factor));
    const seriesAdaptadas =
      nivelNormalizado === 'fuerzas_especiales' ? baseGenero.series + 1 : baseGenero.series;

    return {
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      area: ejercicio.area,
      musculos: [...ejercicio.musculos],
      descripcion: ejercicio.descripcion,
      series: seriesAdaptadas,
      repeticiones: repeticionesAdaptadas,
      descansoSegundos: baseGenero.descansoSegundos,
      volumenEjercicio: seriesAdaptadas * repeticionesAdaptadas,
      tecnica: {
        tipoAnimacion: ejercicio.tecnica.tipoAnimacion,
        pasos: [...ejercicio.tecnica.pasos],
        erroresComunes: [...ejercicio.tecnica.erroresComunes]
      }
    };
  });

  const metricas = calcularMetricasRutina(ejerciciosAdaptados);
  const protocolos = obtenerProtocolosPorArea(areaNormalizada);

  return {
    perfil: generoNormalizado,
    areaLocalizada: areaNormalizada,
    nivelMilitar: nivelNormalizado,
    totalEjercicios: ejerciciosAdaptados.length,
    ...metricas,
    calentamiento: protocolos.calentamiento,
    recuperacion: protocolos.recuperacion,
    ejercicios: ejerciciosAdaptados
  };
}

/**
 * Calcula las métricas agregadas (series totales, repeticiones totales y duración estimada en minutos)
 * para una lista de ejercicios adaptados.
 *
 * @param {Object[]} ejerciciosAdaptados - Lista de ejercicios con series, repeticiones y descansoSegundos.
 * @returns {{ seriesTotales: number, repeticionesTotales: number, duracionEstimadaMinutos: number }} Resumen cuantitativo de la rutina.
 * @throws {Error} Si el parámetro no es un arreglo válido.
 */
function calcularMetricasRutina(ejerciciosAdaptados) {
  if (!Array.isArray(ejerciciosAdaptados)) {
    throw new Error('La lista de ejercicios adaptados debe ser un arreglo.');
  }

  let seriesTotales = 0;
  let repeticionesTotales = 0;
  let tiempoTotalSegundos = 0;

  for (const item of ejerciciosAdaptados) {
    seriesTotales += item.series;
    repeticionesTotales += item.volumenEjercicio;
    const segundosEjecucionPorSerie = item.repeticiones * 3;
    tiempoTotalSegundos += item.series * (segundosEjecucionPorSerie + item.descansoSegundos);
  }

  return {
    seriesTotales,
    repeticionesTotales,
    duracionEstimadaMinutos: Math.max(1, Math.ceil(tiempoTotalSegundos / 60))
  };
}

const API_CALISTENIA_MILITAR = {
  CATALOGO_EJERCICIOS,
  PROTOCOLOS_CALENTAMIENTO_Y_RECUPERACION,
  obtenerAreasDisponibles,
  validarParametrosEntrenamiento,
  filtrarEjerciciosPorArea,
  obtenerProtocolosPorArea,
  obtenerTecnicaEjercicio,
  generarRutinaMilitar,
  calcularMetricasRutina
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CALISTENIA_MILITAR;
}

if (typeof window !== 'undefined') {
  window.CalisteniaMilitar = API_CALISTENIA_MILITAR;
}
