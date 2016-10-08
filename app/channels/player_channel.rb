class PlayerChannel < ApplicationCable::Channel

  def follow(data)
    stop_all_streams
    stream_from "channels:#{data['channel_id']}:player"
    if channel = Channel.find_by(id: data['channel_id']) and channel.sync_user_id.blank?
      channel.update_attribute :sync_user_id, data['user_id'] 
      broadcast_sync_user_id(data['channel_id'], data['user_id'])
      IntroRelayJob.perform_later(channel)
    end
  end

  def unfollow(data)
    stop_all_streams
    Channel.where(sync_user_id: data['user_id']).each do |ch|
      if ch.sync_user_id == data['user_id']
        ch.update_attribute(:sync_user_id, nil) 
        broadcast_sync_user_id(ch.id, '')
      end
    end
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
      Channel.find_by(id: data['channel_id']).try(:q).try(:next_video)
    when 'needsplayerload'
      IntroRelayJob.perform_later(channel)
    when 'wantsync'
      if channel = Channel.find_by(id: data['channel_id'])
        if channel.sync_user_id.blank?
          channel.update_attribute :sync_user_id, data['user_id'] 
          broadcast_sync_user_id(data['channel_id'], data['user_id'])
        else
          # channel.update_attribute :sync_user_id, nil 
          ActionCable.server.broadcast(
            "channels:#{data['channel_id']}:player", 
            { channel_id: data['channel_id'], 
              user_id: channel.sync_user_id,
              event_data: { player_event: 'confirmsyncuser' }
            }
          )
          ConfirmSyncUserRelayJob.perform_later(channel)
        end
      end
    when 'confirmsyncuser'
      if channel = Channel.find_by(id: data['channel_id']) and channel.sync_user_id.blank?
        channel.update_attribute :sync_user_id, data['user_id'] 
        broadcast_sync_user_id(data['channel_id'], data['user_id'])
      end
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

  def broadcast_sync_user_id(channel_id, user_id)
    ActionCable.server.broadcast(
      "channels:#{channel_id}:player", 
      { channel_id: channel_id, 
        user_id: user_id,
        event_data: { player_event: 'updatesyncuser' }
      }
    )
  end

end
