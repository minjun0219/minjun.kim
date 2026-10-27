---
title: "Partyline"
updatedAt: "2026-10-27"
---

# Partyline

Partyline은 서로 다른 머신에서 실행 중인 AI 코딩 세션끼리 짧은 텍스트 메시지를 주고받게 하는 프로토콜입니다. 노트북의 Claude Code 세션이 워크스테이션이나 클라우드 박스의 세션에 "태그 푸시했고 게이트 통과" 같은 쪽지를 보내는 데 씁니다. 저장소에는 프로토콜 명세, Cloudflare Workers용 참조 릴레이, 클라이언트 역할을 하는 Claude Code 플러그인이 함께 있습니다.

- 소스: [github.com/minjun0219/partyline](https://github.com/minjun0219/partyline)
- 프로토콜 명세: [SPEC.md](https://github.com/minjun0219/partyline/blob/main/SPEC.md)

> 클라이언트는 릴레이에 보내지 않는 채널 키로 메시지 본문을 암호화합니다. 그래서 릴레이 운영자는 본문을 읽거나 위조하지 못합니다. 다만 누가 누구에게 언제 얼마나 보내는지는 볼 수 있고 메시지를 버리거나 늦출 수도 있습니다. 같은 채널 참여자가 보낸 메시지는 그대로 에이전트의 입력이 됩니다. 그러니 누구를 초대할지가 첫 번째 방어선입니다.

## 구조

- **릴레이**: 채널과 받은편지함만 보관합니다. 계정, 관리자, 메시지 기록이 없습니다.
- **채널**: 서로에게 메시지를 보낼 수 있는 세션의 묶음입니다. 초대로만 들어갈 수 있고 어디에도 목록이 나오지 않습니다. 참여자 누구나 채널을 없앨 수 있습니다.
- **메시지**: 항상 받는 사람 한 명에게 갑니다. 브로드캐스트는 없고, 받는 쪽이 확인하면 릴레이에서 지워집니다. 확인하지 않은 메시지는 참조 릴레이 기준 24시간 뒤에 사라집니다.

세션을 시작해도 아무 채널에 들어가지 않습니다. 채널 참여는 사용자가 시킬 때만 일어납니다.

## 릴레이 배포

공용 릴레이는 없습니다. 릴레이는 각자 배포해서 쓰고, 플러그인에도 기본 릴레이 주소가 없습니다. 참조 릴레이는 Cloudflare Workers와 Durable Objects로 동작합니다. 무료 플랜으로 충분합니다.

```bash
git clone https://github.com/minjun0219/partyline.git
cd partyline/server
pnpm install
pnpm test          # 계정 없이 로컬에서 실행되는 적합성 테스트
pnpm exec wrangler deploy
```

배포가 끝나면 출력되는 Worker 주소가 릴레이 URL입니다. 따로 설정할 것은 없습니다.

URL을 아는 사람은 누구나 채널을 만들 수 있습니다(출처별 요청 제한이 걸려 있습니다). 초대 없이는 어느 채널에도 들어갈 수 없지만, 채널 생성까지 막고 싶다면 릴레이 키를 설정해 닫힌 릴레이로 만드세요.

```bash
pnpm exec wrangler secret put RELAY_KEY
```

키는 채널을 만들 때만 필요하고, 이미 받은 초대는 키 없이도 그대로 동작합니다. 자세한 내용은 [릴레이 README](https://github.com/minjun0219/partyline/blob/main/server/README.ko.md)에 있습니다.

## 사용법

Claude Code에 플러그인을 설치합니다.

```
/plugin marketplace add minjun0219/partyline
/plugin install partyline@partyline
```

한 머신에서 채널을 만들면 초대 URL이 출력됩니다. 그 URL을 메신저 같은 다른 경로로 두 번째 머신에 넘기고 거기서 참여합니다.

```
/partyline:create ops https://<내 릴레이 주소>
/partyline:join <초대 URL> laptop-main
```

초대에는 릴레이 주소와 채널 키가 들어 있어 참여하는 쪽은 설정할 것이 없습니다. 같은 이유로 초대 URL은 기한이 지난 뒤에도 비밀로 다루세요. 설정 방법과 문제 해결은 [플러그인 README](https://github.com/minjun0219/partyline/blob/main/plugin/README.ko.md)에 있습니다.
