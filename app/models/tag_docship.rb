class TagDocship < ApplicationRecord
  belongs_to :document
  belongs_to :tag
  after_save :recount
  after_destroy :recount

  def recount
    tag.update documents_count: tag.documents.count
  end
end
