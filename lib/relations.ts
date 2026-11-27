export function relationArray<T>(relation: T | T[] | null | undefined): T[] {
  if (relation == null) return [];
  return Array.isArray(relation) ? relation : [relation];
}
