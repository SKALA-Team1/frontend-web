// 날짜 생성기: 최신(15) → 11 순으로 순환
export const dateForIndex = (idx) => {
  const base = 15 - (idx % 5)
  const day = String(base).padStart(2, '0')
  return `2025.11.${day}`
}