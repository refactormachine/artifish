class ActionLogsController < ApplicationController
  skip_before_action :authorize_request

  def create
    action = Action.find_by_name(params[:action_name])
    raise ExceptionHandler::BadRequest, Message.action_name_does_not_exist(params[:action_name]) if action.nil?
    payload = JSON.parse(params[:payload].to_s)
    create_action_log(action, payload)
    head :no_content
  end

  private

  def create_action_log(action, payload)
    user_id = current_user.id if current_user
    begin
      action_log_params = {user_id: user_id, client_uuid: current_client_uuid, action_id: action.id, payload: payload}
      ActionLog.create!(action_log_params)
    rescue Exception => e
      Rails.logger.error "Could not create action log with params: #{action_log_params}"
    end
  end
end
