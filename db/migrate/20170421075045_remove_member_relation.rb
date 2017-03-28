class RemoveMemberRelation < ActiveRecord::Migration[5.0]
  def up
    remove_column :tube_vids, :member_id
    remove_column :documents, :member_id
  end
  def down
    add_column :tube_vids, :member_id, :integer
    add_column :documents, :member_id, :integer
  end
end
