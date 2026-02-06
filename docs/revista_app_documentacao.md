# 📘 Documentação Técnica Completa — Projeto MyFacebrasil

Esta documentação tem como objetivo servir como guia completo para a implementação da nova versão multiplataforma da revista Facebrasil, com funcionalidades detalhadas, infraestrutura técnica, plano de monetização e sistema de franquias.

---

## 📁 Índice Geral

1. Introdução Geral do Projeto
2. Arquitetura Técnica e Tecnologias
3. Estrutura de Planos e Perfis de Usuário
4. Funcionalidades Completas por Plano
5. Sistema de Edição de Conteúdo
6. Plataforma de Anúncios – AddFacebrasil
7. Gamificação e Recompensas
8. Franquias Facebrasil – Estrutura Técnica e Comercial
9. Estratégia de Lançamento e Tráfego Pago
10. Modelos de Monetização
11. Banco de Dados e Tabelas
12. Considerações Finais

---

## 1. Introdução Geral do Projeto

A **MyFacebrasil** é a evolução da tradicional revista Facebrasil, trazendo uma experiência de leitura inteligente, personalizável e interativa. O app estará disponível para Web, Android e iOS, com integração ao Instagram, YouTube, Google Ads e IA editorial.

---

## 2. Arquitetura Técnica e Tecnologias

| Camada               | Tecnologias Utilizadas                            |
| -------------------- | ------------------------------------------------- |
| Frontend             | Vite + React + TailwindCSS                        |
| Backend/Auth         | Supabase (Auth, Storage, Edge Functions)          |
| PDF & Exportação     | `react-pdf`, `html2pdf.js` (fallback)             |
| Armazenamento Local  | IndexedDB via LocalForage                         |
| Automação            | n8n + Zapier (opcional)                           |
| IA Editorial         | Ollama local, Groq API, HuggingFace, OpenRouter   |
| Analytics            | Supabase Analytics + Google Analytics (GA4 + UTM) |
| Integrações Externas | Instagram API, YouTube Data API, Google Ads       |

---

## 3. Estrutura de Planos e Perfis de Usuário

### 🆓 Free — Leitores Recorrentes

- Leitura offline
- Favoritos e coleções
- Histórico de leitura
- Comentários limitados
- Notificações personalizadas
- Mini-dashboard
- Pontuação simples por leitura

### 💎 PRO — Usuários Avançados (R\$9,90/mês)

- Todos os recursos do plano Free +
- My Daily Clipping
- Audiocasts com vozes TTS
- Anotações, destaques e exportação
- Quiz semanal
- Níveis de engajamento (Bronze → Ouro)
- Sugestões inteligentes via IA
- Ranking mensal por engajamento

### 🏢 PREMIUM — Franquias (R\$499 anuais + R\$99/mês)

- Edições personalizadas com conteúdo local
- Capa customizável e colunistas regionais
- QR Code + domínio exclusivo
- Curadoria automatizada por região
- Editor Virtual Local
- Gestão de anunciantes locais
- Academia do Franqueado
- Ranking e gamificação por desempenho

---

## 4. Funcionalidades Completas por Plano

Cada funcionalidade da plataforma será entregue como um componente modular em React, com controle de acesso por nível de usuário (Free, PRO, Premium/Franquia) e integração nativa com o Supabase para persistência e segurança. Abaixo estão os recursos detalhados por plano, com explicações de como cada um se encaixa no ecossistema da MyFacebrasil.

---

### 🆓 Funcionalidades Free (usuários cadastrados gratuitos)

1. **`ArticleReader`** — Componente de leitura com controle de progresso e ajuste de fonte. Ao concluir a leitura, gera pontos e atualiza o histórico.
2. **`FavoritesManager`** — Sistema de favoritar artigos e organizá-los por categorias personalizadas ou tags próprias.
3. **`NotificationsCenter`** — Entrega push ou e-mail com base nas categorias seguidas e localização do usuário.
4. **`ReadingHistoryDashboard`** — Mostra o que foi lido, com gráficos simples e tempo de leitura total.
5. **`SEOHelper`**** (modo básico)** — Sugestões de palavras-chave e legibilidade dos textos salvos no Notion.
6. **`CommentBox`** — Sistema de comentários limitado a 3 interações por dia, com moderação automática por IA e relatório para os editores.
7. **`MiniGamificationBar`** — Exibe nível atual, barra de XP e alertas de nova conquista (limitado a pontos por leitura).

---

### 💎 Funcionalidades PRO (assinatura mensal)

1. **`MyDailyClipping`** — Algoritmo que gera um resumo diário com 3 a 5 artigos curados com base nas categorias favoritas do usuário.
2. **`AudioPlayer`** — Narrador de artigos em português e inglês com seleção de voz e velocidade, usando ElevenLabs ou Polly.
3. **`CollectionManager`** — Permite criar coleções temáticas (ex: Empreendedorismo, Saúde) com pastas visuais para leitura sequencial.
4. **`HighlightEditor`** — Ferramenta para destacar trechos dos artigos e adicionar notas pessoais visíveis apenas ao usuário.
5. **`EnhancedGamificationEngine`** — Desbloqueio de conquistas por tempo de leitura, cliques em quiz, destaque de frases, etc.
6. **`IntelligentContentRecommender`** — IA sugere artigos com base no comportamento de navegação e engajamento.
7. **`WeeklyThematicQuiz`** — Quiz gamificado com temas relacionados aos artigos da semana, recompensando com pontos extras.
8. **`EvernoteExporter`** — Exporta coleções ou destaques diretamente para Notion ou Evernote com integração via API.

