class Video < ApplicationRecord
  belongs_to :channel
  belongs_to :user
  belongs_to :q

  # after_commit { VideoRelayJob.perform_later(self) }
end
