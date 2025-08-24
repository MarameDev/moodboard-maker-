const imageInput = document.getElementById('imageInput');
const moodBoard = document.getElementById('moodBoard');
const downloadBtn = document.getElementById('downloadBoard');

// Upload images to mood board
imageInput.addEventListener('change', (e) => {
  const files = e.target.files;
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = document.createElement('img');
      img.src = event.target.result;
      moodBoard.appendChild(img);
    }
    reader.readAsDataURL(file);
  }
});

// Download mood board as single image
downloadBtn.addEventListener('click', () => {
  if (moodBoard.children.length === 0) {
    alert("Please add at least one image before downloading.");
    return;
  }
  html2canvas(moodBoard).then(canvas => {
    const link = document.createElement('a');
    link.download = 'moodboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

