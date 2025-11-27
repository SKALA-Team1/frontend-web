# 인증 및 세션 플로우 가이드

이 문서는 프로젝트의 전체 인증 및 롤플레잉 세션 생성 플로우를 설명합니다.

## 목차

1. [회원가입 플로우](#1-회원가입-플로우)
2. [로그인 플로우](#2-로그인-플로우-현재-미구현)
3. [테스트 토큰 발급](#3-테스트-토큰-발급-개발-환경-전용)
4. [롤플레잉 세션 생성 플로우](#4-롤플레잉-세션-생성-플로우)
5. [WebSocket 연결 플로우](#5-websocket-연결-플로우)
6. [토큰 및 세션 요약](#토큰-및-세션-요약)
7. [현재 상태 및 필요한 작업](#현재-상태-및-필요한-작업)

---

## 1. 회원가입 플로우

```
[Client]                    [Spring 1 Gateway]          [Spring 2 CRUD]
   │                              │                            │
   │ POST /auth/signup            │                            │
   │ {email, password, name}      │                            │
   ├─────────────────────────────>│                            │
   │                              │ POST /internal/auth/signup  │
   │                              ├───────────────────────────>│
   │                              │                            │ 1. 이메일 중복 체크
   │                              │                            │ 2. 비밀번호 해싱 (BCrypt)
   │                              │                            │ 3. User 생성 (auth_provider="LOCAL")
   │                              │                            │ 4. Refresh Token 생성 (UUID)
   │                              │                            │ 5. User.refreshToken에 저장
   │                              │                            │ 6. User.refreshTokenExpiresAt = +7일
   │                              │                            │
   │                              │<───────────────────────────┤
   │                              │ {userId, role, refreshToken}│
   │                              │                            │
   │                              │ 7. JWT Access Token 생성   │
   │                              │    (userId, role, 30분 만료)│
   │                              │                            │
   │<─────────────────────────────┤                            │
   │ {accessToken, refreshToken,  │                            │
   │  expiresIn}                  │                            │
```

### 토큰 발급 상세

- **Refresh Token**: 
  - 발급 위치: Spring 2
  - 형식: UUID (예: `550e8400-e29b-41d4-a716-446655440000`)
  - 저장 위치: MySQL `user.refresh_token` 컬럼
  - 만료 시간: 7일
  - 용도: Access Token 갱신

- **Access Token**: 
  - 발급 위치: Spring 1
  - 형식: JWT (JSON Web Token)
  - 저장 위치: 클라이언트 (메모리 또는 로컬스토리지)
  - 만료 시간: 30분
  - 용도: API 인증 (Authorization 헤더에 `Bearer {token}` 형식)

---

## 2. 로그인 플로우 (현재 미구현)

```
[Client]                    [Spring 1 Gateway]          [Spring 2 CRUD]
   │                              │                            │
   │ POST /auth/login              │                            │
   │ {email, password}             │                            │
   ├─────────────────────────────>│                            │
   │                              │ POST /internal/auth/login   │
   │                              ├───────────────────────────>│
   │                              │                            │ ❌ 엔드포인트 없음!
   │                              │                            │
   │                              │ (구현 필요)                 │
   │                              │ 1. 이메일로 User 조회       │
   │                              │ 2. 비밀번호 검증 (BCrypt)   │
   │                              │ 3. Refresh Token 생성 (UUID)│
   │                              │ 4. User.refreshToken 업데이트│
   │                              │ 5. {userId, role, refreshToken} 반환│
```

### 현재 상태

- **Spring 1**: `POST /auth/login` 엔드포인트는 존재하지만, Spring 2에 해당 엔드포인트가 없어 동작하지 않음
- **Spring 2**: `POST /internal/auth/login` 엔드포인트가 구현되지 않음

### 필요한 구현

Spring 2의 `AuthService`에 다음 로직 추가 필요:
1. 이메일로 User 조회
2. BCrypt로 비밀번호 검증
3. Refresh Token 생성 및 User 테이블 업데이트
4. `{userId, role, refreshToken}` 반환

---

## 3. 테스트 토큰 발급 (개발 환경 전용)

```
[Client]                    [Spring 1 Gateway]
   │                              │
   │ GET /auth/test/token/{userId}│
   ├─────────────────────────────>│
   │                              │ 1. JWT Access Token 생성
   │                              │    (userId, role="ROLE_USER", 30분)
   │                              │
   │<─────────────────────────────┤
   │ {accessToken, expiresIn}     │
```

### 특징

- **프로덕션 비활성화**: `@Profile("!prod")` 어노테이션으로 프로덕션 환경에서는 비활성화됨
- **Refresh Token 없음**: Access Token만 발급
- **현재 사용 중**: 프론트엔드에서 롤플레잉 테스트 시 이 방식 사용

### 사용 예시

```javascript
// frontend-web/src/api/roleplay.js
export async function getJwtToken(userId = 1) {
  const url = `${GATEWAY_URL}/auth/test/token/${userId}`
  const response = await fetch(url)
  const data = await response.json()
  return data.accessToken
}
```

---

## 4. 롤플레잉 세션 생성 플로우

```
[Client]                    [Spring 1 Gateway]          [Spring 2 CRUD]          [FastAPI]
   │                              │                            │                      │
   │ POST /roleplaying/sessions   │                            │                      │
   │ Authorization: Bearer {JWT}  │                            │                      │
   │ {scenarioId}                  │                            │                      │
   ├─────────────────────────────>│                            │                      │
   │                              │ 1. JWT 검증                │                      │
   │                              │ 2. userId 추출             │                      │
   │                              │ 3. sessionId 생성 (UUID)   │                      │
   │                              │                            │                      │
   │                              │ POST /internal/sessions     │                      │
   │                              │ {sessionId, userId,         │                      │
   │                              │  scenarioId}                │                      │
   │                              ├───────────────────────────>│                      │
   │                              │                            │ 4. ScenarioSession   │
   │                              │                            │    DB 저장 (MySQL)    │
   │                              │                            │                      │
   │                              │<───────────────────────────┤                      │
   │                              │ {success}                   │                      │
   │                              │                            │                      │
   │                              │ POST /roleplaying/internal/ │                      │
   │                              │ sessions/setup              │                      │
   │                              │ {sessionId, userId,         │                      │
   │                              │  scenarioId}                │                      │
   │                              ├─────────────────────────────────────────────────>│
   │                              │                            │                      │ 5. 시나리오 조회 (DB)
   │                              │                            │                      │ 6. Redis 저장
   │                              │                            │                      │    키: session:{sessionId}
   │                              │                            │                      │    값: {userId, expiresAt}
   │                              │                            │                      │    TTL: 2시간
   │                              │                            │                      │
   │                              │<─────────────────────────────────────────────────┤
   │                              │ {wsUrl, scenario, expiresAt}│                      │
   │                              │                            │                      │
   │                              │ 7. 응답 구성                │                      │
   │                              │                            │                      │
   │<─────────────────────────────┤                            │                      │
   │ {sessionId, wsUrl, scenario, │                            │                      │
   │  initMessage, expiresAt}    │                            │                      │
```

### 세션 ID 발급 및 저장

#### 발급
- **위치**: Spring 1 Gateway (`SessionService.createSession()`)
- **형식**: UUID (예: `550e8400-e29b-41d4-a716-446655440000`)
- **생성 코드**: `UUID.randomUUID().toString()`

#### 저장 위치

1. **Spring 2 (MySQL)**
   - 테이블: `scenario_session`
   - 컬럼:
     - `session_id` (PK)
     - `user_id`
     - `scenario_id`
     - `status` (IN_PROGRESS, FINISHED)
     - `created_at`, `updated_at`
   - 목적: 영구 저장 (세션 히스토리 관리)

2. **FastAPI (Redis)**
   - 키 형식: `session:{sessionId}`
   - 값: JSON 문자열
     ```json
     {
       "userId": 1,
       "expiresAt": "2025-11-20T10:30:00Z"
     }
     ```
   - TTL: 2시간 (7200초)
   - 목적: WebSocket 연결 시 빠른 검증

### API 엔드포인트

#### Spring 1 → Spring 2
```
POST /internal/sessions
Body: {
  "session_id": "uuid",
  "user_id": 1,
  "scenario_id": 1
}
```

#### Spring 1 → FastAPI
```
POST /roleplaying/internal/sessions/setup
Body: {
  "sessionId": "uuid",
  "userId": 1,
  "scenarioId": 1
}
```

---

## 5. WebSocket 연결 플로우

```
[Client]                    [Spring 1 Gateway]          [FastAPI]
   │                              │                            │
   │ WebSocket 연결                │                            │
   │ ws://fastapi:8082/ws?        │                            │
   │ session_id={sessionId}        │                            │
   ├───────────────────────────────────────────────────────────>│
   │                              │                            │ 1. sessionId 추출
   │                              │                            │ 2. Redis 조회
   │                              │                            │    키: session:{sessionId}
   │                              │                            │ 3. 세션 검증
   │                              │                            │ 4. WebSocket 연결 수락
   │                              │                            │
   │<──────────────────────────────────────────────────────────┤
   │ WebSocket 연결 완료           │                            │
   │                              │                            │
   │ {type: "INIT", myRole, aiRole}│                            │
   ├───────────────────────────────────────────────────────────>│
   │                              │                            │ 5. 롤플레잉 시작
```

### 세션 ID 사용

1. **연결 시**: WebSocket URL의 쿼리 파라미터로 전달
   ```
   ws://localhost:8082/ws?session_id=550e8400-e29b-41d4-a716-446655440000
   ```

2. **검증**: FastAPI가 Redis에서 세션 정보 조회
   - Redis 키: `session:{sessionId}`
   - 세션이 없으면 연결 거부 (1008: Invalid Session)

3. **검증 실패 시**: 클라이언트에 재로그인 안내

---

## 토큰 및 세션 요약

| 항목 | 발급 위치 | 저장 위치 | 만료 시간 | 용도 |
|------|----------|----------|----------|------|
| **Access Token (JWT)** | Spring 1 | 클라이언트 (메모리/로컬스토리지) | 30분 | API 인증 |
| **Refresh Token (UUID)** | Spring 2 | MySQL `user.refresh_token` | 7일 | Access Token 갱신 |
| **Session ID (UUID)** | Spring 1 | MySQL `scenario_session` (영구)<br>Redis `session:{id}` (2시간) | 2시간 (Redis)<br>영구 (DB) | 롤플레잉 세션 식별 |

### 토큰 형식

#### Access Token (JWT)
```json
{
  "sub": "1",
  "role": "ROLE_USER",
  "iat": 1700123456,
  "exp": 1700125256
}
```

#### Refresh Token
```
550e8400-e29b-41d4-a716-446655440000
```

#### Session ID
```
550e8400-e29b-41d4-a716-446655440000
```

---

## 현재 상태 및 필요한 작업

### ✅ 구현 완료

1. **회원가입**: 정상 동작
   - Spring 1: `POST /auth/signup`
   - Spring 2: `POST /internal/auth/signup`

2. **테스트 토큰**: 개발 환경에서 동작
   - Spring 1: `GET /auth/test/token/{userId}`

3. **롤플레잉 세션 생성**: 정상 동작
   - Spring 1: `POST /roleplaying/sessions`
   - Spring 2: `POST /internal/sessions`
   - FastAPI: `POST /roleplaying/internal/sessions/setup`

4. **WebSocket 연결**: 정상 동작
   - FastAPI: Redis 세션 검증

### ❌ 미구현

1. **로그인**: Spring 2에 엔드포인트 없음
   - Spring 1: `POST /auth/login` (존재하지만 동작 안 함)
   - Spring 2: `POST /internal/auth/login` (구현 필요)

### 🔧 필요한 작업

#### Spring 2에 로그인 엔드포인트 구현

**파일**: `backend-crud2/src/main/java/com/skala/spring_2_biz/auth/controller/InternalAuthController.java`

```java
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(
    @Valid @RequestBody LoginRequest request) {
    // AuthService.login() 호출
}
```

**파일**: `backend-crud2/src/main/java/com/skala/spring_2_biz/auth/service/AuthService.java`

```java
public LoginResponse login(LoginRequest request) {
    // 1. 이메일로 User 조회
    // 2. BCrypt로 비밀번호 검증
    // 3. Refresh Token 생성 (UUID)
    // 4. User.refreshToken 업데이트
    // 5. {userId, role, refreshToken} 반환
}
```

**DTO 추가 필요**:
- `LoginRequest.java` (email, password)
- `LoginResponse.java` (userId, role, refreshToken)

---

## 참고 자료

### 관련 파일

#### Spring 1 (Gateway)
- `AuthService.java`: 인증 비즈니스 로직
- `SessionService.java`: 세션 생성 로직
- `JwtService.java`: JWT 토큰 생성/검증
- `AuthController.java`: 인증 API 엔드포인트

#### Spring 2 (CRUD)
- `AuthService.java`: 사용자 인증 처리
- `InternalAuthController.java`: 내부 인증 API
- `User.java`: User 엔티티 (refreshToken 저장)

#### FastAPI
- `session_service.py`: 세션 Redis 저장
- `router.py`: 세션 설정 API
- `ws_realtime.py`: WebSocket 연결 처리

#### Frontend
- `src/api/roleplay.js`: API 호출 함수
- `src/features/roleplay/hooks/useRoleplaySession.js`: 세션 관리 훅

---

## 업데이트 이력

- 2025-11-20: 초기 문서 작성

