import { build } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = fileURLToPath(new URL("..", import.meta.url));

const config = [
  {
    entry: path.resolve(__dirname, "./src/ts/index.cjs.ts"),
    fileName: () => `ode-ts-client.js`,
    formats: ["umd"],
    name: "ode-ts-client",
  },
  {
    entry: path.resolve(__dirname, "./src/ts/index.ts"),
    fileName: () => `ode-ts-client.mjs`,
    formats: ["es"],
  },
  {
    entry: path.resolve(__dirname, "./src/ts/index.ts"),
    fileName: () => `ode-ts-client.esm.js`,
    formats: ["es"],
  },
];

config.forEach(async (lib) => {
  await build({
    build: {
      sourcemap: true,
      outDir: "./dist",
      lib: {
        ...lib,
      },
      commonjsOptions: {
        transformMixedEsModules: true,
        exclude: ["node_modules"],
      },
      rollupOptions: {
        output: {
          globals: {
            rxjs: "RxJS",
          },
        },
      },
      emptyOutDir: true,
    },
    plugins: [visualizer(), dts()],
  });
});
