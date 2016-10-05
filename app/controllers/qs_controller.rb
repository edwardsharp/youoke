class QsController < ApplicationController
  before_action :set_channel

  def search
    
    SearchRelayJob.perform_later(channel: @channel, user_id: @current_user.id, q: params[:q][:q])

  end

  def add_video_to_q
    
    Rails.logger.debug "\n\n #{params.inspect} \n\n"
    @video = Video.find_by id: params[:yt_id]
    
    if @video
      QRelayJob.perform_later(@video)
    else
      @video = Video.create id: params[:yt_id], title: params[:yt_title], q: @channel.q, user: @current_user
    end


  end

  def skip
    @channel.q.skip(params[:video_id])

    head :ok
  end

  private
    def set_channel
      @channel = Channel.find_by slug: params[:channel_id]
    end
end
