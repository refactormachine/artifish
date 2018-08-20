class PortfolioItemsController < ApplicationController
  skip_before_action :authorize_request

  # GET /portfolio_items
  def index
    query_tags = []
    query_tags = params[:tags].split(' ') if params[:tags]
    color = hex_to_color(params[:color]) if params[:color]

    size_name_query = "#{params[:width]}x#{params[:height]}" if params[:width] && params[:height]
    size_name_query = "#{params[:width]}x%" if params[:width] && !params[:height]
    size_name_query = "%x#{params[:height]}" if !params[:width] && params[:height]
    size_ids = Size.where.has{name =~ size_name_query}.pluck(:id) if size_name_query

    material_id = Material.where(material_type: params[:material]).pluck(:id).first if params[:material]

    @portfolio_items = PortfolioItem.joins(:tags).where.has{ tags.name.in query_tags } if query_tags.present?
    @portfolio_items = (@portfolio_items || PortfolioItem).joins(:portfolio_item_colors).where.has{ portfolio_item_colors.color_id == color.id }
                                                          .select("portfolio_item_colors.dominance_index, portfolio_item_colors.dominance_weight")
                                                          .order("portfolio_item_colors.dominance_index ASC, portfolio_item_colors.dominance_weight ASC") if color.present?

    if @portfolio_items.nil?
      random_tags = Tag.all.sample(5)
      portfolio_items_ids = []
      random_tags.each { |tag| portfolio_items_ids += tag.portfolio_items.last(20).pluck(:id).sample(4) }
      @portfolio_items = PortfolioItem.where(:id => portfolio_items_ids)
    end

    @portfolio_items = @portfolio_items.joins(:purchase_options => :material).where.has{purchase_options.material.enabled == true}
    @portfolio_items = @portfolio_items.where.has{purchase_options.material_id == material_id} if material_id
    @portfolio_items = @portfolio_items.where.has{purchase_options.size_id.in size_ids} if size_ids

    # This part should come after last filter to get a correct number of total entries!
    @portfolio_items = @portfolio_items.distinct
    per_page = params[:per_page].to_i if params[:per_page]
    @portfolio_items = @portfolio_items.paginate(page: params[:page], per_page: [(per_page || 20), 100].min)
    @total_entries = @portfolio_items.total_entries

    # Getting starting price
    @portfolio_items = @portfolio_items
    .select("MIN(purchase_options.price_cents) as starting_price")
    .select("purchase_options.price_currency")
    .select("portfolio_items.*").group("portfolio_items.id, purchase_options.price_currency #{', portfolio_item_colors.dominance_index, portfolio_item_colors.dominance_weight' if color.present?}") if @portfolio_items

    @portfolio_items = @portfolio_items.preload(image_attachment: :blob)
  end

  private

  def hex_to_color(hex_color)
    m = hex_color.match /#(..)(..)(..)/
    Color.where(r: m[1].hex, g: m[2].hex, b: m[3].hex).first
  end
end
