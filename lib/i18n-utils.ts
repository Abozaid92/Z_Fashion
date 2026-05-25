export function pickMessages<T extends Record<string, any>>(
  messages: T,
  namespaces: string[],
) {
  const out: Record<string, any> = {};
  const topLevelRequested = new Set<string>();
  for (const ns of namespaces) {
    if (!ns) continue;
    // support nested path like "Parent.child" by taking the top-level part
    const top = ns.split(".")[0];
    topLevelRequested.add(top);
    if (Object.prototype.hasOwnProperty.call(messages, top)) {
      out[top] = messages[top];
    }
  }

  // If none of the requested top-level namespaces were found or some are
  // missing, fall back to returning the full messages object. This avoids
  // showing raw message IDs in the UI when a server page forgot to include
  // required namespaces (safer default than returning an empty subset).
  if (
    topLevelRequested.size > 0 &&
    Object.keys(out).length < topLevelRequested.size
  ) {
    return messages as T;
  }

  return out as T;
}

export function pickMessagesExact<T extends Record<string, any>>(
  messages: T,
  keys: string[],
) {
  // Returns only exact top-level keys provided in keys
  const out: Record<string, any> = {};
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(messages, k)) {
      out[k] = messages[k];
    }
  }
  return out as T;
}
// export function pickMessages(messages: Record<string, any>, keys: string[]) {
//   // Normalize to top-level namespaces (support dotted paths like "AdminCharts.revenue")
//   const topLevel = Array.from(new Set(keys.map((k) => k.split(".")[0])));
//   const out: Record<string, any> = {};
//   for (const ns of topLevel) {
//     if (ns in messages) out[ns] = messages[ns];
//   }
//   return out;
// }

export default pickMessages;
