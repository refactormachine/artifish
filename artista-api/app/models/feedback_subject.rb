# == Schema Information
#
# Table name: feedback_subjects
#
#  id         :bigint(8)        not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class FeedbackSubject < ApplicationRecord
  PRODUCT_RECOMMENDATION = "product_recommendation"
end
