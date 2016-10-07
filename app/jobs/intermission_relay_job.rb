class IntermissionRelayJob < ApplicationJob
  def perform(channel)

    ActionCable.server.broadcast "channels:#{channel.id}:player", player: ChannelsController.render(partial: 'channels/intermission', locals: { channel: channel })

    sleep(30)

    ActionCable.server.broadcast "channels:#{channel.id}:qs", 
      q: QsController.render(partial: 'qs/q', locals: { q: channel.q })

    ActionCable.server.broadcast "channels:#{channel.id}:player",
      player: ChannelsController.render(partial: 'channels/player', locals: { channel: channel })

  end
end
