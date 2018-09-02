# == Schema Information
#
# Table name: actions
#
#  id         :bigint(8)        not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Action < ApplicationRecord
  RESULT_SETS = "result_sets"
  ENLARGED_IMAGE = "enlarged_image"
  ADD_IMAGE_TO_COLLECTION = "add_image_to_collection"
  REMOVE_IMAGE_FROM_COLLECTION = "remove_image_from_collection"
  PROCEEDED_TO_PURCHASE = "proceeded_to_purchase"
  SEARCH_PERFORMED = "search_performed"
  MOVE_PAGE = "result_sets.move_page"

  has_many :action_logs
end
