#!/bin/sh

rake db:create
rake db:migrate
rake db:seed
rake assets:precompile
