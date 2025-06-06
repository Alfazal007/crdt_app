import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    plugins: [react(), wasm(), topLevelAwait(), tailwindcss()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
