# Estado de la rama de Lucas

Revisión del 19 de noviembre de 2026. Avance parcial: no constituye la entrega terminada de EP3.

## Implementado

- Catálogo real heredado de las ramas del equipo; detalle con clasificación y calendario obtenidos de la API, incluyendo carga, vacío, error y reintento.
- AuthProvider obtiene el perfil autenticado mediante `POST /api/usuarios/me`. La identidad de las pantallas nuevas usa el ID devuelto por ese servicio, no IDs de demostración.
- Perfil: edición de nombre y apodo, correo de identidad de solo lectura, historial individual real y cierre de sesión. No envía rol ni correo en la edición.
- Equipos: pantalla conectada a la API para creación, edición, integrantes y desactivación; confirmación de eliminación y errores sin falso éxito. La edición de integrantes se ofrece al capitán o administrador.
- Inscripciones: ruta conectada a la API, participación individual o por equipo compatible del capitán, confirmación previa, listado propio y cancelación confirmada. Los enlaces del catálogo real ya permiten acceder al formulario. La ocupación se calcula con inscripciones vigentes devueltas por la API, sin inventar cupos ocupados.
- Organización: ruta `/organizacion.html`, visible y protegida para organizador/administrador. Selecciona torneo, lista inscripciones, aprueba pendientes, programa y reprograma partidas PROGRAMADA. Desde el calendario permite consultar, crear y editar resultados pendientes, y validarlos con confirmación. Los resultados validados no ofrecen edición. Incluye consulta de sanciones por jugador/equipo, registro con motivo, severidad y fechas, y cierre confirmado. La anulación exige justificación y confirmación. Un error 503 de sincronización informa que el resultado quedó guardado; los resultados validados/anulados permiten reconstruir el ranking desde la pantalla incluso después de recargar.
- Backend complementario `lucborquez/game`, rama `feature/lucas-ep3`, commit `aa168bb`: validación JWT en usuarios, perfil propio y permisos de equipos; endpoint DELETE de integrante que preserva al capitán.

## Validación ejecutada

Actualización del 21 de noviembre: instalación limpia correcta, 149 pruebas aprobadas y build correcto (77 módulos). Cobertura de líneas 71,34 %, sentencias 70,86 %. Se añadieron avisos públicos persistidos de cambios de estado y asignación de premios, consultados desde el detalle del torneo. Cuatro casos de interfaz verifican vacío, representación segura de texto, reintento y cancelación. La API complementaria está documentada en `EP3_NOTIFICACIONES.md` del backend. La prueba integrada con servicios activos sigue pendiente. Este resultado reemplaza los totales históricos indicados abajo.

Actualización del 20 de noviembre: 145 pruebas del frontend aprobadas y build correcto (76 módulos). Cobertura de líneas: 71,06 %; sentencias: 70,56 %. Se incorporó la modalidad determinada por jugadores por equipo del catálogo y seis casos de premios: ocultamiento antes del cierre, consulta, permisos de interfaz, asignación, rechazo y reintento/cancelación. Los premios se consultan en el detalle finalizado y se asignan desde Organización por administradores. La autorización definitiva corresponde al backend. Esta evidencia reemplaza el total histórico de 138 indicado abajo.

- Frontend: 138 pruebas aprobadas, ninguna fallida. Build correcto. Tres pruebas de sanciones cubren consulta, creación y rechazo de cierre confirmado. Cuatro pruebas de resultados cubren ganador derivado del marcador, confirmación de validación, bloqueo de edición y rechazo del servidor; se conservan las pruebas de organización e inscripción.
- Las cuatro pruebas que dependían del antiguo perfil simulado se actualizaron para comprobar edición persistida mediante el servicio, identidad inmutable, historial vacío real y bloqueo de acceso usando el selector simulado antiguo. No se desactivaron casos.
- Backend de identidad y equipos: 8 pruebas de perfil y seguridad más 9 de permisos e integrantes, aprobadas con Maven/JDK 26.
- Los clientes HTTP y repositorios se simulan en estas pruebas. No se ejecutó todavía el flujo completo con servicios activos y MySQL, ni se confirmó login real en navegador.
- Karma informó una demora al cerrar Edge después de completar las pruebas.

## Pendientes para entrega

Validación real de concurrencia de cupos y duplicados, modalidad, verificación integrada de ranking automático e idempotencia, premios y notificaciones, seguridad de los restantes microservicios, evidencias E2E, documentación final y PRs. `sesion.jugadorId` aún no se usa como identidad verificada: las pantallas conectadas consultan `perfil.id`. Backend implementa permisos, reglas de equipos, vigencia de sanciones y bloqueo por torneo; falta prueba integrada y de concurrencia MySQL. La autorización del Gateway no sustituye la seguridad pendiente de acceso directo a los otros microservicios.

El arranque agrupado de Eureka, autenticación y Gateway fue rechazado por la herramienta de ejecución. Ese bloqueo no es evidencia de un fallo del código ni una validación satisfactoria.

No integrar esta rama a main como entrega completa hasta implementar y comprobar los flujos pendientes.
