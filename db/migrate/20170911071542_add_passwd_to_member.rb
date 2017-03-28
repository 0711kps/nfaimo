class AddPasswdToMember < ActiveRecord::Migration[5.1]
  def change
    add_column :members, :passwd, :string, default: Digest::SHA1::hexdigest('nfaimonfaimo')
  end
end
