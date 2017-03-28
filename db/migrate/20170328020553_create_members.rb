class CreateMembers < ActiveRecord::Migration[5.0]
  def change
    create_table :members do |t|
      t.string :name
      t.string :title
      t.string :resp
      t.string :ext
      t.string :mail

      t.timestamps
    end
  end
end
