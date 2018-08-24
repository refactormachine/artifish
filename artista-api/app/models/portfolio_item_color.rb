# == Schema Information
#
# Table name: portfolio_item_colors
#
#  portfolio_item_id        :bigint(8)        not null
#  color_id                 :bigint(8)        not null
#  id                       :bigint(8)        not null, primary key
#  dominance_score          :float(24)        not null
#  dominance_similarity     :float(24)        not null
#  dominance_pixel_fraction :float(24)
#

class PortfolioItemColor < ApplicationRecord
  # Validations
  validates_presence_of :portfolio_item, :color

  # Relations
  belongs_to :portfolio_item
  belongs_to :color
end
