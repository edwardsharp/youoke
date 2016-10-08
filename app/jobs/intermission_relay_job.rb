class IntermissionRelayJob < ApplicationJob
  def perform(channel)

    ActionCable.server.broadcast "channels:#{channel.id}:player", player: ChannelsController.render(partial: 'channels/intermission', locals: { channel: channel })
    ActionCable.server.broadcast "channels:#{channel.id}:qs", 
      q: QsController.render(partial: 'qs/q', locals: { q: channel.q })

    unless channel.q.video_queue.empty?
      sleep(30)
      # ActionCable.server.broadcast "channels:#{channel.id}:player",
      #   player: ChannelsController.render(partial: 'channels/player', locals: { channel: channel })

      ActionCable.server.broadcast(
        "channels:#{channel.id}:player", 
        { channel_id: channel.id, 
          event_data: {player_event: 'play'}
        }
      )
    end

  end
end

