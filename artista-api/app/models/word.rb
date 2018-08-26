# == Schema Information
#
# Table name: words
#
#  id   :bigint(8)        not null, primary key
#  name :string(255)
#

class Word < ApplicationRecord
  has_many :tag_words
  has_many :tags, :through => :tag_words

  has_many :portfolio_item_words
  has_many :portfolio_items, :through => :portfolio_item_words
end
