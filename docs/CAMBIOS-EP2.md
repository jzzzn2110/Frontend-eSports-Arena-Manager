# Informe de cambios - EP2

eSports Arena Manager | DSY1104 | 17 de octubre de 2026

## 1. Resultado y estado de entrega

Se completaron los flujos de la aplicación React, sus validaciones y la persistencia local. La entrega incluye siete pantallas funcionales, servicio compartido, pruebas automatizadas, evidencia visual, ERS V2 y guía de presentación. Se mantuvo la identidad gráfica y se incorporaron los aportes remotos del equipo sin sobrescribirlos.

Esta revisión incluye la documentación, las evidencias y el ajuste móvil finales. El usuario autorizó publicar inmediatamente el bloque restante y canceló la espera entre commits. La integración seguirá por develo y qa hacia un Pull Request a main; el estado de publicación se consulta en GitHub.

La revisión inicial detectaba tres pruebas y páginas sin completar. La validación actual registra 103 pruebas aprobadas y una compilación correcta. La revisión de navegador cubre siete pantallas en tres anchos. Los cambios finales se incluyen en el ZIP. El usuario autorizó publicar el bloque restante inmediatamente, dejando sin efecto la espera inicial.

## 2. Alcance de la revisión

Se revisaron los tres PDF suministrados: plan de trabajo de 7 páginas, pauta del estudiante de 9 y anexo de 12. Se inspeccionaron las ramas y fuentes de Frontend-eSports-Arena-Manager, con base inicial develo 0190394231c83f5ed16d06471e85cb6af5038e1a. El repositorio Fullstack2-React, referencia 33852ed8387926675ec9b0d8852c2da90d4c7f4a, se usó para contrastar estructura y enfoque Jasmine/Karma; sus 44 pruebas pasaron y no se modificó.

Los documentos fueron tratados como criterios de evaluación y planificación. La orden para modificar, publicar ramas y espaciar commits provino del usuario. El plan original de doce commits por integrantes no se convirtió en autorías o fechas inventadas. No se recibió el ZIP Interfaz Pro mencionado en ese plan.

## 3. Correcciones funcionales

| Área | Problema observado | Cambio implementado |
|---|---|---|
| Navegación | Props de datos ausentes y parámetros ignorados | Contexto compartido, lectura de id/torneo y estado de ruta desconocida |
| Torneos | Actualización de estado durante render | Filtrado derivado, búsqueda y validación de rango sin bucles |
| Inscripción | Mensaje sin registro real y opción individual oculta | Alta/cancelación persistentes por modalidad, cupos e historial sincronizados |
| Equipos | Pantalla temporal | Crear, editar, incorporar/quitar miembros, elegir capitán y eliminar con confirmación |
| Perfil | Pantalla temporal | Editar datos propios, validar correo/apodo y consultar historial efectivo |
| Administración | Flujo de gestión ausente | CRUD de torneos, estados, fechas, cupos y restablecimiento administrativo |
| Almacenamiento | Cambios perdidos al recargar | Store versionado, validación de recuperación y fallo de escritura sin falso éxito |
| Diseño | Bootstrap incompleto y compresión en móvil | Bootstrap completo, tema oscuro, cabecera adaptable y tablas con scroll interno |

Se aplican restricciones de plazo, cupos, sanciones, duplicados, propiedad del jugador/capitán, tamaño y juego del equipo. Los equipos históricos no se alteran ni se eliminan. Los torneos con participantes o partidas no se borran. El estado del torneo no retrocede y sus cupos no bajan de los ya ocupados.

## 4. Datos, arquitectura y contribuciones preservadas

ArenaProvider centraliza el acceso; crearArenaStore valida y guarda antes de notificar. Los formularios usan estado local y componentes reutilizables; las funciones puras quedan separadas para pruebas. Se eliminaron scripts EP1 sin uso y el servicio anterior, conservando la historia en Git. El README antiguo se archivó para evitar instrucciones incompatibles con Vite.

La semilla genera fechas de inscripción futuras al inicializar y luego las conserva. Se agregó un equipo Minecraft válido para demostrar inscripción por equipos. Los datos deportivos se señalan como demostración.

Durante la pausa el equipo publicó cambios y fusionó el PR #1. Se incorporaron los commits 657d8e6, 7e5c1da, 8a7f6b0 y eb5d146: actualización de dependencias, restauración de Rocket League 2v2, migración de datos guardados, README y siete pruebas adicionales. Se ajustó la suite a esos datos y se añadió una prueba de migración. No se adjudican esos aportes como autoría nueva de esta intervención.

## 5. Verificación y evidencia

| Comprobación | Resultado |
|---|---|
| Instalación con lockfile | Correcta |
| Compilación Vite 6.4.4 | Correcta, 56 módulos transformados |
| Jasmine/Karma | 103 aprobadas, 0 fallidas |
| Cobertura de sentencias | 95,40 % (561/588) |
| Cobertura de ramas | 85,74 % (355/414) |
| Cobertura de funciones | 94,01 % (220/234) |
| Cobertura de líneas | 95,83 % (506/528) |
| Navegador | 21 capturas; cero errores y desbordamientos en la pasada final |
| Actions del commit 6c1e9f9 | Finalizado correctamente |

