/**
 * JWT 토큰 관련 유틸리티 함수
 * 
 * 주요 기능:
 * - JWT 토큰 파싱: Base64로 인코딩된 JWT 토큰을 디코딩하여 payload 추출
 * - userId 추출: Gateway의 JwtService에서 저장한 userId(subject) 추출
 * - 토큰 형식 검증: JWT 3부분 구조(header.payload.signature) 검증
 * - 에러 처리: 토큰이 없거나 형식이 잘못된 경우 null 반환 및 경고 로그
 * - 타입 안전성: userId를 정수로 변환하여 타입 일관성 보장
 */

/**
 * JWT 토큰에서 userId 추출
 * Gateway의 JwtService에서 userId는 Subject(sub)에 저장됨
 * @returns {number|null} userId 또는 null
 */
export function getUserIdFromToken() {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    console.warn('[JWT] accessToken이 없습니다.')
    return null
  }
  
  try {
    // JWT는 Base64로 인코딩된 3부분으로 구성: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('[JWT] 잘못된 토큰 형식')
      return null
    }
    
    const payload = parts[1]
    // Base64 디코딩
    const decoded = JSON.parse(atob(payload))
    
    // Gateway의 JwtService에서 userId는 Subject(sub)에 저장됨
    const userId = decoded.sub ? parseInt(decoded.sub) : null
    
    if (!userId || isNaN(userId)) {
      console.error('[JWT] userId를 추출할 수 없습니다:', decoded)
      return null
    }
    
    return userId
  } catch (error) {
    console.error('[JWT] 토큰 파싱 실패:', error)
    return null
  }
}