---

### 🏢 Funcionalidades Exclusivas para Franquias (plano Premium)

1. **`CustomEditionBuilder`** — Criador visual de revistas digitais com seleção de artigos, matérias locais, ordem e capa.
2. **`LocalContentManager`** — Sistema de postagem de notícias locais com curadoria automatizada por IA e manual.
3. **`FranchiseAnalyticsDashboard`** — Painel de leitura, QR scan, tempo médio por edição, cliques em anúncios locais.
4. **`FranchiseEditorBot`** — IA treinada com base de conteúdo local + central, capaz de sugerir títulos, corrigir texto e planejar edição.
5. **`AdvertiserManager`** — Ferramenta para cadastro e controle de banners locais, com faturas automáticas e histórico de inserções.
6. **`BrandedDistributionTool`** — Geração de domínio customizado (ex: orlando.facebrasil.com) + QR Code + link com UTM.
7. **`FranchiseGamificationCenter`** — Ranking entre franquias com base em audiência, qualidade editorial e inserções publicitárias.
8. **`FranchiseTrainingHub`** — Acesso a vídeos, modelos de edição e boas práticas em publicação digital para capacitação contínua.

---

Cada uma dessas funcionalidades está conectada a um objetivo maior: aumentar o tempo de permanência, melhorar a experiência de leitura, fortalecer o branding local, automatizar tarefas editoriais e monetizar com inteligência.

Todas serão controladas por roles (`user`, `pro`, `franchisee`, `admin`) definidos no Supabase e orquestradas por lógica condicional em interfaces contextuais com suporte para mobile, tablet e desktop.

Cada funcionalidade terá seu próprio componente React e integração com Supabase.

### Funcionalidades Free e PRO

- `ArticleReader` → leitura com controle de progresso
- `FavoritesManager` → salvar e classificar artigos
- `AudioPlayer` → TTS por artigo
- `DailyClipping` → algoritmo de resumo por categoria
- `HighlightEditor` → editor de trechos + comentários
- `SEOHelper` → análises básicas ou profundas por IA
- `GamifiedStats` → pontos, níveis e ranking

### Funcionalidades para Franquias

- `CustomEditionBuilder` → editor visual de edições
- `LocalContentManager` → matérias e eventos locais
- `FranchiseAnalytics` → leitura, cliques e QR tracking
- `FranchiseEditorBot` → IA exclusiva com dados locais
- `AdvertiserManager` → gestão de anunciantes e inserção de banners

---

## 5. Sistema de Edição de Conteúdo

O sistema de edição de conteúdo da plataforma MyFacebrasil foi projetado para atender três perfis principais: leitores que salvam destaques e interagem com artigos, editores (colaboradores ou parceiros), e franqueados que produzem edições completas. Todo o fluxo é sustentado por uma interface intuitiva e modular baseada em componentes React, com persistência no Supabase e recursos avançados de colaboração e automação.

### 🗂️ Tipos de Conteúdo

1. **Artigos do Acervo Principal:**

   - Criados pela equipe Facebrasil central
   - Disponibilizados para leitura, seleção por franquias e recomendação por IA

2. **Artigos Locais (Franquias):**

   - Produzidos por franqueados ou editores convidados
   - Com sinalização da origem e curadoria editorial descentralizada

3. **Posts Multimídia e Interativos:**

   - Suporte a imagens, vídeos curtos, embed de YouTube, Reels, Spotify, etc.
   - Ideais para newsletters, drops de tendências, eventos locais

4. **Conteúdos Automatizados:**

   - Criados por inteligência artificial a partir de títulos, temas ou palavras-chave
   - Validados por humanos antes da publicação

### 🧾 Editor Visual — `EditorRichText`

Um editor rico com suporte a:

- **WYSIWYG e Markdown**: adaptável ao perfil do usuário
- **Modo de Destaque**: para leitura segmentada e foco em trechos curtos
- **Inserção de mídias** (drag and drop ou embed)
- **Comentários lado a lado**: no estilo Google Docs
- **Histórico de versões com comparação**

Tecnologias envolvidas:

- React + Tailwind + TipTap / Draft.js
- Supabase Storage para arquivos
- Algoritmo de "auto-format" baseado em regras de escaneabilidade

### 🔁 Workflow Editorial

- **Rascunho → Revisão → Publicado**
  - Cada status é controlado por regras de permissão
  - Revisores PRO e administradores podem publicar diretamente
- **Notificações automatizadas** via n8n para mudanças de status ou comentários
- **Link compartilhável** com tempo de expiração para revisão externa

### 🔐 Modos de Acesso e Segurança

- Role-based (user, pro, franchisee, admin)
- Controle por franquia (multi-tenant)
- RLS no Supabase garante que só quem criou ou administra possa editar

### 📤 Exportações e Publicações

- Exportação como **PDF (via react-pdf)**
- Exportação como **Notion page** (via API)
- Opção de **agendamento** da publicação via painel (n8n + Supabase schedule)
- Criação de versão impressa para edições com +10 artigos (composição automática)

