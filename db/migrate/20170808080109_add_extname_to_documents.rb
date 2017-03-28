class AddExtnameToDocuments < ActiveRecord::Migration[5.1]
  def change
    add_column :documents, :extname, :string
  end
end
