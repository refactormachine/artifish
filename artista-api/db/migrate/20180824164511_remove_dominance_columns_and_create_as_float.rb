class RemoveDominanceColumnsAndCreateAsFloat < ActiveRecord::Migration[5.2]
  def change
    remove_column :portfolio_item_colors, :dominance_index
    remove_column :portfolio_item_colors, :dominance_weight

    add_column :portfolio_item_colors, :dominance_score, :float, null: false
    add_column :portfolio_item_colors, :dominance_similarity, :float, null: false

    change_column_default(:portfolio_item_colors, :dominance_score, nil)
    change_column_default(:portfolio_item_colors, :dominance_similarity, nil)
  end
end
