# Habit Tracker for Obsidian

[Obsidian](https://obsidian.md)을 위한 간단한 습관 트래커 플러그인입니다. 탭 한 번으로 오늘의 습관을 기록하세요. 데이터는 일반 Markdown 파일로 저장되며 [Dataview](https://github.com/blacksmithgu/obsidian-dataview)와 완벽하게 호환됩니다.

**다른 언어:** [English](README.md) | [日本語](README.ja.md) | [中文](README.zh.md) | [Español](README.es.md)

---

## 기능

- **원탭 체크인** — 오늘의 습관을 즉시 체크하거나 해제
- **연속 달성 표시** — 연속 달성 일수를 실시간으로 확인 🔥
- **습관별 Markdown 파일** — 각 습관마다 DataviewJS 달력이 포함된 `.md` 파일 자동 생성
- **대시보드 자동 생성** — 첫 실행 시 요약 대시보드(`habits/stats/dashboard.md`) 자동 생성
- **Dataview 호환** — Dataview / DataviewJS 블록으로 습관 데이터 쿼리 가능
- **크로스 플랫폼** — 데스크톱은 오른쪽 사이드바, iOS/모바일은 전체 화면 탭으로 표시
- **의존성 없음** — Dataview 없이도 동작 (달력/대시보드 렌더링에는 Dataview 필요)

## 설치

### 커뮤니티 플러그인에서 설치 (권장)
1. Obsidian 설정 → 커뮤니티 플러그인 열기
2. **Habit Tracker** 검색
3. 설치 후 활성화

### BRAT 경유 설치 (베타 테스트용)
1. 커뮤니티 플러그인에서 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 설치
2. BRAT 설정 → **Add Beta plugin** 클릭
3. `https://github.com/KentaMaeda0616/obsidian-habit-tracker` 입력
4. **Add Plugin** 클릭 후 설정 → 커뮤니티 플러그인에서 활성화

### 수동 설치
1. [최신 릴리즈](https://github.com/KentaMaeda0916/obsidian-habit-tracker/releases/latest)에서 `main.js`, `manifest.json`, `styles.css` 다운로드
2. `.obsidian/plugins/habit-tracker/`에 복사
3. 설정 → 커뮤니티 플러그인에서 활성화

## 사용 방법

1. 실행 시 **Habit Tracker** 패널이 자동으로 열립니다 (데스크톱: 사이드바, 모바일: 탭)
2. **+ 습관 추가** 버튼으로 새 습관 생성
3. 체크박스를 탭하여 오늘의 달성 여부를 토글
4. 습관 파일은 `habits/tracker/<이름>.md`에 생성됩니다 (DataviewJS 달력 포함)
5. 요약 대시보드가 `habits/stats/dashboard.md`에 자동 생성됩니다

## 파일 구조

```
habits/
├── tracker/
│   ├── 운동.md         ← 습관별 파일 (frontmatter + DataviewJS 달력)
│   └── 독서.md
└── stats/
    └── dashboard.md    ← 자동 생성 요약 대시보드
```

## 습관 파일 형식

```markdown
---
habit: "운동"
description: "30분"
created: 2026-01-01
completions:
  - 2026-04-07
  - 2026-04-08
---
```

## Dataview 쿼리 예시

```dataview
TABLE habit, length(completions) AS 총 횟수
FROM "habits/tracker"
SORT length(completions) DESC
```

## 설정

| 설정 항목 | 설명 | 기본값 |
|---|---|---|
| 습관 파일 폴더 | 습관 파일을 저장할 폴더 경로 | `habits/tracker` |

## 라이선스

MIT © [maedakenta](https://github.com/maedakenta)
