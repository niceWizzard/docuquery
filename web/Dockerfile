FROM php:8.5-apache

# 1. Install development packages and clean up apt cache.
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install zip pdo_mysql pgsql pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Node.js & npm directly in the PHP container
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

COPY . /var/www/html

WORKDIR /var/www/html

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set Production Environment
ENV APP_ENV=production
ENV APP_DEBUG=false

RUN composer install --no-dev --optimize-autoloader

RUN npm ci --legacy-peer-deps && npm run build

# Ensure the database file exists and the database folder is writable
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache


RUN chmod +x /var/www/html/entry-point.sh
ENTRYPOINT ["/var/www/html/entry-point.sh"]
CMD ["apache2-foreground"]
