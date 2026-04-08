# Arquitetura do Frontend

## Visao geral

O frontend e uma SPA em React + TypeScript criada com Vite. A aplicacao usa:

- `react-router-dom` para roteamento
- `zustand` para estado global de autenticacao
- `axios` para comunicacao HTTP com a API
- `@react-oauth/google` para login com Google
- CSS global em arquivos separados por dominio visual

Hoje a arquitetura e simples e direta: as telas ficam em `src/pages`, componentes reutilizaveis em `src/components`, integracoes HTTP em `src/lib`, estado global em `src/stores`, contratos tipados em `src/types` e estilos em `src/styles`.

## Stack e configuracao base

### Build e ferramenta

- O projeto usa Vite com o plugin oficial de React em [`vite.config.ts`](/home/mateus/Documentos/Faculdade/TPPE/frontend/vite.config.ts).
- Os scripts principais estao em [`package.json`](/home/mateus/Documentos/Faculdade/TPPE/frontend/package.json):
  - `npm run dev`: sobe o ambiente local
  - `npm run build`: roda `tsc -b` e gera o build
  - `npm run lint`: executa ESLint
  - `npm run preview`: visualiza o build localmente

### TypeScript

- O projeto usa modo estrito em [`tsconfig.app.json`](/home/mateus/Documentos/Faculdade/TPPE/frontend/tsconfig.app.json).
- O `tsconfig.json` principal apenas referencia os arquivos de configuracao da aplicacao e do ambiente Node/Vite.
- O frontend trabalha em modo de bundler (`moduleResolution: "Bundler"`), sem emissao de JS pelo TypeScript (`noEmit: true`).

### Lint

- O lint esta configurado em [`eslint.config.js`](/home/mateus/Documentos/Faculdade/TPPE/frontend/eslint.config.js).
- As regras atuais cobrem JavaScript/TypeScript basico, `react-hooks` e `react-refresh`.

### Variaveis de ambiente

As variaveis lidas pelo frontend hoje sao:

- `VITE_API_URL`: URL base da API
- `VITE_GOOGLE_CLIENT_ID`: client ID do Google OAuth

Essas variaveis aparecem em [`frontend/.env`](/home/mateus/Documentos/Faculdade/TPPE/frontend/.env) e sao consumidas em:

- [`src/lib/api.ts`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/lib/api.ts): `VITE_API_URL`
- [`src/main.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/main.tsx): `VITE_GOOGLE_CLIENT_ID`

Observacao: a aba do editor menciona `frontend/.env.local`, mas esse arquivo nao existe no workspace no momento da leitura.

## Estrutura de pastas

```text
frontend/
  src/
    components/
      auth/
      layout/
    lib/
    pages/
      auth/
      home/
      patients/
    stores/
    styles/
    types/
    App.tsx
    main.tsx
```

### Responsabilidade de cada area

#### `src/main.tsx`

Ponto de entrada da aplicacao.

Responsabilidades:

- importar o CSS global
- criar a raiz React
- envolver a app com `GoogleOAuthProvider`
- renderizar o componente principal `App`

#### `src/App.tsx`

Centro do roteamento da aplicacao.

Responsabilidades:

- definir as rotas publicas
- definir as rotas protegidas por perfil
- aplicar `AppLayout` nas telas internas
- redirecionar usuario autenticado para a area correta

#### `src/components`

Contem componentes reaproveitaveis.

- `auth/ProtectedRoute.tsx`: gate de autenticacao e autorizacao por papel
- `auth/PetDecorations.tsx`: SVGs decorativos reutilizados nas telas de autenticacao
- `layout/AppLayout.tsx`: estrutura base com `Sidebar` + `Outlet`
- `layout/Sidebar.tsx`: navegacao lateral, dados do usuario e logout

#### `src/pages`

Contem as telas finais da aplicacao, organizadas por modulo.

- `auth/`: login, cadastro e recuperacao de senha
- `home/`: pagina inicial interna
- `patients/`: listagem, cadastro e detalhes de pacientes

#### `src/lib`

Camada de integracao com backend.

- `api.ts`: instancia Axios central com interceptadores
- `authService.ts`: funcoes de autenticacao encapsuladas

#### `src/stores`

Estado global persistido.

- `authStore.ts`: usuario, tokens e status de autenticacao

#### `src/types`

Contratos TypeScript usados pelo frontend.

- `index.ts`: tipos de usuario, auth, tutor, paciente, consultas, prontuario, vacinas e dashboard

#### `src/styles`

Arquivos CSS globais por contexto visual.

- `index.css`: design tokens, reset e classes base
- `layout.css`: sidebar, layout principal, busca e paginacao
- `auth.css`: telas de autenticacao
- `patients.css`: listagem e cadastro de pacientes

## Fluxo de inicializacao da aplicacao

1. O navegador carrega [`src/main.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/main.tsx).
2. O CSS global `index.css` e importado.
3. O `GoogleOAuthProvider` recebe `VITE_GOOGLE_CLIENT_ID`.
4. O componente [`src/App.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/App.tsx) monta o roteamento com `BrowserRouter`.
5. O estado persistido do `zustand` e restaurado automaticamente do storage do navegador.

## Roteamento e controle de acesso

O roteamento esta centralizado em [`src/App.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/App.tsx).

