require("../c3");

require("util").puts(JSON.stringify({
  "name": "c3",
  "version": c3.version,
  "description": "A JavaScript library for color name modeling.",
  "keywords": ["color", "names", "palette", "design", "image editing", "visualization"],
  "homepage": "http://vis.stanford.edu/color-names",
  "author": {"name": "Jeffrey Heer", "url": "http://vis.stanford.edu/jheer"},
  "repository": {"type": "git", "url": "http://github.com/StanfordHCI/c3.git"},
  "main": "c3.js",
  "dependencies": {
    "uglify-js": "1.1.1"
  }
}, null, 2));
