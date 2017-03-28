class CreateTubeVids < ActiveRecord::Migration[5.0]
  def change
    create_table :tube_vids do |t|
      t.string :title
      t.string :des
      t.string :vid
      t.integer :member_id

      t.timestamps
    end
  end
end
