class SearchChannel < ApplicationCable::Channel

  def follow(data)
    stop_all_streams
    stream_from "channels:#{data['user_id'].to_i}:search"
  end

  def unfollow
    stop_all_streams
  end
end
