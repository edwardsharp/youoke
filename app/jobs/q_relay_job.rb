class QRelayJob < ApplicationJob
  def perform(q)
    ActionCable.server.broadcast "channels:#{q.channel_id}:qs",
      q: QsController.render(partial: 'qs/q', locals: { q: q })
  end
end