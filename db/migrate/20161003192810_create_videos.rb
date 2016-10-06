class CreateVideos < ActiveRecord::Migration[5.0]
  def change
    create_table :videos, id: :string do |t|
      t.references :user, index: true, foreign_key: true
      t.references :q, index: true, foreign_key: true

      t.string :title
      t.string :description

      t.string :file_path
      t.integer :position

      t.timestamps
    end
    add_index :videos, :id, unique: true
  end
end
