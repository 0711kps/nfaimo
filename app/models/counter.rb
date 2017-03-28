class Counter < ApplicationRecord
  validates_presence_of :name, :count
  validates_uniqueness_of :name
end