### 🔧 Componentes do Sistema

- `<ArticleEditor />` – editor visual completo com modos colaborativo e solo
- `<CollaboratorComments />` – comentários laterais, sugestões
- `<MediaUploader />` – upload de imagens e vídeos
- `<VersionControl />` – histórico e comparador de versões
- `<ArticlePreview />` – renderização responsiva
- `<EditorPanel />` – gestão de status, datas e exportações

### 📊 Métricas e Performance Editorial

- Visualizações totais por artigo e por autor
- Tempo médio de leitura
- Quantidade de destaques salvos
- Interações por parágrafo (IA + heatmap)

### 📚 Integração com IA

- **Assistente de Escrita:** reestrutura parágrafos, sugere melhorias
- **Geração de Conteúdo:** esboço automático com base em título e tema
- **Transformação de Estilo:** adapta para estilo jornalístico, leve, institucional, etc.
- **Sugestões de Pauta** com base nas tendências locais, datas comemorativas e interesses do público regional

Essa engrenagem editorial conecta produção colaborativa, automação e curadoria em múltiplos níveis, permitindo escalar conteúdo com qualidade, engajamento e governança. É a espinha dorsal da plataforma.

### Tipos de Conteúdo

- Artigos do acervo
- Artigos locais (franquia)
- Posts multimídia
- Clipping automatizado

### Editor Visual

- `EditorRichText` → Suporte a Markdown/WYSIWYG
- Modo colaborativo com comentários e sugestões
- Workflow de revisão: rascunho → revisão → publicado
- Exportação PDF/HTML com `react-pdf`

---

## 6. Plataforma de Anúncios — AddFacebrasil

O módulo **AddFacebrasil** é o núcleo de monetização direta da plataforma MyFacebrasil. Ele permite a gestão de anúncios digitais (web/app) e físicos (revista PDF), com painéis personalizados para administradores, anunciantes e integração com a gamificação de leitores.

### 📌 Visão Geral

- Permite a inserção, ativação e rastreamento de anúncios por local, categoria ou edição
- Integração com o sistema de recompensas dos leitores (Faceta)
- Inserção automatizada em locais predefinidos do app (AdInjector)
- Relatórios completos por campanha e por anunciante

### 🔐 Painel Administrativo

**Usuários com role ****`admin`**** terão acesso ao painel completo.**

**Funcionalidades:**

- **Cadastro e edição de formatos de anúncios**: Banner, nativo, pop-up, intersticial
- **Associação de anúncios** a: artigos, categorias, home, páginas especiais
- **Upload de mídia**: Suporte a imagens (.png, .jpg) e vídeos curtos (.mp4)
- **Inserção manual** na revista impressa (via PDF)
- **Agendamento**: datas de início e fim da veiculação
- **Painel de controle visual** com:
  - Total de views e cliques por anúncio
  - CTR médio por local
  - Anúncios mais performáticos por seção
  - Exportação de relatórios (.csv, .pdf)

### 🧑‍💼 Painel do Anunciante

**Usuários com role ****`advertiser`**** terão acesso a uma versão simplificada e personalizada.**

**Funcionalidades:**

- **Visualizar seus anúncios** (ativos, expirados, pendentes)
- **Ver estatísticas detalhadas**: impressões, cliques, locais, período
- **Solicitar renovação** ou alteração de mídia
- **Solicitar inserção impressa** (via botão de requisição direta)
- **Visualizar faturas e histórico de campanhas**

### ⚙️ Funcionamento Técnico

#### Banco de Dados (Supabase)

Tabelas principais:

```sql
ads
ad_views
ad_clicks
advertisers
ad_rewards
```

Cada ação relevante (view, clique, recompensa) é registrada por edge function.

#### Automação (n8n)

- Agendamento de campanhas
- Envio de alertas de fim de campanha ou novo anúncio
- Geração automática de faturas
- Integração com Stripe (fase 2) para pagamento por CPM ou CPC

#### Componentes React

- `<AdManager />` — Painel administrativo
- `<AdvertiserDashboard />` — Painel dos anunciantes
- `<AdForm />` — Criação/edição de anúncios
- `<AdPreview />` — Visualização de campanha
- `<AdStats />` — Estatísticas detalhadas
- `<AdInjector location="home_top" />` — Componente que injeta o anúncio na interface

### 🧠 Integração com Gamificação

A integração entre o sistema de anúncios (AddFacebrasil) e a gamificação é um diferencial estratégico do projeto. Ela transforma a interação dos usuários com conteúdos patrocinados em uma experiência recompensadora, educativa e divertida, incentivando o engajamento recorrente com a plataforma e aumentando o valor entregue aos anunciantes.

### Como funciona na prática:

1. **Coleta de interações**:

   - Cada vez que um anúncio é visualizado por um usuário (com tempo mínimo de exibição), uma função de borda registra esse evento em `ad_views`.
   - Se o usuário clicar no anúncio, o clique é registrado em `ad_clicks` e avaliado por IP e timing para garantir que não é repetido.

2. **Conversão em pontos Faceta**:

   - A cada 5 visualizações únicas, o sistema gera 1 ponto (registrado em `ad_rewards`).
   - Cada clique válido gera 3 pontos.
   - Pontuações bônus são atribuídas em campanhas sinalizadas com `bonus_enabled = true` na tabela `ads`.

