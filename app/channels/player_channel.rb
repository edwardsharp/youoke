class PlayerChannel < ApplicationCable::Channel

  @endedThrottle = Time.now

  def follow(data)
    stop_all_streams
    stream_from "channels:#{data['channel_id']}:player"
    @endedThrottle = Time.now 
  end

  def unfollow
    stop_all_streams
  end

  def player_change(data)
    Rails.logger.debug "\n\n PlayerChannel player_change data: #{data.inspect}\n\n"
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
    when 'ended'
      Rails.logger.debug "\n\n Time.now: #{Time.now} @endedThrottle: #{@endedThrottle} diff: #{Time.now - @endedThrottle}\n\n"
      if Time.now - @endedThrottle > 5
        Channel.find_by(id: data['channel_id']).try(:q).try(:next_video)
        @endedThrottle = Time.now
      end
    when 'needsplayerload'
      ActionCable.server.broadcast "channels:#{data['channel_id']}:player",
        player: ChannelsController.render(partial: 'channels/player', locals: { channel: Channel.find_by(id: data['channel_id']) })
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
