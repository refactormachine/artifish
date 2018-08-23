class NotificationsMailer < ApplicationMailer

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.notifications_mailer.join_beta.subject
  #
  def join_beta(email)
    mail to: email, subject: "Password for Artifish Beta"
  end
end
