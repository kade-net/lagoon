import { defineConfig } from "tsup";


export default defineConfig([
    {
        entry: ['./workers/grpc-worker/main.ts'],
        outDir: './dist/workers/grpc-worker',
        format: ['esm'],
        sourcemap: true,
        clean: true,
    },
    {
        entry: ['./workers/replicate-worker/main.ts'],
        outDir: './dist/workers/replicate-worker',
        format: ['esm'],
        sourcemap: true,
        clean: true,
    },
    {
        entry: ['./ingress/index.ts'],
        outDir: './dist/ingress',
        format: ['esm'],
        sourcemap: true,
        clean: true,
    }
])