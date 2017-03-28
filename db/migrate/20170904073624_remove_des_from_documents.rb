class RemoveDesFromDocuments < ActiveRecord::Migration[5.1]
  def change
    remove_column :documents, :des, :string
  end
end
