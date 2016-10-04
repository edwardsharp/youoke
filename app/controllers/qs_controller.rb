class QsController < ApplicationController
  before_action :set_channel

  def search
    
    SearchRelayJob.perform_later(channel: @channel, user_id: @current_user.id, q: params[:q][:q])

  end

  def add_video_to_q
    
    Rails.logger.debug "\n\n #{params.inspect} \n\n"
    #@video = 
    Video.create! id: params[:yt_id], title: params[:yt_title], q: @channel.q, user: @current_user

    head :no_content

  end

  private
    def set_channel
      @channel = Channel.find_by slug: params[:channel_id]
    end
end
