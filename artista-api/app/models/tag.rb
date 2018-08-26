# == Schema Information
#
# Table name: tags
#
#  id         :bigint(8)        not null, primary key
#  name       :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Tag < ApplicationRecord
  has_and_belongs_to_many :portfolio_items

  has_many :tag_words
  has_many :words, :through => :tag_words

  after_save :add_tag_words

  def add_tag_words
    words = self.name.split('-').map { |w| Word.find_or_create_by!(name: w.downcase) }
    words.each do |word|
      begin
        self.tag_words.create!(word_id: word.id)
      rescue ActiveRecord::RecordNotUnique => e
        nil
      end
    end
  end
end
