class CreateActionLogs < ActiveRecord::Migration[5.2]
  def change
    create_table :action_logs do |t|
      t.references :user, foreign_key: true
      t.string :client_uuid
      t.references :action, foreign_key: true
      t.text :payload
      t.integer :parent_action_log_id, index: true

      t.timestamps
    end
  end
end
