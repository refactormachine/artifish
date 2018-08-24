class AddDominancePixelFractionToPortfolioItemColorAndDominantColor < ActiveRecord::Migration[5.2]
  def change
    add_column :portfolio_item_colors, :dominance_pixel_fraction, :float
    add_column :dominant_colors, :pixel_fraction, :float
  end
end
