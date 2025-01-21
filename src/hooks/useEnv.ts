// useEnv.ts
export function useEnv() {
    const { VITE_APP_TITLE, VITE_BASE_API, VITE_PUBLIC_PATH, MODE, VITE_APP_NAME, VITE_BASE_UPLOAD_API } = import.meta.env;

    return {
        MODE,
        VITE_APP_TITLE,
        VITE_APP_NAME,
        VITE_BASE_API,
        VITE_PUBLIC_PATH,
        VITE_BASE_UPLOAD_API
    };
}
