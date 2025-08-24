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

document.getElementById('downloadBoard').addEventListener('click', () => {
  alert("Download feature coming soon! For now, right-click on images to save.");
});
