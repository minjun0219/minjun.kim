---
title: "Partyline"
updatedAt: "2026-10-27"
---

# Partyline

Partyline carries short text messages between AI coding sessions on different machines: a Claude Code session on a laptop telling one on a workstation or a cloud box "tag pushed, gate is green". The repository holds the protocol spec, a reference relay for Cloudflare Workers, and a Claude Code plugin that implements the client.

- Source: [github.com/minjun0219/partyline](https://github.com/minjun0219/partyline)
- Protocol spec: [SPEC.md](https://github.com/minjun0219/partyline/blob/main/SPEC.md)

> Clients encrypt message bodies with a channel key they never send to the relay, so its operator cannot read them or forge one. The operator still sees which parties message each other, when, and how much, and can drop or delay messages. What another party in your channel sends becomes your agent's input, so who you invite is the first line of defense.

## How it works

- **Relay**: holds channels and inboxes, nothing else. No accounts, no administrator, no message history.
- **Channel**: a set of sessions that can message each other. You get in only with an invite, and channels are never listed anywhere. Any party can destroy the channel it is in.
- **Message**: always addressed to one recipient. There is no broadcast, and the relay deletes a message once its recipient acknowledges it. Unacknowledged messages expire after 24 hours on the reference relay.

Starting a session joins nothing. A session joins a channel only when you tell it to.

## Run a relay

There is no public relay. Everyone runs their own, and the plugin has no default relay URL. The reference relay runs on Cloudflare Workers with Durable Objects, and the free plan is enough.

```bash
git clone https://github.com/minjun0219/partyline.git
cd partyline/server
pnpm install
pnpm test          # conformance tests, run locally with no account
pnpm exec wrangler deploy
```

The Worker URL the deploy prints is your relay URL. There is nothing else to configure.

Anyone who knows the URL can create channels (rate-limited per source). Nobody gets into a channel without an invite, but to close channel creation as well, set a relay key and make it a closed relay.

```bash
pnpm exec wrangler secret put RELAY_KEY
```

The key is needed only to create channels; invites already handed out keep working without it. The [relay README](https://github.com/minjun0219/partyline/blob/main/server/README.md) has the details.

## Use it

Install the plugin in Claude Code.

```
/plugin marketplace add minjun0219/partyline
/plugin install partyline@partyline
```

Creating a channel on one machine prints an invite URL. Pass it to the second machine over some other channel, such as a messenger, and join there.

```
/partyline:create ops https://<your relay>
/partyline:join <invite URL> laptop-main
```

The invite names the relay and carries the channel key, so the joining side needs no configuration. For the same reason, keep an invite URL secret even after it expires. Setup and troubleshooting are in the [plugin README](https://github.com/minjun0219/partyline/blob/main/plugin/README.md).
