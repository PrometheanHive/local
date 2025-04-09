#!/bin/sh
# Replace template variables and launch nginx
envsubst '$DOMAIN' < /etc/nginx/conf.d/default.template.conf > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
