class Ceb9458d5364668953b05327205aa8af::MembersController < ApplicationController
  before_action :set_member, only: [:destroy, :update, :alter_order]
  before_action :member_validate
  before_action :ie_go_die, if: :is_ie?

  def index
    unless (@members = Rails.cache.fetch(:members))
      @members = Member.order('display_order ASC')
      Rails.cache.write(:members, @members)
    end

    unless (@counters = Rails.cache.fetch(:counters))
      @counters = Counter.pluck(:count)
      Rails.cache.write(:counters, @counters)
    end

    %x(bash #{Rails.root}/delete_broken_tmp.sh)
  end

  def manual
    markdown_content = File.read(Rails.root.join('b-manual.md'))
    render html: Kramdown::Document.new(markdown_content).to_html.html_safe
  end

  def get_logs
    @logs = Register.all.reverse
  end

  def create
    new_member = Member.new member_param
    new_member.display_order = Member.count + 1
    unless new_member.save
      head 500
    end
    Rails.cache.delete :counters
    Rails.cache.delete :members
    @new_member = new_member
    regist_record("新增了 成員資料",
                 "#{@new_member.name}(#{@new_member.ext})")
  end

  def destroy
    
    target = @member.destroy
    Rails.cache.delete :counters
    Rails.cache.delete :members
    @victim = target.name
    Member.d_alter_order target.display_order
    regist_record("刪除了 成員資料",
                 "#{target.name}(#{target.ext})")
  end

  def update
    origin = {name: @member.name, ext: @member.ext}
    if session[:admin] == @member.mail
      unless @member.update member_param
        head 500
      end
      session[:admin] = @member.mail
      Rails.cache.delete :members
      regist_record("更新了 成員資料",
                   "自己")
    else
      unless @member.update member_param
        head 500
      end
      Rails.cache.delete :members
      regist_record("更新了 成員資料",
                   "#{origin[:name]}(#{origin[:ext]})")
    end
    if (target_tag = Tag.find_by_name "由#{origin[:name]}上傳")
      target_tag.update(name: "由#{@member.name}上傳")
    end
  end

  def alter_order
    unless @member.i_alter_order(params[:change_amount])
      head 500
    end
  end

  def change_password
    if params[:password] == params[:re_password]
      if @target_member.update(passwd: Digest::SHA1::hexdigest(params[:password]))
        head 200
      else
        head 500
      end
    end
  end

  private

  def member_param
    params.permit(:name, :title, :resp, :ext, :mail)
  end

  def set_member
    @member = Member.find(params[:id])
  end
end
