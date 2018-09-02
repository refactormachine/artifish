class AddIndexOnNameToActions < ActiveRecord::Migration[5.2]
  def change
    add_index :actions, :name, unique: true
  end
end
