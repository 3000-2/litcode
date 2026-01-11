# Litcode 개발 진행 상황

[English](../en/PROGRESS.md) | **한국어**

## 완료된 작업 ✅

### Phase 0: 프로젝트 초기화
- [x] Tauri + React + TypeScript 보일러플레이트 생성
- [x] 프로젝트 설정 (package.json, Cargo.toml, tauri.conf.json)
- [x] 플러그인 시스템 코어 구현
  - `src/core/types.ts` - 타입 정의
  - `src/core/event-bus.ts` - 이벤트 버스
  - `src/core/plugin-api.ts` - 플러그인 API 및 레지스트리
  - `src/core/plugin-loader.ts` - 플러그인 로더
  - `src/core/ipc.ts` - Tauri IPC 래퍼

### Phase 1: 기본 레이아웃
- [x] VS Code 스타일 레이아웃
- [x] 사이드바 (접기/펼치기)
- [x] 탭바 (다중 파일)
- [x] 상태바
- [x] 전역 스타일 (global.css)

### Phase 2: 파일 브라우저 플러그인
- [x] `src/plugins/file-explorer/index.ts`
- [x] `src/plugins/file-explorer/components/FileExplorerPanel.tsx`
- [x] `src/plugins/file-explorer/components/FileTree.tsx`
- [x] Rust 커맨드: read_file, write_file, read_dir, file_exists, create_dir, remove_path, rename_path

### Phase 3: 에디터 플러그인
- [x] CodeMirror 6 설치 및 설정
- [x] `src/plugins/editor/index.ts`
- [x] `src/plugins/editor/components/Editor.tsx`
- [x] JavaScript/TypeScript 문법 강조
- [x] Python 문법 강조
- [x] One Dark 테마
- [x] 파일 저장 (Cmd+S)
- [x] 변경사항 추적 (dirty indicator)

### Phase 4: Git Diff 플러그인
- [x] `src/plugins/git-diff/index.ts`
- [x] `src/plugins/git-diff/components/GitDiffPanel.tsx`
- [x] `src/plugins/git-diff/components/DiffViewer.tsx`
- [x] Inline diff 뷰
- [x] Side-by-side diff 뷰
- [x] 뷰 모드 토글
- [x] Rust 커맨드: git_status, git_diff, git_revert_file, git_revert_hunk, git_revert_lines, git_stage_file, git_unstage_file

### Phase 5: 디버거 플러그인 (UI만)
- [x] `src/plugins/debugger/index.ts`
- [x] `src/plugins/debugger/components/DebuggerPanel.tsx`
- [x] `src/plugins/debugger/components/DebuggerPanel.css`
- [x] 디버거 패널 UI
- [x] 브레이크포인트 관리 UI
- [x] 변수/콜스택 패널 UI
- [x] 디버그 컨트롤 버튼
- [x] **App.tsx에 디버거 플러그인 연결 완료**

### Phase 6: 테마 & 폰트
- [x] `src/plugins/settings/index.ts`
- [x] `src/plugins/settings/components/SettingsPanel.tsx`
- [x] Dark/Light 테마 JSON
- [x] 테마 전환
- [x] 폰트 설정 UI

### Phase 7: 빌드 & 배포
- [x] 프로덕션 빌드
- [x] DMG 생성
- [x] 앱 번들 (.app)

### Phase 8: 버그 수정 & 리팩터링
- [x] TabBar: stale closure 버그 수정 (handleTabClose에서 이전 tabs 상태 참조 문제)
- [x] Editor.tsx: 첫 파일 열기 시 currentTabId 미설정 버그 수정
- [x] Editor.tsx: useEffect 의존성 배열 문제로 인한 무한 리렌더링 가능성 수정
- [x] Editor.tsx: 중복된 EditorState 생성 코드를 createEditorState 헬퍼로 추출
- [x] DebuggerPanel: useEffect 의존성 누락 수정 (useCallback으로 핸들러 래핑)
- [x] plugin-api.ts: 동적 import를 정적 import로 변경 (번들 크기 최적화)
- [x] SettingsPanel: useEffect 의존성 경고 수정 (useCallback으로 applyTheme/applyFont 래핑)

### Phase 9: CLI 지원
- [x] main.rs: CLI 인자 파싱 (`litcode .`, `litcode /path`)
- [x] lib.rs: `get_initial_path` 커맨드 추가
- [x] lib.rs: `install_cli`, `uninstall_cli`, `is_cli_installed` 커맨드 추가
- [x] SettingsPanel: "Install CLI" / "Uninstall CLI" 버튼 추가
- [x] FileExplorerPanel: 초기 경로 로딩 지원

### Phase 10: Lucide 아이콘 마이그레이션
- [x] lucide-react 설치
- [x] Sidebar 아이콘 Lucide로 변경
- [x] FileTree 파일/폴더 아이콘 Lucide로 변경
- [x] GitDiffPanel 아이콘 Lucide로 변경
- [x] DebuggerPanel 아이콘 Lucide로 변경
- [x] TabBar, FileExplorerPanel 아이콘 Lucide로 변경

