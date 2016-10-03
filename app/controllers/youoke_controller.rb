class YouokeController < ApplicationController
  def index
    @channels = Channel.all
  end
end
