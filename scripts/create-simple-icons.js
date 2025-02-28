const fs = require('fs');
const path = require('path');

console.log('🖼️ Criando ícones simples para o LazzFit...');

try {
  // Criar a pasta assets se não existir
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log('✅ Pasta assets criada');
  }

  // Criar ícones simples com cores sólidas
  // Usamos strings de SVG que são mais leves e menos propensas a erros
  const iconSVG = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#2E7D32"/>
    <text x="512" y="600" font-family="Arial" font-size="600" text-anchor="middle" fill="white">L</text>
  </svg>`;
  
  const splashSVG = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#2E7D32"/>
    <text x="512" y="512" font-family="Arial" font-size="200" text-anchor="middle" fill="white">LazzFit</text>
  </svg>`;
  
  const iconPath = path.join(assetsDir, 'icon.svg');
  const splashPath = path.join(assetsDir, 'splash.svg');
  const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.svg');
  const faviconPath = path.join(assetsDir, 'favicon.svg');
  
  // Escrever os arquivos SVG
  fs.writeFileSync(iconPath, iconSVG);
  fs.writeFileSync(splashPath, splashSVG);
  fs.writeFileSync(adaptiveIconPath, iconSVG);
  fs.writeFileSync(faviconPath, iconSVG);
  
  console.log('✅ Ícones SVG criados na pasta assets');
  console.log('\n⚠️ Importante: Para o build do Android, você precisará converter estes SVGs para PNG.');
  console.log('Recomendamos usar um site como https://svgtopng.com/ para converter os arquivos.');
  console.log('Depois de converter, substitua os arquivos SVG por PNGs com os mesmos nomes.');
  
} catch (error) {
  console.error('❌ Erro ao criar ícones:', error.message);
  process.exit(1);
}
