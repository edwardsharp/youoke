class PlayerChannel < ApplicationCable::Channel

  def follow(data)
    stop_all_streams
    stream_from "channels:#{data['channel_id']}:player"
  end

  def unfollow
    stop_all_streams
  end
end
