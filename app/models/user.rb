class User < ActiveRecord::Base
  has_many :channels
  has_many :comments
  has_many :videos
end
