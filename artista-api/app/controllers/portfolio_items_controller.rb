class PortfolioItemsController < ApplicationController
  FILTERS_LIST = [:query, :tags, :color, :width, :height, :material, :min_price, :max_price]
  skip_before_action :authorize_request

  # GET /portfolio_items
  def index
    color = hex_to_color(params[:color]) if params[:color]

    size_name_query = "#{params[:width]}x#{params[:height]}" if params[:width] && params[:height]
    size_name_query = "#{params[:width]}x%" if params[:width] && !params[:height]
    size_name_query = "%x#{params[:height]}" if !params[:width] && params[:height]
    size_ids = Size.where.has{name =~ size_name_query}.pluck(:id) if size_name_query

    material_id = Material.where(material_type: params[:material]).pluck(:id).first if params[:material]

    min_price_cents = Money.from_amount(params[:min_price].to_i).cents if params[:min_price]
    max_price_cents = Money.from_amount(params[:max_price].to_i).cents if params[:max_price]

    @portfolio_items = PortfolioItem.joins(:purchase_options => :material).where.has{purchase_options.material.enabled == true}
    @portfolio_items = @portfolio_items.preload(image_attachment: :blob)

    if no_filters
      # Uncomment if you want to return random items for firt page
      # random_tags = Tag.all.sample(5)
      # portfolio_items_ids = []
      # random_tags.each { |tag| portfolio_items_ids += tag.portfolio_items.last(20).pluck(:id).sample(4) }
      # @portfolio_items = @portfolio_items.where(:id => portfolio_items_ids)
      @portfolio_items = @portfolio_items.where.has{id > 0}
    else
      if params[:page] == "1"
        filters = params.slice(*FILTERS_LIST)
        filters.reject! { |k, v| v.blank? }
        parent_action_log = create_action_log(Action::SEARCH_PERFORMED, filters)
      else
        parent_action_log = create_action_log(Action::MOVE_PAGE, params[:page])
      end

      @portfolio_items = @portfolio_items.joins(:portfolio_item_colors).where.has{ portfolio_item_colors.color_id == color.id }
                                          .select("portfolio_item_colors.dominance_pixel_fraction, portfolio_item_colors.dominance_score, portfolio_item_colors.dominance_similarity")
                                          .order("portfolio_item_colors.dominance_pixel_fraction DESC, portfolio_item_colors.dominance_score DESC, portfolio_item_colors.dominance_similarity ASC") if color.present?
      @portfolio_items = @portfolio_items.where.has{purchase_options.material_id == material_id} if material_id
      @portfolio_items = @portfolio_items.where.has{purchase_options.size_id.in size_ids} if size_ids
      @portfolio_items = @portfolio_items.where.has{(purchase_options.price_cents > min_price_cents) & (purchase_options.price_cents < max_price_cents)} if min_price_cents && max_price_cents


      # Tags search explanation: params[:tags] includes selected tags. params[:query] includes free text query.
      # For tag searching we use both tags and query free text.
      # Each space seperated word brings a list of tags containing this word and the tags ids are saved as a group
      # after getting multiple groups of tags ids from different query words, we perform intersection to get portfolio items
      # that has tags in all groups.
      # Portfolio item name is being searched against tag name only if query text is empty. Otherwise, tags are not used
      # for portfolio item name but item name should contain query text words and also has a tag of tags words
      if params[:tags].present? || params[:query].present?
        tag_names = (params[:tags] || '').downcase.split(' ')
        query_words = (params[:query] || '').downcase.split(' ')
        # tag_names += query_words
        portfolio_item_ids_groups_only_tag_names = []
        portfolio_item_ids_groups = []
        [tag_names, query_words].each do |words|
          words.each do |tag_name|
            if tag_name.include?('-') # query word is not a single word - no point in searching for dashed string in words
              tags_id_including_word = TagWord.joins([:tag, :word]).where.has{tag.name == tag_name}.pluck(:tag_id)
            else # query word is a single word, look for all words combinations
              tags_id_including_word = TagWord.joins([:tag, :word]).where.has{word.name.in tag_name}.pluck(:tag_id)
            end
            portfolio_item_ids = @portfolio_items.joins(:tags).where.has{|pi| pi.tags.id.in tags_id_including_word }.pluck(:id).uniq
            portfolio_item_ids_groups_only_tag_names << portfolio_item_ids if words == tag_names
            portfolio_item_ids_groups << portfolio_item_ids
          end
        end
        # intersects arrays
        portfolio_item_ids_intersection = portfolio_item_ids_groups.length > 1 ? portfolio_item_ids_groups.inject(:&) : portfolio_item_ids_groups.first
        portfolio_item_ids_intersection_only_tag_name = portfolio_item_ids_groups_only_tag_names.length > 1 ?
                                                        portfolio_item_ids_groups_only_tag_names.inject(:&) :
                                                        portfolio_item_ids_groups_only_tag_names.first

        if params[:query].present?
          portfolio_item_ids_name_matched = PortfolioItem.joins(:words).where.has{|pi| pi.words.name.in query_words}.group("portfolio_items.id").having("COUNT(DISTINCT portfolio_item_words.word_id) = #{query_words.length}").pluck(:portfolio_item_id)
          portfolio_item_ids_name_matched = portfolio_item_ids_name_matched & portfolio_item_ids_intersection_only_tag_name if portfolio_item_ids_intersection_only_tag_name
        else
          portfolio_item_ids_name_matched = PortfolioItem.joins(:words).where.has{|pi| pi.words.name.in tag_names}.group("portfolio_items.id").having("COUNT(DISTINCT portfolio_item_words.word_id) = #{tag_names.length}").pluck(:portfolio_item_id)
        end
        ids_from_tags_and_name_search = (portfolio_item_ids_intersection + portfolio_item_ids_name_matched).uniq
        @portfolio_items = @portfolio_items.where.has{id.in ids_from_tags_and_name_search}
      end
    end

    # This part should come after last filter to get a correct number of total entries!
    @portfolio_items = @portfolio_items.distinct
    per_page = params[:per_page].to_i if params[:per_page]
    @portfolio_items = @portfolio_items.paginate(page: params[:page], per_page: [(per_page || 20), 100].min)
    @total_entries = @portfolio_items.total_entries

    # Getting starting price
    @portfolio_items = @portfolio_items
    .select("MIN(purchase_options.price_cents) as starting_price")
    .select("purchase_options.price_currency")
    .select("portfolio_items.*").group("portfolio_items.id, purchase_options.price_currency #{', portfolio_item_colors.dominance_pixel_fraction, portfolio_item_colors.dominance_score, portfolio_item_colors.dominance_similarity' if color.present?}") if @portfolio_items

    @portfolio_items = @portfolio_items.shuffle if no_filters # shuffle in case of showing random items as no filters were provided
    unless no_filters
      portfolio_item_ids = @portfolio_items.pluck(:id)
      create_action_log(Action::RESULT_SETS, portfolio_item_ids, parent_action_log)
    end
  end

  private

  def create_action_log(type, payload, parent_action_log = nil)
    action = Action.find_by_name(type)
    user_id = current_user.id if current_user
    begin
      action_log_params = {user_id: user_id, client_uuid: current_client_uuid, action_id: action.id,
        payload: payload}
      action_log_params[:parent_action_log_id] = parent_action_log.id if parent_action_log
      ActionLog.create!(action_log_params)
    rescue Exception => e
      Rails.logger.error "Could not create action log with params: #{action_log_params}"
    end
  end

  def hex_to_color(hex_color)
    m = hex_color.match /#(..)(..)(..)/
    AppColor.where(r: m[1].hex, g: m[2].hex, b: m[3].hex).first
  end

  def no_filters
    FILTERS_LIST.all? { |f| params[f].blank? }
  end
end
