class ChangePortfolioItemTagIndexToUnique < ActiveRecord::Migration[5.2]
  def change
    remove_index :portfolio_items_tags, [:portfolio_item_id, :tag_id]
    add_index :portfolio_items_tags, [:portfolio_item_id, :tag_id], unique: true
  end
end
