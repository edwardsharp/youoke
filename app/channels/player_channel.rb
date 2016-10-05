class PlayerChannel < ApplicationCable::Channel

  def follow(data)
    stop_all_streams
    stream_from "channels:#{data['channel_id']}:player"
  end

  def unfollow
    stop_all_streams
  end

  def player_change(data)
    # Rails.logger.debug "\n\n PlayerChannel player_change data: #{data.inspect}\n\n"
    case data['event_data']['player_event']
    when 'canplay'
      broadcast_player_event data['channel_id'], {player_event: 'play'}
    when 'play'
      broadcast_player_event data['channel_id'], {player_event: 'play'}
    when 'pause'
      broadcast_player_event data['channel_id'], {player_event: 'pause'}
    when 'needstime'
      broadcast_player_event data['channel_id'], {player_event: 'needstime'}
    when 'timeupdate'
      broadcast_player_event data['channel_id'], data['event_data']
    end
    
  end

  private
  def broadcast_player_event(channel_id, player_event)
    ActionCable.server.broadcast(
        "channels:#{channel_id}:player", 
        { channel_id: channel_id, 
          event_data: player_event
        }
      )
  end

end
