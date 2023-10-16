FROM node:hydrogen-alpine as build

# copy the contents of repository on to the image
COPY . /gkapp

ARG VERSION="dev"
ENV VUE_APP_GKAPP_VERSION=${VERSION} \
		NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /gkapp

# install dependencies & build
RUN npm install -g @vue/cli \
	&& npm install \
	&& npm run build

FROM nginx:stable-alpine
# copy the contents of dist/ to nginx image
COPY --from=build /gkapp/dist/ /usr/share/nginx/html/
