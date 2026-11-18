# Estado de la rama de Lucas

Revisión del 18 de noviembre de 2026. Esta rama es un avance parcial, no la entrega terminada de EP3.

## Base y cambios

Frontend basado en feature/nico-ep3, commit a2e1bf5. Las pruebas de componentes ahora montan AuthProvider y limpian la sesión JWT antes y después de cada caso. No se eliminaron pruebas ni se cambiaron sus expectativas para ocultar fallos.

Backend en lucborquez/game, rama feature/lucas-ep3, commit cf905dc: regla de servicio para quitar integrantes, comprobando actor, estado del equipo, pertenencia del miembro y preservación del capitán. Todavía no está conectada a un endpoint con identidad autenticada.

## Validación ejecutada

- Frontend: instalación limpia y build correctos en la revisión inicial de esta rama.
- Suite frontend repetida el 18/11: 104 pruebas, 100 aprobadas y 4 fallidas. Antes de este ajuste fallaban 12.
- Backend: TeamMembersTest, 5 pruebas aprobadas mediante Maven y JDK 26.
- No se ejecutó un flujo completo contra la API ni se confirmó login real.

## Pendientes

Resolver las cuatro pruebas restantes, que todavía esperan edición e historial del perfil anterior y selección de roles simulados. Completar el vínculo seguro entre cuenta y jugador, autorización del resto de operaciones, equipos e inscripciones reales, panel organizador, ranking automático, premios y documentación final de los hitos 11–15.

El arranque agrupado de Eureka, autenticación y Gateway fue rechazado por la herramienta de ejecución. No se considera una prueba de fallo del código de esos servicios ni una validación satisfactoria de su funcionamiento.

No integrar esta rama a main como entrega completa hasta implementar y comprobar los flujos pendientes.
