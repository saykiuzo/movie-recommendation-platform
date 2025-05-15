<template>
  <v-app theme="dark">
    <v-app-bar app elevation="4">
      <v-app-bar-title class="font-weight-bold">
        <router-link to="/" class="text-decoration-none text-white">
          <v-icon icon="mdi-movie" class="me-2"></v-icon>
          MovieLens
        </router-link>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <template v-if="authStore.isLoggedIn">
        <v-btn variant="text" to="/profile">
          <v-icon class="me-1">mdi-account</v-icon>
          Perfil
        </v-btn>
        <v-btn variant="text" @click="logout">
          <v-icon class="me-1">mdi-logout</v-icon>
          Sair
        </v-btn>
      </template>
      <template v-else>
        <v-btn variant="text" to="/login">
          <v-icon class="me-1">mdi-login</v-icon>
          Entrar
        </v-btn>
        <v-btn variant="text" to="/register">
          <v-icon class="me-1">mdi-account-plus</v-icon>
          Registrar
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app class="pa-4 text-center">
      <div class="w-100">
        &copy; {{ new Date().getFullYear() }} - Plataforma de Recomendação MovieLens
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (authStore.userId) {
    authStore.fetchCurrentUser()
  }
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>