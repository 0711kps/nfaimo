class TubeVidsController < ApplicationController
  def index
    unless (@tube_vids = Rails.cache.fetch(:tube_vids))
      @tube_vids = TubeVid.order('created_at desc')
      Rails.cache.write(:tube_vids, @tube_vids)
    end
  end
end
