
function pageLoader() {
  const loader = document.getElementById('pageLoader');
  const page = document.getElementById('page');
  setTimeout(() => {
    page.style.opacity = 1;
  }, 50);

  setTimeout(() => {
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.remove();
    }, 150)
  }, 1000)
}

module.exports = {
  pageLoader
}