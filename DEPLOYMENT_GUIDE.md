# 프론트엔드-백엔드 연동 가이드

## 백엔드 서버 구조

프로젝트는 3개의 백엔드 서버로 구성되어 있습니다:

1. **backend-gateway** (Spring Boot)
   - 포트: 8080 (기본값)
   - 역할: 프론트엔드와의 API 게이트웨이
   - 주요 기능: 인증, 시나리오 관리, 다른 백엔드 서버로의 프록시

2. **backend-crud2** (Spring Boot)
   - 포트: 8081 (기본값)
   - 역할: 데이터베이스 CRUD 처리
   - Gateway를 통해서만 접근 (직접 노출 불필요)

3. **backend-api** (FastAPI)
   - 포트: 8082 (기본값)
   - 역할: 웹소켓 통신, 롤플레잉 로직, 피드백 생성
   - Gateway를 통해서도 접근 가능하지만, 웹소켓은 직접 접근 필요

## 프론트엔드 환경 변수 설정

### Vercel 환경 변수 설정

**EC2 Public IPv4: `3.36.93.248`**

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```bash
# Gateway 서버 URL (REST API)
# HTTPS 인증서가 없으면 http 사용, 있으면 https 사용
VITE_GATEWAY_URL=http://3.36.93.248:8080

# FastAPI 웹소켓 URL (WebSocket 통신)
# HTTPS 인증서가 없으면 ws 사용, 있으면 wss 사용
VITE_FASTAPI_WS_URL=ws://3.36.93.248:8082

# Slack 설정 (필요시)
VITE_SLACK_CLIENT_ID=your-slack-client-id
VITE_NGROK_URL=http://3.36.93.248:8081
```

**참고:** 
- SSL 인증서가 있으면 `http://` → `https://`, `ws://` → `wss://`로 변경
- 초기 테스트는 HTTP/WS로 진행 후 SSL 설정 권장

### 환경 변수 설정 방법

1. Vercel 대시보드 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 다음 변수들을 Production, Preview, Development 환경에 모두 추가:
   - `VITE_GATEWAY_URL`: Gateway 서버의 HTTPS URL
   - `VITE_FASTAPI_WS_URL`: FastAPI 서버의 WSS(WebSocket Secure) URL
   - `VITE_SLACK_CLIENT_ID`: Slack OAuth Client ID (있는 경우)

## 백엔드 서버 설정

### 1. Gateway 서버 CORS 설정 업데이트

`backend-gateway/src/main/java/com/skala/gateway/config/CorsConfig.java` 파일을 수정:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 프로덕션 프론트엔드 URL 추가
        configuration.setAllowedOrigins(Arrays.asList(
                "https://skuseme.vercel.app",  // 프로덕션
                "https://*.vercel.app",        // Vercel 프리뷰 도메인 (선택사항)
                "http://localhost:3000",       // 로컬 개발
                "http://localhost:5173"        // Vite 개발 서버
        ));

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With"
        ));

        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
```

### 2. FastAPI 서버 CORS 설정 추가

`backend-api/app/main.py`에 CORS 미들웨어 추가:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Backend Skeleton", lifespan=lifespan)

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://skuseme.vercel.app",
        "https://*.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
# ... 나머지 코드
```

### 3. 백엔드 서버 간 통신 설정 확인

#### Gateway → CRUD2
- `backend-gateway/src/main/resources/application.properties`:
  ```properties
  spring2.base-url=${SPRING2_BASE_URL:http://localhost:8081}
  ```
  프로덕션에서는 EC2 내부 IP 또는 내부 도메인 사용 권장

#### Gateway → FastAPI
- `backend-gateway/src/main/resources/application.properties`:
  ```properties
  fastapi.base-url=${FASTAPI_BASE_URL:http://localhost:8082}
  fastapi.ws-url=${FASTAPI_WS_URL:ws://localhost:8082}
  ```
  프로덕션에서는 EC2 내부 IP 또는 내부 도메인 사용 권장

#### FastAPI → CRUD2
- `backend-api/app/config.py`의 `SPRING2_BASE_URL` 환경 변수 확인

### 4. 내부 피드백 Hook URL 수정 (선택사항)

`backend-api/app/roleplaying/handlers/ws_realtime_handler.py`의 `_cleanup_session` 함수에서:

```python
# 현재: localhost 사용
feedback_base_url = "http://localhost:8082"

# 프로덕션에서는 내부 통신 URL 사용 (환경 변수로 관리 권장)
feedback_base_url = settings.FASTAPI_INTERNAL_URL or "http://localhost:8082"
```

## 네트워크 보안 설정

### EC2 보안 그룹 설정

다음 포트들이 열려있는지 확인:

1. **Gateway (8080)**
   - 인바운드: 0.0.0.0/0 (HTTPS: 443 또는 8080)
   - 또는 Vercel → Gateway만 허용

2. **FastAPI (8082)**
   - 인바운드: Vercel IP 범위 또는 0.0.0.0/0 (WebSocket 필요)
   - 또는 특정 IP만 허용 (더 안전)

3. **CRUD2 (8081)**
   - 인바운드: Gateway 서버 IP만 (외부 노출 불필요)

### SSL/TLS 인증서 설정

프로덕션에서는 HTTPS/WSS를 사용하도록 설정:

1. Nginx 또는 로드밸런서에서 SSL 터미네이션
2. 또는 각 서버에 개별 SSL 인증서 설정
3. Let's Encrypt를 사용한 무료 인증서 발급 가능

## 테스트 체크리스트

연동 후 다음을 확인하세요:

- [ ] 프론트엔드에서 로그인 성공
- [ ] 시나리오 목록 조회 성공
- [ ] 시나리오 생성 성공
- [ ] 롤플레잉 웹소켓 연결 성공
- [ ] 피드백 생성 및 조회 성공
- [ ] 북마크 기능 작동 확인

## 문제 해결

### CORS 에러 발생 시
- Gateway와 FastAPI 모두에서 CORS 설정 확인
- 브라우저 콘솔에서 정확한 에러 메시지 확인
- Network 탭에서 Preflight OPTIONS 요청 확인

### WebSocket 연결 실패 시
- WSS 프로토콜 사용 확인 (HTTPS 환경에서는 WSS 필수)
- 방화벽/보안 그룹에서 WebSocket 포트 열림 확인
- 브라우저 콘솔에서 WebSocket 에러 확인

### 401 Unauthorized 에러
- JWT 토큰이 올바르게 전송되는지 확인
- Gateway 서버의 JWT_SECRET 환경 변수 확인
- 토큰 만료 시간 확인

