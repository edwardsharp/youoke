class QRelayJob < ApplicationJob
  def perform(video)
    
    video.update_column(:position, video.q.next_position)

    ActionCable.server.broadcast "channels:#{video.q.channel_id}:qs",
      q: QsController.render(partial: 'qs/q', locals: { q: video.q })

    video.download

    IntroRelayJob.perform_later(video.q.channel) 
    
    ActionCable.server.broadcast "channels:#{video.q.channel_id}:qs",
      q: QsController.render(partial: 'qs/q', locals: { q: video.q })

  end
end
