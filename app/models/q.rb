class Q < ApplicationRecord
  belongs_to :channel
  has_many :videos

  #after_commit { QRelayJob.perform_later(self) }

  def currently_playing
    video_queue.first
  end

  def next_video

    if Time.now.utc - updated_at > 10 #10sec throttle
      currently_playing.update_column :position, nil
      currently_playing.update_column :updated_at, Time.now.utc
    end
    broadcast_new_queue_and_player

  end

  def skip(video_id)
    
    v = videos.find_by id: video_id

    unless v.nil?
      v.update_column :position, nil

      broadcast_new_queue_and_player
    end
    
  end

  def video_queue
    videos.where.not(position: nil).sort_by(&:position)
  end

  def q_length
    video_queue.size
  end

  private
  def broadcast_new_queue_and_player
    ActionCable.server.broadcast "channels:#{channel.id}:qs", 
      q: QsController.render(partial: 'qs/q', locals: { q: self })

    ActionCable.server.broadcast "channels:#{channel.id}:player",
      player: ChannelsController.render(partial: 'channels/player', locals: { channel: channel })
  end

end
