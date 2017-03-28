class DefaultValueToDocumentsCountFromTag < ActiveRecord::Migration[5.1]
  def change
    change_column :tags, :documents_count, :integer, default: 0
  end
end
