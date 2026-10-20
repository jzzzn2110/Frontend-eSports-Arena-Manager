const fs = require('fs');
const path = require('path');
// Reporte de resultados reales; no genera resultados a partir del texto de los tests.
function ReporteArena() {
  let casos = [];
  this.onRunStart = () => { casos = []; };
  this.onSpecComplete = (_browser, resultado) => {
    casos.push({ suite: resultado.suite.join(' / '), caso: resultado.description,
      estado: resultado.skipped ? 'omitido' : resultado.success ? 'aprobado' : 'fallido',
      duracionMs: resultado.time, errores: resultado.log });
  };
  this.onRunComplete = () => {
    const dir = path.join(__dirname, '..', 'coverage');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'resultados-casos.json'), JSON.stringify({ fechaUTC: new Date().toISOString(), casos }, null, 2));
  };
}
ReporteArena.$inject = [];
module.exports = { 'reporter:arena': ['type', ReporteArena] };
