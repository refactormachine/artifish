# == Schema Information
#
# Table name: colors
#
#  id :bigint(8)        not null, primary key
#  r  :integer
#  g  :integer
#  b  :integer
#  h  :float(24)
#  s  :float(24)
#  l  :float(24)
#

class AppColor < ApplicationRecord
  self.table_name = 'colors'
  has_many :portfolio_item_colors
  has_many :portfolio_items, :through => :portfolio_item_colors

  def to_hex
    Camalian::Color.new(self.r, self.g, self.b).to_hex
  end

  def self.from_hex(hex_color)
    m = hex_color.match /#(..)(..)(..)/
    AppColor.new(r: m[1].hex, g: m[2].hex, b: m[3].hex)
  end

  def to_hsl
    c = Camalian::Color.new(self.r, self.g, self.b)
    [c.h, c.s, c.l]
  end

  def self.from_hsl(h, s, l)
    h = h/360.0
    s = s/100.0
    l = l/100.0

    r = 0.0
    g = 0.0
    b = 0.0

    if(s == 0.0)
      r = l.to_f
      g = l.to_f
      b = l.to_f #achromatic
    else
      q = l < 0.5 ? l * (1 + s) : l + s - l * s
      p = 2 * l - q
      r = hue_to_rgb(p, q, h + 1/3.0)
      g = hue_to_rgb(p, q, h)
      b = hue_to_rgb(p, q, h - 1/3.0)
    end

    AppColor.new(r: (r * 255).round, g: (g * 255).round, b: (b * 255).round)
  end

  private

  def self.hue_to_rgb(p, q, t)
    t += 1                                  if(t < 0)
    t -= 1                                  if(t > 1)
    return (p + (q - p) * 6 * t)            if(t < 1/6.0)
    return q                                if(t < 1/2.0)
    return (p + (q - p) * (2/3.0 - t) * 6)  if(t < 2/3.0)
    return p
  end

end
