class TubeVid < ApplicationRecord
  validates_uniqueness_of :vid
  validates_presence_of :vid, :title
  after_save :recount
  after_destroy :recount

  def recount
    Counter.update(name: 'TubeVid', count: TubeVid.count)
  end
end
