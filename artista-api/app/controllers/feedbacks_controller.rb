class FeedbacksController < ApplicationController
  skip_before_action :authorize_request
  before_action :try_authorize_request

  def create
    feedback_subject = FeedbackSubject.find_by_name(params[:feedback_subject_name])
    raise ExceptionHandler::BadRequest, Message.feedback_subject_name_does_not_exist(params[:feedback_subject_name]) if feedback_subject.nil?
    create_feedback(feedback_subject)
    head :no_content
  end

  def show
    if params[:id] == 'last'
      get_last
      json_response(Message.not_found, :not_found) if @feedback.nil?
    else
      raise ExceptionHandler::InvalidOperation, Message.invalid_operation
    end
  end

  private

  def create_feedback(feedback_subject)
    user_id = current_user.id if current_user
    begin
      feedback_args = feedback_params.merge({user_id: user_id, client_uuid: current_client_uuid, feedback_subject_id: feedback_subject.id})
      Feedback.create!(feedback_args)
    rescue Exception => e
      Rails.logger.error "Could not create feedback with params: #{feedback_args}"
    end
  end

  def get_last
    if current_user
      @feedback = Feedback.where(user_id: current_user.id).last
    else
      @feedback = Feedback.where(client_uuid: current_client_uuid).last if current_client_uuid
    end
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def feedback_params
    params.require(:feedback).permit(:score)
  end
end
