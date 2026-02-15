# Guia de Integração Técnica - TV Facebrasil

Este documento descreve as especificações para o time de desenvolvimento da Facebrasil enviar os artigos diários para o motor de automação da TV Facebrasil.

## 1. Visão Geral
O sistema de automação aguarda o recebimento de lotes de artigos para a curadoria do "Editor Chefe AI". O Editor Chefe processará cada notícia e decidirá se ela se tornará um **Short (1-3 min)** ou um **Vídeo Doc (10 min)**.

## 2. Endpoint da API (Integração Direta)
O envio é feito via HTTP POST diretamente para a API do Portal de Vídeos da TV Facebrasil:

**URL Produção:** `https://tv.fbr.news/api/intake`
**URL Dev:** `http://localhost:3000/api/intake` (ou porta correspondente)

*Nota: A integração via N8N foi substituída por esta chamada direta.*

## 3. Frequência e Lote
- **Frequência Recomenda**: A cada 60 minutos.
- **Volume**: Lote de 5 artigos por envio.

## 4. Estratégia de Seleção
O time de dev deve programar o sistema para selecionar os últimos 5 artigos publicados (ou atualizados) na última hora que ainda não foram enviados para a TV Facebrasil.

## 5. Estrutura do JSON (Payload)
O formato deve seguir rigorosamente a estrutura abaixo:

```json
{
  "articles": [
    {
      "id": "ID_INTERNO_MATERIA_1",
      "titulo": "Título da Matéria 1",
      "conteudo": "Texto completo da matéria, incluindo parágrafos e aspas importantes. Quanto mais detalhado, melhor para o roteirista AI.",
      "link": "https://facebrasil.com/caminho-da-materia-1"
    },
    {
      "id": "ID_INTERNO_MATERIA_2",
      "titulo": "Título da Matéria 2",
      "conteudo": "Texto completo...",
      "link": "https://..."
    },
    {
      "id": "ID_INTERNO_MATERIA_3",
      "titulo": "Título da Matéria 3",
      "conteudo": "Texto completo...",
      "link": "https://..."
    },
    {
      "id": "ID_INTERNO_MATERIA_4",
      "titulo": "Título da Matéria 4",
      "conteudo": "Texto completo...",
      "link": "https://..."
    },
    {
      "id": "ID_INTERNO_MATERIA_5",
      "titulo": "Título da Matéria 5",
      "conteudo": "Texto completo...",
      "link": "https://..."
    }
  ]
}
```

### Descrição dos Campos:
- `id`: (String) Identificador único da matéria no banco de dados da Facebrasil (importante para evitar duplicidade).
- `titulo`: (String) Headline da notícia.
- `conteudo`: (String) A notícia na íntegra.
- `link`: (String) URL pública da versão web da matéria.

## 6. Cabeçalhos (Headers)
Certifique-se de enviar o cabeçalho de tipo de conteúdo:
`Content-Type: application/json`

---
**Suporte ao Desenvolvedor:**
O sistema n8n está configurado para responder com `200 OK` assim que o lote for recebido e enfileirado com sucesso. Caso o banco de dados detecte um `id` duplicado, ele ignorará a entrada individual automaticamente, sem quebrar o processamento das demais.
