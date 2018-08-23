class AddIndexOnNameToPortfolioItems < ActiveRecord::Migration[5.2]
  def change
    add_index :portfolio_items, :name
  end
end
