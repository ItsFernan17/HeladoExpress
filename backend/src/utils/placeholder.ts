import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';

export async function createPlaceholderImage(width: number = 320, height: number = 240): Promise<Buffer> {
  // Create a simple gradient placeholder image
  return await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 200, b: 200 }
    }
  })
  .png()
  .composite([
    {
      input: Buffer.from(
        `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#999" text-anchor="middle" dominant-baseline="middle">
            No Image
          </text>
        </svg>`
      ),
      top: 0,
      left: 0
    }
  ])
  .jpeg({ quality: 80 })
  .toBuffer();
}

export async function savePlaceholderImages(): Promise<void> {
  const placeholderDir = path.join(process.cwd(), 'public-assets', 'placeholders');
  
  // Ensure placeholder directory exists
  await fs.mkdir(placeholderDir, { recursive: true });
  
  // Create placeholder images for different orientations
  const placeholders = [
    { name: 'placeholder_landscape_320x240.jpg', width: 320, height: 240 },
    { name: 'placeholder_portrait_240x320.jpg', width: 240, height: 320 },
    { name: 'placeholder_square_128x128.jpg', width: 128, height: 128 }
  ];
  
  for (const placeholder of placeholders) {
    const imagePath = path.join(placeholderDir, placeholder.name);
    const buffer = await createPlaceholderImage(placeholder.width, placeholder.height);
    await fs.writeFile(imagePath, buffer);
    console.log(`Created placeholder: ${imagePath}`);
  }
}