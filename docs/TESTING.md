# Informe de testing - EP2

eSports Arena Manager | DSY1104 | 17 de octubre de 2026

## 1. Resultado y versión

Se ejecutaron 103 casos: 103 aprobados, 0 fallidos y 0 omitidos. Registro UTC de la ejecución local: 2026-10-17T21:15:20.257Z. Código base publicado: 6c1e9f9; el ajuste CSS posterior a esa ejecución fue validado con build y la revisión de navegador. El CSS no está instrumentado por Istanbul.

La compilación Vite finalizó correctamente. Se completaron flujos de inscripción/cancelación, edición de perfil, CRUD de equipos y CRUD de torneos, incluidas recargas para comprobar persistencia. Se capturaron siete pantallas en tres anchos, sin errores JavaScript ni desbordamiento horizontal de la página en la última pasada.

## 2. Entorno reproducible

Windows, Node.js 24.19.0, Edge Chromium en modo headless; React 18.3.1, Vite 6.4.4, Jasmine 5.5.0, Karma 6.4.4, Webpack 5.112.0 y Babel. package-lock.json fija el árbol de instalación. El workflow usa Ubuntu, Node 22 y Chrome.

```powershell
npm ci
npm run build
npm test
```

Si no se detecta el navegador, establecer CHROME_BIN en la ruta de Chrome o Edge. La configuración detecta instalaciones habituales de Windows. npm run test:coverage ejecuta la misma suite y genera HTML, lcov, resumen JSON y resultados por caso. El reporte local HTML está en coverage/html/index.html. El repositorio conserva el resumen y casos en docs/evidencias para no versionar artefactos temporales completos.

