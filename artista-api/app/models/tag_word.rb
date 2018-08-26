# == Schema Information
#
# Table name: tag_words
#
#  id         :bigint(8)        not null, primary key
#  tag_id     :bigint(8)
#  word_id    :bigint(8)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class TagWord < ApplicationRecord
  belongs_to :tag
  belongs_to :word
end
