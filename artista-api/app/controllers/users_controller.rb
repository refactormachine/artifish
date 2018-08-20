class UsersController < ApplicationController
  skip_before_action :authorize_request, only: [:create, :verify]

  # TODO: Uncomment when you want verification code...
  # # POST /signup
  # def create
  #   code = generate_email_verification_code
  #   user = User.create!(user_params.merge(verification_code: code))
  #   payload = {id: user.id, code: code}.to_json
  #   send_verification_code_email(payload)

  #   response = { message: Message.user_created }
  #   json_response(response, :created)
  # end

  def create
    user = User.create!(user_params.merge(is_verified: true))
    begin
      ActionLogMailer.user_registered(user).deliver unless user.email.include?("@test.com")
    rescue Exception => e
      Rails.logger.error "Failed to send user_registered email for new user with id #{user.id}"
    end
    token = AuthenticateUser.new(user_params[:email], user_params[:password]).call
    response = Message.user_created(token)
    json_response(response, :created)
  end

  def verify
    raise ExceptionHandler::BadRequest, Message.missing_parameter(:p) if params[:p].blank?
    encoded_payload = params[:p]
    payload = JSON.parse(Base64.strict_decode64(encoded_payload))
    user_to_verify = User.where(id: payload['id'], verification_code: payload['code'])
    raise ExceptionHandler::InvalidOperation, Message.incorrect_verification_code if user_to_verify.blank?

    user_to_verify.update(is_verified: true, verification_code: nil)
    head :no_content
  end

  private

  def user_params
    params.permit(:first_name, :last_name, :email, :password, :password_confirmation)
  end

  def generate_email_verification_code(characters = 40)
    SecureRandom.hex(characters / 2)
  end

  def send_verification_code_email(payload)
    Base64.strict_encode64(payload)
    # TODO Add email sending code
  end
end
