class AddIndexOnClientUuidToActionLogs < ActiveRecord::Migration[5.2]
  def change
    add_index :action_logs, :client_uuid
  end
end
