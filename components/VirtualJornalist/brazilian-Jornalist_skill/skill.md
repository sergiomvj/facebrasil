Perfeito. Skill enxuta, só base de conhecimento. Salva em `~/.claude/skills/brazilian-journalist.md`:

---

```markdown
# Brazilian Journalist — Base de Conhecimento

## Missão
Identificar, coletar e classificar notícias sobre brasileiros nos EUA publicadas pela mídia internacional em inglês. Servir como referência para o agente de automação saber **o que**, **onde** e **como** buscar.

---

## 1. O QUE buscar — Temas prioritários

### Tier A (Alta prioridade — sempre buscar)
- **Imigração / ICE:** detenções, deportações, operações, checkpoints, asilo, TPS, green card
- **Casos específicos com brasileiros:** presos, desaparecidos, deportados, vítimas, heróis
- **Políticas migratórias:** decisões da Suprema Corte, ordens executivas, mudanças legislativas
- **Dados e estatísticas:** números de deportação, apreensões na fronteira, demografia

### Tier B (Média prioridade)
- **Casos policiais:** crimes envolvendo brasileiros (vítimas ou autores), tráfico, fraudes
- **Comunidade:** desaparecimentos, mobilizações, conquistas, perfis de destaque
- **Esportes:** Copa 2026, atletas brasileiros, torcida
- **Economia:** negócios brasileiros, empreendedorismo, remessas

### Tier C (Contexto — buscar esporadicamente)
- Relações EUA-Brasil (diplomacia, comércio)
- Cultura brasileira nos EUA (eventos, festivais)
- Política brasileira com impacto na diáspora

---

## 2. ONDE buscar — Fontes por tier

### Tier 1 — Grandes veículos (alta credibilidade, alcance nacional)
| Veículo | Domínio | Especialidade |
|---------|---------|---------------|
| New York Times | nytimes.com | Investigação, imigração |
| Washington Post | washingtonpost.com | Política, imigração |
| Wall Street Journal | wsj.com | Economia, política |
| Reuters | reuters.com | Breaking news |
| Associated Press | apnews.com | Breaking news |
| The Guardian | theguardian.com | Investigação, imigração |
| BBC News | bbc.com/news | Cobertura global |
| CNN | cnn.com | Breaking news |
| NBC News | nbcnews.com | Imigração, comunidade |
| ABC News | abcnews.go.com | Breaking news |

### Tier 2 — Fontes locais (comunidades com alta concentração de brasileiros)
| Região | Veículo | Domínio |
|--------|---------|---------|
| Massachusetts | Boston Globe | bostonglobe.com |
| Massachusetts | WGBH | wgbh.org |
| Nova York | NY Post | nypost.com |
| Nova York | Daily News | nydailynews.com |
| Flórida | Orlando Sentinel | orlandosentinel.com |
| Flórida | Miami Herald | miamiherald.com |
| Texas | Houston Chronicle | houstonchronicle.com |
| Texas | Texas Tribune | texastribune.org |
| New Jersey | NJ.com | nj.com |
| Nacional (local) | Patch | patch.com |

### Tier 3 — Fontes oficiais (primárias)
| Fonte | Domínio | Conteúdo |
|-------|---------|----------|
| ICE | ice.gov | Press releases, operações |
| DHS | dhs.gov | Políticas, estatísticas |
| DOJ | justice.gov | Indictments, processos |
| USCIS | uscis.gov | Políticas de visto/asilo |
| CBP | cbp.gov | Dados de fronteira |

### Tier 4 — Especializadas em imigração
| Veículo | Domínio | Foco |
|---------|---------|------|
| The Marshall Project | themarshallproject.org | Justiça criminal |
| Immigration Impact | immigrationimpact.com | Políticas migratórias |
| NPR | npr.org | Cobertura imigração |
| ProPublica | propublica.org | Investigação |
| The Trace | thetrace.org | Imigração + armas |

### Tier 5 — Mídia brasileira nos EUA (referência cruzada)
- Gazeta News (gazetanews.com)
- AcheiUSA (acheiusa.com)
- Brazilian Voice (brazilianvoice.com)
- Brazilian Times (braziliantimes.com)
- Nossa Rádio USA (nossaradiousa.com)

---

## 3. COMO buscar — Queries Firecrawl

### Queries principais (executar diariamente)
```
1. "Brazilians in USA" OR "Brazilian immigrants" 2026
2. "ICE arrests Brazilian" OR "Brazilian deported" 2026
3. "Brazilian detained" OR "Brazilian missing USA"
4. "Brazilian arrested USA" OR "Brazilian crime"
5. "Brazilian community USA" OR "Brazilian diaspora"
6. "Brazilian deportation flight" OR "deported Brazilian"
7. "Brazilian asylum USA" OR "Brazilian border"
8. site:ice.gov Brazilian
9. site:dhs.gov Brazilian
10. "Brazilian missing Florida" OR "Brazilian missing Massachusetts"
```

### Queries contextuais (semanal)
```
- "Brazilian Copa 2026" OR "Brazilian fans USA"
- "Brazilian entrepreneur USA" OR "Brazilian business"
- "Brazilian consulate" OR "Brazilian diplomat USA"
- "Brazilian TPS" OR "Temporary Protected Status Brazil"
```

### Parâmetros Firecrawl
```json
{
  "limit": 15,
  "lang": "en",
  "country": "us",
  "scrapeOptions": {
    "formats": ["markdown"],
    "onlyMainContent": true
  }
}
```

---

## 4. Critérios de ranqueamento

Ordenar resultados por score combinado:

| Critério | Peso | Regra |
|----------|------|-------|
| **Recência** | 40% | Últimos 3 dias = 1.0 / 7 dias = 0.7 / 14 dias = 0.4 / >14 = 0.1 |
| **Tier da fonte** | 25% | Tier 1 = 1.0 / Tier 2 = 0.8 / Tier 3 = 0.9 / Tier 4 = 0.7 / Tier 5 = 0.3 |
| **Relevância do tema** | 25% | Tier A = 1.0 / Tier B = 0.6 / Tier C = 0.3 |
| **Especificidade** | 10% | Caso específico brasileiro = 1.0 / Política geral = 0.5 |

### Filtros de exclusão
- ❌ Notícias com > 30 dias
- ❌ Duplicatas por URL (verificar no banco)
- ❌ Conteúdo paywall sem scrape completo
- ❌ Artigos de opinião sem fatos novos
- ❌ Clickbait sem substância

---

## 5. Categorização automática

Classificar cada notícia em UMA categoria:

| Categoria | Palavras-chave |
|-----------|----------------|
| `imigração` | ICE, deport, asylum, visa, green card, border, checkpoint, detention, TPS, undocumented |
| `policial` | arrest, crime, prison, trafficking, fraud, PCC, CV, gang, homicide, assault |
| `comunidade` | missing, found, community, event, festival, award, profile, business, entrepreneur |
| `política` | Supreme Court, Trump, Biden, law, legislation, policy, executive order, judge, ruling |
| `esportes` | Copa, World Cup, NBA, MLS, soccer, football, athlete, fan |
| `economia` | business, economy, remittance, investment, market, entrepreneur |
| `cultura` | art, music, film, festival, culture, heritage |

---

## 6. Contexto da comunidade (para o agente entender relevância)

### Dados demográficos
- **~1.8M brasileiros nos EUA** (2025)
- **~500k indocumentados** (estimativa)
- **Concentrações:** Massachusetts (Framingham, Somerville), Flórida (Orlando, Miami), Nova York (NYC, Newark), Nova Jersey

### Contexto político atual (2026)
- **Governo Trump 2ª gestão** — políticas de imigração endurecidas
- **7.700+ brasileiros deportados** em voos diretos desde 2020
- **ICE ampliando operações** — uso de tecnologia, checkpoints, prisões em tribunais
- **Suprema Corte** validando barrar asilo na fronteira, facilitar deportação de residentes
- **TPS em risco** — haitianos e sírios já perderam proteção
- **Custo de cidadania** subindo até 80%

### Dores da comunidade
- Medo de deportação após anos nos EUA
- Famílias separadas (cidadãos + indocumentados)
- Dificuldade de acesso a consulados
- Desinformação sobre direitos
- Casos de brasileiros desaparecidos sem resolução

---

## 7. Regras de qualidade

### O agente DEVE:
- ✅ Buscar APENAS em inglês (mídia internacional)
- ✅ Duplicar checagem por URL antes de inserir
- ✅ Classificar categoria corretamente
- ✅ Priorizar Tier 1 e 2 sobre Tier 5
- ✅ Incluir data de publicação quando disponível
- ✅ Extrair resumo de 2-3 linhas da notícia

### O agente NÃO DEVE:
- ❌ Inventar fatos não presentes no conteúdo
- ❌ Misturar notícias de mídia BR com internacional
- ❌ Inserir duplicatas no banco
- ❌ Classificar erroneamente a categoria
- ❌ Ignorar recência (notícias > 30 dias são lixo)
- ❌ Priorizar clickbait sobre jornalismo sério

---

## 8. Estrutura de saída esperada

Cada notícia coletada deve ter:
```json
{
  "title": "Título original em inglês",
  "title_translated": "Tradução para PT-BR",
  "source": "Nome do veículo",
  "source_tier": 1-5,
  "url": "URL canônica",
  "summary": "Resumo 2-3 linhas em PT-BR",
  "category": "imigração|policial|comunidade|política|esportes|economia|cultura",
  "published_at": "ISO 8601",
  "collected_at": "ISO 8601",
  "relevance_score": 0.0-1.0,
  "keywords": ["array", "de", "palavras-chave"]
}
```

---

## 9. Fluxo esperado do agente

```
1. Executar queries Firecrawl (10 queries principais)
2. Coletar resultados (150+ notícias brutas)
3. Deduplicar por URL contra banco existente
4. Filtrar por recência (> 30 dias = descarta)
5. Categorizar automaticamente
6. Calcular relevance_score
7. Ranquear e selecionar top 10
8. Apresentar lista numerada 1-10
9. Aguardar escolha do usuário
```

---

## 10. Evolução da skill

### Próximas iterações
- [ ] Adicionar suporte a RSS feeds das fontes Tier 1-3
- [ ] Integração com Google News API como fallback
- [ ] Detecção de paywall e fallback para archive.org
- [ ] Análise de sentimento (positivo/negativo/neutro)
- [ ] Detecção de trending topics (notícias que estão viralizando)
- [ ] Cross-reference com mídia BR (mesmo fato, ângulos diferentes)
```

---

