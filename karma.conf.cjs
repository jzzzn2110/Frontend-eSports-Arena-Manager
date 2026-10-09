// Configuración de las pruebas con Jasmine y Karma.
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],

    // Archivos que contienen las pruebas.
    files: [
      { pattern: 'tests/**/*.spec.js', watched: false },
      { pattern: 'tests/**/*.spec.jsx', watched: false },
    ],

    // Prepara los imports y JSX para ejecutarlos en Chrome.
    preprocessors: {
      'tests/**/*.spec.js': ['webpack'],
      'tests/**/*.spec.jsx': ['webpack'],
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',

      resolve: {
        extensions: ['.js', '.jsx'],
      },

      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: 'defaults' }],
                  ['@babel/preset-react', { runtime: 'automatic' }],
                ],

                // Mide la cobertura del código ejecutado.
                plugins: [
                  ['babel-plugin-istanbul', {
                    exclude: ['**/tests/**'],
                  }],
                ],
              },
            },
          },
        ],
      },
    },

    reporters: ['progress', 'coverage'],

    // Guarda el reporte de cobertura.
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'text-summary' },
        { type: 'html', subdir: 'html' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' },
      ],
    },

    // Ejecuta las pruebas en Chrome sin abrir una ventana.
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: 1,

    client: {
      clearContext: false,
    },
    //
  });
};