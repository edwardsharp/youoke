class CommentRelayJob < ApplicationJob
  def perform(comment)
    ActionCable.server.broadcast "channels:#{comment.channel_id}:comments",
      comment: CommentsController.render(partial: 'comments/comment', locals: { comment: comment })
  end
end