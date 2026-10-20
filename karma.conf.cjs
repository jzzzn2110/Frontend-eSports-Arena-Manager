const fs = require("fs");
// Chrome es preferido; Edge Chromium permite ejecutar la misma suite en Windows.
if (!process.env.CHROME_BIN && process.platform === "win32") {
  const candidatos = [
    `${process.env.PROGRAMFILES}/Google/Chrome/Application/chrome.exe`,
    `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
    `${process.env["PROGRAMFILES(X86)"]}/Microsoft/Edge/Application/msedge.exe`,
  ];
  process.env.CHROME_BIN = candidatos.find((ruta) => fs.existsSync(ruta)) || "";
}
// Configuración de las pruebas con Jasmine y Karma.
module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "webpack"],
    plugins: [
      require("karma-jasmine"),
      require("karma-webpack"),
      require("karma-coverage"),
      require("karma-chrome-launcher"),
      require("./tests/reporte.cjs"),
    ],

    // Archivos que contienen las pruebas.
    proxies: { "/img/": "/base/public/img/" },
    files: [
      {
        pattern: "public/img/*",
        included: false,
        served: true,
        watched: false,
      },
      { pattern: "tests/**/*.spec.js", watched: false },
      { pattern: "tests/**/*.spec.jsx", watched: false },
    ],

    // Prepara los imports y JSX para ejecutarlos en Chrome.
    preprocessors: {
      "tests/**/*.spec.js": ["webpack"],
      "tests/**/*.spec.jsx": ["webpack"],
    },

    webpack: {
      mode: "development",
      devtool: "inline-source-map",

      resolve: {
        extensions: [".js", ".jsx"],
      },

      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: [
                  ["@babel/preset-env", { targets: "defaults" }],
                  ["@babel/preset-react", { runtime: "automatic" }],
                ],

                // Mide la cobertura del código ejecutado.
                plugins: [
                  [
                    "babel-plugin-istanbul",
                    {
                      exclude: ["**/tests/**", "**/src/main.jsx"],
                    },
                  ],
                ],
              },
            },
          },
        ],
      },
    },

    reporters: ["progress", "coverage", "arena"],

    // Guarda el reporte de cobertura.
    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "text-summary" },
        { type: "json-summary", subdir: ".", file: "coverage-summary.json" },
        { type: "html", subdir: "html" },
        { type: "lcovonly", subdir: ".", file: "lcov.info" },
      ],
    },

    // Ejecuta las pruebas en Chrome sin abrir una ventana.
    browsers: ["ChromeHeadless"],
    singleRun: true,
    concurrency: 1,

    client: {
      clearContext: false,
    },
    //
  });
};
