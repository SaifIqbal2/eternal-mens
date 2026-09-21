const { Jimp } = require('jimp');

async function recolor() {
  const image = await Jimp.read('public/assets/images/logo.png');
  
  // Use --brass (#a67c3d) instead of --brass-soft
  const targetColor = { r: 166, g: 124, b: 61 }; 
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const alpha = this.bitmap.data[idx + 3];
    if (alpha > 0) {
      this.bitmap.data[idx] = targetColor.r;
      this.bitmap.data[idx + 1] = targetColor.g;
      this.bitmap.data[idx + 2] = targetColor.b;
    }
  });

  await image.write('public/assets/images/logo-brass.png');
  console.log('Logo recolored successfully to #a67c3d!');
}

recolor().catch(console.error);
