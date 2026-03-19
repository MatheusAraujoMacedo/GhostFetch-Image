# WebP-Unblocker & Video Downloader

Um aplicativo web simples, moderno e elegante para baixar vídeos e Shorts do YouTube em MP4, além de baixar imagens bloqueadas e converter arquivos `.webp` da web diretamente para `.png` preservando a qualidade.

## 🚀 Funcionalidades

- **Download de Vídeos e Shorts do YouTube**: Basta colar o link do YouTube e o app baixa o MP4 na melhor qualidade!
- **Bypass de Proteções Básicas**: Faz o download simulando um navegador real, ideal para imagens de sites que bloqueiam o clique direito ou escondem a extensão.
- **Conversão Automática**: Processa imagens (como arquivos `.webp`) convertendo-os em tempo real para `.png`.
- **Interface Premium (UI/UX)**: Estética moderna utilizando *Glassmorphism* (efeito de vidro no CSS), Dark Mode nativo, e animações visuais fluidas.
- **Backend Robusto**: Servidor leve e direto ao ponto escrito em Python puro.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (Fetch API para requisições assíncronas inteligente)
- **Backend**: Python, Flask, Requests, Pillow (Manipulação de imagens) e **yt-dlp** (O melhor e mais moderno baixador de vídeos do YouTube).

## 📦 Como executar localmente

1. **Clone o projeto:**
   ```bash
   git clone https://github.com/SEU_USUARIO/webp-unblocker.git
   cd webp-unblocker
   ```

2. **Instale os requisitos:**
   (É recomendado usar um ambiente virtual Python, `venv`)
   ```bash
   pip install -r requirements.txt
   ```

3. **Inicie o servidor:**
   ```bash
   python app.py
   ```

4. **Acesse:**
   Abra seu navegador em [http://localhost:5000](http://localhost:5000), cole a URL da imagem ou o link do vídeo do YouTube e seja feliz!

## 🤝 Contribuindo
Fique à vontade para fazer um *fork* do projeto e enviar sugestões ou novas funções de melhoria via *Pull Request*. Licença livre!
