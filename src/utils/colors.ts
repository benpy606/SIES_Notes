export const getVibrantColor = (name: string, defaultColor: string) => {
  if (name.includes('Computation')) return '#A855F7'
  if (name.includes('Arch')) return '#10B981'
  if (name.includes('Networks')) return '#06B6D4'
  if (name.includes('Imperative')) return '#3B82F6'
  if (name.includes('Indian')) return '#64748B'
  return defaultColor
}
