class RemoveDesFromTubeVids < ActiveRecord::Migration[5.0]
  def up
    remove_column :tube_vids, :des
  end
  def down
    add_column :tube_vids, :des, :string
  end
end
