class IntroRelayJob < ApplicationJob
  def perform(channel)

    ActionCable.server.broadcast "channels:#{channel.id}:qs", 
      q: QsController.render(partial: 'qs/q', locals: { q: channel.q })

    begin
      video_path = "/videos/#{File.basename(channel.q.currently_playing.file_path)}"
    rescue 
      video_path = ''
    end

    ActionCable.server.broadcast(
      "channels:#{channel.id}:player", 
      { channel_id: channel.id,
        intro: ChannelsController.render(partial: 'channels/intro', locals: { channel: channel }),
        video_path: video_path } 
    )

    unless channel.q.try(:video_queue).empty?
      
      sleep(25)
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