### Phase 11: 공통 컴포넌트 라이브러리
- [x] `src/components/` 폴더 생성
- [x] Icon 컴포넌트 (Lucide wrapper)
- [x] IconButton 컴포넌트 (sm/md/lg, default/ghost/danger)
- [x] Button 컴포넌트 (primary/secondary/danger/ghost, loading 상태)
- [x] Input 컴포넌트 (icon 지원)
- [x] Select 컴포넌트 (sm/md/lg, error, fullWidth)
- [x] SelectOption 컴포넌트
- [x] Radio 컴포넌트 (단일 라디오 버튼)
- [x] RadioGroup 컴포넌트 (vertical/horizontal)
- [x] Toggle 컴포넌트 (sm/md/lg)
- [x] Slider 컴포넌트 (valueSuffix 지원)
- [x] Checkbox 컴포넌트
- [x] Panel 컴포넌트 (title + actions + content)
- [x] Section 컴포넌트 (title + hint + content)
- [x] EmptyState 컴포넌트
- [x] 공통 CSS (components.css)
- [x] 기존 파일들 리팩터링 (공통 컴포넌트 사용)

### Phase 12: 문법 강조 확장
- [x] Go, Rust, Java, C++, SQL, YAML, XML, HTML, CSS, Markdown, JSON, Shell 등 30+ 언어 지원
- [x] 파일 확장자별 언어 자동 감지

### Phase 13: Git Diff 개선
- [x] Staged, Unstaged, Untracked 파일 분리 표시 (VS Code 스타일)
- [x] Stage/Unstage UI 버튼 추가
- [x] Untracked 파일 diff 표시 (전체 파일을 additions으로)
- [x] git_diff_untracked Rust 커맨드 추가

### Phase 14: 버그 수정 (코드 리뷰)
- [x] git_revert_hunk / git_revert_lines 파일 손상 버그 수정
- [x] Editor 빠른 탭 전환 시 race condition 수정 (loadRequestIdRef)
- [x] TabBar stale closure 버그 수정 (functional setState)
- [x] DiffViewer untracked/staged 파일에 Discard 버튼 숨김
- [x] StatusBar 레이아웃 수정 (CSS grid)
- [x] git_unstage_file 첫 커밋 케이스 처리
- [x] FileTree 로드 실패 시 에러 표시

### Phase 15: 라이선스 & CLI
- [x] Elastic License 2.0 (ELv2) 적용
- [x] 듀얼 라이선스: Core (ELv2), Plugin SDK (MIT)
- [x] CLI 터미널 detach 수정 (open -a 사용)
- [x] CLI 설치 경로 변경: /usr/local/bin → ~/.local/bin (권한 문제 해결)

### Phase 16: 파일 작업 UI
- [x] ContextMenu 재사용 컴포넌트
- [x] 파일/폴더 우클릭 컨텍스트 메뉴
- [x] 새 파일 생성 (인라인 입력 + write_file)
- [x] 새 폴더 생성 (인라인 입력 + create_dir)
- [x] 이름 변경 (인라인 편집 + rename_path)
- [x] 삭제 (확인 다이얼로그 + remove_path)
- [x] 탐색기 헤더에 새 파일/폴더 툴바 버튼
- [x] Icon 컴포넌트 확장 (file-plus, folder-plus, pencil)

---

## 남은 작업 📋

### 향후 구현 필요

#### 디버거 완성 (DAP)
- [ ] DAP 클라이언트 구현 (Rust)
- [ ] vscode-js-debug 어댑터 연동 (Node.js)
- [ ] debugpy 어댑터 연동 (Python)
- [ ] delve 어댑터 연동 (Go)
- [ ] 에디터 gutter에 브레이크포인트 표시
- [ ] 디버그 중 라인 하이라이트

#### 에디터 개선
- [ ] 검색/바꾸기
- [ ] 다중 커서
- [ ] 코드 접기

#### 테마 & 폰트 완성
- [ ] ~/.litcode/themes/ 에서 커스텀 테마 로딩
- [ ] ~/.litcode/fonts/ 에서 커스텀 폰트 로딩
- [ ] 추가 내장 테마 (Dracula, Nord, Monokai)

#### 기타
- [ ] 터미널 플러그인
- [ ] 검색 플러그인
- [ ] LSP 지원

---

## 파일 위치

### 생성된 모든 파일

