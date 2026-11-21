# Dependencias de desarrollo

Revisión del 21 de noviembre de 2026. Se actualizó Vite de 6.4.4 a 6.4.6 y se renovaron dependencias transitivas mediante npm. El archivo de bloqueo permite reproducir la instalación con `npm ci`.

La auditoría inicial tenía siete avisos (dos altos y cinco moderados). La auditoría final conserva dos avisos moderados vinculados a minimatch y karma-webpack, sin avisos altos o críticos. Instalación limpia correcta, 149 pruebas aprobadas y build de 77 módulos correcto. Evidencia del 21 de noviembre de 2026; el resultado puede cambiar con nuevos avisos publicados.

Se evaluó fijar minimatch 11.0.1 para karma-webpack, pero el cambio afectó a glob 7 y rompió la carga de Karma. Se descartó esa sustitución y se restauró la resolución compatible. No se modificaron archivos internos de node_modules ni se desactivaron pruebas. No aplicar `npm audit fix --force`: propone cambiar la versión de karma-webpack y requiere evaluar compatibilidad.

El aviso de minimatch afecta a las versiones 7 a anteriores a 11.0.1 según [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). El árbol de pruebas conserva minimatch 9 bajo karma-webpack y minimatch 3 para glob. Los patrones de las pruebas proceden de la configuración del repositorio, no de formularios del usuario. Esto limita la exposición del flujo local, pero no elimina el aviso.
