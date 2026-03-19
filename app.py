from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import requests
from io import BytesIO
from PIL import Image
import yt_dlp
import tempfile
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/download', methods=['POST'])
def download_image():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
        
    url = data['url']
    
    try:
        # Spoof User-Agent to bypass basic blocks
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': url 
        }
        
        response = requests.get(url, headers=headers, stream=True, timeout=10)
        response.raise_for_status()
        
        image_data = response.content
        
        # Determine format based on Content-Type or open it directly with PIL
        img = Image.open(BytesIO(image_data))
        
        # Save as PNG
        output = BytesIO()
        img.save(output, format='PNG')
        output.seek(0)
        
        return send_file(
            output,
            mimetype='image/png',
            as_attachment=True,
            download_name='imagem_convertida.png'
        )
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch image: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

@app.route('/api/download/youtube', methods=['POST'])
def download_youtube():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
        
    url = data['url']
    
    try:
        temp_dir = tempfile.gettempdir()
        
        ydl_opts = {
            # Ao usar apenas 'best', evitamos precisar do ffmpeg instalado no PC para juntar áudio e vídeo
            'format': 'best[ext=mp4]/best',
            'outtmpl': os.path.join(temp_dir, 'ytdlp_%(id)s.%(ext)s'),
            'noplaylist': True,
            'quiet': True,
            'restrictfilenames': True
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
            # Since sometimes it merges into mkv if ffmpeg requires, let's just make sure it returns whatever it generated
            if not os.path.exists(filename):
                # if the extension changed because of merge
                base, _ = os.path.splitext(filename)
                for ext in ['.mp4', '.mkv', '.webm']:
                    if os.path.exists(base + ext):
                        filename = base + ext
                        break

        # Send file back
        return send_file(
            filename,
            as_attachment=True,
            download_name=info.get('title', 'video') + os.path.splitext(filename)[1]
        )
    except Exception as e:
        return jsonify({'error': f'Failed to process YouTube video: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
