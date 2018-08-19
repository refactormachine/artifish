# == Schema Information
#
# Table name: order_items
#
#  id                 :bigint(8)        not null, primary key
#  name               :string(255)
#  image_url          :string(255)
#  item_url           :string(255)
#  purchase_option_id :bigint(8)
#  price_cents        :integer          default(0), not null
#  price_currency     :string(255)      default("USD"), not null
#  order_id           :bigint(8)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  product_identifier :string(255)
#

class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :purchase_option

  monetize :price_cents
end
