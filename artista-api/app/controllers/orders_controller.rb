class OrdersController < ApplicationController
  before_action :set_order, only: [:show]

  # GET /orders/1
  # GET /orders/1.json
  def show
  end

  # POST /orders
  # POST /orders.json
  def create
    new_order_params = order_params
    new_order_params[:items_attributes].each_with_index do |order_item_params, index|
      collection_item = CollectionItem.find(params[:items_attributes][index][:collection_item_id])
      portfolio_item = collection_item.portfolio_item
      order_item_params[:product_url] = portfolio_item.product_url
      order_item_params[:product_identifier] = portfolio_item.product_identifier
    end
    @order = current_user.orders.build(new_order_params)
    @order.items.each { |order_item| order_item.price = order_item.purchase_option.price }

    if @order.save
      begin
        ActionLogMailer.new_order(@order).deliver
      rescue Exception => e
        Rails.logger.error "Failed to send new_order email for new order with id #{@order.id}"
      end
      render :show, status: :created
    else
      render json: @order.errors, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_order
      @order = Order.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def order_params
      params.require(:order).permit(:first_name, :last_name, :city, :address, :zip_code, :phone_number, items_attributes: [:name, :image_url, :purchase_option_id])
    end
end
