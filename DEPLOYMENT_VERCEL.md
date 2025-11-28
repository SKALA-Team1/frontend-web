# Vercel 배포 가이드

## 배포 전 준비사항

### 1. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 연결 또는 직접 업로드

### 2. 빌드 설정

Vercel은 자동으로 Vite 프로젝트를 감지하지만, 명시적으로 설정할 수 있습니다:

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
npm install
```

### 3. 환경 변수 설정 (중요!)

Vercel 대시보드 → Project Settings → Environment Variables에서 설정:

#### 필수 환경 변수

```
VITE_GATEWAY_URL=https://your-api-domain.com
VITE_FASTAPI_WS_URL=wss://your-api-domain.com
```

**주의사항:**
- `VITE_` 접두사 필수 (Vite 환경 변수)
- 프로덕션, 프리뷰, 개발 환경별로 설정 가능
- WebSocket URL은 `wss://` (secure) 사용

#### 환경 변수 예시

**프로덕션:**
```
VITE_GATEWAY_URL=https://api.skala.com
VITE_FASTAPI_WS_URL=wss://api.skala.com
```

**프리뷰 (스테이징):**
```
VITE_GATEWAY_URL=https://staging-api.skala.com
VITE_FASTAPI_WS_URL=wss://staging-api.skala.com
```

### 4. SPA 라우팅 설정

`vercel.json` 파일이 프로젝트 루트에 있어야 합니다:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

이미 생성되어 있으므로 확인만 하면 됩니다.

### 5. 배포

#### 자동 배포 (GitHub 연동 시)

1. `main` 브랜치에 푸시하면 자동 배포
2. Pull Request 생성 시 프리뷰 배포

#### 수동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

## 백엔드 연동 설정

### 1. CORS 설정 (백엔드)

백엔드 서버에서 Vercel 도메인을 허용해야 합니다.

#### Spring Gateway (Spring 1) CORS 설정

`backend-gateway/src/main/java/com/skala/gateway/config/CorsConfig.java` 파일 수정:

```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",  // 개발 환경
    "https://your-vercel-app.vercel.app",  // Vercel 배포 URL
    "https://your-custom-domain.com"  // 커스텀 도메인 (있는 경우)
));
```

#### FastAPI CORS 설정

`backend-api/app/main.py`에 CORS 미들웨어 추가:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-vercel-app.vercel.app",
        "https://your-custom-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. API URL 설정

프로덕션 환경에서 백엔드 API URL을 확인:

- **Gateway URL**: EC2 인스턴스의 공인 IP 또는 도메인
- **WebSocket URL**: Gateway와 동일한 도메인, `wss://` 프로토콜 사용

예시:
```
VITE_GATEWAY_URL=https://ec2-xxx-xxx-xxx-xxx.ap-northeast-2.compute.amazonaws.com
VITE_FASTAPI_WS_URL=wss://ec2-xxx-xxx-xxx-xxx.ap-northeast-2.compute.amazonaws.com
```

### 3. SSL/TLS 인증서

HTTPS를 사용하려면:
- **AWS ALB (Application Load Balancer)** 사용 권장
- 또는 **Let's Encrypt**로 무료 SSL 인증서 발급

## 배포 후 확인사항

### 1. 기본 동작 확인

- [ ] 홈페이지 로드 확인
- [ ] 로그인 페이지 접근 확인
- [ ] 라우팅 동작 확인 (직접 URL 접근)

### 2. API 연동 확인

- [ ] 로그인 API 호출 확인
- [ ] 시나리오 목록 조회 확인
- [ ] WebSocket 연결 확인

### 3. CORS 오류 확인

브라우저 개발자 도구 → Console에서 CORS 오류 확인:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

오류 발생 시 백엔드 CORS 설정 확인 필요.

### 4. 환경 변수 확인

Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인:
- 프로덕션 환경 변수
- 빌드 로그에서 환경 변수 사용 확인

## 문제 해결

### 문제 1: 404 오류 (직접 URL 접근 시)

**원인**: SPA 라우팅 미설정

**해결**: `vercel.json` 파일 확인

### 문제 2: CORS 오류

**원인**: 백엔드에서 Vercel 도메인 미허용

**해결**: 
1. Vercel 배포 URL 확인
2. 백엔드 CORS 설정에 추가

### 문제 3: API 연결 실패

**원인**: 환경 변수 미설정 또는 잘못된 URL

**해결**:
1. Vercel 환경 변수 확인
2. API 서버 접근 가능 여부 확인
3. 네트워크 보안 그룹 확인 (EC2)

### 문제 4: WebSocket 연결 실패

**원인**: 
- `ws://` 대신 `wss://` 사용 필요
- 방화벽/보안 그룹에서 WebSocket 포트 미개방

**해결**:
1. `wss://` 프로토콜 사용 확인
2. EC2 보안 그룹에서 WebSocket 포트 개방

## 커스텀 도메인 설정

1. Vercel 대시보드 → Project Settings → Domains
2. 도메인 추가
3. DNS 설정 (A 레코드 또는 CNAME)
4. SSL 인증서 자동 발급 (Let's Encrypt)

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [React Router 배포](https://reactrouter.com/en/main/start/overview#deploying)

