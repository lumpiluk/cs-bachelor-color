import lume from "lume/mod.ts";

import date from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import metas from "lume/plugins/metas.ts";
import robots from "lume/plugins/robots.ts";
import sass from "lume/plugins/sass.ts";
import sourceMaps from "lume/plugins/source_maps.ts";

const site = lume();

/* Allows import .glsl files as text.
 * (Written with help from an LLM.)
 */
const glslPlugin = {
  name: "glsl",
  setup(build) {
    build.onLoad({ filter: /\.glsl$/ }, async (args) => {
      const source = await Deno.readTextFile(args.path);
      return {
        contents: `export default ${JSON.stringify(source)};`,
        loader: "js",
      };
    });
  },
};

site.ignore("Readme.md",);
site.use(date());
site.use(esbuild({
  extensions: [".ts", ".js"],
  options: {
    plugins: [glslPlugin],
    bundle: true,
    format: "esm",
    minify: true,
    keepNames: true,
    platform: "browser",
    target: "esnext",
    treeShaking: true,
    outdir: "./",
    outbase: ".",
  },
}));
site.use(sass());
site.use(sourceMaps());
site.use(metas());
site.use(robots({
  rules: [
    {
      userAgent: "*",
      disallow: [
        // Using `noindex` in header of /imprint and /contact instead
      ],
    },
  ],
}));

site.add("styles/color-main.scss");
site.add("scripts/color.js");
site.add("img/");

export default site;
