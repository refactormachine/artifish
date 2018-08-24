class TagsController < ApplicationController
  skip_before_action :authorize_request

  # GET /tags.json
  def index
    @tags = Tag.joins(:portfolio_items).group("tags.id, tags.name").having("COUNT(*) > 5").select("tags.*").to_a.take(30)
  end
end
