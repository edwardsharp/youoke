class Comment < ActiveRecord::Base
  belongs_to :channel
  belongs_to :user

  after_commit { CommentRelayJob.perform_later(self) }
end
