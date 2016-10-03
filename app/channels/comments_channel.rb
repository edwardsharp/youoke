class CommentsChannel < ApplicationCable::Channel
  def follow(data)
    stop_all_streams
    stream_from "channels:#{data['channel_id']}:comments"
  end

  def unfollow
    stop_all_streams
  end
end
