import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';

const pluginSalvarAvatar = (): Plugin => ({
  name: 'plugin-salvar-avatar',
  configureServer(server) {
    server.middlewares.use('/api/save-avatar', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ message: 'Método não permitido' }));
        return;
      }

      let body = '';
      request.on('data', (chunk) => {
        body += chunk.toString();
      });

      request.on('end', async () => {
        try {
          const payload = JSON.parse(body) as { dataUrl: string; fileName: string };
          const matchDataUrl = payload.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

          if (!matchDataUrl) {
            response.statusCode = 400;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ message: 'Imagem inválida' }));
            return;
          }

          const mimeType = matchDataUrl[1];
          const base64Data = matchDataUrl[2];
          const extensaoPorMime: Record<string, string> = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/webp': 'webp',
          };
          const extensao = extensaoPorMime[mimeType] ?? 'png';
          const nomeSemExtensao = payload.fileName.replace(/\.[a-zA-Z0-9]+$/, '');
          const nomeFinal = `${nomeSemExtensao}.${extensao}`;

          const pastaAvatar = path.resolve(process.cwd(), 'src', 'assets', 'avatar');
          await mkdir(pastaAvatar, { recursive: true });
          const caminhoArquivo = path.resolve(pastaAvatar, nomeFinal);
          await writeFile(caminhoArquivo, Buffer.from(base64Data, 'base64'));

          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.end(
            JSON.stringify({
              filePath: `src/assets/avatar/${nomeFinal}`,
            }),
          );
        } catch {
          response.statusCode = 500;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ message: 'Erro ao salvar imagem' }));
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), pluginSalvarAvatar()],
});
