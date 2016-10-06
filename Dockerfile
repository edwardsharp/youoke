FROM ruby:2.3.0
MAINTAINER edward@edwardsharp.net

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y nodejs redis-server nginx postgresql-client vim

RUN echo "\ndaemon off;" >> /etc/nginx/nginx.conf
RUN chown -R www-data:www-data /var/lib/nginx
ADD nginx-default.conf /etc/nginx/sites-enabled/default

RUN gem update bundler

RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
RUN chmod a+rx /usr/local/bin/youtube-dl

RUN mkdir /youoke

COPY Gemfile /youoke

ENV NOKOGIRI_USE_SYSTEM_LIBRARIES 1
ENV RAILS_ENV production
ENV RACK_ENV production 

WORKDIR /youoke
RUN bundle

EXPOSE 3001
EXPOSE 28080

COPY . /youoke
RUN bundle

CMD tail -f /youoke/log/development.log
