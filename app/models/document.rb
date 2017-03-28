class Document < ApplicationRecord
  has_many :tag_docships, dependent: :destroy
  has_many :tags, through: :tag_docships
  validates_uniqueness_of :local_name
  validates_uniqueness_of :title, scope: :extname
  validates_presence_of :title, :local_name, :extname
  after_save :recount

  def self.recount
    Counter.update(name: 'Document', count: Document.count)
  end
  
  def recount
    Counter.update(name: 'Document', count: Document.count)
  end

end