Los informes no afirman cobertura total ni certifican el backend: la aplicación sigue siendo una demostración local. El detalle de mocks, casos, exclusiones y vulnerabilidades de herramientas de desarrollo se encuentra en TESTING.md y su PDF.

## 6. Commits y ramas

| Bloque | Hash/estado | Fecha real America/Santiago |
|---|---|---|
| Flujos y persistencia | 6706068 publicado | 17-10-2026 13:04:26 |
| Pruebas y CI | 6c1e9f9 publicado | 17-10-2026 18:17:25 |
| Documentación, evidencias y ajuste móvil | Incluido en esta revisión | Fecha real registrada en Git |

Entre los dos bloques publicados transcurrieron 5 horas, 12 minutos y 59 segundos por la pausa de la sesión. Se conserva ese tiempo real. El usuario canceló la espera para el bloque restante y pidió publicarlo inmediatamente; no se manipulan GIT_AUTHOR_DATE ni GIT_COMMITTER_DATE.

El PR #1, fix/ep2-flujos-y-pruebas hacia develo, fue fusionado por el equipo. La publicación final seguirá fix hacia develo y qa, conservando cambios remotos. Se abrirá un PR a main para revisión y presentación; main no se declara actualizado antes de comprobar su integración. La continuación programada fue desactivada al autorizarse el cierre inmediato.

## 7. Documentos y preparación de la defensa

Se añadieron ERS-V2.md, TESTING.md, CAMBIOS-EP2.md y GUIA-PRESENTACION.md, junto con versiones PDF de los tres informes. La evidencia contiene el inventario CSV de 103 casos, los resultados originales del reporter, cobertura por módulo, auditoría npm y 21 capturas. El ZIP excluye node_modules, .git, dist y archivos temporales.

La guía organiza una exposición de 15 minutos y 5 de preguntas según el anexo: problema, arquitectura, props/estado, demostración de flujos, pruebas y límites. Cada integrante debe poder explicar el conjunto; ejecutar el código no reemplaza la defensa individual.

## 8. Límites y tareas externas

El caso eSports y su equivalencia con la pauta general requieren aceptación docente; la fecha de entrega debe verificarse en AVA. No se agregó una tienda ni carrito por una mención de la pauta. No hay login real, servidor, base de datos, sincronización multiusuario ni edición de brackets/resultados. Rankings, premios y algunas estadísticas son datos iniciales.

Quedan cuatro entradas altas de auditoría en herramientas de desarrollo por braces sin parche publicado, documentadas y no ocultadas. No se aplicaron degradaciones forzadas que comprometan Jasmine/Karma. Las métricas de pruebas y la aprobación de CI se refieren a ejecuciones identificadas; la futura publicación final debe validar su propio SHA.

## 9. Inventario de archivos de código

Comparación acumulada frente a develo 0190394. Incluye los aportes del equipo integrados durante la sesión. A = agregado, M = modificado, D = retirado. Los scripts retirados continúan recuperables en el historial Git.

| Estado | Archivo |
|---|---|
| A | .github/workflows/validar-ep2.yml |
| M | README.md |
| M | index.html |
| D | js/datos.js |
| D | js/equipo.js |
| D | js/inicio.js |
| D | js/inscripcion.js |
| D | js/perfil.js |
| D | js/torneo-detalle.js |
| D | js/torneos.js |
| M | karma.conf.cjs |
| M | package-lock.json |
| M | package.json |
| M | src/App.jsx |
| M | src/components/Cabecera.jsx |
| A | src/components/Confirmacion.jsx |
| M | src/components/PiePagina.jsx |
| M | src/components/TarjetaTorneo.jsx |
| A | src/context/ArenaContext.jsx |
| M | src/data/datos.js |
| A | src/data/semilla.js |
| M | src/main.jsx |
| A | src/pages/Administracion.jsx |
| M | src/pages/Equipo.jsx |
| M | src/pages/Inicio.jsx |
| M | src/pages/Inscripcion.jsx |
| M | src/pages/Perfil.jsx |
| M | src/pages/TorneoDetalle.jsx |
| M | src/pages/Torneos.jsx |
| D | src/services/arenaService.js |
| A | src/services/crearArenaStore.js |
| M | src/styles/estilos.css |
| M | src/utils/logica.js |
| A | tests/componentes.spec.jsx |
| A | tests/flujos.spec.jsx |
| A | tests/limites.spec.js |
| M | tests/logica.spec.js |
| A | tests/reporte.cjs |
| A | tests/servicio.spec.js |

La documentación se añade en docs, con PDFs y evidencia. El README principal se consolida para EP2 y el ajuste final de CSS limita el contexto de los textos ocultos dentro de la tabla desplazable de Administración.
