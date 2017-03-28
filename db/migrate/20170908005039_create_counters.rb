class CreateCounters < ActiveRecord::Migration[5.1]
  def change
    create_table :counters do |t|
      t.string :name
      t.integer :count, default: 0

      t.timestamps
    end
  end
end
