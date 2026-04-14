import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import path from 'path'

function sourceWatchPlugin() {
  const tokensDir = path.resolve(__dirname, 'tokens')
  const iconsDir = path.resolve(__dirname, 'icons')

  function buildTokens() {
    try {
      execSync('node scripts/build-tokens.cjs', { stdio: 'inherit' })
    } catch {
      console.error('[source-watch] Token build failed')
    }
  }

  function buildIcons() {
    try {
      execSync('node scripts/build-icons.cjs', { stdio: 'inherit' })
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
  server: {
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