### Rotas publicas

- `/login`
- `/register`
- `/forgot-password`

Essas rotas sao envolvidas por `PublicRoute`. Se o usuario ja estiver autenticado:

- `TUTOR` vai para `/portal`
- `OWNER` e `VET` vao para `/`

### Rotas protegidas

O componente [`ProtectedRoute.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/components/auth/ProtectedRoute.tsx) faz duas validacoes:

- se nao houver autenticacao, redireciona para `/login`
- se o papel nao estiver entre os permitidos, redireciona para a area compatível com o perfil

### Areas protegidas atuais

#### Para `OWNER` e `VET`

- `/`
- `/pacientes`
- `/pacientes/cadastrar`
- `/pacientes/:id`
- `/agenda`
- `/historico`

Essas rotas usam [`AppLayout.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/components/layout/AppLayout.tsx), que rendeiriza a `Sidebar` fixa e o `Outlet` principal.

#### Para `TUTOR`

- `/portal`

Hoje essa area ainda esta em placeholder.

### Catch-all

- qualquer rota desconhecida vai para `/login`

## Estado global de autenticacao

O estado global fica em [`src/stores/authStore.ts`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/stores/authStore.ts).

### O que o store guarda

- `user`
- `accessToken`
- `refreshToken`
- `isAuthenticated`

### Acoes disponiveis

- `setAuth(user, accessToken, refreshToken)`
- `logout()`

### Persistencia

O store usa o middleware `persist` do Zustand com a chave:

- `iougurt-auth`

Isso faz com que o login sobreviva a reload da pagina.

## Camada HTTP e autenticacao

### `api.ts`

[`src/lib/api.ts`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/lib/api.ts) concentra a configuracao do Axios.

Responsabilidades:

- definir a `baseURL` via `VITE_API_URL`
- enviar `Content-Type: application/json`
- anexar o JWT no header `Authorization`
- tentar refresh automatico ao receber `401`

### Interceptador de request

Antes de cada requisicao:

- le `accessToken` diretamente do `authStore`
- se existir, envia `Authorization: Bearer <token>`

### Interceptador de response

Quando recebe `401`:

1. evita reprocessar a mesma request com `_retry`
2. se ja existir refresh em andamento, coloca a request numa fila
3. se nao houver `refreshToken`, faz logout local
4. tenta `POST /auth/refresh`
5. atualiza o store com novos tokens e usuario
6. reprocesa a request original
7. se o refresh falhar, limpa sessao local

Esse mecanismo evita que varias requests tentem renovar o token ao mesmo tempo.

### `authService.ts`

[`src/lib/authService.ts`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/lib/authService.ts) encapsula as chamadas de autenticacao:

- `login`
- `register`
- `refresh`
- `logout`
- `googleLogin`

Ele funciona como uma camada de servico simples sobre `api.ts`.

## Tipagem e contrato de dados

Os tipos ficam centralizados em [`src/types/index.ts`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/types/index.ts).

Esse arquivo espelha, na intencao do projeto, os schemas do backend e define:

- papeis (`Role`)
- usuario e resposta de autenticacao
- tutor e payloads de criacao/edicao
- paciente e payloads de criacao/edicao
- formulario combinado de cadastro de paciente
- consulta, prontuario, vacinacao, arquivos e metricas

Importante: nem todos os tipos definidos estao em uso no frontend atual. O modulo de pacientes usa parte deles; outras areas parecem preparadas para evolucao futura.

## Organizacao visual e estilo

### Design system global

[`src/styles/index.css`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/styles/index.css) funciona como base visual da aplicacao.

