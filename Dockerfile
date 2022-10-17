FROM node:lts-alpine as build

# copy the contents of gkapp to the image
COPY . /gkapp

WORKDIR /gkapp

# install dependencies & build
RUN npm install -g @vue/cli \
	&& npm install \
	&& npm run build

# copy the contents of dist/ to nginx image
FROM nginx:stable-alpine

COPY --from=build /gkapp/dist/ /usr/share/nginx/html/
