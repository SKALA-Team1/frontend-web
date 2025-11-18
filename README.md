# 영어회화 프로토타입 (React + Vite + MUI)

모바일/웹 반응형을 고려한 간단한 프로토타입입니다. 좌측 상단 햄버거 버튼(드로어)에서 4개 페이지(홈, 롤플레잉, 학습, 마이페이지)로 이동합니다.

## 실행

1) 의존성 설치
```bash
npm i
```

2) 개발 서버
```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 접속

3) 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 기술스택
- React 18, React Router 6
- MUI v6 (@mui/material, @mui/icons-material)
- Emotion (@emotion/react, @emotion/styled)
- Vite

## 구조
```
src/
  App.jsx            # AppBar + Drawer + Routes
  main.jsx           # ThemeProvider, Router
  pages/
    Home.jsx
    Roleplay.jsx
    Learn.jsx
    MyPage.jsx
```
