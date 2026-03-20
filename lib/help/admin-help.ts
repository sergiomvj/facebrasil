export type HelpDocEntry = {
  id: string;
  label: string;
  route: string;
  routePrefix?: string;
  summary: string;
  purpose: string;
  elements: string[];
  uses: string[];
  keywords: string[];
};

const ADMIN_HELP_DOCS: HelpDocEntry[] = [
  {
    id: "admin-dashboard",
    label: "Dashboard",
    route: "/admin",
    summary: "Visao geral do painel com indicadores, atalhos e acompanhamento operacional do portal.",
    purpose: "Ajudar a equipe a entender o estado atual do conteudo, acompanhar metricas e iniciar fluxos frequentes sem navegar pelo menu inteiro.",
    elements: [
      "Cards de metricas do mes, leitura media e total de artigos",
      "Atalhos rapidos para criar novo artigo e moderar videos",
      "Listas de conteudo recente e indicadores consolidados do portal"
    ],
    uses: [
      "Entrar no admin e validar rapidamente a saude editorial do portal",
      "Acessar operacoes recorrentes sem procurar a tela no menu",
      "Conferir volume de publicacao, visualizacoes e dados gerais antes de agir"
    ],
    keywords: ["dashboard", "inicio", "visao geral", "metricas", "painel"]
  },
  {
    id: "admin-articles",
    label: "Artigos",
    route: "/admin/articles",
    summary: "Central de gestao das materias, noticias e publicacoes do portal.",
    purpose: "Organizar o ciclo editorial, localizar conteudos existentes e acompanhar o status de publicacao.",
    elements: [
      "Lista de artigos com filtros e acoes de gerenciamento",
      "Informacoes de status, autoria e datas",
      "Atalhos para criar, editar ou revisar conteudos"
    ],
    uses: [
      "Localizar rapidamente materias existentes",
      "Revisar status editorial antes da publicacao",
      "Iniciar manutencao ou atualizacao de um conteudo"
    ],
    keywords: ["artigos", "materias", "noticias", "publicacao", "editorial"]
  },
  {
    id: "admin-article-scheduler",
    label: "Agendador IA",
    route: "/admin/articles/scheduler",
    summary: "Ferramenta de programacao automatizada de conteudos com apoio de inteligencia artificial.",
    purpose: "Permitir planejar cadencia de publicacoes e automatizar parte do fluxo de criacao e disparo de conteudo.",
    elements: [
      "Configuracoes de prompts e parametros de agendamento",
      "Definicao de intervalo, categoria e comportamento do fluxo",
      "Controles para revisar e operar a automacao"
    ],
    uses: [
      "Agendar ciclos de conteudo com menos operacao manual",
      "Padronizar publicacoes recorrentes",
      "Acompanhar configuracoes da automacao editorial"
    ],
    keywords: ["agendador", "ia", "scheduler", "automacao", "prompt"]
  },
  {
    id: "admin-editor",
    label: "Editor",
    route: "/admin/editor",
    summary: "Ambiente de criacao e edicao de artigos do portal.",
    purpose: "Produzir materias com texto formatado, imagens, autoria, categoria e configuracoes de publicacao.",
    elements: [
      "Editor rico de texto",
      "Campos de titulo, categoria, autor e agendamento",
      "Recursos para inserir imagens e estruturar o conteudo"
    ],
    uses: [
      "Criar um novo artigo do zero",
      "Montar conteudo com estrutura editorial completa",
      "Preparar materia para publicar agora ou agendar"
    ],
    keywords: ["editor", "novo artigo", "criar artigo", "texto", "rich text"]
  },
  {
    id: "admin-media",
    label: "Midia",
    route: "/admin/media",
    summary: "Biblioteca central de arquivos e imagens utilizadas pelo portal.",
    purpose: "Concentrar uploads, organizacao e reutilizacao de ativos visuais do sistema.",
    elements: [
      "Area de arquivos e pastas",
      "Controles de upload e gerenciamento",
      "Acesso a URLs e ativos armazenados"
    ],
    uses: [
      "Enviar novas imagens para uso editorial",
      "Localizar arquivos existentes no storage",
      "Reaproveitar URLs e organizar ativos do portal"
    ],
    keywords: ["midia", "media", "imagens", "arquivos", "storage", "upload"]
  },
  {
    id: "admin-tv-facebrasil",
    label: "TV Facebrasil",
    route: "/admin/tv-facebrasil",
    summary: "Painel de gerenciamento da grade de videos e programacao da TV Facebrasil.",
    purpose: "Controlar a operacao audiovisual do produto e organizar o conteudo em video exibido pela plataforma.",
    elements: [
      "Controles de cadastro e organizacao de videos",
      "Definicao de destaques e ordem de exibicao",
      "Campos ligados a programacao da web TV"
    ],
    uses: [
      "Adicionar ou revisar conteudo em video",
      "Ajustar prioridade de exibicao",
      "Operar a grade da TV dentro do admin"
    ],
    keywords: ["tv", "video", "web tv", "youtube", "programacao"]
  },
  {
    id: "admin-video-reports",
    label: "Videos Reportados",
    route: "/admin/video-reports",
    summary: "Area de moderacao para analisar videos sinalizados pela comunidade.",
    purpose: "Apoiar a equipe na triagem de ocorrencias e no tratamento de conteudos reportados.",
    elements: [
      "Lista de videos sinalizados",
      "Dados do reporte e contexto da ocorrencia",
      "Acoes de moderacao e acompanhamento"
    ],
    uses: [
      "Investigar um reporte recebido",
      "Tomar decisao de moderacao",
      "Acompanhar volume de ocorrencias da comunidade"
    ],
    keywords: ["reportados", "moderacao", "videos", "denuncia", "ocorrencia"]
  },
  {
    id: "admin-events",
    label: "Eventos",
    route: "/admin/events",
    summary: "Gestao da agenda de eventos e publicacoes da comunidade.",
    purpose: "Cadastrar encontros, festas, shows e outros itens da agenda que aparecem no portal.",
    elements: [
      "Formulario e lista de eventos",
      "Campos de data, local e descricao",
      "Configuracoes de imagem e publicacao"
    ],
    uses: [
      "Cadastrar um novo evento",
      "Atualizar informacoes da agenda",
      "Controlar o calendario exibido ao publico"
    ],
    keywords: ["eventos", "agenda", "calendario", "comunidade"]
  },
  {
    id: "admin-authors",
    label: "Autores",
    route: "/admin/authors",
    summary: "Cadastro e manutencao dos autores e perfis editoriais do portal.",
    purpose: "Garantir que o conteudo seja associado corretamente aos profissionais responsaveis.",
    elements: [
      "Lista e cadastro de autores",
      "Campos de foto, nome, bio e redes",
      "Acoes de criacao, edicao e organizacao"
    ],
    uses: [
      "Registrar um novo autor",
      "Atualizar informacoes de perfil",
      "Preparar autores para selecao no fluxo editorial"
    ],
    keywords: ["autores", "jornalistas", "perfil", "bio"]
  },
  {
    id: "admin-categories",
    label: "Categorias",
    route: "/admin/categories",
    summary: "Gestao das editorias e classificacoes de conteudo do portal.",
    purpose: "Organizar os artigos por tema e manter consistencia estrutural na navegacao publica.",
    elements: [
      "Lista de categorias e slugs",
      "Campos de identificacao e organizacao",
      "Acoes para criar, editar e revisar classificacoes"
    ],
    uses: [
      "Criar nova editoria",
      "Ajustar slug ou metadados de categoria",
      "Manter a taxonomia editorial organizada"
    ],
    keywords: ["categorias", "editorias", "slug", "taxonomia"]
  },
  {
    id: "admin-daily-hero",
    label: "Hero Diario",
    route: "/admin/daily-hero",
    summary: "Configuracao da manchete ou destaque principal exibido na pagina inicial.",
    purpose: "Definir qual conteudo recebe o maior destaque visual do portal em um determinado periodo.",
    elements: [
      "Controles para selecionar o destaque principal",
      "Dados do conteudo promovido",
      "Configuracoes de exibicao do hero"
    ],
    uses: [
      "Promover uma materia importante",
      "Atualizar o destaque principal do dia",
      "Sincronizar editorialmente a capa do portal"
    ],
    keywords: ["hero", "destaque", "manchete", "home"]
  },
  {
    id: "admin-ads",
    label: "Anuncios",
    route: "/admin/ads",
    summary: "Painel de administracao dos banners e espacos publicitarios do portal.",
    purpose: "Gerenciar criativos, links e posicionamentos de anuncios no ecossistema.",
    elements: [
      "Cadastro de banners e pecas",
      "Configuracao de links e posicoes",
      "Indicadores ou controles de exibicao"
    ],
    uses: [
      "Subir um novo banner",
      "Atualizar destino ou criativo de campanha",
      "Controlar inventario publicitario do portal"
    ],
    keywords: ["anuncios", "ads", "banners", "publicidade", "campanha"]
  },
  {
    id: "admin-pages",
    label: "Paginas",
    route: "/admin/pages",
    routePrefix: "/admin/pages/",
    summary: "Gestao das paginas estaticas e institucionais do site.",
    purpose: "Criar e manter paginas permanentes como termos, privacidade e conteudos institucionais.",
    elements: [
      "Lista de paginas publicadas ou editaveis",
      "Fluxo de criacao e manutencao de pagina",
      "Acesso a edicao de um item especifico"
    ],
    uses: [
      "Criar pagina institucional",
      "Revisar ou corrigir paginas existentes",
      "Acessar o detalhe de uma pagina para manutencao"
    ],
    keywords: ["paginas", "institucional", "termos", "privacidade", "estatico"]
  },
  {
    id: "admin-readers",
    label: "Leitores",
    route: "/admin/readers",
    summary: "Painel de gestao da base de leitores e assinantes do portal.",
    purpose: "Acompanhar usuarios cadastrados, dados relevantes e aspectos operacionais do relacionamento com leitores.",
    elements: [
      "Lista de leitores cadastrados",
      "Dados de perfil e acompanhamento",
      "Controles administrativos relacionados a usuarios"
    ],
    uses: [
      "Consultar um leitor especifico",
      "Acompanhar informacoes da base cadastrada",
      "Revisar dados operacionais relacionados a usuarios"
    ],
    keywords: ["leitores", "usuarios", "assinantes", "base"]
  },
  {
    id: "admin-gamification",
    label: "Gamificacao",
    route: "/admin/gamification",
    summary: "Area de configuracao e monitoramento do sistema de XP e engajamento.",
    purpose: "Controlar regras de pontuacao, incentivos e elementos de engajamento dos leitores.",
    elements: [
      "Controles de XP e parametros de recompensa",
      "Visao do sistema de ranking ou regras",
      "Ajustes de gamificacao do produto"
    ],
    uses: [
      "Alterar regras de pontuacao",
      "Acompanhar mecanismos de engajamento",
      "Ajustar a operacao do leaderboard e XP"
    ],
    keywords: ["gamificacao", "xp", "leaderboard", "engajamento"]
  },
  {
    id: "admin-shop",
    label: "FacebrasilShop",
    route: "/admin/shop",
    summary: "Gestao operacional da loja integrada ao ecossistema Facebrasil.",
    purpose: "Administrar produtos, exibicao comercial e informacoes relevantes da operacao de loja.",
    elements: [
      "Lista ou cadastro de produtos",
      "Campos de preco, estoque e exibicao",
      "Acoes de manutencao do catalogo"
    ],
    uses: [
      "Cadastrar um produto",
      "Atualizar preco ou estoque",
      "Manter o catalogo da loja em operacao"
    ],
    keywords: ["shop", "loja", "produtos", "catalogo", "estoque"]
  },
  {
    id: "admin-image-converter",
    label: "Conversor de Imagens",
    route: "/admin/tools/image-converter",
    summary: "Ferramenta utilitaria para conversao e otimizacao de imagens.",
    purpose: "Ajudar a equipe a preparar ativos visuais em formatos mais leves e adequados para publicacao.",
    elements: [
      "Entrada de arquivos de imagem",
      "Opcoes de conversao de formato",
      "Resultado pronto para download ou uso"
    ],
    uses: [
      "Converter imagens para formatos mais eficientes",
      "Reduzir peso antes de publicar no portal",
      "Padronizar ativos visuais do conteudo"
    ],
    keywords: ["imagem", "conversor", "webp", "otimizacao", "formato"]
  },
  {
    id: "admin-settings",
    label: "Configuracoes",
    route: "/admin/settings",
    summary: "Ajustes gerais do sistema e parametros globais do portal.",
    purpose: "Centralizar configuracoes que impactam o comportamento do site e do painel administrativo.",
    elements: [
      "Campos de parametros globais",
      "Ajustes de integracoes e comportamento",
      "Controles administrativos de configuracao"
    ],
    uses: [
      "Atualizar uma configuracao estrutural",
      "Revisar parametros que afetam o portal",
      "Concentrar manutencao operacional do sistema"
    ],
    keywords: ["configuracoes", "settings", "parametros", "integracoes"]
  },
  {
    id: "admin-fbr-apps",
    label: "Sistemas FBR",
    route: "/admin/fbrapps",
    summary: "Hub de acesso a outros sistemas e ativos do ecossistema FBR.",
    purpose: "Facilitar a navegacao operacional entre produtos do grupo dentro do contexto administrativo.",
    elements: [
      "Lista de sistemas ou atalhos do ecossistema",
      "Links de navegacao cruzada",
      "Referencias a ativos corporativos"
    ],
    uses: [
      "Abrir outro sistema do grupo com rapidez",
      "Entender o contexto do ecossistema FBR",
      "Usar o painel como ponto de acesso operacional"
    ],
    keywords: ["fbr", "sistemas", "ecosistema", "apps", "atalhos"]
  },
  {
    id: "admin-help",
    label: "Manual de Operacao",
    route: "/admin/help",
    summary: "Tela legada de manual geral do admin com topicos agregados por funcionalidade.",
    purpose: "Servir como apoio secundario enquanto o help contextual por rota assume a funcao principal de orientacao.",
    elements: [
      "Lista pesquisavel de topicos gerais",
      "Resumo manual de funcionalidades",
      "Indicacao para usar o agente contextual"
    ],
    uses: [
      "Consultar uma visao geral do sistema",
      "Encontrar topicos quando o usuario ainda nao sabe a tela exata",
      "Usar como referencia de transicao para o novo help"
    ],
    keywords: ["ajuda", "manual", "help", "operacao"]
  }
];

