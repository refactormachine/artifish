class PurchaseOptionsController < ApplicationController
  skip_before_action :authorize_request

  # GET /tags.json
  def max_price
    json_response ({ max_price_rounded: Money.new(PurchaseOption.maximum(:price_cents)).to_f.ceil })
  end
end
