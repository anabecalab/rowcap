import { isPostgrestChain, methodsAfter, methodsBefore } from "../shared.js";

const DEFAULT_FROM = ["from", "rpc"];

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require an explicit .order() alongside .range(), so paged reads cannot skip or repeat rows.",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          fromMethods: { type: "array", items: { type: "string" } },
          checkLimit: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unordered:
        "{{method}}() without .order() pages an unordered result. Postgres may return rows in any order between requests, so pages can repeat and skip rows. Add .order() on a unique, stable column.",
    },
  },

  create(context) {
    const opts = context.options[0] || {};
    const fromMethods = opts.fromMethods || DEFAULT_FROM;
    const watched = opts.checkLimit ? ["range", "limit"] : ["range"];

    return {
      CallExpression(node) {
        if (node.callee.type !== "MemberExpression") return;
        const method = node.callee.computed ? null : node.callee.property.name;
        if (!watched.includes(method)) return;
        if (!isPostgrestChain(node, fromMethods)) return;

        const chain = [...methodsBefore(node), ...methodsAfter(node)];
        if (chain.includes("order")) return;

        context.report({ node: node.callee.property, messageId: "unordered", data: { method } });
      },
    };
  },
};
