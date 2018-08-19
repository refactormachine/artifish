class ActionLogMailer < ApplicationMailer

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.action_log_mailer.user_registered.subject
  #
  def user_registered(user)
    @user = user
    mail to: "artifish.info@gmail.com", subject: "New user registered to MVP"
  end

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.action_log_mailer.purchase.subject
  #
  def new_order(order)
    @order = order
    mail to: "artifish.info@gmail.com", subject: "New Order was made (ID: #{@order.id})!"
  end

  def order_paid(order, paypal_transaction)
    @order = order
    @paypal_transaction = paypal_transaction
    mail to: "artifish.info@gmail.com", subject: "Order was paid (ID: #{@order.id})"
  end
end
