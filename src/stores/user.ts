
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    let accessToken = ref('')
    let expiresAt = ref(0)

    return { accessToken, expiresAt }
})
