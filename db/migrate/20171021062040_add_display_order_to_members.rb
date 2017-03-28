class AddDisplayOrderToMembers < ActiveRecord::Migration[5.1]
  def change
    add_column :members, :display_order, :integer
  end
end
