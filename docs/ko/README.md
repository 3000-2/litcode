# Litcode

[English](../../README.md) | **한국어**

바이브 코딩을 위한 미니멀 IDE

## 특징

- **미니멀**: 9.1MB 앱 크기 (Electron 대비 ~15배 가벼움)
- **확장 가능**: 플러그인 아키텍처로 쉬운 기능 추가
- **핵심 기능만**: 파일 브라우저, 에디터, Git Diff, 디버거

## 기술 스택

| 구성요소 | 기술 |
|----------|------|
| 프론트엔드 | React 19 + TypeScript + Tailwind CSS |
| 에디터 | CodeMirror 6 |
| 백엔드 | Tauri 2 (Rust) |
| Git | git2-rs |
| 플랫폼 | macOS 전용 |

## 설치

### 개발 환경

```bash
cd litcode
pnpm install
pnpm run tauri dev
```

### 프로덕션 빌드

```bash
pnpm run tauri build
```

빌드 결과물:
- `src-tauri/target/release/bundle/macos/Litcode.app`
- `src-tauri/target/release/bundle/dmg/Litcode_0.1.0_aarch64.dmg`

### CLI 설치

1. `Litcode.app`을 `/Applications`로 이동
2. 앱 실행 → 설정 → **Install CLI** 클릭
3. 터미널에서 사용:

```bash
litcode .                    # 현재 폴더 열기
litcode /path/to/project     # 특정 폴더 열기
```

CLI는 `~/.local/bin/litcode`에 설치됩니다. PATH에 없으면 추가:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

## 프로젝트 구조

```
litcode/
├── src/                       # React 프론트엔드
│   ├── components/            # 공유 UI 컴포넌트
│   ├── core/                  # 플러그인 시스템 코어
│   ├── lib/                   # 유틸리티 (cn 등)
│   ├── plugins/               # 내장 플러그인
│   │   ├── file-explorer/
│   │   ├── editor/
│   │   ├── git-diff/
│   │   ├── debugger/
│   │   └── settings/
│   ├── ui/                    # 레이아웃 컴포넌트
│   └── styles/                # Tailwind CSS + 테마
│
├── src-tauri/                 # Rust 백엔드
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   └── commands/
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── tailwind.config.js
└── package.json
```

## 기능

### 파일 탐색기
- 트리 네비게이션
- 파일 열기/저장
- 폴더 접기/펼치기

### 에디터 (CodeMirror)
- 30+ 언어 문법 강조
- 다중 탭 지원
- Cmd+S 저장

### Git Diff
- 인라인 / 나란히 보기 토글
- 파일 전체 되돌리기
- Hunk 단위 되돌리기
- 라인 단위 되돌리기
- 파일 Stage/Unstage

### 설정
- 테마: Dark / Light
- 에디터 폰트: JetBrains Mono, Fira Code, SF Mono, Menlo, Monaco
- 에디터/UI 폰트 크기 분리
- 줄간격, 리가쳐
- 커스텀 테마/폰트 (~/.litcode/)
- CLI 설치

### 디버거 (UI만 구현)
- 브레이크포인트 관리
- 변수 패널
- 콜스택 패널
- 디버그 컨트롤 (Start, Stop, Step Over/Into/Out)

## 단축키

| 단축키 | 동작 |
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

## 문서

- [PRD](PRD.md) - 제품 요구사항 문서
- [Progress](PROGRESS.md) - 개발 진행 상황

## 라이선스

듀얼 라이선스:

| 구성요소 | 라이선스 | 설명 |
|----------|----------|------|
| **Core** | [ELv2](../../LICENSE-ELv2) | 자유롭게 사용/수정 가능. 호스팅 서비스로 제공 불가. |
| **Plugin SDK** | [MIT](../../LICENSE-MIT) | `src/core/` - 어떤 라이선스로든 플러그인 제작 가능. |

자세한 내용은 [LICENSE](../../LICENSE) 참조.