Ele define:

- paleta principal rosa
- tons de cinza
- variaveis semanticas (`--color-primary`, `--color-text`, etc.)
- espacos, bordas, sombras e transicoes
- reset global
- estilos base de formulario e botoes
- fonte principal `Poppins`

### Layout

[`src/styles/layout.css`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/styles/layout.css) estiliza:

- `layout`
- `sidebar`
- `main-content`
- `page-header`
- `search-bar`
- `page-footer`

### Auth

[`src/styles/auth.css`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/styles/auth.css) cuida das telas de autenticacao.

Caracteristicas:

- logo com `Fredoka One`
- fundo com SVGs animados de pets
- card central limpo
- botao de login Google

### Pacientes

[`src/styles/patients.css`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/styles/patients.css) concentra os estilos do modulo de pacientes.

Ele cobre:

- header da listagem
- botoes de filtro e cadastro
- estados de loading e vazio
- formulario de cadastro
- upload de foto
- grids de campos

## Modulos e fluxos atuais

### 1. Autenticacao

### Login

Tela: [`src/pages/auth/LoginPage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/auth/LoginPage.tsx)

Fluxo:

1. usuario preenche email e senha
2. `authService.login` chama `POST /auth/login`
3. `setAuth` grava usuario e tokens no store
4. a navegacao depende do papel:
   - `TUTOR` vai para `/portal`
   - demais vao para `/`

Tambem existe login com Google:

1. `useGoogleLogin` obtem `access_token` do Google
2. `authService.googleLogin` envia o token para `POST /auth/google`
3. o backend devolve sessao da aplicacao
4. o store e atualizado e o usuario e redirecionado

### Cadastro

Tela: [`src/pages/auth/RegisterPage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/auth/RegisterPage.tsx)

Fluxo:

1. usuario informa nome, email e senha
2. o frontend chama `authService.register`
3. o papel enviado esta fixo como `VET`
4. em caso de sucesso, o usuario e levado para `/login`

### Esqueci a senha

Tela: [`src/pages/auth/ForgotPasswordPage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/auth/ForgotPasswordPage.tsx)

Estado atual:

- ainda nao integra com backend
- simula envio com `setTimeout`
- serve hoje mais como placeholder de UX

### 2. Layout autenticado

### `AppLayout`

[`src/components/layout/AppLayout.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/components/layout/AppLayout.tsx) e um shell simples:

- `Sidebar` fixa
- `<main>` com `Outlet`

### `Sidebar`

[`src/components/layout/Sidebar.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/components/layout/Sidebar.tsx) concentra a navegacao principal.

Responsabilidades:

- listar links internos
- destacar rota ativa com `NavLink`
- exibir avatar ou iniciais do usuario
- executar logout

Fluxo de logout:

1. tenta `authService.logout()`
2. se falhar, segue mesmo assim
3. limpa o store local
4. navega para `/login`

### 3. Home

Tela: [`src/pages/home/HomePage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/home/HomePage.tsx)

Estado atual:

- placeholder simples
- nao consome API
- indica que o dashboard ainda sera implementado

### 4. Modulo de pacientes

Esse e hoje o modulo mais desenvolvido do frontend.

### Listagem de pacientes

Tela: [`src/pages/patients/PatientsListPage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/patients/PatientsListPage.tsx)

Responsabilidades:

- buscar pacientes da API
- paginar resultados
- filtrar por busca, especie e data
- navegar para detalhes ou cadastro

Fluxo:

1. ao montar ou mudar filtros/pagina, a tela chama `GET /patients`
2. monta `params` com `page`, `perPage`, `search`, `species` e `updateDate`
3. salva `patients` e `total`
4. renderiza loading, vazio ou tabela

Observacoes de implementacao:

- `perPage` esta fixo em `10`
- o filtro visual usa um popover controlado localmente
- a data digitada no filtro e mascarada em `dd/mm/aaaa`
- a tabela mostra `updatedAt` como "ultima consulta", o que e uma aproximacao de negocio, nao necessariamente a data real da ultima consulta

### Cadastro de paciente

Tela: [`src/pages/patients/PatientRegisterPage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/patients/PatientRegisterPage.tsx)

Esse arquivo concentra bastante logica de formulario.

Responsabilidades:

- controlar todo o estado do form localmente
- validar campos obrigatorios
- mascarar CPF, telefone, CEP e data
- calcular idade a partir da data de nascimento
- converter foto para base64 no navegador
- criar tutor e depois criar paciente

