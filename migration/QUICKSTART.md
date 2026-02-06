# WordPress Migration - Quick Start Guide

## 🚀 Passos Rápidos

### 1. Instalar Dependências
```bash
cd migration
npm install
```

### 2. Configurar Ambiente

Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 3. Obter IDs Necessários

Execute o helper:
```bash
node src/get-ids.js
```

Copie os IDs exibidos para o `.env`

### 4. Colocar Arquivos XML

Coloque seus 4 arquivos XML na pasta `data/`:
```
migration/
└── data/
    ├── export1.xml
    ├── export2.xml
    ├── export3.xml
    └── export4.xml
```

### 5. Atualizar .env

Edite `XML_FILES` com os caminhos corretos:
```env
XML_FILES=./data/export1.xml,./data/export2.xml,./data/export3.xml,./data/export4.xml
```

### 6. Teste (Dry Run)

```bash
npm run dry-run
```

Verifique se tudo está OK!

### 7. Executar Migração

```bash
npm run migrate
```

## ⏱️ Tempo Estimado

- **8300 artigos** ≈ **20-30 minutos**

## 📊 Acompanhar Progresso

Você verá uma barra de progresso:
```
Progress |████████████░░░░| 75% || 6225/8300 Articles || ETA: 120s
```

## ✅ Verificar Resultado

```sql
SELECT COUNT(*) FROM articles;
```

## 🐛 Problemas?

Veja `migration-errors.json` para detalhes dos erros.
