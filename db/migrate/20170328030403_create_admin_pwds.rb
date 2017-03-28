class CreateAdminPwds < ActiveRecord::Migration[5.0]
  def change
    create_table :admin_pwds do |t|
      t.string :password

      t.timestamps
    end
  end
end
