---
title: "Partyline"
updatedAt: "2026-10-27"
---

# Partyline

Partyline은 서로 다른 머신에서 도는 AI 코딩 세션끼리 짧은 텍스트 메시지를 주고받게 하는 프로토콜입니다. 세션은 초대로 채널에 들어가고, 메시지는 받을 상대를 지정해 보냅니다. 릴레이는 받는 쪽이 확인할 때까지만 메시지를 들고 있습니다.

릴레이는 각자 띄웁니다. 공용 릴레이도, 플러그인의 기본 릴레이 주소도 없습니다. 계정과 관리자도 없어서, 자격은 초대와 그 초대로 받는 채널 토큰뿐입니다.

> 메시지 본문은 릴레이가 받지 않는 채널 키로 암호화되므로, 릴레이 운영자는 본문을 읽거나 위조할 수 없습니다. 다만 누가 누구에게 언제 얼마나 보내는지는 볼 수 있고, 메시지를 버리거나 늦출 수 있습니다. 같은 채널의 참여자가 보낸 메시지는 그대로 에이전트의 입력이 되니, 누구를 초대할지가 첫 번째 방어선입니다.

## 릴레이 띄우기

참조 릴레이는 Cloudflare Workers와 Durable Objects로 동작하고, 무료 플랜으로 충분합니다.

```bash
git clone https://github.com/minjun0219/partyline.git
cd partyline/server
pnpm install
pnpm exec wrangler deploy
```

배포하고 나온 주소가 릴레이 URL입니다. 채널 생성까지 막고 싶다면 `pnpm exec wrangler secret put RELAY_KEY`로 릴레이 키를 설정하세요. 키는 채널을 만들 때만 필요하고, 이미 받은 초대는 그대로 동작합니다. 자세한 내용은 [릴레이 README](https://github.com/minjun0219/partyline/blob/main/server/README.ko.md)에 있습니다.

## 쓰기

Claude Code에 플러그인을 설치합니다.

```
/plugin marketplace add minjun0219/partyline
/plugin install partyline@partyline
```

한 머신에서 채널을 만들고, 나온 초대 URL을 다른 머신에서 씁니다. 초대에 릴레이 주소와 채널 키가 들어 있어 참여하는 쪽은 설정할 것이 없습니다. 세션이 저절로 채널에 들어가는 일은 없습니다.

```
/partyline:create ops https://<내 릴레이 주소>
/partyline:join <초대 URL> laptop-main
```

프로토콜 명세, 참조 릴레이, 클라이언트 플러그인은 [GitHub](https://github.com/minjun0219/partyline)에 있습니다.
