<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card class="elevation-12 rounded-lg">
                    <v-card-title class="text-center py-6">
                        <h1 class="text-h4">Entrar na Plataforma</h1>
                    </v-card-title>

                    <v-card-text class="px-6 py-4">
                        <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mb-4"
                            @click:close="errorMessage = ''">
                            {{ errorMessage }}
                        </v-alert>

                        <v-form @submit.prevent="handleLogin">
                            <v-text-field v-model="email" label="E-mail" placeholder="Seu email de cadastro"
                                prepend-inner-icon="mdi-email-outline" variant="outlined" required
                                :error-messages="emailError" class="mb-4"></v-text-field>

                            <!-- Escondemos o campo de senha para simplificar a UI -->
                            <input type="hidden" v-model="password" value="senha123" />

                            <v-btn color="primary" type="submit" :loading="loading" block size="large" class="mt-4 mb-6"
                                elevation="2">
                                Entrar
                            </v-btn>
                        </v-form>

                        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
                            {{ successMessage }}
                        </v-alert>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions class="justify-center pa-6">
                        <p class="text-body-1 me-2">Não tem uma conta?</p>
                        <v-btn color="primary" variant="text" @click="$router.push('/register')">
                            Registrar-se
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('senha123') // Senha padrão fixa
const emailError = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleLogin = async () => {
    emailError.value = ''
    errorMessage.value = ''
    successMessage.value = ''

    if (!email.value) {
        emailError.value = 'Email é obrigatório'
        return
    }

    loading.value = true
    try {
        const success = await authStore.login(email.value)
        if (success) {
            successMessage.value = 'Login realizado com sucesso! Redirecionando...'
            setTimeout(() => {
                router.push('/')
            }, 1500)
        } else {
            errorMessage.value = 'Usuário não encontrado. Verifique o email informado.'
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error)
        errorMessage.value = error.message || 'Erro ao fazer login'
    } finally {
        loading.value = false
    }
}
</script>