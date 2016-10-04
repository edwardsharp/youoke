class Q < ApplicationRecord
  belongs_to :channel
  has_many :videos

  #after_commit { QRelayJob.perform_later(self) }

  def video_queue
    videos.where.not(position: nil).sort_by(&:position)
  end

  def q_length
    video_queue.size
  end

end