3. **Exibição ao usuário**:

   - O componente `<MiniGamificationBar />` ou `<GamifiedStats />` é atualizado em tempo real com as conquistas do usuário.
   - Notificações personalizadas (push/email) são enviadas ao completar desafios ou resgatar prêmios.

4. **Loja de Recompensas e Desafios**:

   - Os pontos acumulados podem ser trocados na loja virtual (`reward_store`) por:
     - Artigos exclusivos
     - PDF de edições especiais sem anúncios
     - Cupons de desconto de parceiros
     - Participação em sorteios temáticos
   - Desafios semanais ativam metas como "Visualizar 10 anúncios de diferentes categorias" ou "Clicar em 3 anúncios locais", com bônus de 10 a 20 pontos.

5. **Leaderboard e Reconhecimento Público**:

   - Um ranking mensal é exibido por cidade, estado ou geral, premiando os usuários mais ativos com selos visuais e destaque no perfil.

6. **Integração Técnica**:

   - Todas as funções são realizadas com Supabase Edge Functions (view, click, reward)
   - n8n é usado para disparar notificações, gerar relatórios e rodar sorteios automaticamente

7. **Governança e Segurança**:

   - Os pontos são acumulados apenas se o usuário estiver logado
   - Há limites diários e validações por IP/device para evitar fraudes
   - Logs são armazenados por 6 meses e podem ser exportados em .csv para auditoria

Essa mecânica de gamificação transforma os anúncios em uma ferramenta de fidelização e torna o usuário parte ativa do modelo de negócios, ampliando o valor percebido da experiência editorial. visualização válida ou clique em anúncio pode render pontos ao usuário (Faceta), registrados na tabela `ad_rewards`. Os pontos acumulados podem ser trocados por recompensas na loja virtual, integrando engajamento com monetização.

**Mecânica Recomendada:**

- 1 ponto a cada 5 visualizações únicas
- 3 pontos por clique real (sem repetição por IP em 24h)
- Bônus por campanhas patrocinadas (via flag na tabela `ads`)

### 🔒 Segurança e Governança

A camada de segurança e governança do MyFacebrasil é essencial para garantir integridade, privacidade, controle de acesso e confiabilidade em todas as operações — especialmente nos módulos de anúncios, gamificação, edição colaborativa e franquias.

### 🔐 Autenticação e Controle de Acesso

- Implementada via **Supabase Auth** com autenticação por e-mail/senha, Google e OAuth social.
- Papéis de usuário (`user`, `pro`, `franchisee`, `admin`) controlam o acesso a funcionalidades e componentes do app.
- Middleware personalizado no frontend e políticas no backend restringem ações específicas (como editar anúncios ou exportar PDF).

### 🧱 Row-Level Security (RLS)

- Toda tabela sensível no Supabase possui políticas RLS ativas.
- Exemplos:
  - Um anunciante visualiza apenas seus próprios anúncios e estatísticas.
  - Um franqueado acessa apenas conteúdos vinculados ao seu `franchise_id`.
  - Um editor só vê e edita artigos que criou ou recebeu permissão.

### 📑 Auditoria e Logs

- Toda ação administrativa crítica (criação, edição, exclusão, publicação) gera logs com timestamp e ID do usuário.
- Logs são armazenados em uma tabela `action_logs` com nível de criticidade e descrição da operação.
- Integração opcional com sistemas de log externos (Logtail, Datadog).

### 🔁 Validação de Dados e Consistência

- Edge Functions em Supabase fazem validações automáticas em eventos sensíveis, como:
  - Data de veiculação de anúncio
  - Repetição de cliques
  - Regras de recompensa da gamificação
- Utiliza gatilhos (`triggers`) no banco para verificar unicidade e coerência entre relacionamentos (ex: artigo x franquia).

### 🔐 Segurança de Conteúdo e Uploads

- Uploads de mídia passam por filtros de extensão e tamanho antes de serem armazenados.
- Scan automático contra arquivos maliciosos via API de segurança (fase 2).
- Armazenamento seguro no Supabase Storage com links temporários para acesso restrito.

### 📉 Rate Limiting e Antifraude

- Limite de interações (views/cliques/comentários) por IP e por usuário com base horária e diária.
- Detecção de comportamento suspeito via n8n (ações em excesso, cliques duplicados, contas múltiplas).
- Sistema de penalidade automática com alerta para admin.

### 🔔 Notificações e Alertas

- Administradores recebem alertas sobre picos de tráfego anormal, tentativas de invasão, alterações não autorizadas.
- Logs de login e logout são monitorados com identificação de localização (geolocalização IP).

### 🔒 Criptografia e Proteção de Sessão

- Dados sensíveis armazenados de forma criptografada (senhas, tokens, preferências privadas).
- Sessões com tempo de expiração configurável e revogação manual via painel administrativo.

A combinação desses mecanismos assegura que a plataforma MyFacebrasil funcione com responsabilidade, transparência e proteção real dos usuários e franqueados.

- **Supabase RLS** (Row-Level Security) para garantir que cada anunciante veja apenas seus dados
- **Validação automática** da data de veiculação com Supabase Edge Functions
- **Logs de ações administrativas** com timestamps para auditoria

