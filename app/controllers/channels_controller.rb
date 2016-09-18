class ChannelsController < ApplicationController
  def index
    @channels = Channel.all
  end

  def show
    @channel = Channel.find_by slug: params[:id]
  end
end
