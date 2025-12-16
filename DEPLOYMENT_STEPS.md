# 배포 단계별 가이드 (EC2 Public IP: 3.36.93.248)

## 1. Vercel 환경 변수 설정

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에서 다음 변수들을 **모든 환경(Production, Preview, Development)**에 추가:

```bash
VITE_GATEWAY_URL=http://3.36.93.248:8080
VITE_FASTAPI_WS_URL=ws://3.36.93.248:8082
```

**설정 후 반드시 재배포 필요!**

## 2. 백엔드 CORS 설정 (완료됨)

✅ Gateway 서버 CORS 설정 업데이트 완료
✅ FastAPI 서버 CORS 설정 추가 완료

**변경사항 적용을 위해 서버 재시작 필요:**

```bash
# EC2에서 각 서버 재시작
# Gateway 서버 재시작
# FastAPI 서버 재시작
```

## 3. EC2 보안 그룹 확인 및 설정

### AWS EC2 콘솔에서 확인:

1. EC2 → Instances → 인스턴스 선택
2. Security 탭 클릭
3. 보안 그룹 선택 → Inbound rules 확인

### 필요한 포트 열기:

- **포트 8080 (Gateway)**: 
  - Type: Custom TCP
  - Port: 8080
  - Source: 0.0.0.0/0 (또는 Vercel IP 범위)

- **포트 8082 (FastAPI - WebSocket)**:
  - Type: Custom TCP
  - Port: 8082
  - Source: 0.0.0.0/0 (또는 Vercel IP 범위)

- **포트 8081 (CRUD2)**:
  - 외부 노출 불필요 (Gateway를 통해서만 접근)
  - 또는 EC2 내부 IP만 허용

### 보안 그룹 편집 방법:

1. 보안 그룹 선택 → Edit inbound rules
2. Add rule 클릭
3. 위 포트들 추가
4. Save rules 클릭

## 4. 서버 상태 확인

EC2에서 각 서버가 실행 중인지 확인:

```bash
# Gateway 서버 확인
curl http://localhost:8080/health

# FastAPI 서버 확인
curl http://localhost:8082/health

# 외부에서 접근 테스트
curl http://3.36.93.248:8080/health
curl http://3.36.93.248:8082/health
```

## 5. 프론트엔드 재배포

Vercel 환경 변수를 설정한 후:

1. Vercel 대시보드 → 프로젝트 → Deployments
2. 최신 배포에서 "Redeploy" 클릭
3. 또는 Git에 푸시하여 자동 배포 유도

## 6. 테스트 체크리스트

배포 후 다음을 확인:

- [ ] Vercel 프론트엔드에서 로그인 페이지 접속
- [ ] 로그인 시도 (API 연결 확인)
- [ ] 시나리오 목록 조회
- [ ] 롤플레잉 시작 (웹소켓 연결 확인)
- [ ] 피드백 생성 및 조회

## 7. 문제 해결

### CORS 에러 발생 시

브라우저 콘솔에서 CORS 에러가 발생하면:
- Gateway와 FastAPI 서버가 재시작되었는지 확인
- Vercel 환경 변수가 올바르게 설정되었는지 확인
- Network 탭에서 Preflight OPTIONS 요청 응답 확인

### WebSocket 연결 실패 시

- 포트 8082가 보안 그룹에서 열려있는지 확인
- 브라우저 콘솔에서 WebSocket 에러 메시지 확인
- `ws://3.36.93.248:8082/ws/...` 형식으로 연결 시도하는지 확인

### 401 Unauthorized 에러

- JWT 토큰이 올바르게 전송되는지 확인
- Gateway 서버의 JWT_SECRET 환경 변수 확인
- Network 탭에서 Authorization 헤더 확인


