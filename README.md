# 청년미래적금 2차 신청 가이드 (쩐투력 / JJEONPOWER)

인스타그램 DM 링크로 보내는 모바일 안내 페이지입니다. HTML·CSS·JavaScript만 쓰는 정적 사이트라서 설치나 빌드 없이 GitHub Pages에 올릴 수 있어요. 서버, 로그인, 개인정보 수집은 없습니다.

> 이 페이지는 공식 공개자료를 정리한 안내입니다. 확인한 출처와 미확인 항목은 [SOURCES.md](SOURCES.md)를 보세요. **접수 운영시간이 아직 미확인이라 배포 전에 한 번 확인해야 해요.**

## 파일 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 페이지 내용(문구·표·체크리스트·FAQ) |
| `styles.css` | 디자인(색, 글자 크기, 모바일/인쇄 스타일) |
| `script.js` | 날짜 상태 표시, 체크리스트 저장, FAQ, 링크 복사·공유 |
| `SOURCES.md` | 주장별 출처, 확인 날짜, 미확인 항목 |
| `README.md` | 이 문서 |

이미지는 쓰지 않아서 `assets/` 폴더가 없습니다. 모든 파일 경로는 상대경로라서 GitHub Pages의 하위 주소(`아이디.github.io/저장소이름/`)에서도 동작해요.

## 내 컴퓨터에서 열어보기

**방법 1. 파일 열기 (가장 쉬움)**
`index.html`을 더블클릭하면 브라우저에서 열려요. 다만 이 방식(`file://`)에서는 브라우저가 클립보드 복사를 막을 수 있어요. 그땐 페이지가 ‘주소를 직접 복사해 주세요’ 안내를 띄웁니다.

**방법 2. 로컬 서버로 열기 (실제 배포와 가장 비슷함)**
이 폴더에서 터미널을 열고, 아래 중 하나를 실행하세요.

Node.js가 설치되어 있다면:

```bash
npx --yes serve .
```

Python이 설치되어 있다면:

```bash
python -m http.server 8000
```

그다음 터미널에 표시되는 주소(보통 `http://localhost:3000` 또는 `http://localhost:8000`)를 브라우저에 입력하세요.

**날짜별 상태 미리보기**
주소 끝에 `?today=2026-10-07` 처럼 날짜를 붙이면, 그 날짜 기준의 상태 배너와 일정 표시를 볼 수 있어요. 예: `http://localhost:8000/index.html?today=2026-11-16`

이 기능은 **내 컴퓨터(`localhost`, `127.0.0.1`)에서만** 동작해요. GitHub Pages 같은 공개 주소에서는 `?today=` 값을 무시하고 항상 실제 한국시간 날짜를 써요.

## GitHub Pages에 게시하기 (준비되면 직접 진행)

1. GitHub에 로그인하고 **New repository**를 눌러 저장소를 만듭니다(예: `jjeonpower-guide`, Public).
2. 저장소 화면에서 **uploading an existing file**을 눌러 `index.html`, `styles.css`, `script.js`, `README.md`, `SOURCES.md`를 올리고 **Commit changes**를 누릅니다. 올린 파일이 `main` 브랜치의 맨 위(루트)에 있어야 해요.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Build and deployment → Source**를 `Deploy from a branch`로, **Branch**를 `main`, 폴더를 `/ (root)`로 고르고 **Save**를 누릅니다.
5. 1~2분 뒤 Pages 화면에 주소가 나타납니다. 보통 `https://내아이디.github.io/저장소이름/` 형태예요.
6. 그 주소를 폰으로 열어 확인한 뒤 DM 링크로 쓰세요.

## 새 조건과 일정으로 업데이트하기

일정이나 조건이 바뀌면 아래 위치를 고치세요. 문구를 찾을 땐 편집기의 검색(Ctrl+F)을 쓰면 편해요.

| 바꿀 것 | 위치 |
|---|---|
| 상태 배너·타임라인의 날짜 계산 | `script.js` 맨 위 `SCHEDULE`, `APPLY_DAYS`, `NO_APPLY_REASON` |
| 상단 신청·계좌개설 날짜 카드 | `index.html`의 `class="date-card"` 두 곳 |
| 일정 4단계 | `index.html`의 `id="timeline"` 안 `<li>`와 `data-start`/`data-end` |
| 신청 가능한 날·홀짝제 표 | `index.html`의 `#schedule` 안 표 |
| 월 한도·기여금·금리 등 숫자 | `index.html`의 `id="summary"`, `id="eligibility"` |
| 군인 관련 설명 | `index.html`의 `id="military"` |
| 갈아타기 순서 | `index.html`의 `id="switch"` |
| 체크리스트 항목 | `index.html`의 `id="checklist-list"` (항목을 추가하면 개수는 자동 계산) |
| 출처 표와 확인일 | `index.html`의 `id="sources"`, 푸터, 상단 ‘2026.10.5 확인’ 배지, `SOURCES.md` |

**접수 운영시간을 확인한 뒤 할 일**
1. `index.html`에서 `id="hours-note"` 블록의 ‘공식 확인 필요’ 태그를 지우고, 2차 공식 자료에서 확인한 시간과 출처를 적습니다.
2. 현재 문구 ‘접수 시간은 신청할 취급기관 앱 공지를 확인하세요.’를 `script.js`(상태 배너 2곳)와 `index.html`(`id="hours-note"`, 체크리스트 아래 경고)에서 찾아, 확인한 시간으로 바꿉니다. 1차 모집 때의 운영시간은 2차에 그대로 옮겨 쓰지 마세요.
3. `index.html` 체크리스트 아래 경고 문구와 `SOURCES.md`의 미확인 1번도 정리합니다.

## 만든 기능

- 한국시간(KST) 기준 날짜 상태 표시: 시작 전 / 신청 기간 / 접수 없는 날 / 심사 / 계좌개설 / 종료. 운영시간이 미확인이라 ‘지금 접수 가능’ 같은 실시간 판단은 하지 않아요.
- 체크리스트: 브라우저(`localStorage`)에만 저장하고, 저장이 막혀도 체크는 동작합니다.
- 링크 복사, 공유하기(미지원 브라우저는 링크 복사), 인쇄 / PDF 저장(브라우저 인쇄 기능 사용).
- 인스타그램 앱 안 브라우저에서 열면 외부 브라우저 안내가 나타나요.

넣지 않은 것: 인스타그램 자동 DM, 팔로우 인증, 가입 자격 판정 계산기, 개인정보 입력.
