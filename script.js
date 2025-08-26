// Advanced Moodboard Creator
class MoodboardCreator {
  constructor() {
    this.images = [];
    this.settings = {
      layout: 'grid',
      gridColumns: 3,
      backgroundType: 'solid',
      backgroundColor: '#ffffff',
      gradientColor1: '#ffffff',
      gradientColor2: '#f0f0f0',
      gradientDirection: 'vertical',
      textureType: 'paper',
      textureColor: '#f8f8f8',
      imageFilter: 'none',
      exportResolution: 1,
      addTextLabels: false
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updatePreview();
  }

  setupEventListeners() {
    // File upload
const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      this.handleFileUpload(e.dataTransfer.files);
    });

    // Control changes
    document.getElementById('layoutStyle').addEventListener('change', (e) => {
      this.settings.layout = e.target.value;
      this.toggleLayoutControls();
      this.updatePreview();
    });

    document.getElementById('gridColumns').addEventListener('input', (e) => {
      this.settings.gridColumns = parseInt(e.target.value);
      document.getElementById('gridColumnsValue').textContent = e.target.value;
      this.updatePreview();
    });

    document.getElementById('backgroundType').addEventListener('change', (e) => {
      this.settings.backgroundType = e.target.value;
      this.toggleBackgroundControls();
      this.updatePreview();
    });

    document.getElementById('backgroundColor').addEventListener('change', (e) => {
      this.settings.backgroundColor = e.target.value;
      this.updatePreview();
    });

    document.getElementById('gradientColor1').addEventListener('change', (e) => {
      this.settings.gradientColor1 = e.target.value;
      this.updateGradientPreview();
      this.updatePreview();
    });

    document.getElementById('gradientColor2').addEventListener('change', (e) => {
      this.settings.gradientColor2 = e.target.value;
      this.updateGradientPreview();
      this.updatePreview();
    });

    document.getElementById('gradientDirection').addEventListener('change', (e) => {
      this.settings.gradientDirection = e.target.value;
      this.updateGradientPreview();
      this.updatePreview();
    });

    document.getElementById('textureType').addEventListener('change', (e) => {
      this.settings.textureType = e.target.value;
      this.updatePreview();
    });

    document.getElementById('textureColor').addEventListener('change', (e) => {
      this.settings.textureColor = e.target.value;
      this.updatePreview();
    });

    document.getElementById('imageFilter').addEventListener('change', (e) => {
      this.settings.imageFilter = e.target.value;
      this.updatePreview();
    });

    document.getElementById('exportResolution').addEventListener('change', (e) => {
      this.settings.exportResolution = parseInt(e.target.value);
    });

    document.getElementById('addTextLabels').addEventListener('change', (e) => {
      this.settings.addTextLabels = e.target.checked;
      this.updateImageLabels();
      this.updatePreview();
    });

    // Download button
    document.getElementById('downloadBoard').addEventListener('click', () => {
      this.downloadMoodboard();
    });

