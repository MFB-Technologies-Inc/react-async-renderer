/*
 *  Copyright 2023 MFB Technologies, Inc.
 */

import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import postcss from "rollup-plugin-postcss"
import postcssUrl from "postcss-url"
import svgr from "@svgr/rollup"

const outputDir = "lib"

export default (() => {
  return {
    input: "src/index.ts",
    output: {
      dir: outputDir,
      format: "esm",
      sourcemap: true
    },
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.prod.json",
        declaration: true,
        declarationDir: outputDir
      }),
      postcss({
        plugins: [
          // not entirely sure why this eslint error is happening so I will ignore it for now
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          postcssUrl({
            url: "inline",
            encodeType: "base64",
            filter: /\.svg$/
          })
        ]
      }),
      svgr()
    ]
  }
})()
