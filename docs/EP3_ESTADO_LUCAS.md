# Estado de la rama de Lucas

Revisión del 19 de noviembre de 2026. Avance parcial: no constituye la entrega terminada de EP3.

## Implementado

- Catálogo real heredado de las ramas del equipo; detalle con clasificación y calendario obtenidos de la API, incluyendo carga, vacío, error y reintento.
- AuthProvider obtiene el perfil autenticado mediante `POST /api/usuarios/me`. La identidad de las pantallas nuevas usa el ID devuelto por ese servicio, no IDs de demostración.
- Perfil: edición de nombre y apodo, correo de identidad de solo lectura, historial individual real y cierre de sesión. No envía rol ni correo en la edición.
- Equipos: pantalla conectada a la API para creación, edición, integrantes y desactivación; confirmación de eliminación y errores sin falso éxito. La edición de integrantes se ofrece al capitán o administrador.
- Backend complementario `lucborquez/game`, rama `feature/lucas-ep3`, commit `aa168bb`: validación JWT en usuarios, perfil propio y permisos de equipos; endpoint DELETE de integrante que preserva al capitán.

## Validación ejecutada

- Frontend: 118 pruebas aprobadas, ninguna fallida. Build correcto, 72 módulos.
- Las cuatro pruebas que dependían del antiguo perfil simulado se actualizaron para comprobar edición persistida mediante el servicio, identidad inmutable, historial vacío real y bloqueo de acceso usando el selector simulado antiguo. No se desactivaron casos.
- Backend de identidad y equipos: 8 pruebas de perfil y seguridad más 9 de permisos e integrantes, aprobadas con Maven/JDK 26.
- Los clientes HTTP y repositorios se simulan en estas pruebas. No se ejecutó todavía el flujo completo con servicios activos y MySQL, ni se confirmó login real en navegador.
- Karma informó una demora al cerrar Edge después de completar las pruebas.

## Pendientes para entrega

Inscripción real en pantalla, permisos y reglas completas de inscripción por equipo, concurrencia de cupos, panel organizador, ranking automático idempotente, premios y notificaciones, seguridad de los restantes microservicios, evidencias E2E, documentación final y PRs. `sesion.jugadorId` aún no se usa como identidad verificada: las pantallas conectadas consultan `perfil.id`.

El arranque agrupado de Eureka, autenticación y Gateway fue rechazado por la herramienta de ejecución. Ese bloqueo no es evidencia de un fallo del código ni una validación satisfactoria.

No integrar esta rama a main como entrega completa hasta implementar y comprobar los flujos pendientes.
