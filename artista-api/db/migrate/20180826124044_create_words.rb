class CreateWords < ActiveRecord::Migration[5.2]
  def change
    create_table :words do |t|
      t.string :name
    end

    add_index :words, :name, unique: true
  end
end
