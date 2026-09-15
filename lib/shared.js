/** Walk down a member-call chain and report whether it is rooted in `.from(...)`. */
export function isPostgrestChain(call, fromMethods) {
  let cur = call.callee && call.callee.object;
  while (cur) {
    if (cur.type === "CallExpression" && cur.callee.type === "MemberExpression") {
      const name = methodName(cur.callee);
      if (fromMethods.includes(name)) return true;
      cur = cur.callee.object;
    } else if (cur.type === "MemberExpression") {
      cur = cur.object;
    } else {
      return false;
    }
  }
  return false;
}

/** Method names appearing BELOW `call` in the chain (closer to the root). */
export function methodsBefore(call) {
  const names = [];
  let cur = call.callee && call.callee.object;
  while (cur) {
    if (cur.type === "CallExpression" && cur.callee.type === "MemberExpression") {
      names.push(methodName(cur.callee));
      cur = cur.callee.object;
    } else if (cur.type === "MemberExpression") {
      cur = cur.object;
    } else break;
  }
  return names;
}

/** Method names chained AFTER `call`. */
export function methodsAfter(call) {
  const names = [];
  let cur = call;
  let parent = cur.parent;
  while (parent && parent.type === "MemberExpression" && parent.object === cur) {
    names.push(methodName(parent));
    const maybeCall = parent.parent;
    if (maybeCall && maybeCall.type === "CallExpression" && maybeCall.callee === parent) {
      cur = maybeCall;
      parent = maybeCall.parent;
    } else break;
  }
  return names;
}

export function methodName(member) {
  if (!member || member.type !== "MemberExpression") return null;
  if (!member.computed && member.property.type === "Identifier") return member.property.name;
  if (member.property.type === "Literal") return String(member.property.value);
  return null;
}

/** True when select() was called with { head: true }, which returns no rows. */
export function isHeadOnly(call) {
  const opts = call.arguments && call.arguments[1];
  if (!opts || opts.type !== "ObjectExpression") return false;
  return opts.properties.some(
    (p) =>
      p.type === "Property" &&
      methodNameFromKey(p.key) === "head" &&
      p.value.type === "Literal" &&
      p.value.value === true,
  );
}

function methodNameFromKey(key) {
  if (!key) return null;
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal") return String(key.value);
  return null;
}
