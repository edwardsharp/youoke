class AddSyncUserIdToChannel < ActiveRecord::Migration[5.0]
  def change
    add_column :channels, :sync_user_id, :integer
  end
end
