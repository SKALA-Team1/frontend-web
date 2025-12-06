# SKALA 영어회화 플랫폼 (Frontend)

영어 회화 연습을 위한 실시간 AI 롤플레잉 플랫폼의 프론트엔드 애플리케이션입니다.

## 주요 기능

- **인증**: 로그인/회원가입 (JWT 기반)
- **홈**: 대시보드, 롤플레잉 생성 및 시작
- **롤플레잉**: 실시간 음성/텍스트 기반 AI 대화 연습
  - STT (Speech-to-Text): 음성 인식
  - TTS (Text-to-Speech): AI 응답 음성 재생
  - 3D 아바타: Ready Player Me 기반
  - 실시간 스트리밍 응답
- **학습**: 체계적인 커리큘럼 및 챕터 학습
- **피드백**: 완료된 롤플레잉 세션의 피드백 및 평가 확인
- **마이페이지**: 프로필 관리, 북마크, 녹음 내역

## 기술 스택

- **프레임워크**: React 18, React Router 6
- **UI 라이브러리**: Material-UI (MUI) v6
- **스타일링**: Emotion (@emotion/react, @emotion/styled), Tailwind CSS
- **3D 렌더링**: Three.js, @react-three/fiber, @react-three/drei
- **빌드 도구**: Vite 6
- **오디오 처리**: Web Audio API, MediaRecorder API
- **WebSocket**: 실시간 양방향 통신
- **아키텍처**: SOLID 원칙 기반, Service Layer Pattern

## 프로젝트 구조 (리팩토링 완료)

```
src/
├── App.jsx                    # 메인 앱 컴포넌트 (라우팅, Lazy Loading, Error Boundary)
├── main.jsx                   # 진입점 (ThemeProvider, Router 설정)
├── index.css                  # 전역 스타일
├── config/                    # 설정 및 상수
│   └── constants.js           # API 엔드포인트, 라우트, UI 상수 등
├── services/                  # 비즈니스 로직 레이어
│   ├── httpClient.js          # HTTP 요청 공통 처리
│   ├── authService.js         # 인증 관련 서비스
│   ├── integrationService.js  # Slack 연동 서비스
│   └── roleplayService.js     # 롤플레이 서비스
├── components/                # 공통 컴포넌트
│   ├── Layout/                # 레이아웃 컴포넌트
│   │   ├── AppLayout.jsx      # 전체 레이아웃 구조
│   │   ├── AppHeader.jsx      # 모바일 헤더
│   │   └── AppDrawer.jsx      # 네비게이션 드로어
│   ├── Route/                 # 라우팅 컴포넌트
│   │   └── ProtectedRoute.jsx # 인증 보호 라우트
│   └── Common/                # 공통 UI 컴포넌트
│       ├── LoadingSpinner.jsx # 로딩 UI
│       ├── ErrorBoundary.jsx  # 에러 경계
│       ├── Notification.jsx   # 알림 (Snackbar)
│       └── EmptyState.jsx     # 빈 상태 표시
├── hooks/                     # 공통 커스텀 훅
│   ├── useNotification.js     # 알림 상태 관리
│   └── useBookmarks.js        # 북마크 관리
├── features/                  # 기능별 모듈
│   ├── auth/                  # 인증
│   │   ├── components/        # LoginForm, SignUpForm
│   │   ├── hooks/             # useLoginForm, useSignupForm
│   │   └── pages/             # LoginPage, SignUpPage
│   ├── roleplay/              # 롤플레잉 (핵심 기능)
│   │   ├── components/        # SessionView, AvatarWindow, MessageList, MicButton 등
│   │   ├── hooks/             # useRoleplaySession (STT/TTS/WebSocket 관리), useScenarioData
│   │   └── pages/             # RoleplayPage
│   ├── learn/                 # 학습
│   │   ├── components/        # LearnChapterList
│   │   ├── hooks/             # useLearnPage
│   │   └── pages/             # LearnPage
│   ├── feedback/              # 피드백
│   │   ├── hooks/             # useFeedbackPage
│   │   └── pages/             # FeedbackPage
│   └── user/                  # 마이페이지
│       ├── components/        # ProfileSummary, BookmarkList, RecordingList
│       ├── hooks/             # useUserPage
│       └── pages/             # UserPage
├── data/                      # 정적 데이터 (JSON)
└── utils/                     # 유틸리티 함수
    └── dateUtils.js
```

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 3. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 환경 설정

백엔드 서버 URL은 `src/features/roleplay/api/roleplayApi.js`에서 설정:

```javascript
const GATEWAY_URL = 'http://localhost:8080'      // Spring Gateway
const FASTAPI_WS_URL = 'ws://localhost:8082'      // FastAPI WebSocket
```

## 주요 기능 상세

### 롤플레잉 세션

- **시작**: 시나리오 선택 또는 커스텀 롤플레잉 생성
- **통신 방식**:
  - 텍스트 입력: 키보드로 직접 입력
  - 음성 입력: 마이크 버튼으로 STT 활성화
- **오디오 처리**:
  - PCM 16-bit mono (16kHz) 형식으로 변환하여 전송
  - AudioContext + ScriptProcessorNode 사용
- **실시간 응답**:
  - 스트리밍 방식으로 AI 응답 수신
  - TTS로 음성 재생
  - 3D 아바타 입 모양 애니메이션

### WebSocket 통신 프로토콜

1. **INIT**: 세션 초기화 메시지 (연결 직후 전송)
2. **USER_TEXT**: 텍스트 입력
3. **AUDIO_CHUNK**: 오디오 청크 (Binary)
4. **UTTERANCE_END**: 발화 종료
5. **END_SESSION**: 세션 종료

**수신 메시지**:
- `ACK`: 초기화 확인
- `AI_TEXT`: 완전한 AI 응답
- `AI_TEXT_STREAMING`: 스트리밍 청크
- `AI_TYPING`: AI 응답 중
- `STT_PARTIAL`: STT 부분 결과
- `STT_FINAL`: STT 최종 결과
- `ERROR`: 에러 메시지

## 개발 가이드

### 코드 스타일

- 컴포넌트: PascalCase (예: `SessionView.jsx`)
- Hook: camelCase with `use` prefix (예: `useRoleplaySession.js`)
- 파일명: 컴포넌트는 `.jsx`, Hook/Util은 `.js`

### 주요 Hook

- `useRoleplaySession`: 롤플레잉 세션 상태 관리, WebSocket, STT/TTS 처리
- `useRoleplayFilters`: 시나리오 필터링
- `useBookmarks`: 북마크 관리

## 브라우저 호환성

- Chrome/Edge (권장): 최신 버전
- Firefox: 최신 버전
- Safari: 최신 버전 (일부 기능 제한 가능)

**필수 기능**:
- WebSocket API
- Web Audio API
- MediaRecorder API
- Speech Synthesis API (TTS)

## 라이선스

프로젝트 내부 사용
