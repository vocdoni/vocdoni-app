/**
 * Memoises `build` per key and keeps only the `max` most recently used results, for caches fed by open-ended input
 * (such as one organisation colour per branded vote on the server).
 */
export const lruMemo = <V>(max: number, build: (key: string) => V): ((key: string) => V) => {
  // A Map iterates in insertion order, so re-inserting on every hit keeps the least recently used entry first.
  const entries = new Map<string, V>()
  return (key) => {
    if (entries.has(key)) {
      const hit = entries.get(key) as V
      entries.delete(key)
      entries.set(key, hit)
      return hit
    }
    const created = build(key)
    entries.set(key, created)
    if (entries.size > max) entries.delete(entries.keys().next().value as string)
    return created
  }
}
