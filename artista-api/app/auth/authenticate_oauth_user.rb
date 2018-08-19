require "rest-client"

class AuthenticateOauthUser
  include AuthenticateUserCommand

  def initialize(auth_provider, provider)
    @auth_provider = auth_provider
    @provider = provider
  end

  private

  def user
    return @user if @user

    user_info = @auth_provider.get_user_info
    @user = get_or_create_user(user_info)
    return @user

  rescue RestClient::Exception => e
    error_msg = JSON.parse(e.response)
    Rails.logger.error(error_msg)
    raise ExceptionHandler::InternalError, Message.internal_error
  end

  def get_or_create_user(user_info)
    user = User.where(:uid => user_info['id'], :provider => @provider).first
    return user if user

    uid = user_info[@auth_provider.get_field_name(:id)]
    if uid.nil?
      Rails.logger.error("OAuth response is missing user id")
      raise ExceptionHandler::InternalError, Message.internal_error
    end

    user_data = {
      uid: uid,
      email: user_info[@auth_provider.get_field_name(:email)],
      first_name: user_info[@auth_provider.get_field_name(:first_name)],
      last_name: user_info[@auth_provider.get_field_name(:last_name)],
    }
    user = User.new(user_data.merge(provider: @provider, is_verified: true))
    # Skip validation to not fail on missing password
    user.save!(validate: false)
    begin
      ActionLogMailer.user_registered(user).deliver
    rescue Exception => e
      Rails.logger.error "Failed to send user_registered email for new user with id #{user.id}"
    end
    user
  end
end
