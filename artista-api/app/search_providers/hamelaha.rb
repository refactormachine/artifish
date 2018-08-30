require "base_provider"
require "galmir_allowed_catalogs"

module SearchProviders
  class Hamelaha < BaseProvider
    PRICE_CURRENCY = "USD"
    SUPPLIER_NAME = "hamelaha"
    BASE_URL = "http://www.hamelaha.shop/"
    URL = "#{BASE_URL}collections/%s"
    CATEGORIES = {
      nil => ["up-to-60", "design-and-illustration", "black-and", "portraits", "tel-aviv-sewer-cover", "david-tartakover", "avital-cnaani", "efrat-hakimi"]
    }
    MATERIAL_NAME_TO_TYPE = {
      "paper" => "paper"
    }

    def initialize
      super
    end

    protected

    def url(category_identifier)
      URL % category_identifier.to_s
    end

    def get_linked_images_hashes(page)
      item_tables = page.css('.grid-view-item__image-container')
      linked_images = []
      item_tables.each do |item_table|
        title = item_table.css('.grid-view-item__title').first.text
        artist_name_and_name = title.split('|')
        artist_name_and_name = title.split('-') if artist_name_and_name.count == 1
        if artist_name_and_name.count > 2
          artist_name = artist_name_and_name[0].strip if artist_name_and_name[0]
          name = artist_name_and_name[1..-1].join('-').strip if artist_name_and_name[1..-1].join('-')
        elsif artist_name_and_name.count == 2
          artist_name = artist_name_and_name[0].strip if artist_name_and_name[0]
          name = artist_name_and_name[1].strip if artist_name_and_name[1]
        else
          name = title.strip
        end
        image_hash = {
          :image_url => nil,
          :url_link => get_link(item_table[:href]),
          :name => name,
          :artist_name => artist_name,
          :catalog_num => item_table[:href].split('/').last
        }
        linked_images << image_hash
      end
      linked_images
    end

    def get_next_page_link(page)
      next_page_a_tag = page.css('li.pagination__text+li>a.btn--narrow').last
      if next_page_a_tag && next_page_a_tag[:href]
        next_page_link = get_link next_page_a_tag[:href]
      end
      next_page_link
    end

    def get_materials_with_sizes(page)
      match = /size:.*?(\d+[-_*xX]\d+[ ]cm)/.match(page.css('.product-single__description').last.text)
      match = /size:.*?in?ch.\/.(\d+[-_*xX]\d+)/.match(page.css('.product-single__description').last.text) if match.nil?
      sizes = [match[1].gsub(/[-_*X]/, 'x')]
      materials = [{
        material_id: 1,
        material_name: 'paper',
        sizes: sizes
      }]
      materials
    end

    def get_price(page, material_id, w, h)
      price = page.css('.product-price__price span').first.text.strip
      price = price.gsub(',', '').gsub('$', '')
      price
    end

    def get_image_full_size(page)
      "https:" + page.css('.product-single__photo-wrapper')[1].css('.product-single__photo').first['data-zoom']
    end
  end
end
