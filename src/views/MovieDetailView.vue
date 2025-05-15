<template>
    <v-container>
        <v-row v-if="loading">
            <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            </v-col>
        </v-row>

        <template v-else-if="movie">
            <v-row>
                <!-- Poster do Filme -->
                <v-col cols="12" sm="4" md="3">
                    <v-img :src="movie.poster" :alt="movie.title" height="450" cover class="rounded-lg"></v-img>

                    <!-- Avaliação do Usuário -->
                    <v-sheet v-if="authStore.isLoggedIn" class="mt-4 pa-4 rounded-lg">
                        <h3 class="text-subtitle-1 mb-2">Sua avaliação</h3>
                        <div class="d-flex align-center justify-space-between">
                            <v-rating v-model="userRating" color="amber" hover size="large" density="comfortable"
                                item-aria-label="Avaliação" :clearable="false"
                                @update:model-value="rateMovie"></v-rating>

                            <v-btn v-if="hasUserRating" icon="mdi-delete" variant="text" color="error" size="small"
                                @click="removeRating"></v-btn>
                        </div>

                        <div v-if="loadingRating" class="text-center mt-2">
                            <v-progress-linear indeterminate color="primary"></v-progress-linear>
                            <div class="text-caption">Salvando avaliação...</div>
                        </div>

                        <div v-else-if="hasUserRating" class="text-center mt-2">
                            <div class="text-body-2">
                                <v-icon size="small" color="success">mdi-check</v-icon>
                                Sua avaliação: {{ userRating }} estrelas
                            </div>
                        </div>

                        <v-btn v-if="!hasUserRating" class="mt-2" size="small" variant="text"
                            @click="forceRefreshRating" prepend-icon="mdi-refresh">
                            Verificar avaliação
                        </v-btn>
                    </v-sheet>
                </v-col>

                <!-- Detalhes do Filme -->
                <v-col cols="12" sm="8" md="9">
                    <h1 class="text-h3 mb-2">{{ movie.title }}</h1>

                    <div class="d-flex align-center mb-4">
                        <span v-if="movie.year" class="text-body-1 mr-4">{{ movie.year }}</span>
                        <v-rating v-if="movie.imdbRating" :model-value="movie.imdbRating / 2" color="amber"
                            half-increments readonly size="small"></v-rating>
                        <span v-if="movie.imdbRating" class="ml-1">
                            {{ movie.imdbRating.toFixed(1) }}/10
                        </span>
                    </div>

                    <v-divider class="mb-4"></v-divider>

                    <!-- Sinopse -->
                    <div class="mb-6">
                        <h2 class="text-h5 mb-2">Sinopse</h2>
                        <p class="text-body-1">{{ movie.plot || 'Nenhuma sinopse disponível.' }}</p>
                    </div>

                    <!-- Atores -->
                    <div v-if="movie && movie.actors && movie.actors.length" class="mb-6">
                        <h2 class="text-h5 mb-2">Elenco</h2>

                        <v-row>
                            <v-col v-for="actor in movie.actors" :key="actor.tmdbId || actor.name" cols="6" sm="4"
                                md="3" lg="2">
                                <v-card class="pa-2" height="100%">
                                    <div class="d-flex flex-column align-center">
                                        <v-avatar size="80" class="mb-2">
                                            <v-img :src="actor.poster" :alt="actor.name"></v-img>
                                        </v-avatar>
                                        <div class="text-center">
                                            <div class="text-subtitle-1">{{ actor.name }}</div>
                                        </div>
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- Gêneros -->
                    <div class="mb-6">
                        <h2 class="text-h5 mb-2">Gêneros</h2>
                        <v-chip-group>
                            <v-chip v-for="genre in movie.genres" :key="genre.name" color="primary" variant="outlined"
                                @click="navigateToGenre(genre.name)">
                                {{ genre.name }}
                            </v-chip>
                        </v-chip-group>
                    </div>

                    <!-- Informações Adicionais -->
                    <div class="mb-6">
                        <h2 class="text-h5 mb-2">Informações</h2>
                        <v-list lines="two">
                            <v-list-item v-if="movie.runtime">
                                <template v-slot:prepend>
                                    <v-icon icon="mdi-clock-outline"></v-icon>
                                </template>
                                <v-list-item-title>Duração</v-list-item-title>
                                <v-list-item-subtitle>{{ formatRuntime(movie.runtime) }}</v-list-item-subtitle>
                            </v-list-item>

                            <v-list-item v-if="movie.directors && movie.directors.length">
                                <template v-slot:prepend>
                                    <v-icon icon="mdi-movie-outline"></v-icon>
                                </template>
                                <v-list-item-title>Direção</v-list-item-title>
                                <v-list-item-subtitle>
                                    {{movie.directors.map(d => d.name).join(', ')}}
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </div>
                </v-col>
            </v-row>

            <!-- Filmes Similares -->
            <section class="mt-8">
                <h2 class="text-h4 mb-4">Filmes Similares</h2>
                <movie-carousel :movies="similarMovies" :loading="loadingSimilar"
                    @movie-click="navigateToMovie"></movie-carousel>
            </section>
        </template>

        <v-alert v-else type="warning" variant="tonal" class="mt-8">
            Filme não encontrado.
        </v-alert>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { gql } from '@apollo/client/core'
