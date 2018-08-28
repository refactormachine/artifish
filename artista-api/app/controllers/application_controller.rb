class ApplicationController < ActionController::API
  include Response
  include ExceptionHandler

  before_action :authorize_request, :set_client_uuid

  attr_reader :current_user
  attr_reader :current_client_uuid

  private

  def authorize_request
    authorize_request_from_non_verified_user
    raise ExceptionHandler::NotVerifiedError, Message.user_not_verified unless @current_user.is_verified
  end

  def authorize_request_from_non_verified_user
    result = AuthorizeApiRequest.new(request.headers).call
    @current_user = result[:user]
  end

  def try_authorize_request
    begin
      authorize_request
    rescue Exception => e
      nil
    end
  end

  def set_client_uuid
    @current_client_uuid = request.headers['Application-UUID']
  end
end
