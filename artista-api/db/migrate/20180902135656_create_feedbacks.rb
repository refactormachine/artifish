class CreateFeedbacks < ActiveRecord::Migration[5.2]
  def change
    create_table :feedbacks do |t|
      t.references :feedback_subject, foreign_key: true
      t.references :user, foreign_key: true
      t.string :client_uuid
      t.float :score

      t.timestamps
    end
    add_index :feedbacks, :client_uuid
    add_index :feedbacks, :score
  end
end
