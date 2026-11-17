<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Git / GitHub

- Sempre enviar as alterações para o GitHub ao concluir cada tarefa que modifique arquivos do projeto.
- Antes do commit, rodar `npx tsc --noEmit` e só enviar se não houver erros.
- Fluxo: `git add -A` → `git commit -m "<mensagem descritiva em português>"` → `git push origin main`.
- Remote: `origin` = https://github.com/gustavohen99/gcstudio.git (branch `main`).
- Nunca commitar arquivos `.env*` ou segredos (já ignorados pelo `.gitignore`).
- Informar ao usuário o resultado do push ao final da resposta.
