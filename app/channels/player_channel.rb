class PlayerChannel < ApplicationCable::Channel

  def follow(data)
    stop_all_streams
    stream_from "channels:#{data['channel_id']}:player"
  end

  def unfollow
    stop_all_streams
  end

  def player_change(data)
    Rails.logger.debug "\n\n PlayerChannel player_change data: #{data.inspect}\n\n"
    case data['eventData']['player_event']
    when 'canplay'
      broadcast_player_event data['channel_id'], 'play'
    when 'play'
      broadcast_player_event data['channel_id'], 'play'
    when 'pause'
      broadcast_player_event data['channel_id'], 'pause'
    end
    
  end

  private
  def broadcast_player_event(channel_id, player_event)
    ActionCable.server.broadcast(
        "channels:#{channel_id}:player", 
        { channel_id: channel_id, 
          player_event: player_event
        }
      )
  end

end
