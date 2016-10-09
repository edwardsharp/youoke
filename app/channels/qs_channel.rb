class QsChannel < ApplicationCable::Channel

  def follow(data)
    stop_all_streams
    stream_from "channels:#{data['channel_id']}:qs"
  end

  def unfollow
    stop_all_streams
  end

  def play_player(data)
    ActionCable.server.broadcast(
      "channels:#{data['channel_id']}:player", 
      { channel_id: data['channel_id'], 
        event_data: {player_event: 'play'}
      }
    )
  end

  def pause_player(data)
    ActionCable.server.broadcast(
      "channels:#{data['channel_id']}:player", 
      { channel_id: data['channel_id'], 
        event_data: {player_event: 'pause'}
      }
    )
  end

  def reload_player(data)
    if channel = Channel.find_by(id: data['channel_id'])
      channel.update_attribute :sync_user_id, nil
    end
    ActionCable.server.broadcast(
      "channels:#{data['channel_id']}:player", 
      { channel_id: data['channel_id'], 
        event_data: {player_event: 'reload'}
      }
    )
  end
end
