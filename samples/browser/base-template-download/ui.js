document.addEventListener('DOMContentLoaded', function() {
  const downloadButton = document.querySelector('#download');

  downloadButton.addEventListener('click', function() {
    downloadButton.disabled = 'disabled';
    downloadButton.textContent = 'Downloading...';
    main()
  });
});