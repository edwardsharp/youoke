# YOUOKE partyline

## devel 

### redis

`docker run -p 6379:6379 --name youoke_redis -d redis`

persistanet redis instance will store to /data/ dir
`docker run -p 6379:6379 --name youoke_redis -d redis redis-server --appendonly yes`