export const ADMIN_HELP_FALLBACK_ENTRY: HelpDocEntry = {
  id: "admin-generic",
  label: "Painel Admin",
  route: "/admin",
  summary: "Ajuda contextual do painel administrativo da Nova Facebrasil.",
  purpose: "Oferecer orientacao segura e objetiva sobre a tela atual do admin.",
  elements: [
    "Drawer lateral de ajuda",
    "Resumo automatico da pagina",
    "Chat contextual com o agente Leon"
  ],
  uses: [
    "Entender rapidamente o objetivo da tela atual",
    "Tirar duvidas operacionais sem sair da pagina",
    "Receber orientacao alinhada ao contexto atual"
  ],
  keywords: ["admin", "ajuda", "painel", "leon"]
};

export function normalizeAdminRoute(pathname: string, locale?: string) {
  if (!pathname) return "/admin";

  if (locale) {
    const localizedPrefix = `/${locale}`;
    if (pathname === localizedPrefix) return "/";
    if (pathname.startsWith(`${localizedPrefix}/`)) {
      return pathname.slice(localizedPrefix.length) || "/";
    }
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 1 && segments[1] === "admin") {
    return `/${segments.slice(1).join("/")}`;
  }

  return pathname;
}

export function resolveAdminHelpEntry(pathname: string, locale?: string) {
  const normalizedPath = normalizeAdminRoute(pathname, locale);

  const exactMatch = ADMIN_HELP_DOCS.find((entry) => entry.route === normalizedPath);
  if (exactMatch) {
    return exactMatch;
  }

  const prefixMatch = ADMIN_HELP_DOCS.find((entry) => {
    if (!entry.routePrefix) return false;
    return normalizedPath.startsWith(entry.routePrefix);
  });

  return prefixMatch ?? ADMIN_HELP_FALLBACK_ENTRY;
}

export function getAdminHelpEntries() {
  return ADMIN_HELP_DOCS;
}
