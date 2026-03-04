# Deploy da Edge Function - count-pages

## 📋 Pré-requisitos

1. **Supabase CLI instalado:**
   ```bash
   npm install -g supabase
   ```

2. **Login no Supabase:**
   ```bash
   supabase login
   ```

3. **Link com seu projeto:**
   ```bash
   supabase link --project-ref SEU_PROJECT_REF
   ```

---

## 🚀 Deploy da Edge Function

### 1. Deploy da função count-pages

```bash
cd f:\COPINET\APPCopinet\WindSurf\AppCopinetv2
supabase functions deploy count-pages
```

### 2. Criar tabela de preços no Supabase

Execute a migration no Supabase Dashboard:

1. Vá em **SQL Editor**
2. Cole o conteúdo de `supabase/migrations/20260303_tabela_precos_impressao.sql`
3. Execute

Ou via CLI:

```bash
supabase db push
```

---

## 🔧 Configuração no Frontend

### 1. Obter URL da Edge Function

Após o deploy, a URL será:
```
https://SEU_PROJECT_REF.supabase.co/functions/v1/count-pages
```

### 2. Verificar permissões

A Edge Function já está configurada com CORS aberto (`Access-Control-Allow-Origin: *`).

Se precisar restringir, edite `supabase/functions/count-pages/index.ts`:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://seu-dominio.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

---

## 🧪 Testar Edge Function

### Via curl:

```bash
curl -X POST \
  https://SEU_PROJECT_REF.supabase.co/functions/v1/count-pages \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -F "file=@caminho/para/arquivo.pdf"
```

### Via Postman:

1. Method: `POST`
2. URL: `https://SEU_PROJECT_REF.supabase.co/functions/v1/count-pages`
3. Headers:
   - `Authorization: Bearer SEU_ANON_KEY`
4. Body: `form-data`
   - Key: `file`
   - Type: `File`
   - Value: Selecione arquivo PDF

---

## 📊 Monitorar Logs

```bash
supabase functions logs count-pages --tail
```

Ou no Supabase Dashboard:
- **Edge Functions** → **count-pages** → **Logs**

---

## 🔄 Atualizar Edge Function

Após fazer alterações em `supabase/functions/count-pages/index.ts`:

```bash
supabase functions deploy count-pages
```

---

## ⚠️ Troubleshooting

### Erro: "Function not found"
- Verifique se fez deploy: `supabase functions list`
- Re-deploy: `supabase functions deploy count-pages`

### Erro: "CORS"
- Verifique `corsHeaders` em `index.ts`
- Certifique-se que está enviando header `Authorization`

### Erro: "Body is unusable"
- Problema conhecido do Deno com FormData
- Solução já implementada no código (usando `req.formData()`)

### Contagem incorreta
- Verifique logs: `supabase functions logs count-pages`
- Teste com diferentes PDFs
- Fallback regex deve funcionar para PDFs malformados

---

## 📚 Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy/docs)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
