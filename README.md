# eSports Arena Manager - EP2

Aplicación React para consultar torneos, inscribirse, gestionar equipos y editar perfiles. Incluye administración de torneos, persistencia local y pruebas con Jasmine/Karma para DSY1104, Desarrollo FullStack II.

Integrantes: Lucas Borquez, Nicolás Lara y Jhon Olivares.

## Ejecutar

Requisitos: Node.js 20.19 o superior, npm, Git y Chrome o Edge Chromium. La validación local usó Node 24.19; CI usa Node 22.

```powershell
git clone --branch fix/ep2-flujos-y-pruebas https://github.com/jzzzn2110/Frontend-eSports-Arena-Manager.git
cd Frontend-eSports-Arena-Manager
npm ci
npm run dev
```

Abre la dirección que imprime Vite. Una vez integrado el PR final, puede clonarse `main`. En un ZIP basta con abrir una terminal en la carpeta extraída y ejecutar los tres comandos npm. No se abre index.html directamente ni se ejecuta git init sobre un clon existente.

## Flujos disponibles

| Pantalla | Operaciones |
|---|---|
| Inicio | Resumen, destacados y próximos cierres vigentes |
| Torneos | Búsqueda por nombre y filtros por juego, estado y fechas |
| Detalle | Participantes, partidas por ronda, posiciones y premios |
| Inscripción | Alta individual o por equipo; cancelación dentro de plazo |
| Equipos | Crear, editar integrantes/capitán y eliminar con confirmación |
| Perfil | Actualizar nombre, apodo y correo; consultar historial real de la sesión |
| Administración | Crear, editar y eliminar torneos; consultar cupos |

El selector del encabezado permite simular Visitante, Jugador, Organizador y Administrador. Para demostrar inscripción individual: selecciona Jugador y el primer jugador; abre Torneo de Ajedrez; confirma requisitos; inscribe; recarga y cancela. Para equipos, el capitán del equipo Arena PvP puede inscribirlo en Minecraft. Para administrar, selecciona Organizador. El Administrador puede restablecer los datos mediante confirmación.

Los datos se guardan en localStorage en el mismo navegador y origen. La aplicación usa perfiles simulados, sin autenticación ni servidor. Las reglas del servicio previenen errores dentro de la demostración, pero no sustituyen permisos de un backend. Las fechas abiertas se generan al iniciar por primera vez y se conservan. El historial Rocket League 2v2 se mantiene, incluida la migración de datos anteriores.

## Arquitectura

React 18, React Router 7, Vite 6 y Bootstrap 5. index.html inicia src/main.jsx; las direcciones terminadas en .html son rutas de React Router. ArenaProvider comparte una instantánea inmutable del servicio crearArenaStore mediante useSyncExternalStore. Los formularios controlan su estado local y llaman al servicio para validar y persistir antes de publicar cambios.

| Directorio | Responsabilidad |
|---|---|
| src/pages | Siete pantallas y sus formularios |
| src/components | Cabecera, pie, tarjetas y confirmaciones |
| src/context | Conexión React con el servicio |
| src/services | Operaciones y reglas de negocio |
| src/data, src/utils | Semilla, datos y funciones puras |
| src/styles, public/img | Identidad visual y recursos |
| tests | Lógica, límites, servicio, componentes y reporte |
| docs | ERS, cambios, testing, presentación y evidencia |

## Verificación

```powershell
npm run build
npm test
npm run test:coverage
```

Karma detecta Chrome o Edge en las rutas habituales de Windows. Si el navegador está instalado en otra ubicación, define CHROME_BIN con la ruta del ejecutable. npm test ya genera cobertura; test:coverage es un alias explícito. El reporte interactivo queda en coverage/html/index.html y los resultados por caso en coverage/resultados-casos.json. No se versiona node_modules, dist ni el directorio coverage.

Resultado local registrado el 17 de octubre de 2026: **103 aprobadas, 0 fallidas**. Cobertura: sentencias 95,40 %, ramas 85,74 %, funciones 94,01 % y líneas 95,83 %. Se instrumentaron 17 módulos; se excluye src/main.jsx y no se mide CSS. No equivale a cobertura total de requisitos. Se verificaron siete pantallas en anchos de 360, 768 y 1366 px: 21 capturas, sin errores JavaScript ni desbordamiento de página. Los contenidos de tablas extensas se desplazan dentro de su región.

GitHub Actions ejecuta instalación, build y pruebas en pushes y PR de las ramas de trabajo. El run del commit 6c1e9f9 terminó correctamente; las publicaciones siguientes deben esperar su propia validación.

## Documentación de entrega

- [Cambios y trazabilidad](docs/CAMBIOS-EP2.md)
- [ERS V2](docs/ERS-V2.md)
- [Testing y cobertura](docs/TESTING.md)
- [Guía para la presentación](docs/GUIA-PRESENTACION.md)
- [Los 103 casos ejecutados](docs/evidencias/casos-prueba.csv)
- [Historial EP1](docs/HISTORIAL-EP1.md)

Los tres informes también se entregan en PDF dentro de docs. Las instrucciones EP1 se archivaron para que no se confundan con la ejecución actual de React.

## Ramas y publicación

El flujo es `fix/ep2-flujos-y-pruebas -> develo -> qa -> main`. El PR #1 integró el primer bloque en develo. Los cambios posteriores conservan los aportes del equipo. Esta revisión incluye el bloque final de documentos y evidencia. Su integración se realiza por develo y qa y se propone a main mediante Pull Request. Consultar en GitHub el estado actualizado de las ramas y comprobaciones. No se han fabricado fechas ni autorías.

Antes de integrar: git fetch, revisar diferencias, ejecutar build/pruebas y confirmar el resultado de Actions. No usar push forzado. Tras aprobar y fusionar el PR a main: git switch main y git pull --ff-only origin main.

## Alcance y limitaciones

Proyecto académico local: no hay registro/login real, API, base de datos, concurrencia entre navegadores ni editor de resultados/brackets. Los rankings y premios consultados provienen de la semilla. Las estadísticas de ejemplo se identifican como demostración. Un hosting debe servir index.html como respaldo para las rutas de React Router.

La auditoría npm del 17 de octubre registra cuatro alertas altas en la cadena de desarrollo Karma/chokidar/braces/karma-jasmine, derivadas de una misma dependencia sin versión corregida publicada. No se aplicó la degradación mayor sugerida por npm. Véanse el detalle y las medidas de uso en TESTING.md. Las dependencias de producción no aparecen afectadas en ese resultado. La fecha AVA y la aceptación docente del caso eSports deben comprobarse con la asignatura.
