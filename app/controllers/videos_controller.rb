class VideosController < ApplicationController
  before_action :set_channel

  def create
    @video = Video.create! id: params[:video][:id], channel: @channel, user: @current_user
  end

  private
    def set_channel
      @channel = Channel.find_by slug: params[:channel_id]
    end
end
