class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :ie_go_die , if: :is_ie?

  def taiwan_parse target # target should be created_at
    taiwan_year = target.year - 1911
    return "民國#{taiwan_year}年#{target.strftime('%_m月%e日%_H點%_M分')}"
  end

  protected
  
  def regist_record action, target
    Register.create! content: "#{@executer} #{action}: #{target} - #{taiwan_parse Time.now.localtime}"
    Register.where("updated_at < ?",Time.now - 1.week).delete_all
  end

  def member_validate
    @target_member = Member.find_by_mail session[:admin]
    if @target_member
      @executer = @target_member.name+"(#{@target_member.ext})"
    else
      head 404
    end
  end

  def is_ie?
    Browser.new(request.user_agent).ie?
  end

  def ie_go_die
    render file: "public/no_ie.html", layout: false
  end
end
