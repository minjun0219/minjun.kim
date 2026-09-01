# minjun.kim

개인 블로그 웹사이트. Hono + htmx로 정적 사이트를 만들어 Cloudflare Workers에 배포합니다.

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