---

### Painel Administrativo

O painel administrativo é destinado a usuários com perfil `admin` e oferece controle total da operação publicitária dentro da plataforma.

**Funcionalidades detalhadas:**

- **Criar/editar formatos de anúncio:**
  - Interface visual com presets (banner estático, vídeo, carrossel, pop-up)
  - Possibilidade de definir dimensões, tempo de exibição e posição padrão no app
- **Uploads de mídia:**
  - Suporte a imagens e vídeos com validação de tamanho e extensão
  - Ferramenta de compressão automática para reduzir tempo de carregamento
- **Controle de datas e locais de exibição:**
  - Campos de data/hora com calendário integrado
  - Seleção de páginas e componentes de destino (ex: homepage, artigos de categoria X, resultados de busca)
  - Sistema "AdInjector" baseado em tags semânticas
- **Relatórios e exportações:**
  - Painel dinâmico com gráficos interativos (cliques, visualizações, CTR)
  - Exportação em CSV, PDF e integração com Google Sheets (via n8n)

### Painel do Anunciante

Este painel é acessado por usuários com o papel `advertiser`, oferecendo uma interface simplificada e orientada à ação.

**Funcionalidades detalhadas:**

- **Visualização de campanhas:**
  - Listagem com status (ativo, expirado, agendado)
  - KPIs principais (visualizações, cliques, taxa de conversão)
- **Histórico e performance por anúncio:**
  - Comparação entre campanhas
  - Identificação de melhores locais de exibição
- **Substituição de mídia:**
  - Upload seguro e pré-visualização antes de efetivar alteração
- **Solicitação de veiculação impressa:**
  - Botão direto com formulário automatizado para redatores
  - Permite sugerir página preferencial e versão da edição

### Banco de Dados e Funções Avançadas

**Tabelas principais (Supabase):**

- `ads` – Cadastro de campanhas, formatos e destinos
- `ad_rewards` – Histórico de pontos Faceta por usuário
- `click_events` – Registro individualizado de cliques (com IP e timestamp)

**Automações via n8n:**

- **Ativações programadas**: ativa ou pausa campanhas com base na data de início/fim
- **Faturas automáticas:** cálculo de CPM/CPC e geração de cobranças via Stripe
- **Envio de métricas:** relatórios semanais ou mensais enviados por e-mail ao anunciante
- **Integração futura com CRM** para importação/exportação de leads provenientes dos anúncios

---

## 7. Gamificação e Recompensas

O módulo de gamificação da MyFacebrasil visa transformar a leitura, a interação com anúncios e o uso da plataforma em uma jornada envolvente e premiada. Ele cria uma camada lúdica sobre a navegação, estimulando comportamentos desejáveis (leitura recorrente, engajamento editorial, atenção aos patrocinadores) por meio de recompensas tangíveis e simbólicas.

### 🎮 Mecânica Geral

- Usuários acumulam **pontos Faceta** ao interagir com artigos, quizzes e anúncios.
- Esses pontos são armazenados por usuário e atualizados em tempo real.
- Há **níveis de experiência**, **desafios semanais**, **conquistas desbloqueáveis** e um **ranking mensal**.
- Os pontos Faceta podem ser trocados por prêmios virtuais ou físicos em uma loja de recompensas.

### 📏 Regras de Pontuação

| Ação                                | Pontos Gerados                 |
| ----------------------------------- | ------------------------------ |
| Leitura completa de artigo          | 1 ponto                        |
| Visualização de 5 anúncios únicos   | 1 ponto                        |
| Clique válido em anúncio (1/IP/dia) | 3 pontos                       |
| Responder quiz semanal              | 5 pontos                       |
| Compartilhar artigo no WhatsApp     | 2 pontos                       |
| Participar de sorteio mensal        | Gratuito via pontos acumulados |

> Todos os pontos e limites são configuráveis e podem ser ajustados via painel administrativo.

### 🛒 Loja de Recompensas (`RewardStore`)

A loja virtual permite aos usuários trocarem seus pontos por:

- Artigos ou entrevistas exclusivas
- PDF premium da edição do mês sem anúncios
- Cupons de parceiros comerciais (alimentação, eventos, serviços)
- Ingressos para sorteios com prêmios maiores (gadgets, livros, etc)

### 🧠 Inteligência e Personalização

- O sistema sugere recompensas de acordo com os hábitos do usuário (ex: leitores de finanças veem cupons de bancos e investimentos)
- IA recomenda desafios personalizados semanais com base no uso da plataforma

### 🏆 Ranking Mensal e Reconhecimento

- Exibição de um **Leaderboard global e por cidade/franquia**
- Distintivos públicos (medalhas, selo de Leitor Ouro, etc)
- Convite para edições especiais e entrevistas com usuários top

### 📱 Interface e Feedback

- **`GamifiedStats`**: painel com nível, XP, conquistas e progresso semanal
- **Notificações via push ou e-mail** ao concluir um desafio ou alcançar nova meta
- **Histórico de atividades** com recompensas obtidas, pontos gastos e saldo atual

### 🧱 Infraestrutura Técnica

**Tabelas e Funções:**

```sql
user_rewards
reward_store
user_achievements
challenge_logs
```

**Edge Functions:**

