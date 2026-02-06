## 📘 Documentação Global do Sistema — Facebrasil Next

... (conteúdo anterior mantido) ...

---

## 🧬 Schema Prisma (v1)

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  createdAt     DateTime @default(now())
  profile       Profile?
  subscriptions Subscription[]
  favorites     Favorite[]
  collections   Collection[]
  notifications Notification[]
  analytics     AnalyticsDaily[]
  badges        XPLog[]
  polls         PollVote[]
  quizzes       QuizResponse[]
  communityPosts CommunityPost[]
  communityComments CommunityComment[]
  videoReports  UserVideoReport[]
}

model Profile {
  id        String  @id @default(uuid())
  userId    String  @unique
  name      String?
  avatarUrl String?
  location  String?
  user      User    @relation(fields: [userId], references: [id])
}

model Subscription {
  id        String   @id @default(uuid())
  userId    String
  planId    String
  status    String
  startedAt DateTime
  endsAt    DateTime
  user      User     @relation(fields: [userId], references: [id])
  plan      Plan     @relation(fields: [planId], references: [id])
}

model Plan {
  id           String          @id @default(uuid())
  name         String
  subscriptions Subscription[]
}

model Category {
  id       String    @id @default(uuid())
  name     String
  articles Article[]
}

model Article {
  id           String          @id @default(uuid())
  title        String
  status       String
  categoryId   String
  authorId     String
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  blocks       ArticleBlock[]
  collections  CollectionItem[]
  category     Category        @relation(fields: [categoryId], references: [id])
  author       User            @relation(fields: [authorId], references: [id])
}

model ArticleBlock {
  id        String   @id @default(uuid())
  type      String
  content   Json
  articleId String
  article   Article  @relation(fields: [articleId], references: [id])
}

model Collection {
  id        String          @id @default(uuid())
  name      String
  userId    String
  items     CollectionItem[]
  user      User            @relation(fields: [userId], references: [id])
}

model CollectionItem {
  id          String   @id @default(uuid())
  collectionId String
  articleId    String
  collection   Collection @relation(fields: [collectionId], references: [id])
  article      Article    @relation(fields: [articleId], references: [id])
}

model Favorite {
  id        String   @id @default(uuid())
  userId    String
  articleId String
  user      User     @relation(fields: [userId], references: [id])
  article   Article  @relation(fields: [articleId], references: [id])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  message   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Ad {
  id          String   @id @default(uuid())
  position    String
  region      String?
  impressions AdImpression[]
}

model AdImpression {
  id      String   @id @default(uuid())
  adId    String
  event   String
  createdAt DateTime @default(now())
  ad      Ad      @relation(fields: [adId], references: [id])
}

model AnalyticsDaily {
  id        String   @id @default(uuid())
  userId    String
  articleId String
  views     Int
  date      DateTime
  user      User     @relation(fields: [userId], references: [id])
  article   Article  @relation(fields: [articleId], references: [id])
}

model Badge {
  id    String @id @default(uuid())
  name  String
  icon  String
}

model XPLog {
  id        String   @id @default(uuid())
  userId    String
  type      String
  points    Int
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Mission {
  id          String   @id @default(uuid())
  description String
  points      Int
  active      Boolean
}

model Poll {
  id        String   @id @default(uuid())
  question  String
  options   Json
  createdBy String
}

model PollVote {
  id     String @id @default(uuid())
  pollId String
  userId String
  option String
  user   User   @relation(fields: [userId], references: [id])
}

model Quiz {
  id        String @id @default(uuid())
  title     String
  questions Json
  createdBy String
}

model QuizResponse {
  id       String @id @default(uuid())
  quizId   String
  userId   String
  answers  Json
  user     User   @relation(fields: [userId], references: [id])
}

model CommunityPost {
  id        String @id @default(uuid())
  userId    String
  title     String
  content   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  comments  CommunityComment[]
}

model CommunityComment {
  id        String @id @default(uuid())
  postId    String
  userId    String
  content   String
  createdAt DateTime @default(now())
  post      CommunityPost @relation(fields: [postId], references: [id])
  user      User          @relation(fields: [userId], references: [id])
}

model UserVideoReport {
  id        String @id @default(uuid())
  userId    String
  title     String
  description String
  videoUrl  String
  status    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

---

 **código SQL das tabelas e relacionamentos**.

-- Habilita extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Profile" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID UNIQUE REFERENCES "User"(id),
  name TEXT,
  avatarUrl TEXT,
  location TEXT
);

CREATE TABLE "Plan" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

CREATE TABLE "Subscription" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES "User"(id),
  planId UUID REFERENCES "Plan"(id),
  status TEXT NOT NULL,
  startedAt TIMESTAMP,
  endsAt TIMESTAMP
);

CREATE TABLE "Category" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

CREATE TABLE "Article" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  categoryId UUID REFERENCES "Category"(id),
  authorId UUID REFERENCES "User"(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "ArticleBlock" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  content JSON NOT NULL,
  articleId UUID REFERENCES "Article"(id)
);

CREATE TABLE "Collection" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  userId UUID REFERENCES "User"(id)
);

