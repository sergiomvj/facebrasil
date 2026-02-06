# 📸 Fase 2: Download de Imagens (Executar Depois)

## Por que em 2 fases?

**Fase 1 (Agora):** Importar artigos com URLs originais
- ✅ Rápido (20-30 min)
- ✅ Artigos disponíveis imediatamente
- ✅ Não sobrecarrega Supabase Storage

**Fase 2 (Depois):** Migrar imagens para Supabase Storage
- 📥 Download de ~8000 imagens
- ☁️ Upload para Supabase Storage
- 🔄 Atualizar URLs nos artigos
- ⏱️ Tempo: 2-4 horas (em background)

## Script para Fase 2

```javascript
// migration/src/download-images.js
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function downloadAndUploadImage(url, articleId) {
  try {
    // Download image
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    // Get extension
    const ext = url.split('.').pop().split('?')[0] || 'jpg';
    const fileName = `${articleId}.${ext}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('articles')
      .upload(fileName, response.data, {
        contentType: response.headers['content-type'],
        upsert: true
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('articles')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

async function migrateImages() {
  // Get all articles with external images
  const { data: articles } = await supabase
    .from('articles')
    .select('id, featured_image')
    .not('featured_image', 'is', null)
    .like('featured_image', 'http%');
  
  console.log(`Found ${articles.length} articles with external images`);
  
  for (const article of articles) {
    const newUrl = await downloadAndUploadImage(
      article.featured_image,
      article.id
    );
    
    if (newUrl) {
      await supabase
        .from('articles')
        .update({ featured_image: newUrl })
        .eq('id', article.id);
      
      console.log(`✓ Migrated image for article ${article.id}`);
    }
  }
}

migrateImages();
```

## Quando Executar Fase 2?

- ✅ Depois que a Fase 1 estiver completa
- ✅ Em horário de baixo tráfego
- ✅ Com monitoramento de uso do Supabase Storage
- ✅ Pode pausar e retomar se necessário

## Alternativa: CDN Externo

Se preferir, pode usar Cloudflare Images ou outro CDN:
- Mais barato que Supabase Storage
- Melhor performance global
- Otimização automática de imagens
