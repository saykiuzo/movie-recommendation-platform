<template>
  <v-container>
    <!-- Seção de Recomendações (visível apenas para usuários logados) -->
    <section v-if="authStore.isLoggedIn">
      <h1 class="text-h4 mb-4">Filmes Recomendados para Você</h1>

      <v-row v-if="loadingRecommendations">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-col>
      </v-row>

      <div v-else-if="recommendations.length === 0" class="text-body-1 mb-6">
        <v-alert type="info" variant="tonal">
          Avalie alguns filmes para receber recomendações personalizadas!
        </v-alert>
      </div>

      <movie-carousel v-else :movies="recommendations" :loading="loadingRecommendations"></movie-carousel>
    </section>

    <!-- Barra de Pesquisa -->
    <v-row class="my-6">
      <v-col cols="12">
        <v-text-field v-model="searchQuery" label="Buscar filmes" prepend-inner-icon="mdi-magnify" variant="outlined"
          clearable @keyup.enter="searchMovies" @click:clear="clearSearch"></v-text-field>
      </v-col>
    </v-row>

    <!-- Resultados da Pesquisa -->
    <section v-if="searchResults.length > 0">
      <h2 class="text-h5 mb-4">Resultados da Busca</h2>
      <movie-grid :movies="searchResults" :loading="loadingSearch"></movie-grid>
    </section>

    <!-- Navegação por Gêneros -->
    <section class="mt-8">
      <h2 class="text-h5 mb-4">Navegar por Gênero</h2>

      <v-row v-if="loadingGenres">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="genre in genres" :key="genre.name" cols="6" sm="4" md="3" lg="2">
          <v-card @click="selectGenre(genre)" height="100" class="d-flex align-center justify-center"
            :class="{ 'bg-primary': selectedGenre === genre.name }">
            <v-card-title class="text-center">{{ genre.name }}</v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <!-- Filmes do Gênero Selecionado -->
    <section v-if="selectedGenre" class="mt-8">
      <h2 class="text-h5 mb-4">Filmes de {{ selectedGenre }}</h2>

      <v-row v-if="loadingGenreMovies">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-col>
      </v-row>

      <v-alert v-else-if="genreMovies.length === 0" type="info" variant="tonal">
        Nenhum filme encontrado para este gênero.
      </v-alert>

      <movie-grid v-else :movies="genreMovies" :loading="loadingGenreMovies"></movie-grid>
    </section>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { gql } from '@apollo/client/core'
import apolloClient from '@/plugins/apollo'
import MovieCarousel from '@/components/MovieCarousel.vue'
import MovieGrid from '@/components/MovieGrid.vue'

const authStore = useAuthStore()

// Recomendações
const recommendations = ref([])
const loadingRecommendations = ref(false)

// Busca
const searchQuery = ref('')
const searchResults = ref([])
const loadingSearch = ref(false)

// Gêneros
const genres = ref([])
const loadingGenres = ref(false)
const selectedGenre = ref(null)
const genreMovies = ref([])
const loadingGenreMovies = ref(false)

const fetchRecommendations = async () => {
  if (!authStore.isLoggedIn || !authStore.userId) return

  loadingRecommendations.value = true
  try {
    const { data } = await apolloClient.query({
      query: gql`
        query GetRecommendations($userId: ID!, $limit: Int!) {
          users(where: { userId: $userId }) {
            userId
            recommendedMovies(limit: $limit) {
              tmdbId
              title
              poster
              year
              imdbRating
            }
          }
        }
      `,
      variables: {
        userId: authStore.userId,
        limit: 10
      },
      fetchPolicy: 'network-only'
    })

    if (data?.users?.length > 0) {
      recommendations.value = data.users[0]?.recommendedMovies || []
      if (recommendations.value.length === 0) {
        fetchPopularMovies()
      }
    } else {
      recommendations.value = []
      fetchPopularMovies()
    }
  } catch (error) {
    console.error('Erro ao buscar recomendações:', error)
    recommendations.value = []
    fetchPopularMovies()
  } finally {
    loadingRecommendations.value = false
  }
}

