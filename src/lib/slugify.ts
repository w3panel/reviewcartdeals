export function slugify(value: string): string {
  return value
    .trim()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()
}
