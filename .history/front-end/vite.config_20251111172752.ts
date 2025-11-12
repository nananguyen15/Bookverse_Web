import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Plugin to automatically copy src/assets/img to public/img
function copyImagesPlugin() {
  return {
    name: 'copy-images',
    buildStart() {
      // Copy images from src/assets/img to public/img
      const srcDir = 'src/assets/img'
      const destDir = 'public/img'
      
      const copyRecursive = (src: string, dest: string) => {
        try {
          mkdirSync(dest, { recursive: true })
          const entries = readdirSync(src, { withFileTypes: true })
          
          for (const entry of entries) {
            const srcPath = join(src, entry.name)
            const destPath = join(dest, entry.name)
            
            if (entry.isDirectory()) {
              copyRecursive(srcPath, destPath)
            } else {
              copyFileSync(srcPath, destPath)
            }
          }
        } catch (err) {
          console.warn('Error copying images:', err)
        }
      }
      
      copyRecursive(srcDir, destDir)
      console.log('✅ Images copied from src/assets/img to public/img')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), copyImagesPlugin()],
})