- Registro de leitura e interação
- Verificação de IP por clique
- Conversão automática de ações em pontos

**n8n (Automação):**

- Envio de campanhas gamificadas semanais
- Rodada de sorteios automáticos
- Atualização de ranking e badges

**Segurança:**

- Rate limiting por IP e por ação
- Validação antifraude
- Logs auditáveis por administrador

### 🎯 Alinhamento com o Projeto

A estratégia de gamificação da MyFacebrasil está profundamente conectada aos pilares da plataforma: retenção de usuários, valorização da leitura, reforço da marca editorial e estímulo à participação ativa.

**1. Retenção e Frequência de Acesso:**
Ao oferecer desafios semanais, sistema de níveis e ranking público, o sistema de gamificação induz um comportamento recorrente, com o usuário retornando diariamente para acumular pontos, subir de nível ou garantir uma recompensa específica.

**2. Descoberta e Consumo de Conteúdo:**
A associação entre ações gamificadas e leitura de artigos estimula a descoberta de novos conteúdos, inclusive em categorias que o usuário normalmente não exploraria. Isso aumenta o tempo médio de sessão e diversifica a experiência editorial.

**3. Engajamento com Anúncios de Forma Positiva:**
Diferente de banners invasivos, os anúncios na MyFacebrasil são recompensados com Facetas, criando uma relação positiva com a publicidade e entregando resultados mensuráveis aos anunciantes.

**4. Monetização por Participação:**
A própria gamificação se torna um motor de monetização: usuários são incentivados a consumir conteúdo premium, adquirir cupons e até participar de sorteios patrocinados, criando fluxo de receita e justificando parcerias comerciais.

**5. Valorização dos Leitores Mais Ativos:**
Os leitores mais engajados ganham reconhecimento público, badges exclusivos, acesso antecipado a conteúdos e são convidados para ações especiais. Isso gera senso de pertencimento e reforça a lealdade à plataforma.

**6. Suporte à Estratégia das Franquias:**
Cada franquia pode ativar desafios locais (ex: "Leia 5 artigos de eventos em Orlando"), distribuir prêmios regionais e estimular o consumo de edições personalizadas, promovendo o engajamento geolocalizado e a construção de comunidade.

**7. Base de Dados Riquíssima para Analytics:**
O sistema de gamificação gera insights poderosos sobre preferências, comportamento e padrões de leitura. Esses dados retroalimentam o sistema de recomendação, a pauta editorial e a oferta de serviços personalizados.

A gamificação será o motor de retenção da plataforma, incentivando a volta diária, impulsionando a descoberta de novos conteúdos e gerando valor agregado para os patrocinadores. Usuários engajados consomem mais, compartilham mais e convertem melhor nos espaços publicitários, criando um ecossistema sustentável e interativo.

### Regras

- 5 visualizações únicas = 1 ponto
- Clique válido = 3 pontos
- Missões semanais (ex: "veja 10 anúncios")

### Sistema de Recompensas

- Artigos exclusivos
- Sorteios
- Cupons e prêmios físicos
- Loja de Recompensas (`RewardStore`)

### Infraestrutura

```sql
CREATE TABLE user_rewards (...);
CREATE TABLE reward_store (...);
```

- `Leaderboard` com ranking mensal
- Integração com Supabase Functions + n8n para notificações

---

## 8. Sistema de Franquias

O módulo de franquias da MyFacebrasil transforma a experiência editorial em uma oportunidade de negócio local, permitindo que franqueados autorizados criem, editem e distribuam edições personalizadas da revista com conteúdo local e aproveitamento do acervo central.

### Funcionalidades Detalhadas

1. **Criação de Edições Regionais**

   - Acesso a um editor visual com arrastar e soltar baseado em `CustomEditionBuilder`
   - Seleção de artigos do acervo central e inclusão de matérias locais
   - Modelos predefinidos de capa, seções e ordenação editorial
   - Agendamento de lançamento e exportação em PDF/HTML

2. **Gestão de Marca Local**

   - Customização de logotipo, cores e fontes secundárias dentro de padrões aprovados
   - Inclusão de colunistas regionais com biografia e foto
   - Espaço reservado para a “Carta do Editor Local”

3. **Curadoria Automatizada por IA**

   - Sugestões de temas e pautas locais baseadas em:
     - Artigos mais lidos na região
     - Datas comemorativas locais
     - Google Trends API
   - Editor Virtual Local (`FranchiseEditorBot`) sugere headlines, reescreve conteúdo e gera versões adaptadas para o público da região

4. **Analytics por Franquia**

   - Dashboard exclusivo com:
     - Visualizações por edição
     - QR Codes escaneados
     - Cliques em anúncios locais
     - Tempo médio de leitura
   - Comparativo entre edições e períodos

5. **Gestão de Anunciantes Locais**

   - Cadastro de anunciantes da cidade
   - Inserção de banners em páginas específicas da edição
   - Relatórios individuais para cada parceiro (views, cliques, retorno estimado)
   - Geração automática de recibos/faturas em PDF

6. **Distribuição Personalizada**

   - Cada edição tem um link exclusivo (ex: `orlando.facebrasil.com`)
   - Geração automática de QR Code e shortlink rastreável
   - Integração com ferramentas de disparo de newsletter via n8n

