class Video < ApplicationRecord
  belongs_to :user
  belongs_to :q

  after_commit { QRelayJob.perform_later(self) }

  # after_commit { VideoRelayJob.perform_later(self) }
end
