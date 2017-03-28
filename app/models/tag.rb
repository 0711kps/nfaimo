class Tag < ApplicationRecord
  has_many :tag_docships, dependent: :destroy
  has_many :documents, through: :tag_docships
end
