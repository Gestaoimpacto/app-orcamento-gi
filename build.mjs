
import * as esbuild from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';

const DIST_DIR = 'dist';

// Helper to manually load .env file since dotenv is not available
async function loadEnv() {
  try {
    const envData = await fs.readFile('.env', 'utf8');
    const lines = envData.split('\n');
    for (const line of lines) {
      // Match KEY=VALUE, ignoring comments
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove surrounding quotes if present
        value = value.replace(/(^['"]|['"]$)/g, '').trim();
        
        // Set in process.env if not already set
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    console.log('Loaded environment variables from .env');
  } catch (error) {
    // Ignore error if .env file doesn't exist
    if (error.code !== 'ENOENT') {
      console.error('Error loading .env file:', error);
    } else {
      console.log('No .env file found, using system environment variables.');
    }
  }
}

async function build() {
  await loadEnv();
  console.log('Starting build...');

  // 1. Clean and create the destination directory
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await fs.mkdir(DIST_DIR, { recursive: true });
  console.log('Output directory cleaned.');

  // 2. Compile and bundle TypeScript/React into a single JS file
  await esbuild.build({
    entryPoints: ['index.tsx'],
    bundle: true,
    outfile: path.join(DIST_DIR, 'bundle.js'),
    minify: true,
    sourcemap: 'external',
    target: 'es2022', // Fix: Support private class fields (#)
    // IMPORTANT: This ensures React works correctly in production
    jsx: 'automatic',
    loader: { '.js': 'jsx' }, // Ensure JSX is processed in JS files if needed
    // Mark dependencies present in importmap as external so esbuild doesn't try to bundle them
    external: [
      'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', 
      'firebase/app', 'firebase/auth', 'firebase/firestore', 
      '@google/genai', 'recharts', 'clsx', 'uuid',
      'prop-types', 'react-is', 'path', 'fs', 'process'
    ],
    format: 'esm', // Ensure output is ESM compatible with imports
    define: {
      'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY || ''),
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
      'process.env.NODE_ENV': '"production"',
    },
  });
  console.log('JavaScript bundled successfully.');

  // 3. Read the original index.html and adapt it for production
  let htmlContent = await fs.readFile('index.html', 'utf-8');

  // Remove the development script tags
  htmlContent = htmlContent.replace(/<script type="module" src="\/index.tsx"><\/script>/, ''); 
  htmlContent = htmlContent.replace(/<script type="module" src=".\/index.tsx"><\/script>/, '');

  // Add our bundle.js at the end of the body with type="module"
  // This is CRITICAL because the bundle contains 'import' statements for the external dependencies
  const scriptTag = '<script type="module" src="/bundle.js"></script>';
  htmlContent = htmlContent.replace('</body>', `  ${scriptTag}\n</body>`);

  // 4. Save the new index.html to the destination directory
  await fs.writeFile(path.join(DIST_DIR, 'index.html'), htmlContent);
  console.log('index.html prepared for production.');

  console.log('Build finished successfully! Files are in the "dist" directory.');
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
