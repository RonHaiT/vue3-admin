interface ViteEnv {
    VITE_API_URL: string
    VITE_LOAD: true
}

interface ImportMetaEnv extends ViteEnv { }
//https://cn.vitejs.dev/guide/env-and-mode.html
interface ImportMeta {
    readonly env: ImportMetaEnv
}
