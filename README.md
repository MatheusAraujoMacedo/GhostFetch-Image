# GhostFetch — Downloader Universal

Baixe imagens protegidas, vídeos do YouTube e **TikTok sem marca d'água**.

## Deploy no Render (Grátis)

### Opção 1: Deploy automático via Blueprint
1. Suba o código para um repositório no GitHub
2. Vá em [render.com/blueprints](https://render.com/blueprints)
3. Clique **"New Blueprint Instance"**
4. Conecte seu repositório → o `render.yaml` configura tudo automaticamente

### Opção 2: Deploy manual
1. Vá em [render.com/dashboard](https://dashboard.render.com)
2. Clique **"New" → "Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Runtime**: Docker
   - **Plan**: Free
5. Clique **"Create Web Service"**

## Rodar Localmente

```bash
pip install -r requirements.txt
python app.py
```

Abra `http://localhost:5000`
