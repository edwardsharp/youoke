# youoke

karatube? youaoke? karayouoketube?? dunno. create a queue of youtube videos, maybe they're karaoke videoz. maybe you got a mic. ...maybe

## Dependencies

You must have redis installed and running on the default port:6379 (or configure it in config/redis/cable.yml).

## Starting the servers

run: 

1. `./bin/setup`
2. `foreman start`
4. check out `http://localhost:3000`

### docker notes

dev

`docker build -f Dockerfile.dev -t youoke .`

`docker run -p 3001:3001 -p 28080:28080 -v /Users/edward/src/tower/youoke:/root/youoke youoke sh -c 'cd youoke && foreman start'`

#### not-dev

build

`docker build -t hub.sked.site:5000/youoke .`

`docker push hub.sked.site:5000/youoke`

run

`foreman start -f Procfile.dev`

-or-

`docker run -p 3001:3001 -p 28080:28080 hub.sked.site:5000/youoke sh -c 'rm -f dump.rdb && rm -f tmp/pids/server.pid && ./init_youoke.sh && foreman start'`

-or-

`docker-compose up`

debug

`bash -c "clear && docker exec -it youoke_web_1 /bin/bash"`
