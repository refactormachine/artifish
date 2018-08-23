class JoinBetaController < ApplicationController
  skip_before_action :authorize_request

  def create
    raise ExceptionHandler::BadRequest, Message.missing_parameter(:email) if params[:email].blank?

    NotificationsMailer.join_beta(params[:email]).deliver
  end

end
