class CreateItemTagships < ActiveRecord::Migration[5.0]
  def change
    create_table :item_tagships do |t|
      t.string :item_type
      t.integer :item_id
      t.integer :tag_id

      t.timestamps
    end
  end
end
