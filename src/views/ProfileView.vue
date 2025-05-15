<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card>
                    <v-card-title class="text-center">
                        <h1 class="text-h4 my-4">Seu Perfil</h1>
                    </v-card-title>
                    <v-card-text>
                        <!-- Alertas de sucesso e erro -->
                        <v-alert v-if="successMessage" type="success" variant="tonal" closable class="mb-4"
                            @click:close="successMessage = ''">
                            {{ successMessage }}
                        </v-alert>

                        <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mb-4"
                            @click:close="errorMessage = ''">
                            {{ errorMessage }}
                        </v-alert>

                        <v-form @submit.prevent="updateProfile">
                            <v-text-field v-model="name" label="Nome" required variant="outlined"
                                :error-messages="nameError"></v-text-field>

                            <v-text-field v-model="email" label="E-mail" required variant="outlined"
                                :error-messages="emailError" disabled></v-text-field>

                            <div class="d-flex justify-space-between align-center mt-4">
                                <v-btn color="primary" type="submit" :loading="updating">
                                    Atualizar Perfil
                                </v-btn>

                                <v-btn color="error" variant="outlined" @click="showDeleteDialog = true">
                                    Excluir Conta
                                </v-btn>
                            </div>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Diálogo de confirmação para excluir conta -->
        <v-dialog v-model="showDeleteDialog" max-width="500px">
            <v-card>
                <v-card-title>Confirmar exclusão</v-card-title>
                <v-card-text>
                    Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="showDeleteDialog = false">
                        Cancelar
                    </v-btn>
                    <v-btn color="error" variant="text" @click="deleteAccount" :loading="deleting">
                        Excluir
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { gql } from '@apollo/client/core'
import apolloClient from '@/plugins/apollo'

const router = useRouter()
const authStore = useAuthStore()
const user = authStore.currentUser

const name = ref('')
const email = ref('')
const nameError = ref('')
const emailError = ref('')
const updating = ref(false)
const deleting = ref(false)
const showDeleteDialog = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

onMounted(() => {
    if (!user) {
        authStore.fetchCurrentUser().then(() => {
            if (authStore.currentUser) {
                name.value = authStore.currentUser.name
                email.value = authStore.currentUser.email
            }
        })
    } else {
        name.value = user.name
        email.value = user.email
    }
})

const updateProfile = async () => {
    nameError.value = ''
    errorMessage.value = ''
    successMessage.value = ''

    if (!name.value) {
        nameError.value = 'Nome é obrigatório'
        return
    }

    updating.value = true
    try {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation UpdateUser($userId: ID!, $name: String!) {
          updateUsers(
            where: { userId: $userId },
            update: { name: $name }
          ) {
            users {
              userId
              name
              email
            }
          }
        }
      `,
            variables: { userId: authStore.userId, name: name.value }
        })

        if (data.updateUsers && data.updateUsers.users.length > 0) {
            authStore.user = data.updateUsers.users[0]
            successMessage.value = 'Perfil atualizado com sucesso!'
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error)
        errorMessage.value = 'Erro ao atualizar perfil'
    } finally {
        updating.value = false
    }
}

const deleteAccount = async () => {
    errorMessage.value = ''
    deleting.value = true

    try {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation DeleteUser($userId: ID!) {
          deleteUsers(where: { userId: $userId }) {
            nodesDeleted
          }
        }
      `,
            variables: { userId: authStore.userId }
        })

        if (data.deleteUsers && data.deleteUsers.nodesDeleted > 0) {
            authStore.logout()
            router.push('/login')
        } else {
            errorMessage.value = 'Não foi possível excluir a conta'
            showDeleteDialog.value = false
        }
    } catch (error) {
        console.error('Erro ao excluir conta:', error)
        errorMessage.value = 'Erro ao excluir conta: ' + (error.message || 'Erro desconhecido')
        showDeleteDialog.value = false
    } finally {
        deleting.value = false
    }
}
</script>