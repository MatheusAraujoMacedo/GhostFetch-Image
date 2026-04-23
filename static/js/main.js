document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);

    const form = $('downloadForm');
    const urlInput = $('urlInput');
    const formatSelect = $('formatSelect');
    const submitBtn = $('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    const btnLoader = $('btnLoader');
    const progressWrapper = $('progressWrapper');
    const progressFill = $('progressFill');
    const progressLabel = $('progressLabel');
    const detectedBadge = $('detectedBadge');
    const detectedText = $('detectedText');
    const previewContainer = $('previewContainer');
    const imagePreview = $('imagePreview');
    const previewClose = $('previewClose');
    const toast = $('toast');
    const toastIcon = $('toastIcon');
    const toastMessage = $('toastMessage');
    const toastClose = $('toastClose');
    const dropZone = $('dropZone');
    const dropOverlay = $('dropOverlay');

    // TikTok toggle elements
    const tiktokToggleWrapper = $('tiktokToggleWrapper');
    const toggleVideo = $('toggleVideo');
    const toggleAudio = $('toggleAudio');
    const toggleSlider = $('toggleSlider');

    const cards = {
        image: $('cardImage'),
        youtube: $('cardYoutube'),
        tiktok: $('cardTiktok')
    };

    let toastTimeout = null;
    let tiktokAudioOnly = false;

    // ==========================================
    // Platform Detection
    // ==========================================
    const PLATFORMS = {
        tiktok: {
            pattern: /tiktok\.com|vm\.tiktok\.com/i,
            label: 'TikTok detectado — download sem marca d\'água',
            card: 'tiktok'
        },
        youtube: {
            pattern: /youtube\.com|youtu\.be/i,
            label: 'YouTube detectado — vídeo em alta qualidade',
            card: 'youtube'
        },
        media: {
            pattern: /instagram\.com|x\.com|twitter\.com/i,
            label: 'Mídia social detectada — download automático',
            card: null
        }
    };

    function detectPlatform(text) {
        for (const [key, config] of Object.entries(PLATFORMS)) {
            if (config.pattern.test(text)) return { key, ...config };
        }
        if (text.match(/\.(png|jpe?g|gif|webp|svg|bmp)/i)) {
            return { key: 'image', label: 'Imagem detectada — conversão automática', card: 'image' };
        }
        return null;
    }

    // ==========================================
    // TikTok Toggle (Video / Audio)
    // ==========================================
    function showTikTokToggle() {
        tiktokToggleWrapper.classList.remove('hidden');
    }

    function hideTikTokToggle() {
        tiktokToggleWrapper.classList.add('hidden');
        setTikTokMode('video');
    }

    function setTikTokMode(mode) {
        tiktokAudioOnly = mode === 'audio';

        toggleVideo.classList.toggle('active', mode === 'video');
        toggleAudio.classList.toggle('active', mode === 'audio');

        if (mode === 'audio') {
            toggleSlider.classList.add('audio-active');
            detectedText.textContent = 'TikTok detectado — apenas áudio (MP3)';
        } else {
            toggleSlider.classList.remove('audio-active');
            detectedText.textContent = 'TikTok detectado — download sem marca d\'água';
        }
    }

    toggleVideo.addEventListener('click', () => setTikTokMode('video'));
    toggleAudio.addEventListener('click', () => setTikTokMode('audio'));

    // ==========================================
    // Smart URL Input Detection
    // ==========================================
    urlInput.addEventListener('input', () => {
        const text = urlInput.value.trim();
        const platform = detectPlatform(text);

        Object.values(cards).forEach(c => c.classList.remove('active'));

        if (platform) {
            if (platform.card && cards[platform.card]) {
                cards[platform.card].classList.add('active');
            }
            detectedText.textContent = platform.label;
            detectedBadge.classList.remove('hidden');

            if (platform.key === 'tiktok') {
                formatSelect.disabled = true;
                formatSelect.parentElement.style.opacity = '0.4';
                showTikTokToggle();
            } else {
                formatSelect.disabled = false;
                formatSelect.parentElement.style.opacity = '1';
                hideTikTokToggle();
            }
        } else {
            detectedBadge.classList.add('hidden');
            formatSelect.disabled = false;
            formatSelect.parentElement.style.opacity = '1';
            hideTikTokToggle();
        }
    });

    // ==========================================
    // Feature Card Clicks
    // ==========================================
    Object.entries(cards).forEach(([platform, card]) => {
        card.addEventListener('click', () => {
            Object.values(cards).forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const placeholders = {
                image: 'Cole o link direto da imagem... (ex: https://site.com/foto.webp)',
                youtube: 'Cole o link do YouTube... (ex: https://youtube.com/watch?v=...)',
                tiktok: 'Cole o link do TikTok... (ex: https://www.tiktok.com/@user/video/...)'
            };

            urlInput.placeholder = placeholders[platform];
            urlInput.focus();

            if (platform === 'tiktok') {
                formatSelect.disabled = true;
                formatSelect.parentElement.style.opacity = '0.4';
                detectedText.textContent = 'Modo TikTok ativo — download sem marca d\'água';
                detectedBadge.classList.remove('hidden');
                showTikTokToggle();
            } else {
                formatSelect.disabled = false;
                formatSelect.parentElement.style.opacity = '1';
                detectedBadge.classList.add('hidden');
                hideTikTokToggle();
            }
        });
    });

    // ==========================================
    // Drag & Drop
    // ==========================================
    let dragCounter = 0;

    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        dropOverlay.classList.remove('hidden');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) dropOverlay.classList.add('hidden');
    });

    dropZone.addEventListener('dragover', (e) => e.preventDefault());

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        dropOverlay.classList.add('hidden');

        const text = e.dataTransfer.getData('text/plain');
        if (text) {
            urlInput.value = text;
            urlInput.dispatchEvent(new Event('input'));
        }
    });

    // ==========================================
    // Progress Bar
    // ==========================================
    function showProgress(label) {
        progressWrapper.classList.remove('hidden');
        progressFill.classList.add('indeterminate');
        progressLabel.textContent = label || 'Conectando...';
    }

    function updateProgress(label) {
        progressLabel.textContent = label;
    }

    function hideProgress() {
        progressWrapper.classList.add('hidden');
        progressFill.classList.remove('indeterminate');
        progressFill.style.width = '0%';
    }

    // ==========================================
    // Toast System
    // ==========================================
    function showToast(message, type = 'success') {
        if (toastTimeout) clearTimeout(toastTimeout);

        toastIcon.textContent = type === 'success' ? '✅' : '❌';
        toastMessage.textContent = message;
        toast.className = `toast toast-${type}`;

        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        toastTimeout = setTimeout(() => dismissToast(), 5000);
    }

    function dismissToast() {
        toast.classList.remove('visible');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }

    toastClose.addEventListener('click', dismissToast);

    // ==========================================
    // Preview
    // ==========================================
    previewClose.addEventListener('click', () => {
        previewContainer.classList.add('hidden');
    });

    // ==========================================
    // Form Submit
    // ==========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = urlInput.value.trim();
        if (!text) return;

        const urls = text.split('\n').map(u => u.trim()).filter(u => u);
        if (urls.length === 0) return;

        const format = formatSelect.value;
        const isBatch = urls.length > 1;
        const platform = detectPlatform(text);
        const isTikTokMode = platform && platform.key === 'tiktok';
        const isMedia = format === 'audio' || (format === 'auto' && urls.some(url =>
            url.includes('youtube.com') || url.includes('youtu.be') ||
            url.includes('tiktok.com') || url.includes('instagram.com') ||
            url.includes('x.com') || url.includes('twitter.com')
        ));

        setLoading(true);
        previewContainer.classList.add('hidden');

        try {
            let endpoint, bodyPayload;

            if (isTikTokMode && !isBatch) {
                endpoint = '/api/download/tiktok';
                bodyPayload = { url: urls[0], audio_only: tiktokAudioOnly };

                if (tiktokAudioOnly) {
                    showProgress('Conectando ao TikTok...');
                    setTimeout(() => updateProgress('Extraindo áudio do vídeo...'), 2000);
                    setTimeout(() => updateProgress('Convertendo para MP3...'), 4000);
                } else {
                    showProgress('Conectando ao TikTok...');
                    setTimeout(() => updateProgress('Baixando vídeo sem marca d\'água...'), 2000);
                }
            } else if (isBatch) {
                endpoint = '/api/download/batch';
                bodyPayload = { urls, format };
                showProgress('Processando lote...');
            } else if (isMedia) {
                endpoint = '/api/download/media';
                bodyPayload = { url: urls[0], format };
                showProgress('Baixando mídia...');
                setTimeout(() => updateProgress('Processando arquivo...'), 3000);
            } else {
                endpoint = '/api/download';
                bodyPayload = { url: urls[0], format };
                showProgress('Processando imagem...');
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Erro ao processar. Verifique se o link é válido e público.');
            }

            updateProgress('Finalizando download...');

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            if (!isBatch && !isMedia && !isTikTokMode) {
                imagePreview.src = objectUrl;
                previewContainer.classList.remove('hidden');
            }

            const a = document.createElement('a');
            a.href = objectUrl;

            let filename = 'download';
            if (isTikTokMode && tiktokAudioOnly) filename = 'tiktok_audio.mp3';
            else if (isTikTokMode) filename = 'tiktok_video.mp4';
            else if (isBatch) filename = 'downloads.zip';
            else if (isMedia) filename = format === 'audio' ? 'audio.m4a' : 'video.mp4';
            else filename = `imagem.${format === 'auto' ? 'png' : format}`;

            const disposition = response.headers.get('Content-Disposition');
            if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = decodeURIComponent(match[1]);
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                URL.revokeObjectURL(objectUrl);
                a.remove();
            }, 5000);

            const msg = isTikTokMode
                ? (tiktokAudioOnly
                    ? 'Áudio do TikTok baixado com sucesso!'
                    : 'Vídeo TikTok baixado sem marca d\'água!')
                : 'Download concluído com sucesso!';
            showToast(msg, 'success');

        } catch (error) {
            console.error('Download error:', error);
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
            hideProgress();
        }
    });

    // ==========================================
    // Loading State
    // ==========================================
    function setLoading(on) {
        submitBtn.disabled = on;
        if (on) {
            btnText.textContent = 'Baixando...';
            btnIcon.classList.add('hidden');
            btnLoader.classList.remove('hidden');
        } else {
            btnText.textContent = 'Download';
            btnIcon.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    }

    // ==========================================
    // Keyboard Shortcuts
    // ==========================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            urlInput.value = '';
            urlInput.dispatchEvent(new Event('input'));
            previewContainer.classList.add('hidden');
            dismissToast();
        }
    });
});
