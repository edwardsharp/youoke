class QRelayJob < ApplicationJob
  def perform(video)
    
    video.update_column(:position, video.q.q_length + 1)

    ActionCable.server.broadcast "channels:#{video.q.channel_id}:qs",
      q: QsController.render(partial: 'qs/q', locals: { q: video.q })

    video.download

    if video.q.q_length == 1
      ActionCable.server.broadcast "channels:#{video.q.channel_id}:player",
        player: ChannelsController.render(partial: 'channels/player', locals: { channel: video.q.channel })
    end
    ActionCable.server.broadcast "channels:#{video.q.channel_id}:qs",
      q: QsController.render(partial: 'qs/q', locals: { q: video.q })

  end
end