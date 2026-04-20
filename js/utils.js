function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function resizeImage(img, maxWidth, maxHeight) {
    let width = img.width;
    let height = img.height;
    
    if (maxWidth && width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
    }
    
    if (maxHeight && height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
    }
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    return canvas;
}

function compressImage(img, quality = 0.8) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    return canvas.toDataURL('image/jpeg', quality);
}

function convertFormat(img, format) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp'
    };
    
    return canvas.toDataURL(mimeTypes[format.toLowerCase()] || 'image/jpeg');
}

function rotateImage(img, degrees) {
    const canvas = createCanvas(img.height, img.width);
    const ctx = canvas.getContext('2d');
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    return canvas;
}

function flipImage(img, horizontal = true) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    if (horizontal) {
        ctx.translate(img.width, 0);
        ctx.scale(-1, 1);
    } else {
        ctx.translate(0, img.height);
        ctx.scale(1, -1);
    }
    
    ctx.drawImage(img, 0, 0);
    return canvas;
}

function cropImage(img, x, y, width, height) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    return canvas;
}

function addWatermark(img, text, options = {}) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    
    const fontSize = options.fontSize || Math.max(img.width, img.height) * 0.05;
    ctx.font = `${options.fontWeight || 'bold'} ${fontSize}px Arial`;
    ctx.fillStyle = options.color || 'rgba(255, 255, 255, 0.5)';
    
    const x = options.x || img.width - 20;
    const y = options.y || img.height - 20;
    
    ctx.textAlign = options.align || 'right';
    ctx.textBaseline = options.baseline || 'bottom';
    ctx.fillText(text, x, y);
    
    return canvas;
}

function adjustBrightness(img, brightness) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] + brightness));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function adjustContrast(img, contrast) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function addRoundedCorners(img, radius) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(canvas.width - radius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    ctx.lineTo(canvas.width, canvas.height - radius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
    ctx.lineTo(radius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    
    ctx.clip();
    ctx.drawImage(img, 0, 0);
    
    return canvas;
}

function downloadImage(canvas, filename = 'image.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadDataURL(dataURL, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function setupDragDrop(dropZone, onFileDrop) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });
    
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            onFileDrop(files[0]);
        }
    }, false);
}

function setupFileInput(inputId, onFileSelect) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                onFileSelect(e.target.files[0]);
            }
        });
    }
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function updatePreview(imageSrc, previewId = 'preview') {
    const preview = document.getElementById(previewId);
    if (preview) {
        preview.src = imageSrc;
    }
}

function showResult(message, resultId = 'resultArea') {
    const resultArea = document.getElementById(resultId);
    if (resultArea) {
        const title = resultArea.querySelector('.result-title');
        if (title) {
            title.textContent = message;
        }
        resultArea.classList.add('show');
    }
}

function hideResult(resultId = 'resultArea') {
    const resultArea = document.getElementById(resultId);
    if (resultArea) {
        resultArea.classList.remove('show');
    }
}