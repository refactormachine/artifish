# == Schema Information
#
# Table name: action_logs
#
#  id                   :bigint(8)        not null, primary key
#  user_id              :bigint(8)
#  client_uuid          :string(255)
#  action_id            :bigint(8)
#  payload              :text(65535)
#  parent_action_log_id :integer
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#

class ActionLog < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :action
  belongs_to :parent_action_log, :class_name => "ActionLog", :foreign_key => "parent_action_log_id", :optional => true

  serialize :payload, JSON
end