7. **Academia do Franqueado**

   - Área de treinamento contínuo com:
     - Vídeos tutoriais (como montar uma edição em 3 dias)
     - Templates editáveis
     - Estratégias de captação de leitores e anunciantes

8. **Gamificação entre Franquias**

   - Ranking público das franquias com base em leitores ativos, edições publicadas, cliques em anúncios
   - Desafios mensais como: "5 novos anunciantes" ou "3 edições publicadas no mês"
   - Premiações simbólicas e bônus de visibilidade

Essa estrutura cria um ecossistema descentralizado com governança central, permitindo que a revista se expanda com qualidade editorial e identidade local, fortalecendo a marca Facebrasil em múltiplas comunidades. para Franqueados

- Criar edições regionais
- Gestão de marca local (capa, colunistas)
- Curadoria automatizada por IA
- Analytics detalhado por franquia

### Estrutura Técnica (Banco de Dados)

A estrutura técnica da franquia MyFacebrasil é baseada em um modelo multitenant, onde cada franquia possui um ambiente isolado por `franchise_id`. Isso garante segurança, personalização e escalabilidade para atender múltiplas franquias simultaneamente.

**Tabelas do Banco de Dados:**

- `franchises` — Cadastro das franquias (nome, região, subdomínio, logotipo)
- `franchise_users` — Usuários vinculados a cada franquia com papéis (admin/editor)
- `custom_editions` — Edições personalizadas criadas pelos franqueados
- `edition_articles` — Artigos incluídos em cada edição (sejam do acervo ou locais)
- `local_advertisers` — Cadastro de anunciantes regionais
- `edition_ads` — Relação entre banners locais e edições publicadas
- `qr_distributions` — Geração e rastreamento de links e QR codes para cada edição

Cada uma dessas tabelas possui restrições de integridade referencial, triggers de atualização automática e Row-Level Security para garantir acesso exclusivo a cada franqueado.

### Recursos Avançados

1. **Chatbot Editorial Treinado Localmente**

   - Interface de conversa para o editor sugerir pautas, revisar títulos, gerar sinopses
   - Treinamento com dados da Facebrasil + dados locais da franquia
   - Pode ser acessado via web, app ou WhatsApp (com API N8N ou Evolution)
   - Exemplo de comandos:
     - “Sugira 3 manchetes para minha próxima edição sobre cultura brasileira em Newark”
     - “Corrija esse parágrafo com linguagem mais jornalística”

2. **Links e QR Codes com Métricas**

   - Cada edição recebe um domínio e link único (ex: `boston.facebrasil.com/edicao-junho`)
   - Geração automática de QR code rastreável com `qr_code_url`
   - Integração com analytics para medir:
     - Acessos por canal
     - Dispositivos e horários
     - Taxa de leitura completa da edição

3. **FaceAcademy  - Academia do Franqueado com Treinamentos e Templates**

   - Portal com cursos modulares para franqueados
   - Tipos de conteúdo:
     - Vídeos instrutivos
     - PDFs com dicas e estratégias
     - Templates editáveis para editoriais, capas, chamadas
   - Avaliação de progresso e emissão de certificado simbólico
   - Atualizações mensais com boas práticas e estudos de caso de outras franquias de sucesso

Essa base técnica e os recursos avançados asseguram que o franqueado não apenas tenha controle editorial e comercial, mas também seja continuamente capacitado para alcançar resultados concretos e sustentáveis.

---

## 9. Estratégia de Lançamento

A estratégia de lançamento do MyFacebrasil foi planejada em três fases — pré-lançamento, lançamento e pós-lançamento — com ações de marketing coordenadas, gatilhos de ativação por automação (via n8n), e envolvimento da comunidade para gerar tração orgânica e paid reach.

### 🚀 Pré-Lançamento

**Objetivo:** gerar lista de interessados, engajar a base da revista antiga e criar expectativa pelo novo modelo digital.

**Ações:**
- **Landing Page com Captura de Leads**
  - Ferramenta: Vercel + Supabase + n8n para automatizar e-mails
  - Elementos: contador regressivo, prévia do app, botão "quero ser beta tester"
- **Campanha Teaser nas Redes Sociais**
  - Criativos no Instagram, Threads, WhatsApp e TikTok com frases provocativas e vídeos curtos
  - Ex: "A Facebrasil virou um app que fala com você. Literalmente."
- **Prévia da IA no WhatsApp ou Web Chat**
  - Usuários interagem com o Editor Virtual com respostas limitadas para gerar curiosidade
  - Campanha "Converse com a nova Facebrasil por 5 minutos"
- **Newsletter de Reativação**
  - Enviada para base antiga com highlights da nova versão e botão para criar conta antecipada

### 📢 Lançamento Oficial

**Objetivo:** obter os primeiros mil usuários ativos, gerar buzz online, validar funcionalidades com público real.

**Ações:**
- **Live de Lançamento com Fundadores e Franqueados**
  - Apresentação ao vivo via YouTube/Instagram
  - Demonstração de funcionalidades (gamificação, clipping, editor virtual)
  - Sorteio de cupons com base em interação ao vivo
- **Campanhas de Tráfego Pago (Meta, Google)**
  - Segmentação por idade, interesse e localização de brasileiros no exterior
  - Criativos dinâmicos com chamadas como:
    - "Sua nova revista já tem quiz, voz e recomendações personalizadas."
    - "Ganhe pontos Faceta só por ler. Literalmente."
