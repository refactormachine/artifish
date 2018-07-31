module SearchProviders
  class BaseProvider
    TEMP_IMAGES_DIR = "#{Rails.root}/tmp/images"
    CACHE_PRICE = false

    def initialize
      @material_cache ||= {}
      @size_cache ||= {}
      @pricing_cache = {}
      @already_loaded_portfolios = {}
      @restrict_catalog = defined? ALLOWED_CATALOGS
      get_or_create_supplier
      PortfolioItem.where(supplier_id: @supplier_id).pluck(:product_url).each { |url| @already_loaded_portfolios[url] = true }
      FileUtils.mkdir_p(TEMP_IMAGES_DIR) unless File.directory?(TEMP_IMAGES_DIR)
    end

    def run
      self.class::CATEGORIES.each do |category_name, category_identifiers|
        Array(category_identifiers).each do |category_identifier|
          @category_name = category_name
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
          supplier_id: @supplier_id
        })
        p.tags << Tag.find_or_create_by(name: @category_name)
        p.save!
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
        image_hash[:pricing] = get_prices_hash_for_product(image_hash[:url_link])
        c += 1
        puts "-- #{c}/#{total_count} Getting prices" # if c % 10 == 0
      end
      next_page_link = get_next_page_link(page)
      [linked_images_hashes, next_page_link]
    end

    def get_prices_hash_for_product(url)
      pricing = []

      response = HTTParty.get(URI.encode(url))
      page = Nokogiri::HTML(response.body)
      sizes = get_sizes_hash(page)
      materials = get_materials_hash(page)
      materials.reject! {|m_hash| !self.class::ALLOWED_MATERIALS_IDS.include?(m_hash[:material_id])} if self.class::ALLOWED_MATERIALS_IDS.present?
      materials.each do |m_hash|
        sizes.each do |size|
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
          material = Material.find_or_create_by!(name: pricing[:material_name])
          @material_cache[pricing[:material_name]] = material
        end

        size_name = "#{pricing[:size_w]}x#{pricing[:size_h]}"
        size = @size_cache[size_name]
        if size.nil?
          size = Size.find_or_create_by!(name: size_name)
          @size_cache[size_name] = size
        end

        purchase_options_models << PurchaseOption.new(material_id: material.id, size_id: size.id, portfolio_item_id: portfolio_item.id, price: pricing[:price], price_currency: "ILS")
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
      if @restrict_catalog && ALLOWED_CATALOGS[@category_name][image_hash[:catalog_num]].nil?
        puts "Skipping item with not allowed catalog number (#{catalog_num})"
        return true
      end

      if @already_loaded_portfolios[image_hash[:url_link]]
        puts "Skipping already loaded item"
        return true
      end

      false
    end
  end
end
