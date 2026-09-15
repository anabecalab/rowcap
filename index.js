import noUnboundedSelect from "./lib/rules/no-unbounded-select.js";
import requireOrderWithRange from "./lib/rules/require-order-with-range.js";

const plugin = {
  meta: { name: "eslint-plugin-rowcap", version: "0.1.0" },
  rules: {
    "no-unbounded-select": noUnboundedSelect,
    "require-order-with-range": requireOrderWithRange,
  },
};

plugin.configs = {
  recommended: {
    plugins: { rowcap: plugin },
    rules: {
      "rowcap/no-unbounded-select": "error",
      "rowcap/require-order-with-range": "error",
    },
  },
};

export default plugin;
