class ChannelsController < ApplicationController
  def index
    @channels = Channel.all
  end

  #post
  def join
    channel = Channel.find_by slug: params[:channel][:title].try(:downcase)
    (redirect_to(channel_path(channel)) and return) unless channel.nil?
    head :unprocessable_entity
  end

  def show
    @channel = Channel.find_by slug: params[:id]
  end

  def player
    @channel = Channel.find_by slug: params[:channel_id]
  end

end
