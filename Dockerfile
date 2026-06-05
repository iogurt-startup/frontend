FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# Upstream da API resolvido em runtime via envsubst (sem IP hardcoded).
# Default aponta para o serviço "api" na rede Docker compartilhada;
# em produção basta sobrescrever API_UPSTREAM no ambiente do container.
ENV API_UPSTREAM=http://api:3000
# Faz o entrypoint do nginx detectar o resolver DNS a partir do
# /etc/resolv.conf do container (sem IP de DNS hardcoded) e expô-lo como
# ${NGINX_LOCAL_RESOLVERS} para o template — necessário para o proxy_pass
# com variável resolver o upstream em runtime.
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
# A imagem oficial do nginx processa /etc/nginx/templates/*.template com
# envsubst no entrypoint e grava o resultado em /etc/nginx/conf.d/.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
