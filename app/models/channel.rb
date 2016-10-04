class Channel < ActiveRecord::Base
  belongs_to :user
  has_many :comments
  has_one :q

  before_save :update_slug
  before_create :create_q


  def update_slug
    if title_changed?
      if new_record?
        self.slug = title.parameterize
      else
        update_column :slug, title.parameterize
      end
    end
  end

  def create_q
    self.q = Q.new
  end

  def to_param
    slug
  end
end
