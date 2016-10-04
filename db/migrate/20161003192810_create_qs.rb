class CreateQs < ActiveRecord::Migration[5.0]
  def change
    create_table :qs do |t|
      t.references :channel, index: true, foreign_key: true

      t.string :q
      

      t.timestamps
    end
  end
end
