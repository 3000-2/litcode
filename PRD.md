# Litcode PRD (Product Requirements Document)

## 개요

**제품명**: Litcode  
**버전**: 0.1.0  
**목표**: 바이브 코딩에 최적화된 미니멀 IDE

## 원칙

1. **Minimal First** - 핵심 기능만, 불필요한 기능 배제
2. **Extensible** - 플러그인으로 기능 확장 가능한 구조

## 타겟 사용자

- AI 코딩 어시스턴트와 함께 작업하는 개발자
- VS Code, Cursor가 너무 무겁다고 느끼는 개발자
- 심플한 워크플로우를 선호하는 개발자

## 핵심 기능 요구사항

### 1. 파일 브라우저 ✅ 완료
- [x] 디렉토리 트리 구조 표시
- [x] 파일 클릭으로 에디터에서 열기
- [x] 폴더 접기/펼치기
- [x] 경로 직접 입력
- [x] 새로고침 버튼
- [ ] 파일 생성/삭제/이름변경 (미구현)

### 2. 에디터 ✅ 완료
- [x] CodeMirror 6 기반
- [x] JavaScript/TypeScript 문법 강조
- [x] Python 문법 강조
- [x] Go, Rust, Java, C++, SQL, YAML, XML, HTML, CSS, Markdown, JSON, Shell 등 30+ 언어 지원
- [x] 다중 탭 지원
- [x] Cmd+S 저장
- [x] 변경사항 표시 (dirty indicator)
- [ ] 자동완성 (미구현 - LSP 필요)

### 3. Git Diff ✅ 완료
- [x] 변경된 파일 목록 (staged, unstaged, untracked 분리)
- [x] 브랜치 표시
- [x] Inline diff 뷰어
- [x] Side-by-side diff 뷰어
- [x] Inline ↔ Side-by-side 토글
- [x] 파일 전체 되돌리기
- [x] Hunk(블록) 단위 되돌리기
- [x] **라인 단위 되돌리기**
- [x] Stage/Unstage 기능 (백엔드 + UI)

### 4. 디버거 🔄 UI만 완료
- [x] 디버거 패널 UI
- [x] 브레이크포인트 목록
- [x] 변수 패널
- [x] 콜스택 패널
- [x] 디버그 컨트롤 버튼 (Start/Stop/Step)
- [x] 언어 선택 (Node.js/Python/Go)
- [ ] **DAP 프로토콜 연동** (미구현)
- [ ] 실제 디버그 세션 (미구현)
- [ ] 에디터 브레이크포인트 gutter (미구현)

### 5. 테마 & 폰트 ✅ 완료
- [x] Dark 테마
- [x] Light 테마
- [x] 테마 전환
- [x] 폰트 선택 (5종)
- [x] 폰트 크기 조절
- [x] 줄간격 조절
- [x] 리가쳐 on/off
- [x] 커스텀 테마 경로 안내 (~/.litcode/themes/)
- [x] 커스텀 폰트 경로 안내 (~/.litcode/fonts/)
- [ ] 커스텀 테마 로딩 로직 (미구현)
- [ ] 커스텀 폰트 로딩 로직 (미구현)

### 6. UI 레이아웃 ✅ 완료
- [x] VS Code 스타일 레이아웃
- [x] 사이드바 접기/펼치기
- [x] 탭바
- [x] 상태바
- [x] 반응형 에디터 영역

## 기술 스택

| 구성요소 | 선택 | 이유 |
|----------|------|------|
| 프레임워크 | Tauri 2 | Electron보다 ~15배 가벼움 |
| 프론트엔드 | React 19 | 생태계, 익숙함 |
| 에디터 | CodeMirror 6 | Monaco보다 가벼움, 확장성 |
| 백엔드 | Rust | Tauri 기본, 성능 |
| Git | git2-rs | 네이티브 libgit2 바인딩 |
| 번들러 | Vite | 빠른 HMR |

## 아키텍처

### 플러그인 시스템

```
┌─────────────────────────────────────┐
│           Litcode Core              │
├─────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐
│  │  File   │ │ Editor  │ │  Git    │
│  │Explorer │ │ Plugin  │ │  Diff   │
│  └────┬────┘ └────┬────┘ └────┬────┘
│  ┌────┴────┐ ┌────┴────┐      │
│  │Debugger │ │Settings │      │
│  └────┬────┘ └────┬────┘      │
│       │           │           │
│  ─────┴───────────┴───────────┴────
│            Plugin API Layer
├─────────────────────────────────────┤
│         Event Bus / IPC Bridge
├─────────────────────────────────────┤
│          Tauri Core (Rust)
└─────────────────────────────────────┘
```

### Rust 커맨드

| 커맨드 | 설명 | 상태 |
|--------|------|------|
| read_file | 파일 읽기 | ✅ |
| write_file | 파일 쓰기 | ✅ |
| read_dir | 디렉토리 읽기 | ✅ |
| file_exists | 파일 존재 확인 | ✅ |
| create_dir | 디렉토리 생성 | ✅ |
| remove_path | 파일/디렉토리 삭제 | ✅ |
| rename_path | 이름 변경 | ✅ |
| git_status | Git 상태 | ✅ |
| git_diff | Git diff | ✅ |
| git_revert_file | 파일 되돌리기 | ✅ |
| git_revert_hunk | Hunk 되돌리기 | ✅ |
| git_revert_lines | 라인 되돌리기 | ✅ |
| git_stage_file | 파일 스테이징 | ✅ |
| git_unstage_file | 스테이징 취소 | ✅ |

## 일정

| Phase | 내용 | 예상 기간 | 상태 |
|-------|------|----------|------|
| 0 | 프로젝트 셋업 + 플러그인 시스템 | 2일 | ✅ 완료 |
| 1 | 기본 레이아웃 | 2일 | ✅ 완료 |
| 2 | 파일 브라우저 | 2일 | ✅ 완료 |
| 3 | 에디터 (CodeMirror) | 3일 | ✅ 완료 |
| 4 | Git Diff | 5일 | ✅ 완료 |
| 5 | 디버거 (DAP) | 7일 | 🔄 UI만 완료 |
| 6 | 테마 & 폰트 | 2일 | ✅ 완료 |
| 7 | 빌드 & 배포 | 1일 | ✅ 완료 |

**총 예상**: 24일  
**실제 소요**: 1일 (MVP)

## 빌드 결과

| 파일 | 크기 |
|------|------|
| Litcode.app | 9.1 MB |
| Litcode_0.1.0_aarch64.dmg | 3.5 MB |

## 라이선스

| 구성요소 | 라이선스 |
|----------|----------|
| Core | Elastic License 2.0 (ELv2) |
| Plugin SDK (`src/core/`) | MIT |

## 향후 계획

### v0.2.0
- [ ] DAP 디버거 완전 구현
- [ ] 커스텀 테마/폰트 로딩

### v0.3.0
- [ ] LSP 지원 (자동완성)
- [ ] 터미널 플러그인
- [ ] 검색 플러그인

### v1.0.0
- [ ] 안정화
- [ ] 문서화
- [ ] 커뮤니티 플러그인 지원
