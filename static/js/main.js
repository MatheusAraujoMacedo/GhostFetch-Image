document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('downloadForm');
    const urlInput = document.getElementById('imageUrl');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = document.getElementById('spinner');
    const statusMessage = document.getElementById('statusMessage');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        if (!url) return;

        // Reset UI Context
        setLoadingState(true);
        hideStatus();
        previewContainer.classList.add('hidden');

        try {
            const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
            const endpoint = isYouTube ? '/api/download/youtube' : '/api/download';
            
            if (isYouTube) {
                showStatus('Baixando vídeo do YouTube (isso pode levar alguns minutos dependendo do tamanho)...', 'success');
            } else {
                showStatus('Iniciando processamento da imagem...', 'success');
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao processar o link. Verifique se o link é válido e público.');
            }

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            
            if (!isYouTube) {
                imagePreview.src = objectUrl;
                previewContainer.classList.remove('hidden');
            }

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = objectUrl;
            
            // Attempt to get filename from content-disposition header if present
            let filename = isYouTube ? 'video_baixado.mp4' : 'imagem_convertida.png';
            const disposition = response.headers.get('Content-Disposition');
            if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    filename = decodeURIComponent(match[1]);
                }
            } else if (!isYouTube) {
                try {
                    const urlObj = new URL(url);
                    const pathname = urlObj.pathname;
                    const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
                    if (lastPart) {
                        filename = lastPart.split('.')[0] + '.png';
                    }
                } catch (err) {}
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Clean up later
            setTimeout(() => {
                window.URL.revokeObjectURL(objectUrl);
                a.remove();
            }, 5000); // Wait longer for videos

            showStatus('Download concluído com sucesso!', 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            showStatus(error.message, 'error');
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Processando...';
            spinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Processar Image';
            spinner.classList.add('hidden');
        }
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type;
        statusMessage.classList.remove('hidden');
    }

    function hideStatus() {
        statusMessage.classList.add('hidden');
        statusMessage.className = '';
    }
});
