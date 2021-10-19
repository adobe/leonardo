c3.load = function(uri, async) {
  async = async || false;
  var req = new XMLHttpRequest();
  var onload = function() {
    if (!async || req.readyState == 4) {
      if (req.status == 200 || req.status == 0) {
        c3_init(JSON.parse(req.responseText));
        c3_api();
      } else {
        alert("Error Loading C3 Data");
      }
    }
  };
  req.open('GET', uri, false);
  if (async) req.onreadystatechange = onload;
  req.send(null);
  if (!async) onload();
}

