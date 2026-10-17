# eSports Arena Manager — Frontend

Plataforma para organizar torneos de videojuegos competitivos. Este repositorio
contiene la capa de presentación (frontend) del proyecto, desarrollada para el
ramo Desarrollo FullStack II (DSY1104).

## Integrantes

- Lucas Borquez
- Nicolás Lara
- Jhon Olivares

## Estado actual del proyecto

Evaluación Parcial 1 (EP1) en desarrollo — base web con HTML5, CSS3 y JavaScript
sin framework y sin backend (datos simulados).

## Requisitos previos

- Un navegador web moderno (Chrome, Edge, Firefox).
- No requiere instalación de dependencias ni Node.js para esta etapa (EP1).

 
### Vistas implementadas
 
| Vista | Archivo | Descripción |
|---|---|---|
| Inicio | `index.html` | Torneos destacados, tabla de próximos cierres de inscripción y video embebido |
| Listado de torneos | `torneos.html` | Filtros por juego, estado y rango de fechas; buscador por nombre; estado vacío sin coincidencias |
| Detalle de torneo | `torneo-detalle.html` | Datos generales, participantes, llaves/calendario por ronda, tabla de posiciones y premios |
| Inscripción | `inscripcion.html` | Selección de torneo (vía URL o manual), tipo de participante (equipo/individual) y confirmación |
| Gestión de equipo | `equipo.html` | Creación de equipo, alta/baja de integrantes y selección de capitán |
| Perfil de jugador | `perfil.html` | Datos de contacto, estadísticas, historial de torneos y edición de datos personales |
 
### Validaciones de formulario ya activas
 
- **Equipo**: nombre obligatorio y sin duplicados, juego y capitán
  obligatorios, al menos un integrante.
- **Perfil**: nombre y apodo obligatorios (apodo sin espacios, entre 3 y 20
  caracteres), correo validado con expresión regular.
- **Torneos (filtros)**: rechaza un rango de fechas donde "Inicio desde" es
  posterior a "Inicio hasta".
- **Inscripción**: exige seleccionar torneo/equipo o jugador y confirmar el
  checkbox de requisitos antes de habilitar el envío.
 
## Tecnologías
 
- HTML5 semántico
- CSS3 (variables, Grid y Flexbox) — hoja de estilos única
- JavaScript (ES6+), sin librerías ni frameworks
- Sin backend / sin base de datos (datos simulados en `js/datos.js`)
## Instrucciones de ejecución
 
1. Clonar o descargar este repositorio.
2. Abrir el archivo `index.html` directamente en el navegador, o servirlo con
   una extensión tipo *Live Server* (VS Code) para evitar problemas de rutas
   relativas.
3. Navegar entre las vistas usando el menú superior. El selector "Perfil de
   prueba" en el encabezado permite simular los distintos roles (Visitante,
   Jugador, Organizador, Administrador).
## Estructura de carpetas
 
```
├── index.html              # Vista de inicio
├── torneos.html             # Listado de torneos con filtros
├── torneo-detalle.html      # Detalle de un torneo (llaves, ranking, premios)
├── inscripcion.html         # Formulario de inscripción a torneo
├── equipo.html              # Gestión de equipo
├── perfil.html               # Perfil del jugador
├── css/
│   └── estilos.css           # Hoja de estilos externa única (variables, Grid/Flexbox)
├── js/
│   ├── datos.js               # Datos simulados + funciones de lógica de negocio
│   ├── inicio.js
│   ├── torneos.js
│   ├── torneo-detalle.js
│   ├── inscripcion.js
│   ├── equipo.js
│   └── perfil.js
└── README.md
```


## Importante
en esta etapa no se utiliza una base de datos real. Los datos se manejan mediante arreglos simulados en memoria definidos en js/datos.js y pierden al recargar la pagína.


---

## Evaluación Parcial 2 — eSports Arena Manager

Esta sección describe la versión actual del proyecto. La información anterior se conserva como historial de EP1.

### Actualización del proyecto

Se migró el proyecto original de EP1 a React, manteniendo sus juegos, datos, imágenes e identidad visual.

Se incorporaron componentes reutilizables, navegación, formularios con validaciones, persistencia en el navegador y pruebas automatizadas.

### Tecnologías

- React 18 y React DOM.
- Vite.
- React Router.
- Bootstrap y CSS propio.
- Jasmine y Karma.
- Webpack, Babel e Istanbul para preparar las pruebas y medir cobertura.

Se conserva `index.html` como entrada de la aplicación, siguiendo el ejemplo del profesor. Este archivo carga `src/main.jsx`, que inicia React. Las pantallas se desarrollan mediante componentes `.jsx`.

Las direcciones como `/torneos.html` son rutas gestionadas por React Router.

### Funciones implementadas

| Pantalla | Funciones |
|---|---|
| Inicio | Resumen, torneos destacados, próximos cierres y video |
| Torneos | Búsqueda y filtros por juego, estado y fechas |
| Detalle | Participantes, partidas por ronda, ranking y premios |
| Inscripción | Inscripción individual o por equipo y cancelación dentro del plazo |
| Equipos | Creación, edición, integrantes, capitán y eliminación con confirmación |
| Perfil | Edición de datos personales, estadísticas e historial |
| Administración | Gestión de torneos para organizadores y administradores |

Se incluyen League of Legends, Valorant, Ajedrez, Rocket League y Minecraft.

