from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import requests
from io import BytesIO
from PIL import Image

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
