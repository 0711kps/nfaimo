class ChangePathToLocalNameFromDocuments < ActiveRecord::Migration[5.1]
  def change
    rename_column :documents, :path, :local_name
  end
end