const fetchPopularMovies = async () => {
  try {
    const { data } = await apolloClient.query({
      query: gql`
        query GetPopularMovies($limit: Int!) {
          movies(
            options: { limit: $limit, sort: { imdbRating: DESC } }
            where: { imdbRating_GT: 0, tmdbId_NOT: null }
          ) {
            tmdbId
            title
            poster
            year
            imdbRating
          }
        }
      `,
      variables: { limit: 10 }
    })

    if (data?.movies) {
      recommendations.value = data.movies
    }
  } catch (error) {
    console.error('Erro ao buscar filmes populares:', error)
  }
}

const fetchGenres = async () => {
  loadingGenres.value = true
  try {
    const { data } = await apolloClient.query({
      query: gql`
        query GetGenres {
          genres {
            name
          }
        }
      `
    })

    genres.value = data.genres || []
    // Remover a opção "(no genres listed)" se existir
    genres.value = genres.value.filter(g => g.name !== '(no genres listed)')
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error)
  } finally {
    loadingGenres.value = false
  }
}

const fetchMoviesByGenre = async (genreName) => {
  loadingGenreMovies.value = true
  genreMovies.value = []

  try {
    const { data } = await apolloClient.query({
      query: gql`
        query GetMoviesByGenreIndirect($limit: Int!) {
          movies(
            options: { limit: $limit, sort: { imdbRating: DESC } }
            where: { 
              imdbRating_GT: 0, 
              tmdbId_NOT: null 
            }
          ) {
            tmdbId
            title
            poster
            year
            imdbRating
            genres {
              name
            }
          }
        }
      `,
      variables: {
        limit: 100
      }
    })

    if (data?.movies) {
      const moviesWithGenre = data.movies.filter(movie =>
        movie.genres &&
        movie.genres.some(genre => genre.name === genreName) &&
        movie.tmdbId !== null
      )

      genreMovies.value = moviesWithGenre.slice(0, 12)
    }
  } catch (error) {
    console.error(`Erro ao buscar filmes do gênero ${genreName}:`, error)

    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((graphQLError, i) => {
        console.error(`GraphQL Erro ${i + 1}:`, graphQLError.message, graphQLError.extensions)
      })
    }

    try {
      await fetchMoviesByGenreFallback(genreName)
    } catch (fallbackError) {
      console.error('Erro no método fallback:', fallbackError)
    }
  } finally {
    loadingGenreMovies.value = false
  }
}

const fetchMoviesByGenreFallback = async (genreName) => {
  const { data } = await apolloClient.query({
    query: gql`
      query GetMoviesByGenreMoreRestricted {
        movies(
          options: { limit: 200 }
          where: { 
            tmdbId_NOT: null,
            title_NOT: null,
            imdbRating_GT: 0
          }
        ) {
          tmdbId
          title
          poster
          year
          imdbRating
          genres {
            name
          }
        }
      }
    `,
    fetchPolicy: 'network-only'
  })

  if (data && data.movies) {
    const filteredMovies = data.movies
      .filter(movie =>
        movie &&
        movie.tmdbId &&
        movie.title &&
        movie.genres &&
        movie.genres.some(genre => genre && genre.name === genreName)
      )
      .slice(0, 12)

    genreMovies.value = filteredMovies
  }
}

const searchMovies = async () => {
  if (!searchQuery.value.trim()) return

  loadingSearch.value = true
  try {
    const { data } = await apolloClient.query({
      query: gql`
        query SearchMovies($query: String!, $limit: Int!) {
          searchMovies(searchText: $query, limit: $limit) {
            title
            poster
            tmdbId
            year
            imdbRating
          }
        }
      `,
      variables: {
        query: searchQuery.value,
        limit: 12
      },
      fetchPolicy: 'network-only'
    })

    searchResults.value = (data.searchMovies || []).filter(movie => movie.tmdbId !== null)
  } catch (error) {
    console.error('Erro ao buscar filmes:', error)
    searchResults.value = []
  } finally {
    loadingSearch.value = false
  }
}

const clearSearch = () => {
  searchResults.value = []
  searchQuery.value = ''
}

const selectGenre = (genre) => {
  if (selectedGenre.value === genre.name) {
    selectedGenre.value = null
    genreMovies.value = []
  } else {
    selectedGenre.value = genre.name
    fetchMoviesByGenre(genre.name)
  }
}

onMounted(async () => {
  fetchGenres()

  if (authStore.isLoggedIn) {
    fetchRecommendations()
  }
})

watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    fetchRecommendations()
  } else {
    recommendations.value = []
  }
})
</script>