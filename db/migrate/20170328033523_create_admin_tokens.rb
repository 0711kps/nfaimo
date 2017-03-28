class CreateAdminTokens < ActiveRecord::Migration[5.0]
  def change
    create_table :admin_tokens do |t|
      t.string :usr_addr
      t.datetime :expire_time

      t.timestamps
    end
  end
end
