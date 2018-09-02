# == Schema Information
#
# Table name: feedbacks
#
#  id                  :bigint(8)        not null, primary key
#  feedback_subject_id :bigint(8)
#  user_id             :bigint(8)
#  client_uuid         :string(255)
#  score               :float(24)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

class Feedback < ApplicationRecord
  belongs_to :feedback_subject
  belongs_to :user, optional: true
end
