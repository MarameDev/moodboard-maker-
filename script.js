const imageInput = document.getElementById('imageInput');
const moodBoard = document.getElementById('moodBoard');

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

// Optional: download board as single image using html2canvas (needs external library)
document.getElementById('downloadBoard').addEventListener('click', () => {
  alert("Download feature will be added later. For now, right-click images to save.");
});