- **Ativações por Franquias Regionais**
  - Cada franquia promove sua edição local com desafios exclusivos
  - Ex: "Leia 3 matérias sobre Orlando e concorra a R$ 200 em vouchers"
- **Parcerias com microinfluenciadores locais**
  - Envio de acesso antecipado + guia de divulgação
  - Premiação para quem trouxer mais novos leitores

### 🔁 Pós-Lançamento (Ciclo de Retenção e Expansão)

**Objetivo:** criar hábito de uso, reforçar comunidade e escalar crescimento com usuários engajados.

**Ações:**
- **Reengajamento Automático via n8n**
  - Notificação push e e-mails para quem não leu artigos em 7 dias
  - Gatilhos personalizados com base nas categorias favoritas
- **Geração Automática de Reels com Artigos**
  - A cada semana, um top artigo vira carrossel ou vídeo com narração TTS + imagem destacada
- **Ranking Público de Leitores e Franquias**
  - Mostra os leitores com mais pontos e as franquias com maior leitura
  - Integração com painel público em site e app
- **Edição Especial de Destaque com os 10 Artigos Mais Lidos**
  - Lançada mensalmente com base em analytics globais e regionais

Essa estratégia de lançamento garante que a MyFacebrasil atinja um público qualificado, gere valor desde o primeiro dia e crie uma base de usuários dispostos a engajar, interagir e evoluir com a plataforma.

### Pré-Lançamento

- Landing page com inscrição
- Teasers nas redes sociais
- Prévia da IA respondendo leitores

### Lançamento

- Lives de bastidores com franqueados
- Clipping interativo automático
- Campanhas nos canais: Meta Ads, YouTube Shorts

### Pós-lançamento

- Editor Virtual ativo no WhatsApp
- Geração automática de reels com artigos
- Ranking mensal público com badges

---

## 10. Modelos de Monetização

A plataforma MyFacebrasil foi concebida para gerar receita de forma escalável, ética e integrada à experiência do usuário. Os modelos abaixo se complementam e se sustentam mutuamente, oferecendo fontes de receita direta (assinaturas e franquias) e indireta (publicidade e parcerias).

### 1. **Publicidade Digital (AdSense e AdMob)**
- **Google AdSense:** implementado na versão Web e PWA da revista. Os anúncios são exibidos entre seções ou ao final dos artigos, respeitando UX e velocidade de carregamento.
- **Google AdMob:** integrado via Capacitor.js nos apps Android/iOS. Os anúncios aparecem como banners nativos ou intersticiais entre navegações.
- Ambas as ferramentas contam com medições automáticas e otimização por comportamento, gerando receita proporcional à audiência da plataforma.

### 2. **Assinatura Mensal PRO (R$ 9,90/mês)**
- Acesso a recursos avançados: clipping, audiocasts, gamificação avançada, exportações premium.
- Pagamento via Stripe com controle por `role` no Supabase.
- Possibilidade futura de planos com upgrades (PRO+, PRO Família).

### 3. **Modelo de Franquia (R$499 anual + R$99/mês)**
- Licenciamento regional da plataforma com marca local personalizada.
- Cada franquia gera sua própria edição, atrai anunciantes e fideliza leitores regionais.
- Franquias têm acesso a ferramenta de edição, analytics, suporte técnico e marketing.
- Receita recorrente e previsível.

### 4. **Marketplace de Conteúdo**
- Franquias podem vender artigos premium, entrevistas exclusivas e ensaios para outras franquias.
- Pagamento por crédito interno ou transferência via Stripe Connect.
- Curadoria central pode promover os melhores conteúdos para uso global.

### 5. **Venda de Cupons, Audiocasts e Conteúdo Exclusivo**
- A loja de recompensas (usando pontos Faceta) poderá oferecer upgrades pagos:
  - PDF exclusivo com matérias bônus
  - Narração de edições completas (modo Podcast)
  - Cupons de parceiros premium (com comissão para a plataforma)

### 6. **Programa de Afiliados e Indicações**
- Cada usuário pode gerar seu link personalizado de convite.
- Sistema de rastreamento com UTM no Supabase registra origem.
- Comissão de 10% sobre planos pagos e conversões em franquias.

### 7. **Parcerias e Licenciamento de Tecnologia**
- A plataforma poderá ser licenciada como white-label para grupos de mídia externos, jornais locais ou iniciativas comunitárias.
- O código será adaptado com marca própria, mantendo backend centralizado e cobrando mensalidade ou porcentagem de uso.

Com esses modelos integrados, a MyFacebrasil assegura sustentabilidade financeira, incentiva a colaboração entre editores e franqueados, e transforma engajamento em valor real para todos os envolvidos.

---

** `user`, `pro`, `franchisee`, `admin`

---

## 12. Considerações Finais

A MyFacebrasil combina a credibilidade de uma marca de 15 anos com a inovação digital dos ecossistemas de mídia moderna. Com módulos independentes e escaláveis, ela oferece uma infraestrutura para leitores, anunciantes, franqueados e criadores prosperarem em um ambiente colaborativo e inteligente.

> Próximos passos: gerar arquivos markdown, componentes iniciais e scripts de importação do WordPress.