CREATE TABLE "CollectionItem" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collectionId UUID REFERENCES "Collection"(id),
  articleId UUID REFERENCES "Article"(id)
);

CREATE TABLE "Favorite" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES "User"(id),
  articleId UUID REFERENCES "Article"(id)
);

CREATE TABLE "Notification" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES "User"(id),
  message TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Ad" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position TEXT,
  region TEXT
);

CREATE TABLE "AdImpression" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adId UUID REFERENCES "Ad"(id),
  event TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "AnalyticsDaily" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES "User"(id),
  articleId UUID REFERENCES "Article"(id),
  views INTEGER,
  date DATE
);

CREATE TABLE "Badge" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  icon TEXT
);

CREATE TABLE "XPLog" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES "User"(id),
  type TEXT,
  points INTEGER,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Mission" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT,
  points INTEGER,
  active BOOLEAN
);

CREATE TABLE "Poll" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT,
  options JSON,
  createdBy TEXT
);

CREATE TABLE "PollVote" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pollId UUID REFERENCES "Poll"(id),
  userId UUID REFERENCES "User"(id),
  option TEXT
);

CREATE TABLE "Quiz" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  questions JSON,
  createdBy TEXT
);

CREATE TABLE "QuizResponse" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quizId UUID REFERENCES "Quiz"(id),
  userId UUID REFERENCES "User"(id),
  answers JSON
);

CREATE TABLE "CommunityPost" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES "User"(id),
  title TEXT,
  content TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "CommunityComment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  postId UUID REFERENCES "CommunityPost"(id),
  userId UUID REFERENCES "User"(id),
  content TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "UserVideoReport" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES "User"(id),
  title TEXT,
  description TEXT,
  videoUrl TEXT,
  status TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);


---

## 🗓️ Cronograma de Desenvolvimento — Fases e Milestones

### 🧩 Fase 1 — Infraestrutura e MVP Base (Semanas 1 a 4)

* Setup de projeto Next.js 14 + Tailwind + Shadcn-UI + Clerk + Supabase + Stripe
* Criação de usuários, perfis e planos
* CRUD de artigos com editor WYSIWYG
* Pipeline de publicação com IA
* Sistema de assinatura (Free/Pro) com Stripe
* Deploy e preview com Vercel
* ✅ *Milestone*: Primeira publicação no painel do franqueado

### 📱 Fase 2 — Experiência Mobile e Feed (Semanas 5 a 7)

* Implementação do feed contínuo com swipe
* Leitor otimizado PWA + IndexedDB
* Componente Audiocast TTS com caching
* Modo leitura noturna offline
* Busca semântica com IA
* ✅ *Milestone*: Navegação mobile 100% funcional

### 🧠 Fase 3 — IA e Editor Virtual (Semanas 8 a 9)

* API de chat com contexto por artigo
* Memória por sessão e assistente global
* Componente flutuante (mobile) e fixo (desktop)
* ✅ *Milestone*: Editor responde com base em artigo + preferências

### 🎮 Fase 4 — Gamificação e Analytics (Semanas 10 a 11)

* Badges, XP, missões, ranking (local/global)
* Painel de Analytics para autores e franqueados
* Dashboard in-app com gráficos e exportação CSV
* ✅ *Milestone*: XP acumulando e missões ativas

### 🧩 Fase 5 — Ads e Expansões (Semanas 12 a 13)

* Slots de anúncios dinâmicos (inline, fixos, locais)
* Relatórios de impressões e cliques
* Página Comunidade + Você é o Repórter
* Widget de enquete/quiz embutido no editor
* ✅ *Milestone*: Campanha local criada por franqueado

### 🚀 Fase Final — Testes, Polimento e Go-live (Semanas 14 a 15)

* Testes E2E, performance (LCP, CLS), acessibilidade
* Documentação final (FAQ, vídeos tutoriais, admins)
* ✅ *Milestone*: Go-live com tracking ativo e primeiros usuários reais

---

✅ Documentação concluída! Todos os componentes estratégicos, técnicos e operacionais estão prontos para guiar o desenvolvimento do Facebrasil Next.
Se quiser, posso gerar versões PDF e organizar em pastas para entrega ao time.

