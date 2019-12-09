module.exports = {
  preset: [
    "default",
    {
      svgo: {
        plugins: [
          {
            convertStyleToAttrs: false
          }
        ]
      }
    }
  ]
};
