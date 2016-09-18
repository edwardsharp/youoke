class Channel < ActiveRecord::Base
  belongs_to :user
  has_many :comments
  has_many :videos

  before_save :update_slug
  
  def update_slug
    if title_changed?
      if new_record?
        self.slug = title.parameterize
      else
        update_column :slug, title.parameterize
      end
    end
  end

  def to_param
    slug
  end
end
