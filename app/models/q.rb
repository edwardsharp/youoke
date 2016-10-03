class Q < ApplicationRecord
  belongs_to :channel
  has_many :videos

  after_commit { QRelayJob.perform_later(self) }

end
