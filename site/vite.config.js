import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  console.log("mode:", mode);
  return ({
    base: mode === "production" ? "/sequence-sim/" : "/"
  });
})
