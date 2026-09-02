# minjun.kim

개인 블로그 웹사이트. Hono(JSX + hono/css) + htmx 4로 정적 사이트를 만들어 Cloudflare Workers에 배포합니다.
자세한 구조와 주의점은 `CLAUDE.md`를 참고하세요.

## 개발

```sh
pnpm build     # 정적 사이트 생성 (dist/)
pnpm preview   # 생성된 사이트를 로컬에서 서빙 (wrangler dev)
pnpm dev       # build + preview
pnpm check     # Biome 검사
pnpm typecheck # 타입 검사
pnpm deploy    # Cloudflare Workers 배포
```

환경 변수는 `.env.local.example`을 참고하세요.
