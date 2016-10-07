class AddIntermissionToVideos < ActiveRecord::Migration[5.0]
  def change
    add_column :videos, :intermission, :boolean
  end
end
