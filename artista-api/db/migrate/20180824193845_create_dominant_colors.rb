class CreateDominantColors < ActiveRecord::Migration[5.2]
  def change
    create_table :dominant_colors do |t|
      t.integer :r
      t.integer :g
      t.integer :b
      t.float :score
      t.references :portfolio_item, foreign_key: true
    end
  end
end
