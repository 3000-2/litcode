# Litcode 🔥

바이브 코딩을 위한 미니멀 IDE

## 특징

- **미니멀**: 9.1MB 앱 크기 (Electron 대비 ~15배 가벼움)
- **확장 가능**: 플러그인 아키텍처로 기능 추가 용이
- **핵심 기능만**: 파일 브라우저, 에디터, Git Diff, 디버거

## 기술 스택

| 구성요소 | 기술 |
|----------|------|
| Frontend | React 19 + TypeScript |
| Editor | CodeMirror 6 |
| Backend | Tauri 2 (Rust) |
| Git | git2-rs |
| 플랫폼 | macOS only |

## 설치 및 실행

### 개발 모드

```bash
cd litcode
npm install
npm run tauri dev
```

### 프로덕션 빌드

```bash
npm run tauri build
```

빌드 결과물:
- `src-tauri/target/release/bundle/macos/Litcode.app`
- `src-tauri/target/release/bundle/dmg/Litcode_0.1.0_aarch64.dmg`

### CLI 설치 (터미널에서 실행)

1. `Litcode.app`을 `/Applications`로 이동
2. 앱 실행 → Settings → **Install CLI** 버튼 클릭
3. 터미널에서 사용:

```bash
litcode .                    # 현재 폴더 열기
litcode /path/to/project     # 특정 폴더 열기
```

권한 문제 시 수동 설치:
```bash
sudo ln -sf /Applications/Litcode.app/Contents/MacOS/Litcode /usr/local/bin/litcode
```

## 프로젝트 구조

```
litcode/
├── src/                       # React 프론트엔드
│   ├── components/            # 공통 UI 컴포넌트
│   │   ├── Icon.tsx           # Lucide 아이콘 래퍼
│   │   ├── IconButton.tsx     # 아이콘 버튼
│   │   ├── Button.tsx         # 범용 버튼
│   │   ├── Input.tsx          # 텍스트 입력
│   │   ├── Select.tsx         # 드롭다운
│   │   ├── Radio.tsx          # 라디오 버튼/그룹
│   │   ├── Toggle.tsx         # 토글 스위치
│   │   ├── Slider.tsx         # 슬라이더
│   │   ├── Checkbox.tsx       # 체크박스
│   │   ├── Panel.tsx          # 패널 (헤더+컨텐츠)
│   │   ├── Section.tsx        # 설정 섹션
│   │   ├── EmptyState.tsx     # 빈 상태 메시지
│   │   └── components.css     # 공통 스타일
│   │
│   ├── core/                  # 플러그인 시스템 코어
│   │   ├── types.ts           # 타입 정의
│   │   ├── event-bus.ts       # 이벤트 버스
│   │   ├── plugin-api.ts      # 플러그인 API
│   │   ├── plugin-loader.ts   # 플러그인 로더
│   │   └── ipc.ts             # Tauri IPC 래퍼
│   │
│   ├── plugins/               # 내장 플러그인
│   │   ├── file-explorer/     # 파일 브라우저
│   │   ├── editor/            # CodeMirror 에디터
│   │   ├── git-diff/          # Git Diff 뷰어
│   │   ├── debugger/          # 디버거 (UI만 완성)
│   │   └── settings/          # 테마/폰트 설정
│   │
│   ├── ui/                    # 레이아웃 컴포넌트
│   │   ├── Layout.tsx         # 메인 레이아웃
│   │   ├── Sidebar.tsx        # 사이드바 (접기/펼치기)
│   │   ├── TabBar.tsx         # 탭바
│   │   └── StatusBar.tsx      # 상태바
│   │
│   └── styles/                # 스타일
│       ├── global.css         # 전역 스타일
│       └── themes/            # 테마 JSON 파일
│
├── src-tauri/                 # Rust 백엔드
│   ├── src/
│   │   ├── main.rs            # 엔트리포인트
│   │   ├── lib.rs             # 라이브러리
│   │   └── commands/          # Tauri 커맨드
│   │       ├── fs.rs          # 파일시스템 명령어
│   │       └── git.rs         # Git 명령어
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── package.json
└── README.md
```

## 기능

### 1. 파일 브라우저
- 트리 구조 탐색
- 파일 열기/저장
- 디렉토리 접기/펼치기

### 2. 에디터 (CodeMirror)
- JavaScript/TypeScript 문법 강조
- Python 문법 강조
- Go 문법 강조 (추가 필요)
- 다중 탭 지원
- Cmd+S 저장

### 3. Git Diff
- Inline / Side-by-side 토글
- 파일 전체 되돌리기
- 블록(Hunk) 단위 되돌리기
- **라인 단위 되돌리기**

### 4. 설정
- 테마: Dark / Light
- 폰트: JetBrains Mono, Fira Code, SF Mono, Menlo, Monaco
- 폰트 크기, 줄간격, 리가쳐 설정
- 커스텀 테마/폰트 지원 (~/.litcode/)
- **CLI 설치**: `litcode .` 명령어로 터미널에서 폴더 열기

### 5. 디버거 (UI만 완성)
- 브레이크포인트 관리
- 변수 패널
- 콜스택 패널
- 디버그 컨트롤 (Start, Stop, Step Over/Into/Out)

## 단축키

