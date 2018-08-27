class Message
  class << self
    def not_found(record = 'record')
      { message: :not_found, description: "Sorry, #{record} not found" }.to_json
    end

    def already_exists(record = 'Record')
      { message: :already_exists, description: "#{record} is not unique" }.to_json
    end

    def invalid_credentials
      { message: :invalid_credentials, description: 'Invalid credentials' }.to_json
    end

    def invalid_token
      { message: :invalid_token, description: 'Invalid token' }.to_json
    end

    def missing_token
      { message: :missing_token, description: 'Missing token' }.to_json
    end

    def unauthorized
      { message: :unauthorized, description: 'Unauthorized request' }.to_json
    end

    def internal_error
      { message: :internal_error, description: 'Sorry, an internal server error has occured' }.to_json
    end

    # TODO: Uncomment when you want verification code...
    # def user_created
    #   { message: :user_created, description: 'User created successfully' }.to_json
    # end

    def user_created(auth_token = nil)
      json = { message: :user_created, description: 'User created successfully' }
      json[:auth_token] = auth_token if auth_token
      json.to_json
    end

    def expired_token
      { message: :expired_token, description: 'Sorry, your token has expired. Please login to continue' }.to_json
    end

    def missing_parameter(param)
      { message: :missing_parameter, description: "Missing parameter: #{param}" }.to_json
    end

    def incorrect_verification_code
      { message: :incorrect_verification_code, description: "Verification code is incorrect" }.to_json
    end

    def user_not_verified
      { message: :user_not_verified, description: "User is not verified" }.to_json
    end

    def payment_processor_general_error
      { message: :payment_processor_general_error, description: "Payment error. Please contact us or try again later" }.to_json
    end

    def payment_was_already_processed
      { message: :payment_was_already_processed, description: "Payment was already processed" }.to_json
    end

    def action_name_does_not_exist(action_name)
      { message: :action_name_does_not_exist, description: "Action name #{action_name} does not exist" }.to_json
    end
  end
end
