import { createApp, h } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { provideApolloClient } from '@vue/apollo-composable'
import apolloClient from './plugins/apollo'
import { createPinia } from 'pinia'

const app = createApp({
    setup() {
        provideApolloClient(apolloClient)
    },
    render: () => h(App)
})

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')