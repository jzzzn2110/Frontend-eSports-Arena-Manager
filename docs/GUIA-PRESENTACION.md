# Guía de presentación EP2

Ensayo de 15 minutos más 5 minutos de preguntas. Cada integrante debe entender los diez casos seleccionados y el conjunto de la solución.

| Tiempo | Demostración | Explicación |
|---|---|---|
| 0-2 min | Inicio y problema | Caso eSports, alcance local y actores simulados |
| 2-4 min | Arquitectura en el editor | App, ArenaProvider, servicio, props de actor y estado del formulario |
| 4-7 min | Inscripción Ajedrez | Cupos, confirmación, guardar, recargar, perfil e inscripción duplicada |
| 7-9 min | Equipos y administración | Crear/editar/eliminar borrador, restricciones históricas y rol organizador |
| 9-11 min | Ventana de 360 px | Cabecera, formularios y desplazamiento interno de tablas con Bootstrap/CSS |
| 11-14 min | npm test y cobertura | Diez casos seleccionados, mocks de storage/reloj, resultado real y exclusiones |
| 14-15 min | Git y conclusiones del trabajo | Commits reales, PR, estado de main y límites conocidos |

## Preparación

Ejecutar npm ci, npm run build y npm test antes de exponer. Usar una demostración nueva solo después de confirmar que no se necesitan los cambios locales: Administrador, Restablecer demostración y confirmar. Volver a Jugador, seleccionar el primer jugador y abrir Torneo de Ajedrez. Las fechas de los torneos abiertos se generan al reiniciar; no editar el reloj para la exposición.

## Recorrido individual reproducible

1. Filtrar Ajedrez en Torneos y abrir su detalle.
2. Ir a inscripción, marcar confirmación y guardar. Mostrar el cupo actualizado.
3. Recargar; la inscripción continúa. Abrir Perfil y mostrar el historial.
4. Cambiar apodo y correo válidos; guardar y recargar para probar persistencia.
5. Volver al torneo y cancelar antes del cierre. Mostrar cupo liberado.
6. Crear un equipo borrador sin historial, editarlo y eliminarlo con confirmación.
7. Cambiar a Organizador y crear un torneo con cierre futuro. Editar y eliminar sin participantes.
8. Cambiar a Jugador y mostrar que el formulario de administración no está disponible.

Para demostrar inscripción por equipos, usar al capitán del equipo Arena PvP en Minecraft. Rocket League es el torneo histórico 2v2; sirve para mostrar rondas, ranking y premios. No intentar editar equipos históricos como si fueran borradores.

## Preguntas de ensayo

- ¿Por qué no se usa setState al calcular filtros durante el render? Porque provoca nuevos renders y puede formar un ciclo; los resultados se derivan del estado ya disponible.
- ¿Qué diferencia hay entre props y estado? actor entra por props; los campos editables del formulario usan estado local. Los datos persistidos se comparten por contexto.
- ¿Qué ocurre si localStorage falla? La operación de guardado informa el error y conserva el snapshot anterior; se verifica con un espía que lanza una excepción.
- ¿Cómo se prueba el cierre de inscripción? Con un reloj inyectado y casos del último milisegundo del día, siguiente instante y fechas inválidas.
- ¿Por qué 95,83 % de líneas no significa todo probado? Solo mide líneas instrumentadas ejecutadas; faltan decisiones, CSS, recursos externos y escenarios no previstos.
- ¿Existe seguridad real por roles? No: es un selector de demostración; un sistema real requiere autenticación y autorización en el servidor.
- ¿Qué conserva Git? Aportes originales y commits reales. El primer PR fue fusionado por el equipo; comprobar el PR final y la rama main antes de presentarla como integrada.

## Integración y uso de main

Una vez aprobado y fusionado el PR final hacia main:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
npm ci
npm run build
npm test
```

Si hay cambios propios sin guardar, conservarlos antes de cambiar de rama. Si --ff-only falla, revisar la divergencia; no forzar ni borrar trabajo. La presentación debe citar el commit que realmente se ejecuta, consultando git log -1.
