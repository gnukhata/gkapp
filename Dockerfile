FROM node:gallium-alpine as build

# copy the contents of repository on to the image
COPY . /gkapp

ARG VERSION="dev"
ENV VUE_APP_GKAPP_VERSION=${VERSION}

WORKDIR /gkapp

# install dependencies & build
RUN npm install -g @vue/cli \
	&& npm install \
	&& npm run build \
	&& ls dist/ \
	&& cat dist/gkapp-config.json

FROM nginx:stable-alpine
# copy the contents of dist/ to nginx image
COPY --from=build /gkapp/dist/ /usr/share/nginx/html/
