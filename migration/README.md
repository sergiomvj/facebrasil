# WordPress to Supabase Migration

Script para migrar 8300 artigos do WordPress (4 arquivos XML) para o Supabase.

## 📋 Pré-requisitos

1. **Node.js** 18+ instalado
2. **4 arquivos XML** do WordPress
3. **Credenciais do Supabase**
4. **IDs necessários:**
   - Author ID (UUID do perfil padrão)
   - Blog ID (UUID do blog)
   - Category ID (UUID da categoria padrão)

## 🚀 Instalação

```bash
cd migration
npm install
```

## ⚙️ Configuração

1. **Copie o arquivo de exemplo:**
```bash
cp .env.example .env
```

2. **Edite `.env` com suas credenciais:**
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_service_role_key

DEFAULT_AUTHOR_ID=uuid-do-autor
DEFAULT_BLOG_ID=uuid-do-blog
DEFAULT_CATEGORY_ID=uuid-da-categoria

XML_FILES=./data/export1.xml,./data/export2.xml,./data/export3.xml,./data/export4.xml
```

3. **Coloque os arquivos XML na pasta `data/`:**
```
migration/
├── data/
│   ├── export1.xml
│   ├── export2.xml
│   ├── export3.xml
│   └── export4.xml
```

## 🔍 Obter IDs Necessários

### 1. Author ID
```sql
-- No Supabase SQL Editor
SELECT id, name FROM profiles LIMIT 1;
```

### 2. Blog ID
```sql
SELECT id, name FROM blogs LIMIT 1;
```

### 3. Category ID
```sql
SELECT id, name FROM categories WHERE slug = 'geral' LIMIT 1;
```

## 🧪 Teste (Dry Run)

Antes de importar, teste sem inserir no banco:

```bash
npm run dry-run
```

Isso vai:
- ✅ Parsear os 4 XMLs
- ✅ Transformar os dados
- ✅ Mostrar estatísticas
- ❌ **NÃO** inserir no banco

## ▶️ Executar Migração

Quando estiver pronto:

```bash
npm run migrate
```

## 📊 O que o script faz

1. **Parse XML** - Lê os 4 arquivos XML
2. **Transformação:**
   - Remove shortcodes do WordPress
   - Gera slugs únicos
   - Calcula tempo de leitura
   - Extrai imagem destacada
   - Limpa HTML
3. **Validação:**
   - Verifica slugs duplicados
   - Pula posts não publicados
   - Valida campos obrigatórios
4. **Inserção:**
   - Batches de 100 artigos
   - 5 requisições paralelas
   - Retry automático em caso de erro
5. **Relatório:**
   - Estatísticas finais
   - Arquivo de erros (`migration-errors.json`)

## 🎛️ Opções Avançadas

### Converter HTML para Markdown
```env
CONVERT_TO_MARKDOWN=true
```

### Ajustar tamanho do batch
```env
BATCH_SIZE=50  # Menor = mais lento mas mais seguro
```

### Aumentar concorrência
```env
CONCURRENT_REQUESTS=10  # Mais rápido mas pode dar timeout
```

## 📈 Progresso

Durante a execução você verá:

```
📄 Parsing ./data/export1.xml...
✓ Found 2100 items in ./data/export1.xml

📄 Parsing ./data/export2.xml...
✓ Found 2050 items in ./data/export2.xml

...

✓ Total posts found: 8300

📝 Transforming posts...
✓ Transformed 8150 articles (skipped 150)

📦 Created 82 batches

Progress |████████████████░░░░| 80% || 6520/8150 Articles || ETA: 45s
```

## ✅ Verificação Pós-Migração

```sql
-- Contar artigos importados
SELECT COUNT(*) FROM articles;

-- Ver últimos 10 importados
SELECT title, slug, published_at 
FROM articles 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar slugs duplicados
SELECT slug, COUNT(*) 
FROM articles 
GROUP BY slug 
HAVING COUNT(*) > 1;
```

## 🐛 Troubleshooting

### Erro: "Missing Supabase credentials"
- Verifique se o `.env` existe e tem as credenciais corretas

### Erro: "Missing DEFAULT_AUTHOR_ID"
- Execute a query SQL para obter o UUID do autor

### Erro: "No XML files specified"
- Verifique se `XML_FILES` no `.env` aponta para os arquivos corretos

### Erro: "ENOENT: no such file"
- Verifique se os arquivos XML existem na pasta `data/`

### Muitos erros durante importação
- Reduza `BATCH_SIZE` para 50
- Reduza `CONCURRENT_REQUESTS` para 2
- Verifique os erros em `migration-errors.json`

## 📝 Estrutura de Dados

### WordPress XML → Supabase

| WordPress | Supabase | Transformação |
|-----------|----------|---------------|
| `title` | `title` | Direto |
| `content:encoded` | `content` | Limpa shortcodes |
| `excerpt:encoded` | `excerpt` | Trunca em 300 chars |
| `wp:post_name` | `slug` | Gera único |
| `pubDate` | `published_at` | Converte ISO |
| - | `author_id` | Usa DEFAULT_AUTHOR_ID |
| - | `blog_id` | Usa DEFAULT_BLOG_ID |
| - | `category_id` | Usa DEFAULT_CATEGORY_ID |
| - | `reading_time` | Calcula automaticamente |
| `wp:status` | `status` | `publish` → `published` |

## ⏱️ Tempo Estimado

- **8300 artigos**
- **Batch de 100**
- **5 requisições paralelas**
- **≈ 20-30 minutos**

## 🔄 Rollback

Se precisar desfazer:

```sql
-- CUIDADO! Isso deleta TODOS os artigos
DELETE FROM articles WHERE created_at > '2026-02-05T20:00:00Z';

-- Ou deletar por blog_id
DELETE FROM articles WHERE blog_id = 'seu-blog-uuid';
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique `migration-errors.json`
2. Execute com `--dry-run` primeiro
3. Teste com 1 arquivo XML primeiro
4. Reduza batch size e concorrência
