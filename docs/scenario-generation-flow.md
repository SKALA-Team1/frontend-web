# 시나리오 생성 플로우 분석

이 문서는 프롬프트 기반 시나리오 생성의 전체 플로우와 MySQL 저장 여부를 정확히 분석합니다.

## 목차

1. [현재 시나리오 생성 플로우](#현재-시나리오-생성-플로우)
2. [Access Token 필요 여부](#access-token-필요-여부)
3. [MySQL 저장 여부](#mysql-저장-여부)
4. [문제점 및 개선 방안](#문제점-및-개선-방안)

---

## 현재 시나리오 생성 플로우

### Step 1: Spring 1 Gateway에서 FastAPI URL 획득

```
[Client]                    [Spring 1 Gateway]
   │                              │
   │ POST /scenarios/roleplaying/ │
   │ generate-from-prompt         │
   │ Authorization: Bearer {JWT}  │
   │ {myRole, aiRole, situation}  │
   ├─────────────────────────────>│
   │                              │ 1. JWT 검증 (JwtAuthenticationFilter)
   │                              │ 2. SecurityContext에서 userId 추출
   │                              │ 3. FastAPI URL 구성
   │                              │
   │<─────────────────────────────┤
   │ {userId, fastapi_url}        │
```

**엔드포인트**: `POST /scenarios/roleplaying/generate-from-prompt`

**인증**: ✅ **Access Token 필요** (JWT)
- `SecurityConfig`에서 `/scenarios` 경로는 인증 필요
- `JwtAuthenticationFilter`가 JWT 검증
- `SecurityContext`에서 userId 추출

**응답**:
```json
{
  "userId": 123,
  "fastapi_url": "http://localhost:8082/internal/scenarios/generate-from-prompt"
}
```

---

### Step 2: FastAPI에서 시나리오 생성

```
[Client]                    [FastAPI]
   │                              │
   │ POST {fastapi_url}            │
   │ Authorization: Bearer {JWT}   │
   │ {userId, myRole, aiRole,     │
   │  situation}                    │
   ├──────────────────────────────>│
   │                              │ 1. 과거 시나리오 컨텍스트 조회 (DB READ)
   │                              │ 2. LLM으로 상황 구체화
   │                              │ 3. LLM으로 제목 생성
   │                              │ 4. LLM으로 고정 질문 생성 (3개)
   │                              │
   │                              │ ⚠️ MySQL에 저장하지 않음!
   │                              │
   │<──────────────────────────────┤
   │ {scenario: {                  │
   │   aiRole, topicType,          │
   │   title, fixedQuestions       │
   │ }}                            │
```

**엔드포인트**: `POST /internal/scenarios/generate-from-prompt`

**인증**: ⚠️ **현재 구현에서는 JWT 검증 없음**
- FastAPI는 내부 API로 설계되어 JWT 검증 로직이 없음
- 클라이언트가 직접 호출하지만 인증 체크가 없음

**MySQL 저장**: ❌ **저장하지 않음**
- `PromptBasedScenarioService.generate_from_prompt()` 메서드
- 주석에 명시: **"생성된 데이터를 DTO로 반환 (DB 저장 안 함)"**
- DB는 READ-ONLY로 사용 (과거 시나리오 컨텍스트 조회만)

**응답**:
```json
{
  "scenario": {
    "aiRole": "Project Manager",
    "topicType": "direct",
    "title": "Project Timeline Discussion",
    "fixedQuestions": [
      "What's your current progress?",
      "What challenges are you facing?",
      "What's your recommended next step?"
    ]
  }
}
```

---

## Access Token 필요 여부

### ✅ Spring 1 Gateway: **필요함**

**이유**:
1. `SecurityConfig`에서 `/scenarios` 경로는 인증 필요
   ```java
   .requestMatchers("/auth/signup", "/auth/login", "/auth/refresh").permitAll()
   // 그 외 모든 요청은 인증 필요
   .anyRequest().authenticated()
   ```

2. `JwtAuthenticationFilter`가 JWT 검증
   - JWT 없으면 401 Unauthorized
   - JWT 유효하지 않으면 401 Unauthorized

3. `ScenarioService.generateScenarioFromPrompt()`에서 userId 추출
   ```java
   Long userId = getAuthenticatedUserId(); // SecurityContext에서 추출
   ```

### ⚠️ FastAPI: **현재는 불필요하지만 권장됨**

**현재 상태**:
- FastAPI는 내부 API로 설계되어 JWT 검증 로직이 없음
- 클라이언트가 직접 호출하지만 인증 체크가 없음

**권장 사항**:
- 보안을 위해 JWT 검증 추가 권장
- 또는 Spring 1 Gateway를 통해서만 호출하도록 변경

---

## MySQL 저장 여부

### ❌ **현재 구조에서는 저장되지 않음**

#### FastAPI의 역할

**파일**: `backend-api/app/roleplaying/services/prompt_based_generator_service.py`

```python
"""
역할:
    - 사용자 입력(my_role, ai_role, situation)으로부터 시나리오 생성
    - DB에서 사용자의 과거 시나리오 조회 (컨텍스트)
    - LLM을 통한 상황 구체화, 제목 생성, 질문 생성
    - 생성된 데이터를 DTO로 반환 (DB 저장 안 함)  ⚠️
"""
```

**코드 확인**:
```python
async def generate_from_prompt(...) -> ScenarioInfoDto:
    # Step 1: DB에서 사용자의 과거 시나리오 조회 (컨텍스트) - READ ONLY
    context = await self._fetch_user_context(user_id, db)
    
    # Step 2-4: LLM으로 시나리오 생성
    
    # Step 5: 응답 구성 (DB 저장 없음)
    result = ScenarioInfoDto(...)
    return result  # DTO만 반환, DB 저장 안 함
```

#### Spring 2의 저장 엔드포인트 (존재하지만 사용 안 됨)

**엔드포인트**: `POST /internal/scenarios/roleplaying/save-from-prompt`

**위치**: `backend-crud2/src/main/java/com/skala/spring_2_biz/scenario/controller/InternalScenarioController.java`

**기능**:
- Subject 생성 및 저장
- Scenario 생성 및 저장
- ReferenceDoc 및 ScenarioReference 저장

**코드**:
```java
@PostMapping("/roleplaying/save-from-prompt")
public ResponseEntity<?> saveScenarioFromPrompt(@RequestBody SaveFromPromptRequestDto request) {
    // Subject 저장
    subject = subjectRepository.save(subject);
    
    // Scenario 저장
    scenario = scenarioRepository.save(scenario);
    
    // ReferenceDoc 및 ScenarioReference 저장
    scenarioReferenceRepository.saveAll(scenarioRefsToSave);
    
    return ResponseEntity.ok(response);
}
```

**문제점**: 
- 이 엔드포인트는 존재하지만 **현재 플로우에서 호출되지 않음**
- 클라이언트가 직접 호출할 수 없음 (Spring 1을 통해서만 접근 가능)

---

## 문제점 및 개선 방안

### 현재 문제점

1. **시나리오가 MySQL에 저장되지 않음**
   - FastAPI는 시나리오만 생성하고 반환
   - Spring 2에 저장하는 플로우가 없음

2. **보안 취약점**
   - FastAPI 엔드포인트에 JWT 검증이 없음
   - 클라이언트가 직접 호출 가능

3. **아키텍처 불일치**
   - FastAPI는 READ-ONLY로 설계되었지만, 클라이언트가 직접 호출
   - Spring 2의 저장 엔드포인트가 사용되지 않음

### 개선 방안

#### 방안 1: Spring 1 Gateway를 통한 저장 (권장)

```
[Client]                    [Spring 1]          [FastAPI]          [Spring 2]
   │                              │                  │                  │
   │ POST /scenarios/generate     │                  │                  │
   │ Authorization: Bearer {JWT}  │                  │                  │
   ├─────────────────────────────>│                  │                  │
   │                              │ 1. JWT 검증      │                  │
   │                              │ 2. userId 추출   │                  │
   │                              │                  │                  │
   │                              │ POST /internal/  │                  │
   │                              │ scenarios/        │                  │
   │                              │ generate-from-   │                  │
   │                              │ prompt            │                  │
   │                              ├─────────────────>│                  │
   │                              │                  │ 3. 시나리오 생성  │
   │                              │                  │ (DB 저장 안 함)   │
   │                              │<─────────────────┤                  │
   │                              │ {scenario}        │                  │
   │                              │                  │                  │
   │                              │ POST /internal/  │                  │
   │                              │ scenarios/        │                  │
   │                              │ save-from-prompt  │                  │
   │                              ├───────────────────────────────────>│
   │                              │                  │                  │ 4. MySQL 저장
   │                              │                  │                  │ (Subject, Scenario)
   │                              │<───────────────────────────────────┤
   │                              │ {scenarioId}      │                  │
   │                              │                  │                  │
   │<─────────────────────────────┤                  │                  │
   │ {scenarioId, scenario}       │                  │                  │
```

**장점**:
- Spring 1이 전체 플로우를 관리
- JWT 검증이 한 곳에서만 필요
- FastAPI는 READ-ONLY 유지
- Spring 2는 저장만 담당

**구현 필요**:
1. Spring 1에 새로운 엔드포인트 추가
   ```
   POST /scenarios/roleplaying/generate-and-save
   ```
2. Spring 1에서 FastAPI 호출 → Spring 2 저장까지 처리

#### 방안 2: 클라이언트에서 직접 저장 요청

```
[Client]                    [Spring 1]          [FastAPI]          [Spring 2]
   │                              │                  │                  │
   │ 1. FastAPI URL 획득          │                  │                  │
   ├─────────────────────────────>│                  │                  │
   │<─────────────────────────────┤                  │                  │
   │                              │                  │                  │
   │ 2. 시나리오 생성              │                  │                  │
   ├───────────────────────────────────────────────>│                  │
   │<───────────────────────────────────────────────┤                  │
   │                              │                  │                  │
   │ 3. 저장 요청                  │                  │                  │
   ├─────────────────────────────>│                  │                  │
   │                              │ POST /internal/  │                  │
   │                              │ scenarios/        │                  │
   │                              │ save-from-prompt  │                  │
   │                              ├───────────────────────────────────>│
   │                              │                  │                  │ MySQL 저장
   │                              │<───────────────────────────────────┤
   │<─────────────────────────────┤                  │                  │
```

**단점**:
- 클라이언트가 두 번의 요청 필요
- 네트워크 왕복 증가
- 에러 처리 복잡

---

## 결론

### 현재 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| **Access Token 필요** | ✅ Spring 1: 필요<br>⚠️ FastAPI: 불필요 (권장) | Spring 1에서 userId 추출용 |
| **MySQL 저장** | ❌ **저장되지 않음** | FastAPI는 DTO만 반환 |
| **저장 엔드포인트** | ✅ 존재하지만 미사용 | Spring 2에 `/internal/scenarios/roleplaying/save-from-prompt` 존재 |

### 정확한 답변

**질문**: "시나리오 생성하는 것도 access 토큰을 사용해야 mysql에 저장되는 구조로 되어있는거냐?"

**답변**:
1. **Access Token**: ✅ **필요함** (Spring 1 Gateway에서 userId 추출용)
2. **MySQL 저장**: ❌ **현재 구조에서는 저장되지 않음**
   - FastAPI는 시나리오만 생성하고 반환 (DB 저장 안 함)
   - Spring 2에 저장 엔드포인트는 있지만 현재 플로우에서 호출되지 않음

### 권장 사항

시나리오를 MySQL에 저장하려면:
1. Spring 1 Gateway에 통합 엔드포인트 추가
2. FastAPI 호출 → Spring 2 저장까지 한 번에 처리
3. 또는 클라이언트에서 생성 후 저장 요청을 별도로 호출

---

## 참고 자료

### 관련 파일

#### Spring 1 (Gateway)
- `ScenarioController.java`: 시나리오 생성 요청 엔드포인트
- `ScenarioService.java`: FastAPI URL 반환 로직
- `SecurityConfig.java`: 인증 설정
- `JwtAuthenticationFilter.java`: JWT 검증 필터

#### FastAPI
- `router.py`: 시나리오 생성 엔드포인트
- `prompt_based_generator_service.py`: 시나리오 생성 로직 (DB 저장 안 함)

#### Spring 2 (CRUD)
- `InternalScenarioController.java`: 시나리오 저장 엔드포인트 (미사용)
- `ScenarioService.java`: MySQL 저장 로직

---

## 업데이트 이력

- 2025-11-20: 초기 문서 작성

