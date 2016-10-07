#!/bin/sh

rake db:create
rake db:migrate
rake db:seed
rake assets:precompile
cp vendor/assets/stylesheets/iconfont/* public/assets/