    // Initialize control visibility
    this.toggleLayoutControls();
    this.toggleBackgroundControls();
    this.updateGradientPreview();
  }

  async handleFileUpload(files) {
  for (let file of files) {
      if (!this.validateFile(file)) continue;
      
      const imageData = await this.processFile(file);
      if (imageData) {
        this.images.push(imageData);
        this.addImageToList(imageData);
      }
    }
    
    this.updatePreview();
    this.updateDownloadButton();
  }

  validateFile(file) {
    // Check file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      alert(`${file.name} is not a supported image format. Please use JPG, PNG, GIF, or WebP.`);
      return false;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} is too large. Maximum file size is 10MB.`);
      return false;
    }
    
    return true;
  }

  async processFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            id: Date.now() + Math.random(),
            file: file,
            src: e.target.result,
            img: img,
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
        img.onerror = () => resolve(null);
        img.src = e.target.result;
      };
    reader.readAsDataURL(file);
    });
  }

  addImageToList(imageData) {
    const imageList = document.getElementById('imageList');
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.draggable = true;
    imageItem.dataset.imageId = imageData.id;
    
    imageItem.innerHTML = `
      <img src="${imageData.src}" alt="${imageData.name}">
      <button class="remove-btn" onclick="moodboard.removeImage('${imageData.id}')">×</button>
      ${this.settings.addTextLabels ? `<input type="text" class="text-label" placeholder="Add label..." value="${imageData.name}">` : ''}
    `;
    
    // Add drag and drop for reordering
    imageItem.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', imageData.id);
    });
    
    imageItem.addEventListener('dragover', (e) => e.preventDefault());
    
    imageItem.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      this.reorderImages(draggedId, imageData.id);
    });
    
    imageList.appendChild(imageItem);
  }

  removeImage(imageId) {
    this.images = this.images.filter(img => img.id != imageId);
    document.querySelector(`[data-image-id="${imageId}"]`).remove();
    this.updatePreview();
    this.updateDownloadButton();
  }

  reorderImages(draggedId, targetId) {
    const draggedIndex = this.images.findIndex(img => img.id == draggedId);
    const targetIndex = this.images.findIndex(img => img.id == targetId);
    
    if (draggedIndex > -1 && targetIndex > -1) {
      const draggedImage = this.images.splice(draggedIndex, 1)[0];
      this.images.splice(targetIndex, 0, draggedImage);
      this.refreshImageList();
      this.updatePreview();
    }
  }

  refreshImageList() {
    const imageList = document.getElementById('imageList');
    imageList.innerHTML = '';
    this.images.forEach(imageData => this.addImageToList(imageData));
  }

  updateImageLabels() {
    const imageList = document.getElementById('imageList');
    const items = imageList.querySelectorAll('.image-item');
    
    items.forEach(item => {
      const existingLabel = item.querySelector('.text-label');
      const imageId = item.dataset.imageId;
      const imageData = this.images.find(img => img.id == imageId);
      
      if (this.settings.addTextLabels && !existingLabel) {
        const label = document.createElement('input');
        label.type = 'text';
        label.className = 'text-label';
        label.placeholder = 'Add label...';
        label.value = imageData.name;
        item.appendChild(label);
      } else if (!this.settings.addTextLabels && existingLabel) {
        existingLabel.remove();
      }
    });
  }

  toggleLayoutControls() {
    const gridColumnsGroup = document.getElementById('gridColumnsGroup');
    gridColumnsGroup.style.display = this.settings.layout === 'grid' ? 'flex' : 'none';
  }

  toggleBackgroundControls() {
    const backgroundColorGroup = document.getElementById('backgroundColorGroup');
    const gradientGroup = document.getElementById('gradientGroup');
    const textureGroup = document.getElementById('textureGroup');
    
    backgroundColorGroup.classList.toggle('hidden', this.settings.backgroundType !== 'solid');
    gradientGroup.classList.toggle('hidden', this.settings.backgroundType !== 'gradient');
    textureGroup.classList.toggle('hidden', this.settings.backgroundType !== 'texture');
  }

  updateGradientPreview() {
    const preview = document.getElementById('gradientPreview');
    if (!preview) return;

    const { gradientColor1, gradientColor2, gradientDirection } = this.settings;
    let gradientCSS;

    switch (gradientDirection) {
      case 'horizontal':
        gradientCSS = `linear-gradient(to right, ${gradientColor1}, ${gradientColor2})`;
        break;
      case 'diagonal':
        gradientCSS = `linear-gradient(45deg, ${gradientColor1}, ${gradientColor2})`;
        break;
      case 'radial':
        gradientCSS = `radial-gradient(circle, ${gradientColor1}, ${gradientColor2})`;
        break;
      default: // vertical
        gradientCSS = `linear-gradient(to bottom, ${gradientColor1}, ${gradientColor2})`;
    }

    preview.style.background = gradientCSS;
  }

  updateDownloadButton() {
    const downloadBtn = document.getElementById('downloadBoard');
    downloadBtn.disabled = this.images.length === 0;
  }

  async updatePreview() {
    const previewContainer = document.getElementById('moodboardPreview');
    
    if (this.images.length === 0) {
      previewContainer.innerHTML = '<div class="preview-placeholder">Upload images to see preview</div>';
      return;
    }

    const canvas = await this.generateCanvas(false); // Preview mode
    if (canvas) {
      previewContainer.innerHTML = '';
      canvas.className = 'preview-canvas';
      previewContainer.appendChild(canvas);
    }
  }

  async generateCanvas(isExport = true) {
    if (this.images.length === 0) return null;

    const baseSize = 800;
    const exportMultiplier = isExport ? this.settings.exportResolution : 1;
    const layout = this.calculateLayout();
    
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
    canvas.width = layout.width * exportMultiplier;
    canvas.height = layout.height * exportMultiplier;
    
    if (exportMultiplier !== 1) {
      ctx.scale(exportMultiplier, exportMultiplier);
    }

    // Draw background
    this.drawBackground(ctx, layout.width, layout.height);
    
    // Draw images
    await this.drawImages(ctx, layout);
    
    return canvas;
  }

  calculateLayout() {
    const padding = 40;
    const gap = 20;
    
    switch (this.settings.layout) {
      case 'grid':
        return this.calculateGridLayout(padding, gap);
      case 'collage':
        return this.calculateCollageLayout(padding, gap);
      case 'smart':
        return this.calculateSmartLayout(padding, gap);
      default:
        return this.calculateGridLayout(padding, gap);
    }
  }

  calculateGridLayout(padding, gap) {
    const cols = this.settings.gridColumns;
    const rows = Math.ceil(this.images.length / cols);
    const tileSize = 200;
    
    const width = cols * tileSize + (cols - 1) * gap + padding * 2;
    const height = rows * tileSize + (rows - 1) * gap + padding * 2;
    
    const positions = [];
    for (let i = 0; i < this.images.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = padding + col * (tileSize + gap);
      const y = padding + row * (tileSize + gap);
      
      positions.push({
        x, y, width: tileSize, height: tileSize,
        image: this.images[i]
      });
    }
    
    return { width, height, positions };
  }

  calculateCollageLayout(padding, gap) {
    // Artistic collage with varied sizes and slight rotations, avoiding overlaps
    const baseSize = 160;
    const width = 800;
    const height = 600;
    const positions = [];
    const placedRects = []; // Track placed rectangles to avoid overlaps
    
    for (let i = 0; i < this.images.length; i++) {
      const image = this.images[i];
      const aspectRatio = image.width / image.height;
      
      // Vary size and position
      const sizeVariation = 0.8 + Math.random() * 0.4; // 0.8x to 1.2x (smaller range)
      const size = baseSize * sizeVariation;
      
      const itemWidth = size * Math.max(aspectRatio, 1);
      const itemHeight = size / Math.max(aspectRatio, 1);
      const rotation = (Math.random() - 0.5) * 15; // -7.5 to +7.5 degrees (less rotation)
      
      // Try to find a non-overlapping position
      let x, y, attempts = 0;
      const maxAttempts = 50;
      
      do {
        x = padding + Math.random() * (width - itemWidth - padding * 2);
        y = padding + Math.random() * (height - itemHeight - padding * 2);
        attempts++;
      } while (attempts < maxAttempts && this.checkOverlap(x, y, itemWidth, itemHeight, placedRects, gap));
      
      // If we couldn't find a good spot, use a grid-like fallback
      if (attempts >= maxAttempts) {
        const cols = Math.ceil(Math.sqrt(this.images.length));
        const row = Math.floor(i / cols);
        const col = i % cols;
        const gridSize = Math.min((width - padding * 2) / cols, (height - padding * 2) / Math.ceil(this.images.length / cols));
        
        x = padding + col * gridSize + Math.random() * 20 - 10; // Small random offset
        y = padding + row * gridSize + Math.random() * 20 - 10;
      }
      
      positions.push({
        x, y, 
        width: itemWidth,
        height: itemHeight,
        rotation,
        image
      });
      
      // Add this rectangle to placed rectangles with some margin
      placedRects.push({
        x: x - gap,
        y: y - gap,
        width: itemWidth + gap * 2,
        height: itemHeight + gap * 2
      });
    }
    
    return { width, height, positions };
  }

  checkOverlap(x, y, width, height, placedRects, margin = 0) {
    const rect = { x: x - margin, y: y - margin, width: width + margin * 2, height: height + margin * 2 };
    
    for (const placed of placedRects) {
      if (rect.x < placed.x + placed.width &&
          rect.x + rect.width > placed.x &&
          rect.y < placed.y + placed.height &&
          rect.y + rect.height > placed.y) {
        return true; // Overlap detected
      }
    }
    return false; // No overlap
  }

  calculateSmartLayout(padding, gap) {
    // Smart layout based on aspect ratios
    const images = this.images.map(img => ({
      ...img,
      aspectRatio: img.width / img.height
    }));
    
    // Separate landscape, portrait, and square images
    const landscape = images.filter(img => img.aspectRatio > 1.2);
    const portrait = images.filter(img => img.aspectRatio < 0.8);
    const square = images.filter(img => img.aspectRatio >= 0.8 && img.aspectRatio <= 1.2);
    
    const width = 800;
    const height = 600;
    const positions = [];
    
    let currentX = padding;
    let currentY = padding;
    let rowHeight = 0;
    
    // Mix images intelligently
    const mixedImages = [];
    const maxLength = Math.max(landscape.length, portrait.length, square.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (landscape[i]) mixedImages.push(landscape[i]);
      if (square[i]) mixedImages.push(square[i]);
      if (portrait[i]) mixedImages.push(portrait[i]);
    }
    
    for (const image of mixedImages) {
      const baseHeight = 160;
      const imageWidth = baseHeight * image.aspectRatio;
      const imageHeight = baseHeight;
      
      // Check if we need a new row
      if (currentX + imageWidth > width - padding) {
        currentX = padding;
        currentY += rowHeight + gap;
        rowHeight = 0;
      }
      
      positions.push({
        x: currentX,
        y: currentY,
        width: imageWidth,
        height: imageHeight,
        image
      });
      
      currentX += imageWidth + gap;
      rowHeight = Math.max(rowHeight, imageHeight);
    }
    
    return { width, height: Math.max(height, currentY + rowHeight + padding), positions };
  }

  drawBackground(ctx, width, height) {
    switch (this.settings.backgroundType) {
      case 'solid':
        ctx.fillStyle = this.settings.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        break;
        
      case 'gradient':
        let gradient;
        switch (this.settings.gradientDirection) {
          case 'horizontal':
            gradient = ctx.createLinearGradient(0, 0, width, 0);
            break;
          case 'diagonal':
            gradient = ctx.createLinearGradient(0, 0, width, height);
            break;
          case 'radial':
            gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
            break;
          default: // vertical
            gradient = ctx.createLinearGradient(0, 0, 0, height);
        }
        gradient.addColorStop(0, this.settings.gradientColor1);
        gradient.addColorStop(1, this.settings.gradientColor2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
        
      case 'texture':
        ctx.fillStyle = this.getTexturePattern(ctx);
        ctx.fillRect(0, 0, width, height);
        break;
    }
  }

  getTexturePattern(ctx) {
    // Create a simple procedural texture with custom color
    const size = 100;
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = textureCanvas.height = size;
    const textureCtx = textureCanvas.getContext('2d');
    const baseColor = this.settings.textureColor;
    
    switch (this.settings.textureType) {
      case 'paper':
        textureCtx.fillStyle = baseColor;
        textureCtx.fillRect(0, 0, size, size);
        // Add noise
        for (let i = 0; i < 1000; i++) {
          textureCtx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
          textureCtx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
        }
        break;
        
      case 'canvas':
        textureCtx.fillStyle = baseColor;
        textureCtx.fillRect(0, 0, size, size);
        // Cross-hatch pattern
        textureCtx.strokeStyle = 'rgba(0,0,0,0.05)';
        textureCtx.lineWidth = 0.5;
        for (let i = 0; i < size; i += 3) {
          textureCtx.beginPath();
          textureCtx.moveTo(i, 0);
          textureCtx.lineTo(i, size);
          textureCtx.stroke();
          textureCtx.beginPath();
          textureCtx.moveTo(0, i);
          textureCtx.lineTo(size, i);
          textureCtx.stroke();
        }
        break;
        
      case 'fabric':
        textureCtx.fillStyle = baseColor;
        textureCtx.fillRect(0, 0, size, size);
        // Weave pattern
        textureCtx.fillStyle = 'rgba(0,0,0,0.03)';
        for (let i = 0; i < size; i += 4) {
          textureCtx.fillRect(i, 0, 2, size);
          textureCtx.fillRect(0, i, size, 2);
        }
        break;
    }
    
    return ctx.createPattern(textureCanvas, 'repeat');
  }

  async drawImages(ctx, layout) {
    for (const position of layout.positions) {
      await this.drawSingleImage(ctx, position);
    }
  }

  async drawSingleImage(ctx, position) {
    const { x, y, width, height, rotation = 0, image } = position;
    
    ctx.save();
    
    // Apply rotation if specified
    if (rotation) {
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
    } else {
      ctx.translate(x, y);
    }
    
    // Clip to rounded rectangle
    this.roundedRect(ctx, 0, 0, width, height, 8);
    ctx.clip();
    
    // Apply image filter
    this.applyImageFilter(ctx);
    
    // Calculate cover-fit dimensions
    const scale = Math.max(width / image.width, height / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const offsetX = (width - scaledWidth) / 2;
    const offsetY = (height - scaledHeight) / 2;
    
    // Draw image
    ctx.drawImage(image.img, offsetX, offsetY, scaledWidth, scaledHeight);
    
    // Draw text label if enabled
    if (this.settings.addTextLabels) {
      const labelInput = document.querySelector(`[data-image-id="${image.id}"] .text-label`);
      const labelText = labelInput ? labelInput.value : image.name;
      
      if (labelText) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, height - 30, width, 30);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Roboto, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, 8, height - 15);
      }
    }
    
    ctx.restore();
  }

  applyImageFilter(ctx) {
    switch (this.settings.imageFilter) {
      case 'vintage':
        ctx.filter = 'sepia(50%) contrast(120%) brightness(110%)';
        break;
      case 'bright':
        ctx.filter = 'brightness(120%) contrast(110%)';
        break;
      case 'contrast':
        ctx.filter = 'contrast(150%) brightness(105%)';
        break;
      case 'warm':
        ctx.filter = 'sepia(20%) saturate(120%) hue-rotate(10deg)';
        break;
      case 'cool':
        ctx.filter = 'saturate(110%) hue-rotate(-10deg) brightness(105%)';
        break;
      default:
        ctx.filter = 'none';
    }
  }

  roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  async downloadMoodboard() {
    if (this.images.length === 0) {
      alert('Please upload some images first.');
      return;
    }

    const canvas = await this.generateCanvas(true); // Export mode
    if (!canvas) return;

    const filename = this.generateFilename();
    
    // Try toBlob first, fallback to toDataURL
    if (canvas.toBlob) {
  canvas.toBlob((blob) => {
        if (blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
          link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);
    } else {
      const url = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
    }
  }

  generateFilename() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16).replace(/[:-]/g, '').replace('T', '-');
    const layoutName = this.settings.layout;
    const resolution = this.settings.exportResolution;
    return `moodboard-${layoutName}-${resolution}x-${dateStr}.png`;
  }
}

// Initialize the moodboard creator
const moodboard = new MoodboardCreator();

// Toggle customize panel
function toggleCustomizePanel() {
  const controls = document.getElementById('customizeControls');
  const icon = document.getElementById('customizeIcon');
  
  controls.classList.toggle('collapsed');
  icon.classList.toggle('rotated');
}
