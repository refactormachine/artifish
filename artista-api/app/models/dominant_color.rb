# == Schema Information
#
# Table name: dominant_colors
#
#  id                :bigint(8)        not null, primary key
#  r                 :integer
#  g                 :integer
#  b                 :integer
#  score             :float(24)
#  portfolio_item_id :bigint(8)
#  pixel_fraction    :float(24)
#

class DominantColor < ApplicationRecord
  belongs_to :portfolio_item

  def to_hex
    Camalian::Color.new(self.r, self.g, self.b).to_hex
  end
end
