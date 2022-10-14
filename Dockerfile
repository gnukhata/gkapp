FROM node:lts-alpine as build

ARG ref=devel

RUN wget -qO- https://gitlab.com/gnukhata/gkapp/-/archive/${ref}/gkapp-${ref}.tar.gz \
	| tar -xz \
	&& mv /gkapp-${ref} /gkapp \
	&& cd /gkapp \
	&& npm install -g @vue/cli \
	&& npm install \
	&& npm run build

FROM nginx:stable-alpine

COPY --from=build /gkapp/dist/ /usr/share/nginx/html/
