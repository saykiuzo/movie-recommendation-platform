<template>
    <div>
        <v-row v-if="loading">
            <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-col>
        </v-row>

        <v-row v-else-if="movies.length === 0">
            <v-col cols="12">
                <p>Nenhum filme encontrado.</p>
            </v-col>
        </v-row>

        <v-row v-else>
            <v-col v-for="movie in movies" :key="movie.tmdbId" cols="6" sm="4" md="3" lg="2">
                <v-card height="100%" @click="navigateToMovie(movie)">
                    <v-img :src="movie.poster || '/placeholder-movie.jpg'" :alt="movie.title" height="250" cover
                        class="align-end">
                        <v-card-title v-if="!movie.poster" class="text-subtitle-1 text-center">
                            {{ movie.title }}
                        </v-card-title>
                    </v-img>

                    <v-card-subtitle>
                        <div class="d-flex align-center">
                            <v-rating v-if="movie.imdbRating" :model-value="movie.imdbRating / 2" color="amber"
                                density="compact" half-increments readonly size="small"></v-rating>
                            <span v-if="movie.imdbRating" class="ms-1 text-caption">
                                {{ movie.imdbRating }}/10
                            </span>
                            <span v-if="movie.year" class="ml-auto">{{ movie.year }}</span>
                        </div>
                    </v-card-subtitle>

                    <v-card-text class="text-truncate">
                        {{ movie.title }}
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'

defineProps({
    movies: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const router = useRouter()

const navigateToMovie = (movie) => {
    router.push(`/movie/${movie.tmdbId}`)
}
</script>