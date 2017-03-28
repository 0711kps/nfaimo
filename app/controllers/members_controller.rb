class MembersController < ApplicationController
  layout "entry", only: [:admin_entry]

  def index
    unless (@members = Rails.cache.fetch(:members))
      @members = Member.order('display_order ASC')
      Rails.cache.write(:members, @members)
    end

    unless (@counters = Rails.cache.fetch(:counters))
      @counters = Counter.pluck(:count)
    end

    %x(bash #{Rails.root}/delete_broken_tmp.sh)
  end

  def manual
    markdown_content = File.read(Rails.root.join('f-manual.md'))
    render html: Kramdown::Document.new(markdown_content).to_html.html_safe
  end

  def admin_entry
    if Member.find_by_mail session[:admin]
      redirect_to '/ceb9458d5364668953b05327205aa8af'
    end
  end

  def admin_login
    acc = params[:account]
    pw = params[:password]
    if ( targetMember = Member.find_by_ext(acc) )
      if Digest::SHA1::hexdigest(pw) ==  targetMember.passwd
        session[:admin] = targetMember.mail
        redirect_to '/ceb9458d5364668953b05327205aa8af'
      else
        redirect_to '/@admin_entry'
      end
    else
      redirect_to '/@admin_entry'
    end
  end

  def admin_logout
    session[:admin].clear
    redirect_to '/'
  end
end
