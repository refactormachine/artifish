class AddProductIdentifierToOrderItemAndRenameItemUrl < ActiveRecord::Migration[5.2]
  def change
    add_column :order_items, :product_identifier, :string
    rename_column :order_items, :item_url, :product_url
  end
end