La ejecución del segundo bloque en GitHub Actions está aprobada: [Validar EP2, run 39070314881](https://github.com/jzzzn2110/Frontend-eSports-Arena-Manager/actions/runs/39070314881). Esa aprobación corresponde al SHA indicado; cualquier commit final requiere su propia ejecución.

## 3. Diseño, aislamiento y mocks

- Lógica: cupos, ranking sin mutación, sanciones, fechas locales, valores vacíos y cálculo de puntos de partidas finalizadas.
- Servicio: almacenamiento simulado con getItem/setItem y espías de Jasmine; se inyectan reloj y semilla. Se prueba lectura corrupta, incompatibilidad de versión, fallo de escritura, instantáneas inmutables y recuperación tras recarga.
- Componentes: createRoot, act y MemoryRouter montan las páginas con ArenaProvider. Se disparan cambios y envíos reales en el DOM; se verifican mensajes, campos, cupos e historial. Los espías controlan fallos del servicio sin usar datos del navegador del usuario.
- Limpieza: cada caso prepara una instancia y DOM propios; se desmonta la raíz y se eliminan contenedores. El reloj fijo evita que el calendario real vuelva inestables las pruebas de plazo.
- Persistencia: se recrea el servicio con el mismo almacenamiento simulado para demostrar recuperación. Se comprueba que un error de setItem conserve el estado anterior.

## 4. Inventario ejecutado

| Suite | Casos | Resultado |
|---|---:|---|
| Componentes y rutas de Arena | 34 | Aprobados |
| Fechas, límites y resultados | 7 | Aprobados |
| Flujos de eSports Arena Manager | 7 | Aprobados |
| Lógica de eSports Arena Manager | 3 | Aprobados |
| Servicio de Arena con almacenamiento y reloj aislados | 52 | Aprobados |

El inventario íntegro de los 103 casos se entrega en evidencias/casos-prueba.csv, con ID, suite, nombre, resultado y duración. evidencias/resultados-casos.json proviene del reporter de Karma, no de una lista de resultados inventada. Los casos parametrizados de entradas inválidas se cuentan como casos separados.

## 5. Diez casos para la demostración

| N.º | Escenario | Resultado que debe explicarse |
|---|---|---|
| 1 | Cupos con exceso de inscritos | No devuelve una cantidad negativa |
| 2 | Ordenar ranking | Respeta puntos y conserva el arreglo original |
| 3 | Sanciones | Distingue vigentes y terminadas |
| 4 | Inscribir y reconstruir servicio | Recupera la participación guardada |
| 5 | Inscripción repetida | Rechaza duplicado y no consume otro cupo |
| 6 | setItem lanza error | Mantiene estado previo y entrega error útil |
| 7 | Inscripción de equipo ajeno | Solo capitán o administrador puede realizarla |
| 8 | Buscar en el listado | Actualiza tarjetas sin ciclos de renderizado |
| 9 | Formulario de inscripción | Exige confirmación, registra y permite cancelar |
| 10 | Jugador en administración | No muestra el formulario de gestión |

Estos diez casos facilitan la defensa del criterio de la pauta. La suite completa añade fronteras de tiempo, validación de perfiles, equipos incompletos, juego incorrecto, equipos inactivos, cupos agotados, cambios de estado, protección histórica, rutas desconocidas y migración Rocket League.

## 6. Cobertura medida

| Módulo | Sentencias % | Ramas % | Funciones % | Líneas % |
|---|---:|---:|---:|---:|
| total | 95.40 | 85.74 | 94.01 | 95.83 |
| src/App.jsx | 78.94 | 50.00 | 62.50 | 81.25 |
| src/components/Cabecera.jsx | 87.50 | 57.14 | 66.66 | 87.50 |
| src/components/Confirmacion.jsx | 100.00 | 100.00 | 100.00 | 100.00 |
| src/components/PiePagina.jsx | 100.00 | 100.00 | 100.00 | 100.00 |
| src/components/TarjetaTorneo.jsx | 80.00 | 81.25 | 100.00 | 100.00 |
| src/context/ArenaContext.jsx | 69.23 | 50.00 | 100.00 | 72.72 |
| src/data/datos.js | 100.00 | 100.00 | 100.00 | 100.00 |
| src/data/semilla.js | 100.00 | 55.55 | 100.00 | 100.00 |
| src/pages/Administracion.jsx | 97.56 | 100.00 | 100.00 | 97.43 |
| src/pages/Equipo.jsx | 90.32 | 76.00 | 88.23 | 92.98 |
| src/pages/Inicio.jsx | 100.00 | 72.22 | 100.00 | 100.00 |
| src/pages/Inscripcion.jsx | 87.17 | 89.74 | 91.66 | 86.48 |
| src/pages/Perfil.jsx | 100.00 | 85.71 | 100.00 | 100.00 |
| src/pages/TorneoDetalle.jsx | 93.47 | 76.74 | 84.21 | 92.50 |
| src/pages/Torneos.jsx | 93.33 | 91.30 | 88.88 | 92.85 |
| src/services/crearArenaStore.js | 99.57 | 90.66 | 100.00 | 99.52 |
| src/utils/logica.js | 100.00 | 100.00 | 100.00 | 100.00 |

Totales: 561/588 sentencias; 355/414 ramas; 220/234 funciones; 506/528 líneas. Son 17 módulos instrumentados. src/main.jsx se excluye como punto de arranque; tampoco se mide CSS, HTML, recursos externos ni comportamiento de un backend. La cobertura de ramas refleja decisiones ejecutadas, no calidad visual ni cumplimiento total de requisitos.

La cifra inicial de 20,73 % de sentencias correspondía a tres pruebas y a un conjunto mucho menor de código instrumentado. El aumento no debe presentarse como comparación sobre un denominador idéntico. La pauta no fija un porcentaje mínimo de cobertura; se informa el valor medido sin convertirlo en una nota estimada.

## 7. Verificación de navegador

Edge headless sobre Vite, ventanas de 360, 768 y 1366 píxeles de ancho y 900 de alto. Se capturó la página completa de Inicio, Torneos, Detalle Rocket League, Inscripción, Equipo, Perfil y Administración. Los 21 registros tienen scrollWidth igual o compatible con clientWidth. Las tablas más anchas permiten desplazamiento interno y conservan acceso por teclado a su región.

El recorrido ejecutó: alta individual, recarga y detección del inscrito; actualización y recarga de perfil; cancelación; alta, recarga, edición y eliminación de equipo; alta, edición y eliminación de torneo. Se observaron cero eventos pageerror. La evidencia se guarda en navegador.json y capturas. No se comprobó reproducción del video externo ni servicios de terceros; tampoco Safari, Firefox, dispositivos físicos o lectores de pantalla.

Durante la revisión se encontró desbordamiento en Administración móvil por los textos ocultos de botones dentro de una tabla. Se estableció position: relative en su contenedor desplazable y se repitió la revisión completa: cero desbordamientos. Esta comprobación visual complementa las pruebas unitarias.

## 8. Defectos corregidos y análisis

- Las rutas montaban componentes sin datos esperados y omitían parámetros URL. El proveedor compartido y la lectura de parámetros resuelven el fallo; se cubren rutas válidas y desconocidas.
- El listado actualizaba estado durante el renderizado. Ahora calcula resultados y error de fechas a partir del estado existente, sin ciclos.
- La inscripción solo mostraba éxito. Ahora valida, persiste, actualiza cupos y se refleja en otras vistas; se prueban duplicados y rechazo por reglas.
- Equipos y perfil eran temporales. Se completaron formularios, CRUD, permisos simulados, historial y recuperación tras recarga.
- La configuración Bootstrap solo importaba parte de los estilos. Se incorporó la hoja completa, se revisó el tema oscuro y se adaptó la navegación.
- Al integrar aportes remotos se adaptaron pruebas del histórico a Rocket League; se añadió regresión de migración que preserva datos y no se repite. No se eliminaron las siete pruebas del equipo.
- El reporter de evidencia se ajustó para no sobrescribir hooks de un decorador; el inventario se validó contra los 103 resultados reales.

## 9. Dependencias y límites pendientes

La auditoría npm del 17 de octubre de 2026 registra cuatro entradas altas de desarrollo: braces, chokidar, karma y karma-jasmine. Comparten la cadena de dependencia de braces. El aviso [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) afecta hasta 3.0.3 y no publica versión corregida; npm view confirmó 3.0.3 como versión disponible. No se degradó Karma a una versión mayor antigua ni se aplicó npm audit fix --force.

El uso previsto es ejecutar los patrones de prueba del repositorio en un entorno de desarrollo confiable; no aceptar patrones externos ni exponer el runner como servicio público. El resultado no declara seguridad certificada. La aplicación compilada no incluye estas dependencias de testing. La auditoría completa se entrega como evidencia fechada y debe repetirse si se actualiza el lockfile.

Los roles simulados no garantizan identidad. localStorage no resuelve concurrencia ni sincroniza equipos; los datos históricos y estadísticas son demostrativos. La aceptación docente del caso, la fecha AVA y la exposición individual permanecen fuera de lo que puede certificar esta ejecución.
