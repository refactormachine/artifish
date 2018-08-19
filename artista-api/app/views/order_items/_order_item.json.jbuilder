json.extract! order_item, :id, :name, :image_url, :price, :created_at, :updated_at
json.price_formatted order_item.price.format
json.currency_code order_item.price.currency.iso_code
