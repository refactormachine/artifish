# == Schema Information
#
# Table name: collection_items
#
#  id             :bigint(8)        not null, primary key
#  name           :string(255)
#  image_link     :string(255)
#  url_link       :string(255)
#  price_cents    :integer          default(0), not null
#  price_currency :string(255)      default("USD"), not null
#  collection_id  :bigint(8)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

class CollectionItem < ApplicationRecord
  belongs_to :collection

  monetize :price_cents
end
