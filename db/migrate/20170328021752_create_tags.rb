class CreateTags < ActiveRecord::Migration[5.0]
  def change
    create_table :tags do |t|
      t.string :title
      t.string :des
      t.string :item_type
      t.integer :item_id

      t.timestamps
    end
  end
end
