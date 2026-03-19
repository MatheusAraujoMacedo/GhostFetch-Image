# GhostFetch-Image


Um aplicativo web simples, moderno e elegante para baixar imagens bloqueadas em sites ou converter arquivos `.webp` da web diretamente para `.png` preservando a qualidade.

##  Funcionalidades

- **Bypass de Proteções Básicas**: Faz o download simulando um navegador real, ideal para imagens de sites que bloqueiam o clique direito ou escondem a extensão.
- **Conversão Automática**: Processa arquivos em `.webp` (muito comuns e difíceis de editar) convertendo-os em tempo real para `.png`.
- **Interface Premium (UI/UX)**: Estética moderna utilizando *Glassmorphism* (efeito de vidro no CSS), Dark Mode nativo, e animações visuais.
- **Backend Fácil**: Servidor leve e direto ao ponto escrito em Python puro.

##  Tecnologias Utilizadas

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (Fetch API para requisições assíncronas)
- **Backend**: Python, Flask, Requests (para atuar como proxy de download), Pillow (Processamento da imagem)

##  Como executar localmente

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
   Abra seu navegador em [http://localhost:5000](http://localhost:5000), cole a URL da imagem e seja feliz!

## 🤝 Contribuindo
Fique à vontade para fazer um *fork* do projeto e enviar sugestões ou novas funções de melhoria via *Pull Request*. Licença livre!
