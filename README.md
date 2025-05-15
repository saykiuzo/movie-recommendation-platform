# CineGraph - Frontend

Interface de usuário para o sistema de recomendação de filmes CineGraph, desenvolvido com Vue.js 3 e Vuetify.

## Tecnologias utilizadas

- Vue.js 3 (Composition API)
- Pinia para gerenciamento de estado
- Vue Router para navegação
- Apollo Client para comunicação GraphQL
- Vuetify 3 para UI

## Estrutura do projeto

```
src/
├── assets/         # Recursos estáticos (imagens, etc.)
├── components/     # Componentes reutilizáveis
│   ├── MovieCarousel.vue
│   └── MovieGrid.vue
├── plugins/        # Configurações de plugins
│   ├── apollo.js   # Cliente Apollo para GraphQL
│   └── vuetify.js  # Configuração do Vuetify
├── router/         # Configuração de rotas
│   └── index.js
├── stores/         # Stores Pinia
│   └── auth.js     # Gerenciamento de autenticação
├── views/          # Componentes de página
│   ├── HomeView.vue           # Página inicial com recomendações e pesquisa
│   ├── LoginView.vue          # Página de login
│   ├── MovieDetailView.vue    # Detalhes do filme
│   ├── ProfileView.vue        # Perfil do usuário
│   └── RegisterView.vue       # Registro de usuário
├── App.vue         # Componente principal
└── main.js         # Ponto de entrada da aplicação
```

## Funcionalidades

- **Autenticação**: Login e registro de usuários
- **Recomendações**: Visualização de filmes recomendados baseados em preferências
- **Pesquisa**: Busca de filmes por título
- **Navegação por gênero**: Exploração de filmes por categoria
- **Detalhes do filme**: Informações detalhadas, elenco e filmes similares
- **Avaliação**: Sistema de avaliação de filmes (1-5 estrelas)
- **Gerenciamento de perfil**: Edição e exclusão de conta

## Pré-requisitos

- Node.js (versão 18 ou superior)
- NPM ou Yarn
- API GraphQL do CineGraph em execução (backend)

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/saykiuzo/movie-recommendation-platform.git
   cd movie-recommendation-platform
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure a URL da API:
   
   Edite o arquivo `src/plugins/apollo.js` e ajuste a URL do servidor GraphQL:
   ```js
   const httpLink = createHttpLink({
       uri: 'http://localhost:4000'
   })
   ```

## Execução

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run serve
   # ou
   yarn serve
   ```

2. Acesse o aplicativo no navegador:
   ```
   http://localhost:8080
   ```

## Compilação para produção

```bash
npm run build
# ou
yarn build
```

## Fluxo de autenticação

Como o projeto é um desafio, o fluxo de autenticação foi simplificado para facilitar a implementação. As principais características são:

1. O login é realizado apenas com o e-mail (senha fixa "senha123")
2. O token JWT é armazenado no localStorage
3. As requisições GraphQL incluem o token no cabeçalho Authorization

## Componentes principais

- **MovieCarousel**: Exibe filmes em um carrossel horizontal deslizante
- **MovieGrid**: Apresenta filmes em um grid responsivo
- **HomeView**: Página inicial com recomendações, pesquisa e navegação por gêneros
- **MovieDetailView**: Exibe detalhes do filme, elenco, avaliações e filmes similares

## Observações

- A interface foi projetada com o tema escuro do Vuetify por padrão
- O sistema de recomendação utiliza algoritmos de similaridade de gêneros
- A navegação requer que a API GraphQL do backend esteja em execução