import apolloClient from '@/plugins/apollo'
import MovieCarousel from '@/components/MovieCarousel.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const movie = ref(null)
const loading = ref(true)
const similarMovies = ref([])
const loadingSimilar = ref(false)
const userRating = ref(0)
const loadingRating = ref(false)

const hasUserRating = computed(() => userRating.value > 0)

const forceRefreshRating = () => {
    if (movie.value && movie.value.title) {
        fetchUserRating(movie.value.title);
    }
};

const fetchMovieDetails = async () => {
    const movieId = route.params.id;
    if (!movieId) return;

    loading.value = true;
    try {
        const { data } = await apolloClient.query({
            query: gql`
        query GetMovieDetails($movieId: ID!) {
          movies(where: { tmdbId: $movieId }) {
            tmdbId
            title
            poster
            plot
            year
            imdbRating
            runtime
            budget
            revenue
            tagline
            released
            genres {
              name
            }
            directors {
              name
            }
            actors {
              name
              tmdbId
              poster
            }
          }
        }
      `,
            variables: { movieId },
            fetchPolicy: 'network-only'
        });

        if (data.movies && data.movies.length > 0) {
            movie.value = data.movies[0];

            fetchSimilarMovies(movie.value.title);
            if (authStore.isLoggedIn) {
                fetchUserRating(movie.value.title);
            }
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do filme:', error);
    } finally {
        loading.value = false;
    }
};

const fetchSimilarMovies = async (movieTitle) => {
    if (!movieTitle) {
        console.error('Título do filme não fornecido para busca de similares')
        return
    }

    loadingSimilar.value = true
    try {
        const { data } = await apolloClient.query({
            query: gql`
        query GetSimilarMovies($title: String!, $limit: Int!) {
          movies(where: { title: $title }) {
            tmdbId
            title
            similarMovies(limit: $limit) {
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
                title: movieTitle,
                limit: 10
            }
        })

        if (data?.movies?.length > 0 && Array.isArray(data.movies[0]?.similarMovies)) {
            similarMovies.value = data.movies[0].similarMovies.filter(movie => movie && movie.tmdbId);
        } else {
            similarMovies.value = []
        }
    } catch (error) {
        console.error('Erro ao buscar filmes similares:', error)
        similarMovies.value = []
    } finally {
        loadingSimilar.value = false
    }
}

const fetchUserRating = async (movieTitle) => {
    if (!authStore.isLoggedIn || !authStore.userId || !movieTitle) return

    try {
        const { data } = await apolloClient.query({
            query: gql`
        query GetUserRating($userId: ID!, $movieTitle: String!) {
          getUserRating(userId: $userId, movieTitle: $movieTitle) {
            rating
          }
        }
      `,
            variables: {
                userId: authStore.userId,
                movieTitle: movieTitle
            },
            fetchPolicy: 'network-only'
        });

        if (data?.getUserRating?.rating !== null && data?.getUserRating?.rating !== undefined) {
            userRating.value = data.getUserRating.rating;
        } else {
            userRating.value = 0;
        }
    } catch (error) {
        console.error('Erro ao buscar avaliação do usuário:', error);
        userRating.value = 0;
    }
};

const rateMovie = async (rating) => {
    if (!authStore.isLoggedIn || !movie.value || loadingRating.value) return

    const normalizedRating = Math.max(1, Math.min(5, rating));
    loadingRating.value = true
    try {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation RateMovie($userId: ID!, $movieTitle: String!, $rating: Int!) {
          addRating(userId: $userId, movieTitle: $movieTitle, rating: $rating) {
            movie {
              title
              tmdbId
            }
            user {
              userId
              name
            }
            rating
          }
        }
      `,
            variables: {
                userId: authStore.userId,
                movieTitle: movie.value.title,
                rating: Math.round(normalizedRating)
            }
        });

        if (data?.addRating) {
            userRating.value = data.addRating.rating;
        } else {
            console.warn('Mutação bem-sucedida, mas sem dados de retorno esperados');
        }
    } catch (error) {
        console.error('Erro ao avaliar filme:', error);
    } finally {
        loadingRating.value = false;
    }
};

const removeRating = async () => {
    if (!authStore.isLoggedIn || !movie.value || loadingRating.value) return

    loadingRating.value = true
    try {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation RemoveRating($userId: ID!, $movieTitle: String!) {
          removeRating(userId: $userId, movieTitle: $movieTitle) {
            success
          }
        }
      `,
            variables: {
                userId: authStore.userId,
                movieTitle: movie.value.title
            }
        });

        if (data.removeRating && data.removeRating.success) {
            userRating.value = 0;
        }
    } catch (error) {
        console.error('Erro ao remover avaliação:', error);
    } finally {
        loadingRating.value = false;
    }
};

const formatRuntime = (minutes) => {
    if (!minutes) return 'Desconhecido'

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
        return `${mins}min`
    } else if (mins === 0) {
        return `${hours}h`
    } else {
        return `${hours}h ${mins}min`
    }
}

const navigateToGenre = (genreName) => {
    router.push({
        path: '/',
        query: { genre: genreName }
    })
}

const navigateToMovie = (movie) => {
    if (!movie || !movie.tmdbId) {
        console.error('Tentativa de navegar para um filme sem ID:', movie);
        return;
    }

    router.push(`/movie/${movie.tmdbId}`);
}

watch(() => route.params.id, (newId, oldId) => {
    if (newId && newId !== oldId) {
        fetchMovieDetails();
    }
});

onMounted(() => {
    fetchMovieDetails()
})
</script>