class RemoveSomeTable < ActiveRecord::Migration[5.1]
  def change
    drop_table :admin_pwds
    drop_table :admin_tokens
    drop_table :dl_tokens
    drop_table :item_tagships
    remove_column :tags, :des
  end
end
