class ChannelsController < ApplicationController
  def index
    @channels = Channel.all
  end

  def show
    @channel = Channel.find_by slug: params[:id]
  end

  def player
    @channel = Channel.find_by slug: params[:channel_id]
  end

end
