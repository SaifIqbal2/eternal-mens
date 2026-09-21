const { Jimp, cssColorToHex } = require('jimp');

async function recolor() {
  const image = await Jimp.read('public/assets/images/logo.png');
  
  const targetColor = { r: 201, g: 169, b: 106 }; // #c9a96a
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    // Only modify pixels that are somewhat dark and have opacity
    const alpha = this.bitmap.data[idx + 3];
    if (alpha > 0) {
      this.bitmap.data[idx] = targetColor.r;
      this.bitmap.data[idx + 1] = targetColor.g;
      this.bitmap.data[idx + 2] = targetColor.b;
      // keep original alpha
    }
  });

  await image.write('public/assets/images/logo-brass.png');
  console.log('Logo recolored successfully!');
}

recolor().catch(console.error);
