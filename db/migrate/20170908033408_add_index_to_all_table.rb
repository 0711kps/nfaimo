class AddIndexToAllTable < ActiveRecord::Migration[5.1]
  def change
    add_index :tube_vids, :created_at
    add_index :members, :created_at
    add_index :documents, :created_at
  end
end
