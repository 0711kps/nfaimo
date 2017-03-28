class Ceb9458d5364668953b05327205aa8af::TubeVidsController < ApplicationController
  before_action :set_tube_vid, only:[:destroy, :update]
  before_action :member_validate

  def index
    unless (@tube_vids = Rails.cache.fetch(:tube_vids))
      @tube_vids = TubeVid.order('created_at desc')
      Rails.cache.write(:tube_vids, @tube_vids)
    end
  end

  def create
    str = %x(curl 'https://www.youtube.com/watch?v=#{tube_param['pid']}')
    html = Nokogiri::HTML(str)
    title = html.at("#eow-title").attr('title')
    puts title
    tv = TubeVid.new(title: title,vid: tube_param['pid'])
    if tv.save
      Rails.cache.delete :tube_vids
      Rails.cache.delete :counters
      regist_record("新增了YouTube影片",
                    "#{tv.title}")
      @tv_title = tv.title
      @tv_id = tv.id
      @tv_vid = tv.vid
      pid = tube_param['pid']
      thumbnail_url = "https://img.youtube.com/vi/#{pid}/hqdefault.jpg"
    else
      head 500
    end
  end

  def destroy
    @victim = if @tube_vid.title.size>23
                @tube_vid.title[0,8]+". . ."+@tube_vid.title[-8,8]
              else
                @tube_vid.title
              end
    @tube_vid.destroy
    Rails.cache.delete :tube_vids
    Rails.cache.delete :counters
    regist_record("刪除了YouTube影片",
                  "#{@tube_vid.title}")
  end

  def update
    origin = @tube_vid.title
    @tube_vid.update(title: tube_param['title'])
    Rails.cache.delete :tube_vids
    regist_record("重新命名了YouTube影片",
                  "#{origin} -> #{@tube_vid.title}")
    @tube_title = @tube_vid.title
  end

  private

  def set_tube_vid
    @tube_vid = TubeVid.find(params[:id])
  end

  def tube_param
    params.permit(:pid, :title)
  end
end
