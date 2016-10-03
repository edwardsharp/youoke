class QsController < ApplicationController
  # before_action :set_channel

  def search
    
    SearchRelayJob.perform_later(user_id: @current_user.id, q: params[:q][:q])

  end

  # private
  #   def set_channel
  #     @channel = Channel.find_by slug: params[:channel_id]
  #   end
end
