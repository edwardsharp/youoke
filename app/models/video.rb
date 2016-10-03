class Video < ApplicationRecord
  belongs_to :channel
  belongs_to :user
  

  # after_commit { VideoRelayJob.perform_later(self) }
end