```
litcode/
├── src/
│   ├── components/
│   │   ├── index.ts
│   │   ├── Icon.tsx
│   │   ├── IconButton.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Radio.tsx
│   │   ├── Toggle.tsx
│   │   ├── Slider.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Panel.tsx
│   │   ├── Section.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ContextMenu.tsx
│   │   └── components.css
│   │
│   ├── core/
│   │   ├── types.ts
│   │   ├── event-bus.ts
│   │   ├── plugin-api.ts
│   │   ├── plugin-loader.ts
│   │   ├── ipc.ts
│   │   └── index.ts
│   │
│   ├── plugins/
│   │   ├── file-explorer/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── FileExplorerPanel.tsx
│   │   │       ├── FileExplorerPanel.css
│   │   │       ├── FileTree.tsx
│   │   │       └── FileTree.css
│   │   │
│   │   ├── editor/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── Editor.tsx
│   │   │       └── Editor.css
│   │   │
│   │   ├── git-diff/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── GitDiffPanel.tsx
│   │   │       ├── GitDiffPanel.css
│   │   │       ├── DiffViewer.tsx
│   │   │       └── DiffViewer.css
│   │   │
│   │   ├── debugger/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── DebuggerPanel.tsx
│   │   │       └── DebuggerPanel.css
│   │   │
│   │   └── settings/
│   │       ├── index.ts
│   │       └── components/
│   │           ├── SettingsPanel.tsx
│   │           └── SettingsPanel.css
│   │
│   ├── ui/
│   │   ├── Layout.tsx
│   │   ├── Layout.css
│   │   ├── Sidebar.tsx
│   │   ├── Sidebar.css
│   │   ├── TabBar.tsx
│   │   ├── TabBar.css
│   │   ├── StatusBar.tsx
│   │   ├── StatusBar.css
│   │   └── index.ts
│   │
│   ├── styles/
│   │   ├── global.css
│   │   └── themes/
│   │       ├── dark.json
│   │       └── light.json
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   └── commands/
│   │       ├── mod.rs
│   │       ├── fs.rs
│   │       └── git.rs
│   │
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 빌드 결과물

```
src-tauri/target/release/bundle/
├── macos/
│   └── Litcode.app (9.1 MB)
└── dmg/
    └── Litcode_0.1.0_aarch64.dmg (3.5 MB)
```

---

## 재개 방법

1. **터미널 열기**
   ```bash
   cd /path/to/litcode
   ```

2. **빌드 & 테스트**
   ```bash
   pnpm run tauri build
   open src-tauri/target/release/bundle/macos/Litcode.app
   ```

3. **개발 모드**
   ```bash
   pnpm run tauri dev
   ```

---

## 변경 이력

### 2026-01-11
- 파일 작업 UI 완성
  - ContextMenu 컴포넌트로 우클릭 메뉴 지원
  - 컨텍스트 메뉴 및 툴바 버튼으로 새 파일/폴더 생성
  - 인라인 편집으로 파일/폴더 이름 변경
  - 확인 다이얼로그로 파일/폴더 삭제
  - Icon 컴포넌트 확장 (file-plus, folder-plus, pencil 아이콘)
- 듀얼 라이선스 설정: Core (ELv2), Plugin SDK (MIT)
- CLI 권한 문제 해결: ~/.local/bin으로 설치 경로 변경
- CLI 터미널 detach 수정: open -a 사용으로 터미널 즉시 해제

### 2026-01-10
- 코드 리뷰 버그 수정
  - git_revert_hunk / git_revert_lines 파일 손상 버그 수정
  - Editor 빠른 탭 전환 시 race condition 수정
  - TabBar stale closure 버그 수정
  - DiffViewer untracked/staged 파일에 Discard 버튼 숨김
  - StatusBar 레이아웃 수정 (CSS grid)
  - git_unstage_file 첫 커밋 케이스 처리
  - FileTree 로드 실패 시 에러 표시
- AGENTS.md 프로젝트 가이드라인 문서 추가
- Git diff 개선: staged, unstaged, untracked 파일 분리 표시
- 30+ 언어 문법 강조 지원 추가

### 2026-01-09
- 디버거 플러그인 App.tsx 연결 완료
- 버그 수정 및 코드 품질 개선
  - TabBar stale closure 버그 수정
  - Editor.tsx 리팩터링 (중복 코드 제거, 버그 수정)
  - DebuggerPanel useCallback 적용
  - plugin-api.ts 정적 import로 변경
  - SettingsPanel useCallback 적용
- CLI 지원 추가
  - `litcode .` 또는 `litcode /path/to/folder` 명령어 지원
  - Settings에서 CLI 설치/제거 가능
- Lucide 아이콘 마이그레이션
  - emoji 아이콘을 Lucide React 아이콘으로 전환
  - 모든 UI 컴포넌트에서 일관된 아이콘 사용
- 공통 컴포넌트 라이브러리 추가
  - `src/components/` 폴더에 재사용 가능한 UI 컴포넌트 생성
  - Icon, IconButton, Button, Input, Select, Slider, Checkbox, Panel, Section, EmptyState
  - 기존 파일들을 공통 컴포넌트 사용하도록 리팩터링
