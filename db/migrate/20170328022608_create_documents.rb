class CreateDocuments < ActiveRecord::Migration[5.0]
  def change
    create_table :documents do |t|
      t.string :title
      t.string :des
      t.string :pid
      t.string :path
      t.integer :member_id

      t.timestamps
    end
  end
end
