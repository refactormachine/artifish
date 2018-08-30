module SearchProviders
  class BaseProvider
    TEMP_IMAGES_DIR = "#{Rails.root}/tmp/images"
    CACHE_PRICE = false
    MATERIAL_NAME_TO_TYPE = {}

    def initialize
      @material_cache = {}
      @size_cache = {}
      @pricing_cache = {}
      @already_loaded_portfolios = {}
      @restrict_catalog = defined? self.class::ALLOWED_CATALOGS
      raise "PRICE_CURRENCY const is not defined" if !defined? self.class::PRICE_CURRENCY
      FileUtils.mkdir_p(TEMP_IMAGES_DIR) unless File.directory?(TEMP_IMAGES_DIR)
    end

    def run
      get_or_create_supplier
      # Load existing portfolios to not reprocess them
      tags_to_product_urls = PortfolioItem.where(supplier_id: @supplier_id).left_outer_joins(:tags).select("portfolio_items.product_url, tags.name").group_by(&:name)
      tags_to_product_urls.each do |tag_name, items|
        @already_loaded_portfolios[tag_name] = {}
        items.each { |item| @already_loaded_portfolios[tag_name][item.product_url] = true }
      end

      self.class::CATEGORIES.each do |category_name, category_identifiers|
        @category_name = category_name
        @tag = Tag.find_or_create_by(name: @category_name) if @category_name
        @already_loaded_portfolios[category_name] ||= {}
        Array(category_identifiers).each do |category_identifier|
          linked_images = build_linked_image_hashes(url(category_identifier))
          load_images_to_db(linked_images)
        end
      end
      nil
    end

    private

    def build_linked_image_hashes(page_url)
      linked_images = []
      while page_url
        puts "Processing page: #{page_url}"
        start_time = Time.now
        page_linked_images, page_url = get_page_linked_images_and_next_page(page_url)
        puts "Done Processing page in #{Time.now - start_time} seconds"
        linked_images += page_linked_images
      end
      puts "Built #{linked_images.count} image hashes"
      linked_images
    end

    def load_images_to_db(linked_images)
      count = 1
      total_count = linked_images.count
      puts "Loading data to db"
      linked_images.each do |image_hash|
        puts "#{count}/#{total_count}: Working on item #{image_hash[:catalog_num]}" if count % 10 == 0
        p = PortfolioItem.new({
          name: image_hash[:name],
          product_identifier: image_hash[:catalog_num],
          product_url: image_hash[:url_link],
          artist_name: image_hash[:artist_name],
          supplier_id: @supplier_id
        })
        p.tags << @tag if @tag
        begin
          p.save!
        rescue ActiveRecord::RecordNotUnique => e
          # If scraped same portfolio item under different tag, add the new tag to it
          p = PortfolioItem.find_by(supplier_id: @supplier_id, product_identifier: image_hash[:catalog_num])
          p.tags << @tag if @tag
        end
        @already_loaded_portfolios[@category_name][p.product_url] = true
        attach_image(p, image_hash[:image_url])
        create_purchase_options(p, image_hash[:pricing])
        count += 1
      end
    end

    def get_or_create_supplier
      @supplier_id = Supplier.find_or_create_by!(name: self.class::SUPPLIER_NAME).id
    end

    def download_image(image_url)
      filename = image_url.split('/').last
      full_path = "#{Rails.root}/tmp/images/#{filename}"
      ext = File.extname(full_path)
      clean_ext = ext.gsub(/\?.*/, '')
      full_path = full_path.gsub(ext, clean_ext)
      full_path = full_path[0..255 - clean_ext.length] + clean_ext if full_path.length > 255
      filename = full_path.split('/').last
      File.open(full_path, "wb") do |f|
        f.write HTTParty.get(URI.encode(image_url)).body
      end
      {full_path: full_path, filename: filename}
    end

    def get_page_linked_images_and_next_page(url)
      response = HTTParty.get(URI.encode(url))
      page = Nokogiri::HTML(response.body)
      linked_images_hashes = get_linked_images_hashes(page)
      linked_images_hashes.reject! {|image_hash| should_skip_image(image_hash)}
      total_count = linked_images_hashes.length
      puts "Built #{total_count} image hashes"
      puts "-- Getting prices"
      c = 0
      linked_images_hashes.each do |image_hash|
        image_hash[:pricing] = get_prices_hash_for_product(image_hash)
        c += 1
        puts "-- #{c}/#{total_count} Getting prices"
        # break if c == 5
      end
      linked_images_hashes.reject! { |image_hash| image_hash[:pricing].nil? }
      next_page_link = get_next_page_link(page)
      [linked_images_hashes, next_page_link]
    end

    def get_prices_hash_for_product(image_hash)
      pricing = []
      url = image_hash[:url_link]

      response = HTTParty.get(URI.encode(url))
      page = Nokogiri::HTML(response.body)
      full_image_link = get_image_full_size(page)
      image_hash[:image_url] = full_image_link if full_image_link
      materials_with_sizes_hashes = get_materials_with_sizes(page)
      return nil if materials_with_sizes_hashes.nil?
      materials_with_sizes_hashes.reject! {|m_hash| !self.class::ALLOWED_MATERIALS_IDS.include?(m_hash[:material_id])} if defined? self.class::ALLOWED_MATERIALS_IDS
      materials_with_sizes_hashes.each do |m_hash|
        m_hash[:sizes].each do |size|
          size.downcase!
          w, h = size.split('x')

          material_id = m_hash[:material_id]
          if self.class::CACHE_PRICE && @pricing_cache[material_id].present? && @pricing_cache[material_id]["#{w}x#{h}"].present?
            pricing << {
              material_id: material_id,
              material_name: m_hash[:material_name],
              size_w: w.to_i,
              size_h: h.to_i,
              price: @pricing_cache[material_id]["#{w}x#{h}"]
            }
            next
          end
          price = get_price(page, material_id, w, h)
          if self.class::CACHE_PRICE
            @pricing_cache[material_id] ||= {}
            @pricing_cache[material_id]["#{w}x#{h}"] = price
          end
          pricing << {
            material_id: material_id,
            material_name: m_hash[:material_name],
            size_w: w.to_i,
            size_h: h.to_i,
            price: price
          }
        end
      end
      pricing
    end

    def attach_image(portfolio_item, image_url)
      path_info = download_image(image_url)
      portfolio_item.image.attach(io: File.open(path_info[:full_path]), filename: path_info[:filename])
      FileUtils.rm(path_info[:full_path])
    end

    def create_purchase_options(portfolio_item, pricing_list)
      purchase_options_models = []
      pricing_list.each do |pricing|
        material = @material_cache[pricing[:material_name]]
        if material.nil?
          material = Material.where(name: pricing[:material_name]).first
          material = Material.create!(material_type: self.class::MATERIAL_NAME_TO_TYPE[pricing[:material_name]] || 'unknown', name: pricing[:material_name]) if material.nil?
          @material_cache[pricing[:material_name]] = material
        end

        size_name = "#{pricing[:size_w]}x#{pricing[:size_h]}"
        size = @size_cache[size_name]
        if size.nil?
          size = Size.find_or_create_by!(name: size_name)
          @size_cache[size_name] = size
        end

        purchase_options_models << PurchaseOption.new(material_id: material.id, size_id: size.id, portfolio_item_id: portfolio_item.id, price: pricing[:price], price_currency: self.class::PRICE_CURRENCY)
      end
      # PurchaseOption.import(purchase_options_models)
      PurchaseOption.transaction do
        purchase_options_models.each { |p| p.save! }
      end
    end

    def get_link(link)
      link = "#{self.class::BASE_URL}#{link}" if !link.start_with?('http')
      link
    end

    def should_skip_image(image_hash)
      if @restrict_catalog && self.class::ALLOWED_CATALOGS[@category_name][image_hash[:catalog_num]].nil?
        puts "Skipping item with not allowed catalog number (#{image_hash[:catalog_num]})"
        return true
      end

      if @already_loaded_portfolios[@category_name][image_hash[:url_link]]
        puts "Skipping already loaded item"
        return true
      end

      false
    end

    def get_image_full_size(page)
      nil
    end
  end
end
