import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import path from 'path'

const DESIGN_SYSTEM_DIR = path.resolve(__dirname, '../../packages/design-system')
const LAYOUTS_DIR = path.resolve(__dirname, '../../packages/layouts')
const TEMPLATES_DIR = path.resolve(__dirname, '../../packages/templates')
const PROTOTYPES_DIR = path.resolve(__dirname, '../../packages/prototypes')

function sourceWatchPlugin() {
  const tokensDir = path.join(DESIGN_SYSTEM_DIR, 'tokens')
  const iconsDir = path.join(DESIGN_SYSTEM_DIR, 'icons')

  function buildTokens() {
    try {
      execSync('node scripts/build-tokens.cjs', { stdio: 'inherit', cwd: DESIGN_SYSTEM_DIR })
    } catch {
      console.error('[source-watch] Token build failed')
    }
  }

  function buildIcons() {
    try {
      execSync('node scripts/build-icons.cjs', { stdio: 'inherit', cwd: DESIGN_SYSTEM_DIR })
    } catch {
      console.error('[source-watch] Icon build failed')
    }
  }

  return {
    name: 'source-watch',

    buildStart() {
      buildTokens()
      buildIcons()
    },

    configureServer(server: any) {
      server.watcher.add(tokensDir)
      server.watcher.add(iconsDir)
      server.watcher.on('change', (file: string) => {
        const rel = path.relative(process.cwd(), file)

        if (file.startsWith(tokensDir) && file.endsWith('.json')) {
          console.log(`[source-watch] ${rel} changed, rebuilding tokens…`)
          buildTokens()
        }

        if (file.startsWith(iconsDir) && file.endsWith('.ts')) {
          console.log(`[source-watch] ${rel} changed, rebuilding icons…`)
          buildIcons()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [sourceWatchPlugin(), react()],
  resolve: {
    alias: {
      '@sds': path.join(DESIGN_SYSTEM_DIR, 'src'),
      '@layouts': path.join(LAYOUTS_DIR, 'src'),
      '@templates': path.join(TEMPLATES_DIR, 'src'),
      '@prototypes': path.join(PROTOTYPES_DIR, 'src'),
    },
  },
  server: {
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
