class CreateTagWords < ActiveRecord::Migration[5.2]
  def change
    create_table :tag_words do |t|
      t.belongs_to :tag, index: true
      t.belongs_to :word, index: true

      t.timestamps
    end

    add_index :tag_words, [:tag_id, :word_id], unique: true

    # Create words from all tags (splitted by '-')
    puts "-- Migrating data: Converting tags name into words --"
    Tag.find_each do |tag|
      words = tag.name.split('-').map { |w| Word.find_or_create_by!(name: w.downcase) }
      words.each do |word|
        begin
          tag.tag_words.create!(word_id: word.id)
        rescue ActiveRecord::RecordNotUnique => e
          nil
        end
      end
    end
  end
end
