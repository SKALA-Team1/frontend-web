/**
 * 애플리케이션 상수 정의
 * 
 * 역할:
 * - 하드코딩된 값들을 중앙화하여 관리
 * - 변경 시 단일 파일만 수정하면 됨 (Single Source of Truth)
 */

// API 엔드포인트
export const API_ENDPOINTS = {
  GATEWAY: import.meta.env.VITE_GATEWAY_URL || '/api/gateway',
  FASTAPI_WS: import.meta.env.VITE_FASTAPI_WS_URL || 'ws://localhost:8082',
}

// Slack 설정
export const SLACK_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SLACK_CLIENT_ID,
  NGROK_URL: import.meta.env.VITE_NGROK_URL || 'http://localhost:8081',
  SCOPES: 'channels:history,users:read,channels:join,channels:read',
}

// 라우트 경로
export const ROUTES = {
  LOGIN: '/',
  SIGNUP: '/signup',
  ROLEPLAYING: '/roleplaying',
  LEARN: '/learn',
  FEEDBACK: '/feedback',
  BOOKMARK: '/bookmark',
  MYPAGE: '/mypage',
}

// 네비게이션 링크
export const NAV_LINKS = [
  { label: '롤플레잉', path: ROUTES.ROLEPLAYING, key: 'roleplay' },
  { label: '학습', path: ROUTES.LEARN, key: 'learn' },
  { label: '피드백', path: ROUTES.FEEDBACK, key: 'feedback' },
  { label: '북마크', path: ROUTES.BOOKMARK, key: 'bookmark' },
  { label: '마이페이지', path: ROUTES.MYPAGE, key: 'mypage' },
]

// UI 상수
export const UI = {
  DRAWER_WIDTH: 180, // 기본값 (하위 호환성)
  DRAWER_WIDTH_DESKTOP: 240,
  DRAWER_WIDTH_MOBILE: 240,
  MOBILE_BREAKPOINT: 900,
  MAX_CONTAINER_WIDTH: 600,
}

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  BOOKMARKS: 'bookmarks',
}

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

// 메시지 타입
export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
}

// 시나리오 상태
export const SCENARIO_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DRAFT: 'DRAFT',
}

