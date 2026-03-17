# Stage 1: Build React frontend
FROM node:20-alpine AS build

WORKDIR /app
COPY frontend/package.json .
RUN npm install
COPY frontend/ .
RUN npm run build


# Stage 2: Runtime (PHP-FPM already included)
FROM php:8.2-fpm-alpine

# Add nginx — one package, no version juggling
RUN apk add --no-cache nginx

# PHP app
COPY backend/composer.json /app/
RUN cd /app && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php /app/composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && rm /app/composer-setup.php \
    && composer install --working-dir=/app --no-dev --optimize-autoloader --no-interaction --quiet
COPY backend/src/    /app/src/
COPY backend/public/ /app/public/

# React build → nginx webroot
COPY --from=build /app/dist/ /var/www/html/

# nginx config
RUN printf 'server {\n\
    listen 8080;\n\
    root /var/www/html;\n\
    index index.html;\n\
\n\
    location /assets/ {\n\
        try_files $uri =404;\n\
        add_header Cache-Control "public, max-age=31536000, immutable";\n\
    }\n\
\n\
    location /api/ {\n\
        fastcgi_pass 127.0.0.1:9000;\n\
        include fastcgi_params;\n\
        fastcgi_param SCRIPT_FILENAME /app/public/index.php;\n\
        fastcgi_param REQUEST_URI $request_uri;\n\
        fastcgi_param QUERY_STRING $query_string;\n\
    }\n\
\n\
    location / {\n\
        try_files $uri /index.html;\n\
    }\n\
}\n' > /etc/nginx/http.d/default.conf

# Start PHP-FPM then nginx
CMD php-fpm -D && sleep 1 && nginx -g "daemon off;"

EXPOSE 8080
