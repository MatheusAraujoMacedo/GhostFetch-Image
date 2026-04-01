document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('downloadForm');
    const urlsInput = document.getElementById('imageUrls');
    const formatSelect = document.getElementById('formatSelect');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = document.getElementById('spinner');
    const statusMessage = document.getElementById('statusMessage');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const tiktokToggle = document.getElementById('tiktokMode');
    const tiktokWrapper = document.getElementById('tiktokToggleWrapper');

    // Auto-detect TikTok URLs and activate toggle
    urlsInput.addEventListener('input', () => {
        const text = urlsInput.value.trim();
        const isTikTok = /tiktok\.com|vm\.tiktok\.com/i.test(text);
        
        if (isTikTok && !tiktokToggle.checked) {
            tiktokToggle.checked = true;
            tiktokWrapper.classList.add('auto-detected');
            setTimeout(() => tiktokWrapper.classList.remove('auto-detected'), 1500);
        }
    });

    // Toggle visual feedback
    tiktokToggle.addEventListener('change', () => {
        if (tiktokToggle.checked) {
            formatSelect.disabled = true;
            formatSelect.style.opacity = '0.4';
        } else {
            formatSelect.disabled = false;
            formatSelect.style.opacity = '1';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = urlsInput.value.trim();
        if (!text) return;

        const urls = text.split('\n').map(u => u.trim()).filter(u => u);
        if (urls.length === 0) return;

        const format = formatSelect.value;
        const isBatch = urls.length > 1;
        const isTikTokMode = tiktokToggle.checked;

        // Reset UI Context
        setLoadingState(true);
        hideStatus();
        previewContainer.classList.add('hidden');

        try {
            let endpoint = '';
            let bodyPayload = {};
            let isMedia = format === 'audio' || (format === 'auto' && urls.some(url => 
                url.includes('youtube.com') || url.includes('youtu.be') || 
                url.includes('tiktok.com') || url.includes('instagram.com') || 
                url.includes('x.com') || url.includes('twitter.com')
            ));

            // TikTok Mode: use dedicated endpoint (single URL only)
            if (isTikTokMode && !isBatch) {
                endpoint = '/api/download/tiktok';
                bodyPayload = { url: urls[0] };
                showStatus('🎵 Baixando vídeo TikTok sem marca d\'água... Aguarde, isso pode levar alguns segundos.', 'success');
            } else if (isBatch) {
                endpoint = '/api/download/batch';
                bodyPayload = { urls, format };
                showStatus('Processando Lote (Batch). Isso pode levar vários minutos, não feche a página...', 'success');
            } else {
                const url = urls[0];
                endpoint = isMedia ? '/api/download/media' : '/api/download';
                bodyPayload = { url, format };
                
                if (isMedia) {
                    showStatus('Baixando Mídia (isso pode levar alguns minutos dependendo do tamanho)...', 'success');
                } else {
                    showStatus('Processando Imagem...', 'success');
                }
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao processar o(s) link(s). Verifique se são válidos e públicos.');
            }

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            
            if (!isBatch && !isMedia && !isTikTokMode) {
                // Previews ONLY for single images
                imagePreview.src = objectUrl;
                previewContainer.classList.remove('hidden');
            }

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = objectUrl;
            
            // Determine filename
            let filename = 'download';
            if (isTikTokMode) filename = 'tiktok_video.mp4';
            else if (isBatch) filename = 'downloads.zip';
            else if (isMedia) filename = format === 'audio' ? 'audio_baixado.m4a' : 'video_baixado.mp4';
            else filename = `imagem_convertida.${format === 'auto' ? 'png' : format}`;
            
            const disposition = response.headers.get('Content-Disposition');
            if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    filename = decodeURIComponent(match[1]);
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Clean up later
            setTimeout(() => {
                window.URL.revokeObjectURL(objectUrl);
                a.remove();
            }, 5000); 

            if (isTikTokMode) {
                showStatus('✅ Vídeo TikTok baixado com sucesso — sem marca d\'água!', 'success');
            } else {
                showStatus('Download concluído com sucesso!', 'success');
            }
            
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
            btnText.textContent = tiktokToggle.checked ? 'Baixando TikTok...' : 'Processando...';
            spinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Processar Links';
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
