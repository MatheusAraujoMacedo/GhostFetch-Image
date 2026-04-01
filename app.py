from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import requests
from io import BytesIO
from PIL import Image
import yt_dlp
import os
import tempfile
import re
import zipfile

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

def process_single_image(url, fmt='png'):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': url 
    }
    response = requests.get(url, headers=headers, stream=True, timeout=10)
    response.raise_for_status()
    image_data = response.content
    img = Image.open(BytesIO(image_data))
    
    if img.mode in ('RGBA', 'P') and fmt == 'jpeg':
        img = img.convert('RGB')
        
    output = BytesIO()
    img.save(output, format=fmt.upper())
    output.seek(0)
    return output

@app.route('/api/download', methods=['POST'])
def download_image():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
        
    url = data['url']
    fmt = data.get('format', 'png')
    if fmt == 'auto': fmt = 'png'
    
    try:
        output = process_single_image(url, fmt)
        return send_file(
            output,
            mimetype=f'image/{fmt}',
            as_attachment=True,
            download_name=f'imagem_convertida.{fmt}'
        )
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch image: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

def download_media_file(url, fmt, output_dir):
    ydl_format = 'bestaudio[ext=m4a]/bestaudio' if fmt == 'audio' else 'best[ext=mp4]/best'
    
    ydl_opts = {
        'format': ydl_format,
        'outtmpl': os.path.join(output_dir, '%(title)s_%(id)s.%(ext)s'),
        'noplaylist': True,
        'quiet': True,
        'restrictfilenames': True
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        if not os.path.exists(filename):
            base, _ = os.path.splitext(filename)
            for ext in ['.mp4', '.mkv', '.webm', '.m4a']:
                if os.path.exists(base + ext):
                    filename = base + ext
                    break
        return filename, info

def download_tiktok_no_watermark(url, output_dir):
    """Download TikTok video without watermark using yt-dlp."""
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'outtmpl': os.path.join(output_dir, '%(title)s_%(id)s.%(ext)s'),
        'noplaylist': True,
        'quiet': True,
        'restrictfilenames': True,
        'merge_output_format': 'mp4',
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        'postprocessors': [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        # Ensure we find the actual output file
        base, _ = os.path.splitext(filename)
        if not os.path.exists(filename):
            for ext in ['.mp4', '.mkv', '.webm']:
                if os.path.exists(base + ext):
                    filename = base + ext
                    break
        # If converted, also check for .mp4
        if not filename.endswith('.mp4') and os.path.exists(base + '.mp4'):
            filename = base + '.mp4'
        return filename, info

@app.route('/api/download/media', methods=['POST'])
def download_media():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
        
    url = data['url']
    fmt = data.get('format', 'auto')
    
    try:
        temp_dir = tempfile.gettempdir()
        filename, info = download_media_file(url, fmt, temp_dir)

        return send_file(
            filename,
            as_attachment=True,
            download_name=os.path.basename(filename)
        )
    except Exception as e:
        return jsonify({'error': f'Failed to process media: {str(e)}'}), 500

@app.route('/api/download/tiktok', methods=['POST'])
def download_tiktok():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400

    url = data['url']

    # Validate TikTok URL
    tiktok_pattern = r'(tiktok\.com|vm\.tiktok\.com)'
    if not re.search(tiktok_pattern, url):
        return jsonify({'error': 'URL fornecida não é do TikTok. Por favor, insira um link válido do TikTok.'}), 400

    try:
        temp_dir = tempfile.gettempdir()
        filename, info = download_tiktok_no_watermark(url, temp_dir)

        title = info.get('title', 'tiktok_video')[:50]
        safe_title = re.sub(r'[^\w\s-]', '', title).strip().replace(' ', '_')
        download_name = f'{safe_title}.mp4' if safe_title else 'tiktok_video.mp4'

        return send_file(
            filename,
            mimetype='video/mp4',
            as_attachment=True,
            download_name=download_name
        )
    except Exception as e:
        return jsonify({'error': f'Falha ao baixar vídeo TikTok: {str(e)}'}), 500

@app.route('/api/download/batch', methods=['POST'])
def download_batch():
    data = request.get_json()
    if not data or 'urls' not in data:
        return jsonify({'error': 'URLs array is required'}), 400
        
    urls = data['urls']
    fmt = data.get('format', 'auto')
    
    try:
        temp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(tempfile.gettempdir(), 'batch_download.zip')
        
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for i, url in enumerate(urls):
                try:
                    # Very simple heuristic or you can force based on user choice
                    is_media = fmt == 'audio' or (fmt == 'auto' and any(domain in url for domain in ['youtube', 'youtu.be', 'tiktok', 'instagram', 'twitter', 'x.com']))
                    
                    if is_media:
                        filename, _ = download_media_file(url, fmt, temp_dir)
                        zipf.write(filename, arcname=os.path.basename(filename))
                    else:
                        img_fmt = 'png' if fmt == 'auto' else fmt
                        if img_fmt == 'audio': img_fmt = 'png' # fallback
                        img_output = process_single_image(url, img_fmt)
                        temp_img = os.path.join(temp_dir, f'image_{i}.{img_fmt}')
                        with open(temp_img, 'wb') as f:
                            f.write(img_output.read())
                        zipf.write(temp_img, arcname=f'image_{i}.{img_fmt}')
                except Exception as ex:
                    print(f"Failed to process {url}: {ex}")
                    continue
                    
        return send_file(
            zip_path,
            as_attachment=True,
            download_name='downloads.zip'
        )
    except Exception as e:
        return jsonify({'error': f'Batch process failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
