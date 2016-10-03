class VideoRelayJob < ApplicationJob
  def perform(video)
    ActionCable.server.broadcast "channels:#{video.channel_id}:videos",
      video: VideosController.render(partial: 'videos/video', locals: { video: video })
  end
end