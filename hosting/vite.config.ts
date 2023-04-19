import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["shared"],
  },
  build: {
    commonjsOptions: {
      include: [/shared/, /node_modules/],
    },
  },
});
