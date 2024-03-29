import { defineConfig } from 'tsup'

export default defineConfig((opts)=>{
    return {
        entry: ["./src/**/*.ts"],
        splitting: false,
        sourcemap: true,
        clean: !opts.watch,
        format: ["esm"],
        ignoreWatch: [
            "**/node_modules/**",
            "**/.git/**",
            "**/dist/**",   
        ]
    }
})