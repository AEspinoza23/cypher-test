// Utilities
import { defineStore } from 'pinia'

// Define User type
interface UserData {
  token: number;
  name: string;
  email: string;
  user: {}
}

export const useUserStore = defineStore('app', {
  state: () => ({
    user: null as UserData | null,
  }),
  actions: {
    setUser(userData: UserData) {
      this.user = userData;
    },
    logout() {
      this.user = null;
    }
  },
})
