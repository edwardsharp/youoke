class ConfirmSyncUserRelayJob < ApplicationJob
  def perform(channel)
    
    sleep(10)

    ActionCable.server.broadcast(
      "channels:#{channel_id}:player", 
      { channel_id: channel_id, 
        event_data: { player_event: 'lookingfornewsyncuser'}
      }
    )

  end
end