### Validaciones y datos

Se validan cupos, plazos, inscripciones duplicadas, sanciones, integrantes, capitanía, correo, apodo y coherencia de fechas.

Los equipos con inscripciones o historial y los torneos con participantes o partidas tienen restricciones para proteger sus registros.

`ArenaProvider` comparte los datos entre componentes. `crearArenaStore` gestiona las operaciones, validaciones y persistencia mediante `localStorage`.

Los datos se conservan al recargar en el mismo navegador y dirección. El selector de perfiles permite simular roles y jugadores; no corresponde a una autenticación real.

Las fechas de los torneos abiertos se generan al inicializar la demostración y luego se conservan. Restablecer la demostración reemplaza los datos locales.

### Correcciones recientes

- Actualización de dependencias: las alertas de npm bajaron de 16 a 4.
- Recuperación del torneo Rocket League en modalidad 2v2.
- Corrección de equipos, partidas y ranking de Rocket League.
- Actualización de los datos guardados anteriormente, conservando las demás inscripciones y perfiles.
- Incorporación de siete pruebas adicionales para completar diez casos automatizados.

Las cuatro alertas restantes corresponden a dependencias de desarrollo utilizadas por Karma.

### Estructura actual

```text
public/img/          Imágenes de los juegos
src/components/      Componentes reutilizables
src/pages/           Pantallas de la aplicación
src/context/         Datos compartidos
src/data/            Datos originales y semilla
src/services/        Validaciones y persistencia
src/utils/           Funciones de lógica
src/styles/          Estilos del proyecto
tests/               Pruebas de lógica, servicio y componentes
```

### Requisitos

- Node.js 20.19 o superior y npm.
- Git.
- Navegador web.
- Chrome para las pruebas, o Edge configurado mediante `CHROME_BIN`.

### Clonar y ejecutar

```powershell
git clone --branch develo https://github.com/jzzzn2110/Frontend-eSports-Arena-Manager.git
cd Frontend-eSports-Arena-Manager
git branch --show-current
npm ci
npm run dev
```

La rama debe mostrar `develo`. Abre la dirección que indique Vite.

No ejecutes `git init` después de clonar: el clon ya incluye el historial. Una descarga ZIP no incluye Git.

Las instrucciones de abrir directamente el HTML corresponden a EP1. Para ejecutar EP2 se utiliza Vite.

### Compilación y pruebas

```powershell
npm run build
npm test
```

Si Karma no encuentra Chrome y tienes Edge instalado en esta ruta:

```powershell
$env:CHROME_BIN = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npm test
```

Esta configuración se aplica únicamente a la terminal actual.

Para generar el reporte de cobertura:

```powershell
npm run test:coverage
```

Abre `coverage/html/index.html` para consultar el detalle.

### Casos de prueba

Las pruebas utilizan Jasmine y Karma, siguiendo el enfoque del ejemplo del profesor: `describe`, `it`, `expect`, espías, `createRoot`, `act` y limpieza entre casos.

| N.º | Caso comprobado |
|---|---|
| 1 | Los cupos disponibles no pueden ser negativos |
| 2 | El ranking se ordena sin modificar el arreglo original |
| 3 | Se distinguen sanciones vigentes y terminadas |
| 4 | Una inscripción se guarda y puede recuperarse |
| 5 | Se rechaza una inscripción duplicada |
| 6 | Los datos se conservan si falla el almacenamiento |
| 7 | Solo el capitán puede inscribir su equipo, salvo permisos administrativos |
| 8 | El buscador filtra los torneos mostrados |
| 9 | El formulario exige confirmación, inscribe y permite cancelar |
| 10 | El rol jugador no puede acceder al formulario de administración |

El almacenamiento se simula con espías de Jasmine para evitar modificar los datos reales del navegador y comprobar errores de guardado.

### Resultados verificados

Última ejecución registrada: **17 de octubre de 2026**.

**Resultado: 10 pruebas aprobadas.**

| Métrica | Cobertura |
|---|---:|
| Sentencias | 52,20 % |
| Ramas | 42,80 % |
| Funciones | 54,60 % |
| Líneas | 52,04 % |

Estos porcentajes corresponden a los módulos instrumentados durante las pruebas. No representan una comprobación completa de todas las pantallas, estilos o funciones del proyecto.

### Trabajo con ramas

- `develo`: integración del desarrollo.
- `fix/ep2-flujos-y-pruebas`: correcciones integradas mediante Pull Request.
- `qa`: validación de la versión integrada.
- `main`: versión final validada.

Antes de trabajar y guardar cambios:

```powershell
git branch --show-current
git status
```

Para guardar cambios en el README desde `develo`:

```powershell
git add README.md
git commit -m "Actualizando README de EP2 y resultados de pruebas"
git push origin develo
```

Si el push es rechazado porque existen cambios remotos, después de confirmar el trabajo local:

```powershell
git pull --rebase origin develo
```

Resuelve cualquier conflicto antes de volver a subir. No utilices push forzado.

### Pendientes para la entrega

- Actualizar el ERS con las funciones, actores y reglas actuales.
- Preparar el documento de testing con casos, resultados, cobertura y limitaciones.
- Completar la revisión de los flujos en escritorio y celular.
- Validar la versión en `qa` antes de integrarla a `main`.
- Preparar el ZIP final y la presentación individual.