| 단축키 | 기능 |
|--------|------|
| Cmd+S | 저장 |
| Cmd+Shift+E | 파일 탐색기 새로고침 |
| Cmd+Shift+G | Git 상태 새로고침 |
| Cmd+, | 설정 열기 |
| F5 | 디버그 시작 |
| Shift+F5 | 디버그 중지 |
| F8 | 계속 |
| F9 | 브레이크포인트 토글 |
| F10 | Step Over |
| F11 | Step Into |
| Shift+F11 | Step Out |

## 공통 컴포넌트

`src/components/`에서 재사용 가능한 UI 컴포넌트를 제공합니다.

### 사용 예시

```tsx
import { Icon, IconButton, Button, Input, Select, Slider, Checkbox } from '../components';

// Icon - Lucide 아이콘 래퍼
<Icon name="files" size={20} />
<Icon name="git-branch" size={16} strokeWidth={1.5} />

// IconButton - 아이콘만 있는 버튼
<IconButton icon="refresh" size="sm" onClick={handleRefresh} />
<IconButton icon="x" variant="danger" />
<IconButton icon="play" active={isPlaying} />

// Button - 범용 버튼 (primary/secondary/danger/ghost)
<Button variant="primary" onClick={handleSave}>Save</Button>
<Button variant="danger" icon="trash">Delete</Button>
<Button loading={isLoading}>Submit</Button>

// Input - 텍스트 입력
<Input placeholder="Search..." />
<Input icon="search" value={query} onChange={handleChange} />

// Select - 드롭다운
<Select value={theme} onChange={handleThemeChange} size="md">
  <option value="dark">Dark</option>
  <option value="light">Light</option>
</Select>

// Radio - 라디오 버튼
<Radio name="theme" value="dark" checked={theme === 'dark'} onChange={...}>
  Dark Mode
</Radio>

// RadioGroup - 라디오 그룹
<RadioGroup
  name="theme"
  value={theme}
  onChange={setTheme}
  options={[
    { value: 'dark', label: 'Dark Mode' },
    { value: 'light', label: 'Light Mode' },
  ]}
  direction="vertical"
/>

// Slider - 슬라이더
<Slider min={10} max={24} value={fontSize} valueSuffix="px" />

// Checkbox - 체크박스
<Checkbox checked={enabled} onChange={handleToggle}>
  Enable feature
</Checkbox>

// Toggle - 토글 스위치
<Toggle checked={enabled} onChange={handleToggle} size="md">
  Dark Mode
</Toggle>
```

### 컴포넌트 목록

| 컴포넌트 | 설명 | 주요 Props |
|----------|------|------------|
| `Icon` | Lucide 아이콘 래퍼 | `name`, `size`, `strokeWidth` |
| `IconButton` | 아이콘 버튼 | `icon`, `size`, `variant`, `active` |
| `Button` | 범용 버튼 | `variant`, `icon`, `loading` |
| `Input` | 텍스트 입력 | `icon`, `error` |
| `Select` | 드롭다운 | `size`, `error`, `fullWidth` |
| `SelectOption` | 드롭다운 옵션 | `value`, `disabled` |
| `Radio` | 라디오 버튼 | `name`, `value`, `checked` |
| `RadioGroup` | 라디오 그룹 | `options`, `value`, `direction` |
| `Toggle` | 토글 스위치 | `size`, `checked` |
| `Slider` | 슬라이더 | `showValue`, `valueSuffix` |
| `Checkbox` | 체크박스 | `children` |
| `Panel` | 패널 (헤더+컨텐츠) | `title`, `actions` |
| `Section` | 설정 섹션 | `title`, `hint` |
| `EmptyState` | 빈 상태 | `icon`, `message` |

### 지원하는 아이콘

```typescript
type IconName = 
  | 'files' | 'git-branch' | 'bug' | 'settings'
  | 'folder' | 'folder-open' | 'file' | 'file-text' | 'file-code' | 'file-type'
  | 'play' | 'square' | 'step-forward' | 'arrow-down' | 'arrow-up'
  | 'refresh' | 'undo' | 'trash' | 'plus' | 'x'
  | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'chevron-up'
  | 'search' | 'check' | 'alert' | 'info' | 'loader' | 'circle' | 'braces';
```

## 플러그인 개발

### 플러그인 인터페이스

```typescript
interface LitcodePlugin {
  id: string;
  name: string;
  version: string;
  
  activate(api: PluginAPI): Promise<void>;
  deactivate(): Promise<void>;
}
```

### 플러그인 API

```typescript
interface PluginAPI {
  ui: {
    registerSidebar(config: SidebarConfig): void;
    registerPanel(config: PanelConfig): void;
    registerStatusBar(item: StatusBarItem): void;
  };
  
  commands: {
    register(command: Command): void;
    execute(id: string): void;
  };
  
  editor: {
    onOpen(callback): () => void;
    onSave(callback): () => void;
    registerLanguage(config: LanguageConfig): void;
  };
  
  fs: {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    readDir(path: string): Promise<DirEntry[]>;
  };
  
  events: {
    emit(event: string, data?: unknown): void;
    on(event: string, callback): () => void;
  };
  
  storage: PluginStorage;
}
```

## 라이선스

MIT
