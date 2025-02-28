const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando aplicativo para Android...');

try {
  const appJsonPath = path.join(process.cwd(), 'app.json');
  
  // Verificar se o app.json já tem a configuração necessária
  console.log('\n1️⃣ Verificando configuração no app.json...');
  let needsUpdate = false;
  
  if (fs.existsSync(appJsonPath)) {
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    if (!appConfig.expo.android || !appConfig.expo.android.package) {
      console.log('⚠️ Configuração Android incompleta no app.json');
      needsUpdate = true;
      
      // Criar configuração básica do Android se não existir
      appConfig.expo = {
        ...appConfig.expo,
        android: {
          ...appConfig.expo.android,
          package: "com.lazzfit.app",
          adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#2E7D32"
          },
          permissions: [
            "ACCESS_FINE_LOCATION",
            "ACCESS_COARSE_LOCATION",
            "ACCESS_BACKGROUND_LOCATION"
          ]
        }
      };
      
      // Salvar as atualizações
      fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
      console.log('✅ Configuração Android adicionada ao app.json');
    } else {
      console.log('✅ Configuração Android já existe no app.json');
    }
  } else {
    console.error('❌ Arquivo app.json não encontrado!');
    process.exit(1);
  }

  // Verificar e criar a pasta assets se não existir
  console.log('\n2️⃣ Verificando pasta assets...');
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log('✅ Pasta assets criada');
    
    // Criar arquivos de ícone padrão
    console.log('📝 Criando arquivos de ícone padrão...');
    
    // Base64 de um ícone padrão verde com letra L (LazzFit)
    const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA0vSURBVHgB7d1tchNXFgfw/7ndrdiQqsSOeQPMG4SpoTYDA28QWEFgB8MKBp7xjMcsMSsYWEFgBQOzqinAK8CZmoGQGk9oW91956h7TMB2Ihm59enW/1cVRyYJXUk1/W/33HN1r4EQGW1wksPGfgaMBme0oP8UgGNQyOHxnryt2cCUho041vvKMQd6CH10MMTRgfxDXv5MmBBjTRJEGadh3GGdu+AFEsqRdgK/XnSQdRRyMOQwQZLkEGVTZQNrePHwH3oC0ziGS8oDetBFNKzfxYP/bSoby9xVNgSTJE4P6Gg8FGzqjt6AIGx0h8g7Q4qxj+PBprIxK+eX8Sq+fgMbaTfXP8yUoILmzHMvD2UfrOaL+rg+PoNvHGLLyO0OsvVBUvtvFrM6gTUYjZ5XQEkSqtFap3k6iZcyQw+qc9n1kcPjZPX9jbQOYQ3GSZREadRprp/fgwpdB50sSdd3k9rHOoI1ECdREnWaL+vXfqhCjyg27nXSzu/PGzWCNQgnURJ1mv9ePlGXz5vr3UGciu5whG5jG90VP1nJlyA+OcU3Fveaa/UxLLkySaI0b0DwfCPEM4qRrw2SbKOR5HOl/zjJeeuUySrBCoiTKInSvArg2UogBNPFNAkUa0OV5rWGTiet1MbwrVjfvFMdmnjnYJpjlQs9u9+on32/TKCB12itclg3UezpalRz9cO+XYJzHV8naiDOa28eHNo98pkTJ6Mg9D8HaHMZPzw1MBsVUqz5ZsSgpdJi41FzvdMh6t0DvEKcREn1f6OXNphNRNyARKrGrzfMcGLvUXNtctIvtOn7TmM//+i0yo4WYzYxcY9VXFtoNle/7BjGU9gIW9HD6WDLSiVgWoSeS1ro6ArCvsko8XGgel8vAj6wEeABXySBKqeVgKj5NNEGx71uddWOwhZhKwHjtIGaJB/VnOYpuwM+mesDgnV5n54uJsJT7JDONOYYZBrDXv+grwTgaTFo86Jp5rMp2Kk9gw0tYCPwCqdeUbD6zZpPKr3KODQxOelXpn3v1bofniuBLCc26qyM8iztPICNoJQS4ISVFQoJZilV75MNqZPVI+jXx9PFRY0c49Bn/FpGiX4pJSAlU4lYKQ5X8Ai+MHHXZxPnPk98VtD+pV/nyfHkpiRc6a77dD8Lr5NQla4EMFqJXX2d+Kw4/pKP+McX/Cc8DgtdCYRRdm8k+vqExnkn/vBFX4RdCYS09g+jk5Oy3s/B0y/6IuxKIKR5gDAeraerzTQu++pvfNVOgD7MrxO1aBi92HAVmr7w8YlfJ8AojOlGmB7fLqvrQbxOoMyVQPBDf7NLw3gGaP87AXodpiSwdQI0hJRFrQixtZVA0EN/nfQZIImSqJPk/00A9jsBnUxJwK0TMD4nAaqwTsDnMD5aJxDkkJ+PMhpfJxDcEzDunYC+txFbPgFjtU7A5lgacanrBII59Ecr8dEJGJrrBO4KcyPwX2Vx7wSMCqfMZhyahkVMglnIU1YnEMT8PqNFcVsngCs4gUKmFGP42wkUw/hIr+kwm6a80ZsNNOa1E/B+fM9QjxJ/QbHGKJ5hv9Y6AVKBdQLFMz5yCzWFdQK0eLJOwO7S4eA6gTA6jLDIZJ3Aj6hUP0OFe7MbCaMTMJsY2++AWCdgibF9SMDuPIGDdQLkXRDz/yuZJ3CiEzBW1wm8mCcwl3UCZFlY6wRsH/o/v07ATj8X9p9P+FzOKoGbif1pwn7I69EDMge5ToBbRhmx3gvBQK4TIJ/CWCdgb8hPepLwzUfinUAIXGu2ERa3LsB4mCchefZ5+spkc/0va/t4GG5J2WVl034n4GfIb64cqvXHiHIMjXrPDGouUlpVzXWMOt81zE/g1oqA+ok6Ho4VctXsrlKtPUbM3Tzld9jL0E6+A08jAappvp7CrVEXXWsZx9E2TTVLnehH5dKHo6cw9ajWGmVJcnc3qR2xwbYNQTTs9xZxKfIVCgboocGfYTYFM2owjYEqjmLu5ppfqUo7OjLbH3XMWhpo6kFTx6YLtDDjYXRno7n2aRzj6Sggw9cYAwOeNGrcTj0xu6qrx507d9e6iyNS4sLMf55LRRc7gs2rilZNdkHgdhb7eA3V1NM/E980vzLaqF/6VQ/9PdOD1Sni3kZSO1xlUXttxzgJFMX+deGs+pxgn4ZajDgbldKJf5RzK61+cr+5VkdFsM47X2uD9t3G2t0+KoD9W4VcQQUJPJGlvKxr7TsbSe39GJVRdutgumiYXzwcYKnYLwVCqwbkRZZhfGYHiLPxvya1n1EBZd91SNVBvnJ7o177FGXH/gsRXVUDxTOmMD6zSa7pZpL8WGuV9KCc/XYDseYxBiB+kdVAUTxM6s2Tk/6DdGVugCpj0KcMSMdFKvw3Sl8VLC8FDGPoY4SiGfniaSdFlV3xU2IMEg6P8y9RYeVPAgKHnYDDCbtFkTK3aSfp4aN0ZQ0V5eBWYaFSsFXVWMFkKz+teijWcePJ+6Z+80O6MsPKsB6n5Q8JZHlx0aJZnpAmTNQ4kQcuCbxY+vtoJfIZMBJax7XuStx40tt7iGWBXl6MVOXHBTHbG31dMA9e6JaJtvH9qLne0XdUD6KVaBLwOi9gNpFU4cyPXIbxgcCDOKFnMBwla+u9p6ggqZJdL/OO5yVG7huUxpfs44LaYQa9sEbdRsXZmQgMrd8fHGipFnGQc9g3hS6dKY91UyB39SiHaVD7ebd58w9dmMcPbwfsv8p1550nkJKvnUZq/ZpSc2LV9g1Ub04/Mpvy9crk5zaS+t5qdfVTK4be6v+u9liJzx3WRnxnI6nf28YM3JaCRQutFxBu5wVCZuSLl/XRaturdx8h0MvjHSrZOoGQywGXE4NnSY8PAFleMtn/vzh6eH8jqf0EAglaI9DTpzfbrYO7CItQywHnQ/9KJOiMNeXTaP36ztO4/jWqw+81AVh1fF/A+UOEmtx4eCRZvZIn9coJyBs0UGsyJ3+UlGFEE4GVExjXP8rq/2dhKuMRyJouY9UYGvrDowr/c/ii6vyEQOdALoKlGCyBfJlf2RN+VlcJqpGpB4nynai7rWI9Rzhf/DG2MZ0L8/RFYG6WstJRB6uP0+72KmZQWXnDFcatIc85BBpx9DDLVjaba12Bx79y/LGANjuDVfR9A6E8MXRWt7niiUDmdaKO432+RUoT3qJUDhsYRvtcLta9E3JjmnAGbYKvAqwOEW5iXfk4n93rppeYpR/MHm7WTqcrg+nxJfPK/8aLdHV4c5VfSkHH5KxGS58B2GjYpg/h66nJcJ+62e/SHp/x5mG/uTIAbd0Xxq0AEj+MUz3eSO6+g9nFrn2eWfk8Bj1OpBHlnNvsNtY+wZzCHvab+E2iOq/9tgfZOzGG30T/osbZ94qhe9EwRgG5sVnWMPhVY63zCCUQcjvfs9HwTjPGwFN+F8loeMcH/o7beRp7bOcdshMY56ZHzuQqmd5QxKv+DhXDWRN8MhLn7o3kkFc3klu/oAQBJQHvd4Ccm0OZfWjrW8vdA2dyfeqCUW5yMhna/e76+baUXSKRB/s9QJZHmPv9HVgPED95viCyzXl+V6Xg2xnFdHVb7j2XrvQcZG6+RxrNp/SHGE17ZXMVbsT4z9Ob9fUeMpTihKEMSqEY/VMC+8Txyl4jff59nJV1cd9Fgr1XmYNFpibnvSDnvKxR3o5X8/OT/us4G4ZbzYenbN3dnANp/eXNdAHrBUK4GehXnGXfublmiBHcpWXh8/A+ffIDJ+RNczm3QOdA12puYgFS/vLhJ8+JiA1WMExoLsP7ERZys/Ct70CnB+p4MXb3KmcTGA5tFV/pKwET0jDfOSdw1Xruy9L8k+f2CfV2sqBwb/Z5ddJP4E1dKYMLVLYZOCvgJcBJ/XfDHkylXHvxcg5KO8siW8QUjfHdBrrNAX7c6UM6Ak8a2ml/gDfySYdNKxbaBK7pBHDZ+WNCO+gG9vMOZ9JmXCUuDWbNVhPm0xL0MH24/QFXJAAh7T4iD7Z4AXeKl+vvGBrLIirk9JG+boeFMTel70+0b+URgFyxw7IvXSCmEd5mX72k1vDrPe1JXOs1hVhNbvAyD9RLEEYAQNd0JmJk5gRbiAB/M8/1Xl77ZMc1t0Nm8/R2/So2Rvp+0X37DV+gnAGG11tKmHyuMIwD57JVPAI27DRO3kMVuE0B8hUUyOztYtheA0E8AQtk6AdPDKbzhAbILXfLXOnnWajXt3Vwl5BMggp3rBA6UwRZkQk9LQMVzlfq1mV89XZxj9OMmnVs4nQAQaieQU97+ITL7K/PmvS+fIm3K1p1flyb6jVc4nQARaQPpusiMfdLRT9nA+KkvV7b5aOfqmq3XCv0EiMjb3QilfRrm72I1y189ua9hdfXeebv2oZwAEUTNwfrJrzdDsBC8NFgcZpbUy/X4bcabR79IbtcPeJEE388gVOt68M/3sH9sjDJfnNm0V1RPpIthrux9gfXIWV73+h5HzDnVSD/0d/1CLdaGZnWZC3rIkyRQorWNpH6EErgcCbT1Fc5BflzA+s7V4fJtyQJgO7lGrj17ixXeRglc33YawZwAkbe0lnujTvZme3E1kLFUbyPpde4jgIVIVRbsdVn2GCUxaTzJ8jDOrrzh98+/NP8Hp7KLZxszoF0AAAAASUVORK5CYII=';
    
    // Criar arquivos de ícones
    fs.writeFileSync(path.join(assetsDir, 'icon.png'), Buffer.from(iconBase64, 'base64'));
    fs.writeFileSync(path.join(assetsDir, 'splash.png'), Buffer.from(iconBase64, 'base64'));
    fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), Buffer.from(iconBase64, 'base64'));
    fs.writeFileSync(path.join(assetsDir, 'favicon.png'), Buffer.from(iconBase64, 'base64'));
    
    console.log('✅ Ícones padrão criados');
  } else {
    console.log('✅ Pasta assets já existe');
  }
  
  // Instalar dependências necessárias se não estiverem instaladas
  console.log('\n3️⃣ Verificando dependências...');
  try {
    execSync('npx expo-cli --version', { stdio: 'ignore' });
  } catch (e) {
    console.log('📦 Instalando expo-cli...');
    execSync('npm install -g expo-cli', { stdio: 'inherit' });
  }

  // Gerar os arquivos nativos do Android
  console.log('\n4️⃣ Gerando arquivos nativos do Android...');
  console.log('⚠️ Este processo pode levar alguns minutos...');
  execSync('npx expo prebuild --platform android --clean', { stdio: 'inherit' });
  
  console.log('\n✅ Configuração para Android concluída!');
  console.log('\n🚀 Agora você pode executar o aplicativo em um dispositivo Android:');
  console.log('   npx expo run:android');
  console.log('\nOu em um emulador:');
  console.log('   npx expo start --android');
  
} catch (error) {
  console.error('\n❌ Erro durante a configuração:', error.message);
  process.exit(1);
}
