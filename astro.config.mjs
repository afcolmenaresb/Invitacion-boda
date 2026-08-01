import { defineConfig } from 'astro/config';

// Configurado para desplegarse en GitHub Pages como sitio de proyecto:
// https://afcolmenaresb.github.io/Invitacion-boda/
export default defineConfig({
  site: 'https://afcolmenaresb.github.io',
  base: process.env.VERCEL === '1' ? '/' : '/Invitacion-boda/',
});
