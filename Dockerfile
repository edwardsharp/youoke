FROM ruby:2.3.0
MAINTAINER edward@edwardsharp.net

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y nodejs redis-server

RUN gem update bundler

#COPY . /root/youoke
COPY Gemfile /root

ENV NOKOGIRI_USE_SYSTEM_LIBRARIES 1
ENV RAILS_ENV development

WORKDIR /root
RUN bundle

#RUN rake db:create
#RUN rake db:migrate
#RUN rake db:seed

EXPOSE 3001
EXPOSE 28080

CMD tail -f /root/youoke/log/development.log
