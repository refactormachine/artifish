class CreateFeedbackSubjects < ActiveRecord::Migration[5.2]
  def change
    create_table :feedback_subjects do |t|
      t.string :name

      t.timestamps
    end
    add_index :feedback_subjects, :name, unique: true
  end
end
