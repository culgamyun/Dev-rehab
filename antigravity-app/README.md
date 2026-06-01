# Antigravity Fashion — 풀스택 복귀 실습 프로젝트

학습 대시보드(`C:\Study`)의 **"직접 만들어보기" 체크포인트를 실제 코드로 구현**하는 동반 레포입니다.
읽기만으로는 복귀가 안 됩니다 — 여기서 직접 짜고, 돌리고, 디버깅하세요.

## 구조

```
antigravity-app/
├── backend/    Spring Boot 3.4 · Java 21 · Gradle (레이어드 아키텍처)
├── frontend/   Next.js 15 · React 19 · TypeScript (App Router)
├── docker-compose.yml   backend + frontend + postgres + redis
├── .github/workflows/ci.yml   빌드·테스트 CI
└── CHECKPOINTS.md   ← 먼저 읽으세요. 챕터↔파일↔TODO 매핑표
```

## 학습 방식: 스켈레톤 + TODO + 실패 테스트

- `product/` 슬라이스는 **참고용 완성본**입니다 (레이어드 구조의 모범 예시).
- 나머지(`order/`, `auth/`, 프론트 폼 등)는 `// TODO(ChN):` 빈칸 + **실패/비활성 테스트**로 남겨뒀습니다.
- 챕터를 읽고 → 빈칸을 채워 → 테스트를 초록으로 → 실행해 확인하는 흐름입니다.

자세한 순서는 [CHECKPOINTS.md](./CHECKPOINTS.md) 참고.

## 빠른 시작

```bash
docker compose up -d postgres redis     # 인프라
cd backend && ./gradlew bootRun         # 백엔드 :8080
cd frontend && npm install && npm run dev  # 프론트 :3000
```

## 주의

- 이 레포는 **학습용 스캐폴딩**입니다. 일부 의존성/래퍼(gradlew, node_modules)는 첫 실행 시 직접 설치/생성해야 할 수 있습니다.
- 운영 배포용이 아니라 "복귀 훈련 + 포트폴리오 씨앗"이 목적입니다.
