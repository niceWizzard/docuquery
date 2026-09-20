#!/bin/sh
set -e

# Run migrations at container start, not during image build
php artisan migrate --force

# Execute the default container command (Apache)
exec "$@"
