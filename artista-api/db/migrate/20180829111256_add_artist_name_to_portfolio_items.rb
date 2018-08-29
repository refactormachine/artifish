class AddArtistNameToPortfolioItems < ActiveRecord::Migration[5.2]
  def change
    add_column :portfolio_items, :artist_name, :string
  end
end
