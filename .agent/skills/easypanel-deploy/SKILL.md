Abaixo está uma **SKILL completa** no formato pronto para uso em agentes/geradores (Antigravity, Copilot, etc.).
Nome: **easypanel-deploy**

Ela contém **boas práticas reais para deploy em VPS com Easypanel Free**, incluindo Docker, Next.js, Supabase, segurança e troubleshooting.

---

# 🧠 SKILL — `easypanel-deploy`

## 🎯 Objetivo

Preparar, estruturar e executar **deploys seguros e estáveis** em VPS usando **Easypanel versão Free**, com foco em:

* Next.js / Node apps
* Supabase
* APIs
* automações
* micro-serviços Docker
* ambientes de produção reais

---

# 🧭 Filosofia da Skill

Esta skill assume que:

* Easypanel Free = ambiente single server
* sem autoscaling
* sem multi-node
* sem secrets manager avançado
* foco em estabilidade e previsibilidade

Portanto, a abordagem é:

**build estável → runtime seguro → logs claros → rollback simples**

---

# 🏗️ Estrutura recomendada da VPS

## Requisitos mínimos

| Recurso | Mínimo |
| ------- | ------ |
| RAM     | 4GB    |
| CPU     | 2 vCPU |
| SSD     | 40GB   |
| Swap    | 4GB    |

---

## Estrutura de serviços

```
VPS
 ├── Easypanel
 │   ├── apps (Next, Node, APIs)
 │   ├── workers
 │   ├── cron jobs
 │   └── volumes
 ├── Reverse proxy (Traefik interno)
 └── Docker network
```

---

# 🔐 SEGURANÇA (CRÍTICO)

## NUNCA fazer

❌ passar secrets no Docker build
❌ usar NEXT_PUBLIC para chaves privadas
❌ expor service_role do Supabase
❌ usar senha root padrão
❌ expor portas desnecessárias

---

## SEMPRE fazer

✔ usar `.env runtime`
✔ firewall ativo
✔ swap ativo
✔ backups
✔ log rotation
✔ healthchecks

---

# 🧱 Estrutura ideal de projeto

```
project/
 ├── Dockerfile
 ├── .dockerignore
 ├── package.json
 ├── next.config.js
 ├── src/
 └── public/
```

---

# 🐳 Dockerfile padrão (Next.js)

```Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app ./

EXPOSE 3000

CMD ["npm","start"]
```

---

# 🚨 REGRA DE OURO

Secrets NÃO entram no build.

Nunca use:

```
--build-arg SECRET
```

Use runtime env no Easypanel.

---

# ⚙️ Variáveis de ambiente

## Corretas

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
OPENAI_KEY
CLERK_SECRET_KEY
```

## Erradas

```
NEXT_PUBLIC_SERVICE_ROLE
NEXT_PUBLIC_DB_PASSWORD
```

---

# 📦 Configuração no Easypanel

## 1. Criar app

Easypanel → New Project → App

Tipo: Dockerfile

---

## 2. Build settings

```
Build context: /
Dockerfile: Dockerfile
```

---

## 3. Environment variables (runtime)

Adicionar:

```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Nunca colocar secrets no build args.

---

# 🌐 Portas

Next.js padrão:

```
3000
```

Easypanel fará proxy automático.

---

# 🧠 Deploy Strategy

## Sempre usar

### 1. Build local antes

```bash
docker build .
```

### 2. Testar container

```bash
docker run -p 3000:3000 image
```

### 3. Só depois subir no Easypanel

---

# 🧪 Healthcheck recomendado

Dockerfile:

```Dockerfile
HEALTHCHECK CMD wget -qO- http://localhost:3000 || exit 1
```

---

# 🧾 Logs

No Easypanel:

```
App → Logs
```

Se crash:

```
docker logs container
```

---

# 💾 Volumes persistentes

Usar para:

* uploads
* storage
* sqlite
* cache

Nunca para:

* node_modules
* build

---

# 🔁 Atualizações

Fluxo seguro:

```
git pull
redeploy
```

Nunca:

```
docker exec
```

---

# 🚀 Performance tuning

## Node

```
NODE_OPTIONS=--max-old-space-size=1024
```

## Swap

```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

---

# 🧩 Supabase integração

## Nunca usar no build

```
fetch supabase during build
```

Use runtime.

---

# 🔒 Banco externo

Se Supabase cloud:

```
DATABASE_URL=postgresql://...
```

---

# 🔄 Backup strategy

Diário:

```
pg_dump
```

Arquivos:

```
rsync
```

---

# 📊 Monitoramento

Recomendado:

* Uptime Kuma
* Netdata
* Grafana (opcional)

---

# 🛠️ Troubleshooting

## Build falha

Ver:

```
npm run build
```

## App reinicia

Ver:

```
memory
logs
```

## 502 error

Ver:

```
porta
healthcheck
```

---

# 🧠 Padrões de arquitetura

## Estrutura ideal Easypanel Free

```
VPS
 ├── app-next
 ├── api
 ├── n8n
 ├── redis
 └── postgres (opcional)
```

---

# 🔐 Hardening

```bash
ufw enable
ufw allow 22
ufw allow 80
ufw allow 443
```

---

# 📦 Multi-app deploy

1 VPS = até 10 apps leves

Se mais → dividir VPS.

---

# 🧬 Estratégia profissional

Produção real:

```
VPS1 → apps
VPS2 → banco
VPS3 → automações
```

---

# 🤖 Automação futura

Integrar com:

* GitHub Actions
* N8N
* Webhooks

---

# 🧱 Template de projeto

Criar:

```
easypanel-template
```

com:

* Dockerfile
* .env.example
* README
* healthcheck

---

# 🧠 Comportamento esperado do agente

Quando usar esta skill, o agente deve:

1. Validar Dockerfile
2. Validar env vars
3. Checar portas
4. Checar logs
5. Sugerir melhorias
6. Detectar risco de segurança
7. Otimizar deploy

---

# 🏁 Resultado esperado

Após usar esta skill:

✔ deploy estável
✔ build previsível
✔ secrets seguros
✔ rollback simples
✔ logs claros

---

# 📌 Versão

```
skill: easypanel-deploy
version: 1.0
compat: easypanel free
```

---


