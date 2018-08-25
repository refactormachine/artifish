# == Schema Information
#
# Table name: portfolio_items
#
#  id                 :bigint(8)        not null, primary key
#  name               :string(255)
#  product_identifier :string(255)
#  product_url        :string(255)
#  supplier_id        :bigint(8)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#

class PortfolioItem < ApplicationRecord
  has_one_attached :image
  belongs_to :supplier
  has_many :purchase_options, dependent: :destroy
  has_and_belongs_to_many :tags
  has_many :portfolio_item_colors
  has_many :colors, :through => :portfolio_item_colors

  def purchase_options_formatted
    group = purchase_options.preload(:size).joins(:material).where.has{material.enabled == true}.group_by(&:material_id)
    group.each{|material_id, purchase_options| purchase_options.sort_by!{|opt| opt.size.name.split('x').first.to_i}}
    group
  end

  def calculate_starting_price
    min_purchase_option = purchase_options.min_by(&:price_cents)
    min_purchase_option ? min_purchase_option.price : nil
  end

  def extract_tags_and_colors
    require "google/cloud/vision"
    @@project_id ||= "artifish-app"
    @@vision ||= Google::Cloud::Vision.new project: @@project_id, credentials: JSON.parse(ENV['GOOGLE_APPLICATION_CREDENTIALS'])

    @@filter_colors ||= AppColor.all

    filename = self.image.filename.to_s
    temp_file = Tempfile.new(filename)
    temp_file.binmode
    temp_file.write(self.image.download)
    temp_file.close

    vision_image = @@vision.image(temp_file.path)
    vision_tags = []
    labels = vision_image.labels.map(&:description)

    face = vision_image.face
    face_expressions = face.likelihood.to_h.select{|k,v| v == true}.keys.map(&:to_s) if face

    vision_tags += labels
    vision_tags += face_expressions if face_expressions

    vision_dominant_colors = vision_image.properties.colors
    temp_file.unlink

    tag_colors = {}
    vision_dominant_colors.each do |vision_dominant_color|
      DominantColor.create!(portfolio_item_id: self.id, r: vision_dominant_color.red, g: vision_dominant_color.green, b: vision_dominant_color.blue, score: vision_dominant_color.score, pixel_fraction: vision_dominant_color.pixel_fraction)
      dominant_color = AppColor.new(r: vision_dominant_color.red, g: vision_dominant_color.green, b: vision_dominant_color.blue)
      tag_color = @@filter_colors.min_by { |filter_color| calculate_color_diff(dominant_color, filter_color) }
      # tag_color = @@filter_colors.min_by do |filter_color|
      #   hsl = filter_color.to_hsl
      #   dominant_color_hsl = dominant_color.to_hsl
      #   new_l = dominant_color_hsl[2] > 50 ? 50 : dominant_color_hsl[2]
      #   filter_color_same_l = AppColor.from_hsl(hsl[0], hsl[1], new_l) # use the same l of the dominant color for the comparison
      #   calculate_color_diff(dominant_color, filter_color_same_l)
      # end
      dominance_similarity = calculate_color_diff(dominant_color, tag_color)
      tag_colors[tag_color] ||= {dominance_pixel_fraction: 0, dominance_score: 0}
      tag_colors[tag_color][:dominance_score] += vision_dominant_color.score
      tag_colors[tag_color][:dominance_pixel_fraction] += vision_dominant_color.pixel_fraction
      if tag_colors[tag_color][:dominance_similarity]
        tag_colors[tag_color][:dominance_similarity] = [dominance_similarity, tag_colors[tag_color][:dominance_similarity]].min
      else
        tag_colors[tag_color][:dominance_similarity] = dominance_similarity
      end
    end

    tag_colors.each do |c, dominance_hash|
      begin
        self.portfolio_item_colors.create!(color_id: c.id, dominance_pixel_fraction: dominance_hash[:dominance_pixel_fraction], dominance_score: dominance_hash[:dominance_score], dominance_similarity: dominance_hash[:dominance_similarity].to_i)
      rescue ActiveRecord::RecordNotUnique => e
        nil
      end
    end

    vision_tags.each do |vision_tag|
      tag = Tag.find_or_create_by!(name: vision_tag.gsub(/[ _]/, '-'))
      begin
        tags << tag
      rescue ActiveRecord::RecordNotUnique => e
        nil
      end
    end
  end

  def regenerate_color_tags
    self.portfolio_item_colors.destroy_all
    @@filter_colors ||= AppColor.all
    tag_colors = {}

    saved_dominant_colors = DominantColor.where(portfolio_item_id: self.id)
    saved_dominant_colors.each do |saved_dominant_color|
      dominant_color = AppColor.new(r: saved_dominant_color.r, g: saved_dominant_color.g, b: saved_dominant_color.b)
      tag_color = @@filter_colors.min_by { |filter_color| calculate_color_diff(dominant_color, filter_color) }
      # tag_color = @@filter_colors.min_by do |filter_color|
      #   hsl = filter_color.to_hsl
      #   dominant_color_hsl = dominant_color.to_hsl
      #   new_l = dominant_color_hsl[2] > 50 ? 50 : dominant_color_hsl[2]
      #   filter_color_same_l = AppColor.from_hsl(hsl[0], hsl[1], new_l) # use the same l of the dominant color for the comparison
      #   calculate_color_diff(dominant_color, filter_color_same_l)
      # end
      dominance_similarity = calculate_color_diff(dominant_color, tag_color)
      tag_colors[tag_color] ||= {dominance_pixel_fraction: 0, dominance_score: 0}
      tag_colors[tag_color][:dominance_score] += saved_dominant_color.score
      tag_colors[tag_color][:dominance_pixel_fraction] += saved_dominant_color.pixel_fraction
      if tag_colors[tag_color][:dominance_similarity]
        tag_colors[tag_color][:dominance_similarity] = [dominance_similarity, tag_colors[tag_color][:dominance_similarity]].min
      else
        tag_colors[tag_color][:dominance_similarity] = dominance_similarity
      end
    end

    tag_colors.each do |c, dominance_hash|
      begin
        self.portfolio_item_colors.create!(color_id: c.id, dominance_pixel_fraction: dominance_hash[:dominance_pixel_fraction], dominance_score: dominance_hash[:dominance_score], dominance_similarity: dominance_hash[:dominance_similarity].to_i)
      rescue ActiveRecord::RecordNotUnique => e
        nil
      end
    end
  end

  def old_extract_colors(color_count = 10)
    @@filter_colors ||= AppColor.all

    filename = self.image.filename.to_s
    temp_file = Tempfile.new(filename)
    temp_file.binmode
    temp_file.write(self.image.download)
    temp_file.close

    image = Camalian::load(temp_file.path)
    dominant_colors = image.prominent_colors(color_count)#.sort_similar_colors
    temp_file.unlink

    tag_colors = {}
    dominant_colors.each_with_index do |dominant_color, index|
      tag_color = @@filter_colors.min_by { |filter_color| calculate_color_diff(dominant_color, filter_color) }
      # tag_color = @@filter_colors.min_by do |filter_color|
      #   hsl = filter_color.to_hsl
      #   new_l = dominant_color.l > 50 ? 50 : dominant_color.l
      #   filter_color_same_l = AppColor.from_hsl(hsl[0], hsl[1], new_l) # use the same l of the dominant color for the comparison
      #   calculate_color_diff(dominant_color, filter_color_same_l)
      # end
      dominance_similarity = calculate_color_diff(dominant_color, tag_color)
      tag_colors[tag_color] ||= {}
      tag_colors[tag_color][:dominance_score] ||= index
      tag_colors[tag_color][:dominance_pixel_fraction] ||= index
      if tag_colors[tag_color][:dominance_similarity]
        tag_colors[tag_color][:dominance_similarity] = [dominance_similarity, tag_colors[tag_color][:dominance_similarity]].min
      else
        tag_colors[tag_color][:dominance_similarity] = dominance_similarity
      end
    end
    tag_colors.each do |c, dominance_hash|
      begin
        self.portfolio_item_colors.create!(color_id: c.id, dominance_pixel_fraction: dominance_hash[:dominance_pixel_fraction], dominance_score: dominance_hash[:dominance_score], dominance_similarity: dominance_hash[:dominance_similarity].to_i)
      rescue ActiveRecord::RecordNotUnique => e
        nil
      end
    end
  end

  private

  def calculate_color_diff(c1, c2)
    # d = Math.sqrt((c1.r-c2.r)**2 + (c1.g-c2.g)**2 + (c1.b-c2.b)**2)
    color1 = Color::RGB.new(c1.r, c1.g, c1.b)
    color2 = Color::RGB.new(c2.r, c2.g, c2.b)
    Color::Comparison.distance(color1, color2)
  end
end
