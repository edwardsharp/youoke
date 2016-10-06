web: bundle exec unicorn -c config/unicorn.rb
nginx: /usr/sbin/nginx -c /etc/nginx/nginx.conf
cable: bundle exec puma -p 28080 cable/config.ru
redis: redis-server