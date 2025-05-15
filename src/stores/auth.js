import { defineStore } from 'pinia'
import apolloClient from '@/plugins/apollo'
import { gql } from '@apollo/client/core'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        userId: localStorage.getItem('userId') || null
    }),

    getters: {
        isLoggedIn: (state) => !!state.userId,
        currentUser: (state) => state.user
    },

    actions: {
        async login(email) {
            try {
                const { data } = await apolloClient.query({
                    query: gql`
            query GetUserByEmail($email: String!) {
              users(where: { email: $email }) {
                userId
                name
                email
              }
            }
          `,
                    variables: { email },
                    fetchPolicy: 'network-only'
                })

                if (data.users && data.users.length > 0) {
                    const user = data.users[0]
                    this.user = user
                    this.userId = user.userId
                    localStorage.setItem('userId', user.userId)
                    return true
                } else {
                    throw new Error('Usuário não encontrado')
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error)
                throw error
            }
        },

        // Senha mocada para simplificar o processo
        async register(name, email, password = "senha123") {
            try {
                const checkResult = await apolloClient.query({
                    query: gql`
            query CheckUserExists($email: String!) {
              users(where: { email: $email }) {
                userId
              }
            }
          `,
                    variables: { email }
                })

                if (checkResult.data.users && checkResult.data.users.length > 0) {
                    throw new Error('Um usuário com este email já existe')
                }

                const { data } = await apolloClient.mutate({
                    mutation: gql`
            mutation CreateNewUser($name: String!, $email: String!, $password: String!) {
              createUsers(
                input: [
                  { name: $name, email: $email, password: $password }
                ]
              ) {
                users {
                  userId
                  name
                  email
                }
              }
            }
          `,
                    variables: { name, email, password }
                })

                if (data && data.createUsers && data.createUsers.users.length > 0) {
                    const user = data.createUsers.users[0]
                    this.user = user
                    this.userId = user.userId
                    localStorage.setItem('userId', user.userId)
                    return true
                }

                return false
            } catch (error) {
                console.error('Erro ao registrar:', error)
                throw error
            }
        },

        logout() {
            this.user = null
            this.userId = null
            localStorage.removeItem('userId')
        },

        async fetchCurrentUser() {
            if (!this.userId) return

            try {
                const { data } = await apolloClient.query({
                    query: gql`
            query GetUserById($userId: ID!) {
              users(where: { userId: $userId }) {
                userId
                name
                email
              }
            }
          `,
                    variables: { userId: this.userId },
                    fetchPolicy: 'network-only'
                })

                if (data.users && data.users.length > 0) {
                    this.user = data.users[0]
                } else {
                    this.logout()
                }
            } catch (error) {
                console.error('Erro ao buscar usuário:', error)
                this.logout()
            }
        }
    }
})