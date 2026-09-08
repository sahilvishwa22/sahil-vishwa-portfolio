import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-local-videos',
      configureServer(server) {
        const videoRoot = 'D:\\Vishwa.D.Sahil\\Oktobuzz\\2026\\Videos'
        server.middlewares.use('/local-videos', (req, res, next) => {
          if (!req.url) return next()
          try {
            // Strip query params and decode URL
            const cleanUrl = req.url.split('?')[0].replace(/^\//, '')
            const decodedUrl = decodeURIComponent(cleanUrl)
            const filePath = path.join(videoRoot, decodedUrl)

            if (!fs.existsSync(filePath)) {
              return next()
            }

            const stat = fs.statSync(filePath)
            const fileSize = stat.size
            const ext = path.extname(filePath).toLowerCase()
            const contentType = ext === '.mov' ? 'video/quicktime' : 'video/mp4'
            const range = req.headers.range

            if (range) {
              const parts = range.replace(/bytes=/, '').split('-')
              const start = parseInt(parts[0], 10)
              const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
              const chunksize = (end - start) + 1
              const file = fs.createReadStream(filePath, { start, end })

              res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
              })
              file.pipe(res)
              res.on('close', () => file.destroy())
            } else {
              const file = fs.createReadStream(filePath)
              res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': contentType,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'no-cache',
              })
              file.pipe(res)
              res.on('close', () => file.destroy())
            }
          } catch (err) {
            console.error('Error serving video:', err)
            next()
          }
        })
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  }
})
