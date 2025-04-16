const fs = require('fs').promises;
const path = require('path');
const { copyFileSync, mkdirSync } = require('fs');

async function buildProject() {
  try {
    // Create build directory
    const buildDir = path.join(__dirname, 'build');
    mkdirSync(buildDir, { recursive: true });

    // Copy assets
    const assetsDir = path.join(__dirname, 'public', 'assets');
    const buildAssetsDir = path.join(buildDir, 'assets');
    mkdirSync(buildAssetsDir, { recursive: true });
    await fs.readdir(assetsDir).then(files => {
      files.forEach(file => {
        copyFileSync(path.join(assetsDir, file), path.join(buildAssetsDir, file));
      });
    });

    // Copy CSS
    const cssDir = path.join(__dirname, 'public', 'css');
    const buildCssDir = path.join(buildDir, 'css');
    mkdirSync(buildCssDir, { recursive: true });
    await fs.readdir(cssDir).then(files => {
      files.forEach(file => {
        copyFileSync(path.join(cssDir, file), path.join(buildCssDir, file));
      });
    });

    // Copy JS
    const jsDir = path.join(__dirname, 'public', 'js');
    const buildJsDir = path.join(buildDir, 'js');
    mkdirSync(buildJsDir, { recursive: true });
    await fs.readdir(jsDir).then(files => {
      files.forEach(file => {
        copyFileSync(path.join(jsDir, file), path.join(buildJsDir, file));
      });
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Error during build:', error);
    process.exit(1);
  }
}

buildProject();
