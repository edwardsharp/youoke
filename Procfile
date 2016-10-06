web: bundle exec unicorn -c config/unicorn.rb > /dev/null 2>&1
nginx: /usr/sbin/nginx -c /etc/nginx/nginx.conf > /dev/null 2>&1
cable: bundle exec puma -p 28080 cable/config.ru > /dev/null 2>&1
redis: redis-server > /dev/null 2>&1