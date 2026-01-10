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

## 프로젝트 구조

```
litcode/
├── src/                       # React 프론트엔드
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
│   ├── ui/                    # UI 컴포넌트
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
