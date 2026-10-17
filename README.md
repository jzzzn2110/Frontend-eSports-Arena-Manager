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



## EP2 

Esta sección corresponde a la versión actual del proyecto. La información anterior se conserva como historial de EP1.


### Objetivo

Migrar eSports Arena Manager a React, manteniendo como base el proyecto de EP1, sus juegos, datos e identidad visual. Se incorporaron componentes reutilizables, formularios con validaciones, navegación y persistencia de datos en el navegador.

### Tecnologías utilizadas

- React y React DOM.
- Vite para desarrollo y compilación.
- React Router para navegar entre las páginas.
- Bootstrap y CSS propio para adaptar el diseño a escritorio y celular.
- Jasmine y Karma para las pruebas.
- Istanbul para medir cobertura.

Las pantallas están desarrolladas en archivos `.jsx`. Las rutas como `/torneos.html` se mantienen para conservar los enlaces originales y son gestionadas por React Router.

### Funciones implementadas

- **Inicio:** resumen, torneos destacados, próximos cierres y video.
- **Torneos:** búsqueda y filtros por juego, estado y fechas.
- **Detalle:** participantes, partidas por ronda, ranking y premios.
- **Inscripción:** registro individual o por equipo y cancelación dentro del plazo.
- **Equipos:** creación, edición, selección de integrantes y capitán.
- **Perfil:** edición de datos personales, estadísticas e historial.
- **Administración:** gestión de torneos para organizadores y administradores.

Se validan cupos, fechas, inscripciones duplicadas, sanciones, integrantes y permisos del perfil seleccionado. Los equipos y torneos con historial tienen restricciones de modificación o eliminación.

### Datos de demostración

El proyecto incluye League of Legends, Valorant, Ajedrez, Rocket League y Minecraft.

Los datos compartidos se gestionan mediante `ArenaProvider` y `crearArenaStore`. Se guardan en `localStorage`, por lo que los cambios se conservan al recargar en el mismo navegador y dirección.

El selector permite probar distintos roles y jugadores. Es una simulación académica del frontend.

Los torneos abiertos generan fechas futuras al crear la demostración. Estas fechas se conservan al recargar. Restablecer la demostración reemplaza los datos locales.

### Cambios recientes

- Actualización de dependencias: las alertas de npm bajaron de 16 a 4.
- Recuperación del torneo Rocket League en modalidad 2v2.
- Corrección de sus equipos, participantes, partidas y ranking.
- Actualización de los datos guardados anteriormente, conservando las demás inscripciones y perfiles.

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
tests/               Pruebas automatizadas
```

### Requisitos

- Node.js 20.19 o superior y npm.
- Git.
- Navegador web.
- Chrome para ejecutar las pruebas, o Edge configurado mediante `CHROME_BIN`.

### Clonar y ejecutar

```powershell
git clone --branch develo https://github.com/jzzzn2110/Frontend-eSports-Arena-Manager.git
cd Frontend-eSports-Arena-Manager
git branch --show-current
npm ci
npm run dev
```

La rama debe mostrar `develo`. Abre la dirección que indique Vite en la terminal.

Para EP2 se utiliza Vite; las instrucciones de abrir directamente el HTML corresponden a EP1. No ejecutes `git init` después de clonar: el clon ya contiene el historial.

### Compilación y pruebas

```powershell
npm run build
npm test
```

Si utilizas Edge y Karma no encuentra Chrome:

```powershell
$env:CHROME_BIN = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npm test
```

Para generar el reporte de cobertura:

```powershell
npm run test:coverage
```

El reporte se encuentra en `coverage/html/index.html`.

### Estado de las pruebas

Actualmente existen tres pruebas de lógica aprobadas:

1. Los cupos disponibles no pueden ser negativos.
2. El ranking se ordena por puntos y diferencia sin modificar el arreglo original.
3. Se distinguen las sanciones vigentes de las terminadas.

La compilación fue comprobada correctamente. Todavía falta ampliar las pruebas de componentes, interacción con el DOM y mocks.

### Trabajo con ramas

- `develo`: integración del desarrollo.
- `fix/ep2-flujos-y-pruebas`: correcciones de flujos, datos y dependencias.
- `qa`: validación de la versión integrada.
- `main`: versión final validada.

Antes de guardar cambios, verifica la rama con `git branch --show-current` y los archivos con `git status`. Sube el commit a la misma rama de trabajo y utiliza un Pull Request para integrarlo.

Las correcciones recientes se integraron desde `fix/ep2-flujos-y-pruebas` hacia `develo`.

### Pendientes de EP2

- Completar las pruebas de componentes y DOM con Jasmine y Karma.
- Incorporar mocks y analizar la cobertura.
- Actualizar el documento ERS con las funciones y reglas implementadas.
- Preparar el documento de testing con casos, resultados y cobertura.
- Completar la revisión de los flujos en escritorio y celular.
