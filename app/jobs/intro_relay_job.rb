class IntroRelayJob < ApplicationJob
  def perform(channel)

    ActionCable.server.broadcast "channels:#{channel.id}:qs", 
      q: QsController.render(partial: 'qs/q', locals: { q: channel.q })

    unless channel.q.try(:video_queue).empty?
      ActionCable.server.broadcast(
        "channels:#{channel.id}:player", 
        intro: ChannelsController.render(render partial: 'channels/intro', locals: { channel: channel }),
        video_path: asset_path(File.basename(channel.q.currently_playing.file_path)) 
      )

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
