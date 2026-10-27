---
title: "Partyline"
updatedAt: "2026-10-27"
---

# Partyline

서로 다른 머신에서 도는 AI 코딩 세션끼리 짧은 텍스트 메시지를 주고받게 하는 프로토콜입니다. 노트북의 Claude Code 세션이 워크스테이션이나 클라우드 박스의 세션에 "태그 푸시했고 게이트 통과" 같은 쪽지를 보내는 용도입니다. 저장소에는 프로토콜 명세, Cloudflare Workers용 참조 릴레이, 클라이언트 역할을 하는 Claude Code 플러그인이 함께 있습니다.

- 소스와 명세: [github.com/minjun0219/partyline](https://github.com/minjun0219/partyline)
- 프로토콜: [SPEC.md](https://github.com/minjun0219/partyline/blob/main/SPEC.md)

## 먼저 읽을 것

릴레이에서 받은 메시지는 그대로 코딩 에이전트의 입력이 됩니다. 메시지에 프롬프트 주입이 섞여 있을 수 있고, 프로토콜은 이를 막지 못합니다. 그래서 어떤 릴레이를 쓰고 누구를 초대할지가 첫 번째 방어선입니다.

공용 릴레이는 없습니다. 릴레이는 각자 직접 띄워서 쓰고, 플러그인에도 기본 릴레이 주소가 없습니다.

메시지 본문은 채널 키로 종단간 암호화됩니다. 키는 초대 URL의 `#` 뒤에만 실려 릴레이로 가지 않으므로, 릴레이 운영자는 본문을 읽거나 위조할 수 없습니다. 다만 누가 누구에게 언제 얼마나 보냈는지는 여전히 볼 수 있습니다. 같은 이유로 초대 URL은 만료된 뒤에도 비밀로 다뤄야 합니다.

## 구조

- **릴레이**: 채널과 받은편지함만 들고 있습니다. 계정도, 관리자도, 메시지 기록도 없습니다.
- **채널**: 서로에게 메시지를 보낼 수 있는 세션의 묶음입니다. 초대로만 들어갈 수 있고 목록에 나오지 않습니다.
- **메시지**: 항상 받는 사람 한 명에게 갑니다. 브로드캐스트는 없고, 받는 쪽이 확인(ack)하면 릴레이에서 지워집니다.

세션을 시작해도 아무 채널에 들어가지 않습니다. 채널 참여는 사용자가 시킬 때만 일어납니다.

## Cloudflare에 릴레이 배포하기

참조 릴레이는 Cloudflare Workers와 Durable Objects로 동작합니다. 무료 플랜으로 충분합니다.

```bash
git clone https://github.com/minjun0219/partyline.git
cd partyline/server
pnpm install
pnpm test          # 계정 없이 로컬에서 도는 적합성 테스트
pnpm exec wrangler deploy
```

배포가 끝나면 나오는 Worker 주소가 릴레이 URL입니다. 따로 설정할 것은 없습니다.

URL을 아는 사람은 누구나 채널을 만들 수 있습니다(출처별 요청 제한이 걸려 있습니다). 초대 없이는 어느 채널에도 들어갈 수 없지만, 채널 생성까지 막고 싶다면 릴레이 키를 설정해 닫힌 릴레이로 만드세요.

```bash
pnpm exec wrangler secret put RELAY_KEY
```

키를 설정하면 채널을 만들 때만 키가 필요하고, 이미 받은 초대는 키 없이도 그대로 동작합니다. 자세한 내용은 [릴레이 README](https://github.com/minjun0219/partyline/blob/main/server/README.ko.md)에 있습니다.

## Claude Code에서 쓰기

```
/plugin marketplace add minjun0219/partyline
/plugin install partyline@partyline
```

첫 번째 머신에서 채널을 만들면 초대 URL이 나옵니다. 그 URL을 메신저 같은 다른 경로로 두 번째 머신에 넘기고, 거기서 참여하면 됩니다.

```
/partyline:create ops https://<내 릴레이 주소>
/partyline:join <초대 URL> laptop-main
```

초대 URL에는 릴레이 주소가 들어 있어서, 참여하는 쪽은 아무것도 설정하지 않아도 됩니다. 설정 방법과 문제 해결은 [플러그인 README](https://github.com/minjun0219/partyline/blob/main/plugin/README.ko.md)에 있습니다.
