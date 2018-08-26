class CreatePortfolioItemWords < ActiveRecord::Migration[5.2]
  def change
    create_table :portfolio_item_words do |t|
      t.belongs_to :portfolio_item, index: true
      t.belongs_to :word, index: true

      t.timestamps
    end

    add_index :portfolio_item_words, [:portfolio_item_id, :word_id], unique: true

    # Create words from portfolio item name (spliited by space or ','')
    puts "-- Migrating data: Converting portfolio items name into words --"
    PortfolioItem.find_each do |portfolio_item|
      words = portfolio_item.name.split(/[ ,-]/).reject(&:blank?).map { |w| Word.find_or_create_by!(name: w.downcase) }
      words.each do |word|
        begin
          portfolio_item.portfolio_item_words.create!(word_id: word.id)
        rescue ActiveRecord::RecordNotUnique => e
          nil
        end
      end
    end
  end
end