Fluxo de submissao:

1. valida os campos essenciais
2. monta endereco do tutor como uma unica string
3. limpa CPF e telefone
4. tenta `POST /tutors`
5. se receber `409`, busca tutor existente em `GET /tutors` por nome e compara CPF
6. com `tutorId` resolvido, envia `POST /patients`
7. mostra toast e redireciona para `/pacientes`

Pontos arquiteturais relevantes:

- a tela fala diretamente com `api`, sem uma camada de servico especifica do modulo
- paciente e tutor sao criados de forma orquestrada no frontend
- o endereco do tutor nao e estruturado em objeto; ele e serializado em string
- a foto tambem nao passa por upload dedicado; vai como base64 em `photoUrl`

### Detalhes do paciente

Tela: [`src/pages/patients/PatientDetailsPage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/patients/PatientDetailsPage.tsx)

Responsabilidades:

- buscar um paciente por ID
- exibir dados do paciente e do tutor
- alternar entre abas de `Dados` e `Prontuario`
- reconstruir o endereco do tutor a partir da string salva

Fluxo:

1. le `id` da rota
2. chama `GET /patients/:id`
3. salva o retorno em `patient`
4. renderiza loading, erro simples ou conteudo

Observacoes:

- a aba `Prontuario` ainda e placeholder
- os botoes `Atender` e `Editar dados` ainda nao executam acao
- a tela precisa "desempacotar" o endereco do tutor com heuristica de string, porque o cadastro salva o endereco concatenado

## Decisoes arquiteturais observadas

### O que esta funcionando bem

- Separacao clara entre paginas, componentes, store, tipos e estilos
- `authStore` simples e facil de entender
- `api.ts` centraliza autenticacao e refresh de token
- uso de tipos compartilhados melhora consistencia do contrato com backend
- layout autenticado esta isolado e reaproveitavel

### Trade-offs atuais

- Parte importante da logica de negocio mora dentro das paginas, especialmente em pacientes
- O modulo de pacientes ainda nao possui camada propria de servicos, hooks ou componentes menores
- Algumas telas usam bastante estilo inline, principalmente `PatientDetailsPage` e o popover de filtro na listagem
- Endereco do tutor e salvo como texto concatenado, o que obriga parse posterior
- Existem tipos para varios modulos futuros, mas a UI ainda nao os consome

## O que ja esta implementado vs. placeholder

### Implementado de fato

- bootstrap da app
- autenticacao por email/senha
- autenticacao com Google
- persistencia de sessao
- refresh automatico de token
- controle de rota por papel
- sidebar autenticada
- listagem de pacientes
- cadastro de paciente com criacao de tutor
- detalhes do paciente

### Ainda em desenvolvimento ou simulado

- home/dashboard real
- agenda
- historico
- portal do tutor
- prontuario do paciente
- fluxo real de recuperacao de senha
- acoes "Atender" e "Editar dados"

## Leitura arquitetural resumida

Se quisermos descrever o frontend em uma frase:

> Hoje ele e uma SPA React orientada por paginas, com autenticacao centralizada, camada HTTP compartilhada e um modulo de pacientes relativamente avancado, enquanto os demais modulos ainda estao em fase inicial.

## Sugestoes naturais de evolucao

Sem alterar o que existe, os proximos passos arquiteturais mais naturais seriam:

- criar servicos por dominio (`patientsService`, `tutorsService`, etc.)
- extrair hooks de pagina para dados e formularios
- reduzir estilo inline em componentes grandes
- estruturar melhor os modelos de endereco e upload de imagem
- criar uma pasta `features/` ou `modules/` se o volume do projeto crescer
- adicionar documentacao de endpoints consumidos por cada tela

## Arquivos mais importantes para entender rapidamente o frontend

- [`src/main.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/main.tsx)
- [`src/App.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/App.tsx)
- [`src/stores/authStore.ts`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/stores/authStore.ts)
- [`src/lib/api.ts`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/lib/api.ts)
- [`src/lib/authService.ts`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/lib/authService.ts)
- [`src/pages/patients/PatientsListPage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/patients/PatientsListPage.tsx)
- [`src/pages/patients/PatientRegisterPage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/patients/PatientRegisterPage.tsx)
- [`src/pages/patients/PatientDetailsPage.tsx`](/home/mateus/Documentos/Faculdade/TPPE/frontend/src/pages/patients/PatientDetailsPage.tsx)
