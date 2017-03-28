class RemovePidFromDocuments < ActiveRecord::Migration[5.1]
  def change
    remove_column :documents, :pid
  end
end
