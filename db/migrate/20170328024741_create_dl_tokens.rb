class CreateDlTokens < ActiveRecord::Migration[5.0]
  def change
    create_table :dl_tokens do |t|
      t.string :code
      t.datetime :expire_time
      t.string :usr_addr
      t.integer :document_id

      t.timestamps
    end
  end
end
