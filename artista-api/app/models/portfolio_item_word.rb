# == Schema Information
#
# Table name: portfolio_item_words
#
#  id                :bigint(8)        not null, primary key
#  portfolio_item_id :bigint(8)
#  word_id           :bigint(8)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class PortfolioItemWord < ApplicationRecord
  belongs_to :portfolio_item
  belongs_to :word
end
