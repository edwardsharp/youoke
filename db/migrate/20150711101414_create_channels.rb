class CreateChannels < ActiveRecord::Migration
  def change
    create_table :channels do |t|
      t.references :user, index: true, foreign_key: true

      t.string :title
      t.string :slug
      t.text :content

      t.timestamps
    end
  end
end
