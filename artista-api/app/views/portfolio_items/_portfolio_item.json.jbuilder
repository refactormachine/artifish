# json.extract! portfolio_item, :created_at, :updated_at
json.portfolio_item_id portfolio_item.id
json.image_url rails_blob_url(portfolio_item.image) if portfolio_item.image.attached?
json.thumb_url rails_representation_url(portfolio_item.image.variant(resize: "166")) if portfolio_item.image.attached?
json.startingPriceFormatted Money.new(portfolio_item.starting_price, portfolio_item.price_currency).format
