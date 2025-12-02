// 인증 관련 API 함수들

// Vite proxy를 사용하여 CORS 문제 해결
// 개발 환경: /api/gateway (Vite proxy 사용)
// 프로덕션 환경: VITE_GATEWAY_URL 환경 변수 사용
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || '/api/gateway'

/**
 * 이메일 인증 코드 발송
 * @param {string} email - 이메일 주소
 * @returns {Promise<void>}
 */
export async function sendEmailVerificationCode(email) {
  const url = `${GATEWAY_URL}/auth/email/send-code`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '인증 코드 발송에 실패했습니다.' }))
      // 게이트웨이에서 error 필드로 반환하므로 error 또는 message 확인
      throw new Error(errorData.error || errorData.message || '인증 코드 발송에 실패했습니다.')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('[API] 이메일 인증 코드 발송 실패:', error)
    throw error
  }
}

/**
 * 이메일 인증 코드 검증
 * @param {string} email - 이메일 주소
 * @param {string} code - 인증 코드 (6자리)
 * @returns {Promise<void>}
 */
export async function verifyEmailVerificationCode(email, code) {
  const url = `${GATEWAY_URL}/auth/email/verify-code`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '인증 코드 확인에 실패했습니다.' }))
      // 게이트웨이에서 error 필드로 반환하므로 error 또는 message 확인
      throw new Error(errorData.error || errorData.message || '인증 코드 확인에 실패했습니다.')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('[API] 이메일 인증 코드 확인 실패:', error)
    throw error
  }
}

/**
 * 회원가입
 * @param {Object} signupData - 회원가입 데이터
 * @param {string} signupData.name - 이름
 * @param {string} signupData.email - 이메일
 * @param {string} signupData.emailVerificationCode - 이메일 인증 코드 (6자리)
 * @param {string} signupData.password - 비밀번호
 * @param {string} signupData.passwordConfirm - 비밀번호 확인
 * @param {boolean} signupData.agreeToTerms - 이용약관 동의
 * @param {boolean} signupData.agreeToPrivacy - 개인정보처리방침 동의
 * @param {string} signupData.jobRole - 직무
 * @returns {Promise<Object>} { accessToken, refreshToken, tokenType, expiresIn }
 */
export async function signup(signupData) {
  const url = `${GATEWAY_URL}/auth/signup`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: signupData.name,
        email: signupData.email,
        emailVerificationCode: signupData.emailVerificationCode,
        password: signupData.password,
        passwordConfirm: signupData.passwordConfirm,
        agreeToTerms: signupData.agreeToTerms,
        agreeToPrivacy: signupData.agreeToPrivacy,
        job_role: signupData.jobRole  // 백엔드에서 job_role로 기대함
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '회원가입에 실패했습니다.' }))
      // 게이트웨이에서 error 필드로 반환하므로 error 또는 message 확인
      throw new Error(errorData.error || errorData.message || `회원가입 실패 (${response.status})`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('[API] 회원가입 실패:', error)
    throw error
  }
}

/**
 * 이메일/비밀번호 로그인
 * @param {string} email - 이메일 주소
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} { accessToken, refreshToken, tokenType, expiresIn }
 */
export async function login(email, password) {
  const url = `${GATEWAY_URL}/auth/login`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '로그인에 실패했습니다.' }))
      // 게이트웨이에서 error 필드로 반환하므로 error 또는 message 확인
      throw new Error(errorData.error || errorData.message || '로그인에 실패했습니다.')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('[API] 로그인 실패:', error)
    throw error
  }
}

