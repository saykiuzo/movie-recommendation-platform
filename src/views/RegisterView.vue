<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card class="elevation-12 rounded-lg">
                    <v-card-title class="text-center py-6">
                        <h1 class="text-h4">Crie sua Conta</h1>
                    </v-card-title>

                    <v-card-text class="px-6 py-4">
                        <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mb-4"
                            @click:close="errorMessage = ''">
                            {{ errorMessage }}
                        </v-alert>

                        <v-form @submit.prevent="handleRegister">
                            <v-text-field v-model="name" label="Nome" placeholder="Seu nome completo"
                                prepend-inner-icon="mdi-account-outline" variant="outlined" required
                                :error-messages="nameError" class="mb-4"></v-text-field>

                            <v-text-field v-model="email" label="E-mail" placeholder="Seu melhor email"
                                prepend-inner-icon="mdi-email-outline" variant="outlined" required
                                :error-messages="emailError" class="mb-4"></v-text-field>

                            <!-- Esconde o campo de senha para simplificar a UI -->
                            <input type="hidden" v-model="password" value="senha123" />

                            <v-btn color="primary" type="submit" :loading="loading" block size="large" class="mt-4 mb-6"
                                elevation="2">
                                Registrar
                            </v-btn>
                        </v-form>

                        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
                            {{ successMessage }}
                        </v-alert>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions class="justify-center pa-6">
                        <p class="text-body-1 me-2">Já tem uma conta?</p>
                        <v-btn color="primary" variant="text" @click="$router.push('/login')">
                            Entrar
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

const name = ref('')
const email = ref('')
const password = ref('senha123') // Senha padrão fixa
const nameError = ref('')
const emailError = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
    nameError.value = ''
    emailError.value = ''
    errorMessage.value = ''
    successMessage.value = ''

    if (!name.value) {
        nameError.value = 'Nome é obrigatório'
        return
    }

    if (!email.value) {
        emailError.value = 'Email é obrigatório'
        return
    }

    loading.value = true
    try {
        const success = await authStore.register(name.value, email.value, password.value)
        if (success) {
            successMessage.value = 'Conta criada com sucesso! Redirecionando...'

            setTimeout(() => {
                router.push('/')
            }, 1500)
        } else {
            errorMessage.value = 'Não foi possível criar sua conta. Tente novamente.'
        }
    } catch (error) {
        console.error('Erro ao registrar:', error)
        if (error.message.includes('já existe')) {
            emailError.value = 'Este email já está em uso'
        } else {
            errorMessage.value = error.message || 'Erro ao registrar'
        }
    } finally {
        loading.value = false
    }
}
</script>