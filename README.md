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
