// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///D:/Projects/uni-next/node_modules/.pnpm/vite@5.2.8_@types+node@25.1.0_sass@1.64.2_terser@5.44.1/node_modules/vite/dist/node/index.js";
import Components from "file:///D:/Projects/uni-next/node_modules/.pnpm/@uni-helper+vite-plugin-uni-components@0.2.6_rollup@4.53.5/node_modules/@uni-helper/vite-plugin-uni-components/dist/index.mjs";
import { WotResolver } from "file:///D:/Projects/uni-next/node_modules/.pnpm/@uni-helper+vite-plugin-uni-components@0.2.6_rollup@4.53.5/node_modules/@uni-helper/vite-plugin-uni-components/dist/resolvers.mjs";
import UniPages from "file:///D:/Projects/uni-next/node_modules/.pnpm/@uni-helper+vite-plugin-uni_8b102e3c85ec61de73481e3a0898caf3/node_modules/@uni-helper/vite-plugin-uni-pages/dist/index.mjs";
import UniLayouts from "file:///D:/Projects/uni-next/node_modules/.pnpm/@uni-helper+vite-plugin-uni-layouts@0.1.11_rollup@4.53.5/node_modules/@uni-helper/vite-plugin-uni-layouts/dist/index.mjs";
import UniManifest from "file:///D:/Projects/uni-next/node_modules/.pnpm/@uni-helper+vite-plugin-uni_54ce01efc66377e7c884ca428558c896/node_modules/@uni-helper/vite-plugin-uni-manifest/dist/index.mjs";
import Uni from "file:///D:/Projects/uni-next/node_modules/.pnpm/@uni-helper+plugin-uni@0.1._c10333309c02e369447e9a9b27aa78a7/node_modules/@uni-helper/plugin-uni/src/index.js";
import UnoCSS from "file:///D:/Projects/uni-next/node_modules/.pnpm/unocss@66.0.0_postcss@8.5.6_7daa5499aef0d9e62a99a4f32c1eef94/node_modules/unocss/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///D:/Projects/uni-next/vite.config.ts";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  plugins: [
    // https://uni-helper.js.org/vite-plugin-uni-components
    Components({
      dts: true,
      resolvers: [WotResolver()]
    }),
    // https://uni-helper.js.org/vite-plugin-uni-pages
    UniPages(),
    // https://uni-helper.js.org/vite-plugin-uni-layouts
    UniLayouts(),
    // https://uni-helper.js.org/vite-plugin-uni-manifest
    UniManifest(),
    // https://uni-helper.js.org/plugin-uni
    Uni(),
    UnoCSS()
  ],
  build: {
    target: "es6",
    cssTarget: "chrome61"
  },
  optimizeDeps: {
    exclude: [
      "vue-demi"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFx1bmktbmV4dFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUHJvamVjdHNcXFxcdW5pLW5leHRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1Byb2plY3RzL3VuaS1uZXh0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktY29tcG9uZW50cydcclxuaW1wb3J0IHsgV290UmVzb2x2ZXIgfSBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktY29tcG9uZW50cy9yZXNvbHZlcnMnXHJcbmltcG9ydCBVbmlQYWdlcyBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktcGFnZXMnXHJcbmltcG9ydCBVbmlMYXlvdXRzIGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1sYXlvdXRzJ1xyXG5pbXBvcnQgVW5pTWFuaWZlc3QgZnJvbSAnQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLW1hbmlmZXN0J1xyXG5pbXBvcnQgVW5pIGZyb20gJ0B1bmktaGVscGVyL3BsdWdpbi11bmknXHJcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXHJcbiAgICB9XHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICAvLyBodHRwczovL3VuaS1oZWxwZXIuanMub3JnL3ZpdGUtcGx1Z2luLXVuaS1jb21wb25lbnRzXHJcbiAgICBDb21wb25lbnRzKHtcclxuICAgICAgZHRzOiB0cnVlLFxyXG4gICAgICByZXNvbHZlcnM6IFtXb3RSZXNvbHZlcigpXVxyXG4gICAgfSksXHJcbiAgICAvLyBodHRwczovL3VuaS1oZWxwZXIuanMub3JnL3ZpdGUtcGx1Z2luLXVuaS1wYWdlc1xyXG4gICAgVW5pUGFnZXMoKSxcclxuICAgIC8vIGh0dHBzOi8vdW5pLWhlbHBlci5qcy5vcmcvdml0ZS1wbHVnaW4tdW5pLWxheW91dHNcclxuICAgIFVuaUxheW91dHMoKSxcclxuICAgIC8vIGh0dHBzOi8vdW5pLWhlbHBlci5qcy5vcmcvdml0ZS1wbHVnaW4tdW5pLW1hbmlmZXN0XHJcbiAgICBVbmlNYW5pZmVzdCgpLFxyXG4gICAgLy8gaHR0cHM6Ly91bmktaGVscGVyLmpzLm9yZy9wbHVnaW4tdW5pXHJcbiAgICBVbmkoKSxcclxuICAgIFVub0NTUygpLFxyXG4gIF0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIHRhcmdldDogXCJlczZcIixcclxuICAgIGNzc1RhcmdldDogXCJjaHJvbWU2MVwiXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGV4Y2x1ZGU6IFtcclxuICAgICAgXCJ2dWUtZGVtaVwiXHJcbiAgICBdXHJcbiAgfSAgXHJcbn0pXHJcblxyXG5cclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUCxTQUFTLGVBQWUsV0FBVztBQUV2UixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLG1CQUFtQjtBQUM1QixPQUFPLGNBQWM7QUFDckIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQVRrSSxJQUFNLDJDQUEyQztBQVd0TSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBO0FBQUEsSUFFUCxXQUFXO0FBQUEsTUFDVCxLQUFLO0FBQUEsTUFDTCxXQUFXLENBQUMsWUFBWSxDQUFDO0FBQUEsSUFDM0IsQ0FBQztBQUFBO0FBQUEsSUFFRCxTQUFTO0FBQUE7QUFBQSxJQUVULFdBQVc7QUFBQTtBQUFBLElBRVgsWUFBWTtBQUFBO0FBQUEsSUFFWixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
