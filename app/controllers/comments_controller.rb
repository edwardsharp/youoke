class CommentsController < ApplicationController
  before_action :set_channel

  def create
    @comment = Comment.create! content: params[:comment][:content], channel: @channel, user: @current_user
  end

  private
    def set_channel
      @channel = Channel.find_by slug: params[:channel_id]
    end
end
