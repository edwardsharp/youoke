class Q < ApplicationRecord
  belongs_to :channel
  has_many :videos

  #after_commit { QRelayJob.perform_later(self) }

  def currently_playing
    reload.video_queue.first
  end

  def intermission
    intermission_queue.sample
  end

  def next_video

    if Time.now.utc - updated_at > 10 #10sec throttle
      currently_playing.update_column :position, nil
      currently_playing.update_column :updated_at, Time.now.utc
    end

    IntermissionRelayJob.perform_later(channel) 

  end

  def skip(video_id)
    
    v = videos.find_by id: video_id

    unless v.nil?
      v.update_column :position, nil

      ActionCable.server.broadcast "channels:#{channel.id}:qs", 
        q: QsController.render(partial: 'qs/q', locals: { q: self })

      ActionCable.server.broadcast "channels:#{channel.id}:player",
        player: ChannelsController.render(partial: 'channels/player', locals: { channel: channel })
    end
    
  end

  def video_queue
    videos.where.not(position: nil).sort_by(&:position)
  end

  def intermission_queue
    Video.where(intermission: true)
  end

  def q_length
    reload.video_queue.length
  end

end
