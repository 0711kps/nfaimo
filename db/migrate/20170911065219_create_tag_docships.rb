class CreateTagDocships < ActiveRecord::Migration[5.1]
  def change
    create_table :tag_docships do |t|
      t.integer :tag_id
      t.integer :document_id
      t.timestamps
    end
  end
end
