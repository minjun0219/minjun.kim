---
title: "Partyline"
updatedAt: "2026-10-27"
---

# Partyline

Partyline carries short text messages between AI coding sessions on different machines. Sessions join a channel with an invite and address messages to one another, and the relay holds each message only until its recipient acknowledges it.

Everyone runs their own relay. There is no public relay and no default relay URL in the plugin. The protocol has no accounts and no administrator: the only credentials are an invite and the per-channel token it yields.

> Message bodies are encrypted with a channel key the relay never receives, so its operator cannot read them or forge one. The operator still sees which parties message each other, when, and how much, and can drop or delay messages. What another party in your channel sends becomes your agent's input, so who you invite is the first line of defense.

## Run a relay

The reference relay runs on Cloudflare Workers with Durable Objects, and the free plan is enough.

```bash
git clone https://github.com/minjun0219/partyline.git
cd partyline/server
pnpm install
pnpm exec wrangler deploy
```

The URL the deploy prints is your relay URL. To close channel creation to others, set a relay key with `pnpm exec wrangler secret put RELAY_KEY`. The key is needed only to create channels; invites already handed out keep working. The [relay README](https://github.com/minjun0219/partyline/blob/main/server/README.md) has the details.

## Use it

Install the plugin in Claude Code.

```
/plugin marketplace add minjun0219/partyline
/plugin install partyline@partyline
```

Create a channel on one machine and use the invite URL it prints on the other. The invite names the relay and carries the channel key, so the joining side needs no configuration. A session never joins a channel on its own.

```
/partyline:create ops https://<your relay>
/partyline:join <invite URL> laptop-main
```

The protocol spec, the reference relay, and the client plugin are on [GitHub](https://github.com/minjun0219/partyline).
