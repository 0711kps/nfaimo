class Ceb9458d5364668953b05327205aa8af::DocumentsController < ApplicationController
  before_action :member_validate

  def index
    unless (@files = Rails.cache.fetch(:files))
      @files = Document.order("created_at DESC").includes(:tags)
      Rails.cache.write(:files, @files)
    end

    unless (@tags = Rails.cache.fetch(:tags))
      @tags = Tag.order("name ASC")
      Rails.cache.write(:tags, @tags)
    end
  end

  def upload
    # 如果「由OOO上傳標籤不存在，則建立他」
    unless (presetTag = Tag.find_by_name "由#{@target_member.name}上傳")
      presetTag = Tag.create! name: "由#{@target_member.name}上傳"
    end
    title_list = Document.pluck(:title) # 檔案標題列表
    title = params[:filename] # 上傳檔案原本傳入的檔名
    ext = File.extname(title) # 原檔案的副檔名
    title = File.basename(title,ext) # 原檔案的標題(不含副檔名)
    local_name = params[:store_name] # 主機儲存的名字
    if params[:final] == 0 # 如果檔案較小只有一塊chunk
      File.open(Rails.root.join("uploaded",local_name ),'ab') do |f|
        # params[:file] is a UploadFile similar usage with File
        f.write params[:file].read
        f.close
      end
      # 當標題已存在，加個數字在後面避免重複
      if title_list.include? title
        tmp_number = 0
        begin
          tmp_number += 1
        end until title_list.exclude? title+"(#{tmp_number})"
        title = title+"(#{tmp_number})"
      end
      @document=Document.create(title: title, local_name: local_name, extname: ext)
      regist_record("上傳了檔案",
                   "#{@document.title}#{@document.extname}")
      TagDocship.create! tag: presetTag, document: @document
      Rails.cache.delete :files
      Rails.cache.delete :counters
      %x(chmod 777 #{Rails.root.join("uploaded",local_name)}) # 給予該檔案最大操作權限
      
    else # 檔案較大，分割爲較多chunk
      File.open(Rails.root.join("uploaded",local_name+".tmp"),'ab') do |f|
        f.write params[:file].read
        f.close
      end
      if params[:piece] == params[:final]
        %x(mv #{Rails.root.join("uploaded",local_name+".tmp")} #{Rails.root.join("uploaded",local_name)})
        if title_list.include? title
          tmp_number = 0
          begin
            tmp_number += 1
          end until title_list.exclude? title+"(#{tmp_number})"
          title = title+"(#{tmp_number})"
        end
        @document=Document.create(title: title, local_name: local_name, extname: ext)
        regist_record("上傳了檔案",
                     "#{@document.title}#{@document.extname}")
        TagDocship.create! tag: presetTag, document: @document
        Rails.cache.delete :files
        Rails.cache.delete :counters
        %x(chmod 777 #{Rails.root.join("uploaded",local_name)})
      end
    end
  end

  def remove
    if params[:mode] == "0" # 0 目標爲單體
      target = Document.find(params[:id])
      target.destroy
      if target.destroyed?
        Document.recount
        FileUtils.remove Rails.root.join("uploaded",target.local_name)
        Rails.cache.delete :files
        Rails.cache.delete :counters
        regist_record("刪除了檔案",
                      "#{target.title}#{target.extname}")
        head 200
      else
        head 500
      end
    elsif params[:mode] == "1" # 1 目標爲複數
      targets = params[:ids].split(',')
      documents = Document.where(id: targets)
      local_names = documents.pluck(:local_name)
      titles = documents.pluck(:title)
      extnames = documents.pluck(:extname)
      Document.transaction do
        Document.where(id: targets).delete_all
        TagDocship.where(document_id: targets).delete_all
      end
      if Document.where(id: targets).size == 0
        Document.recount
        Rails.cache.delete :files
        Rails.cache.delete :counters
        local_names.each do |ln|
          FileUtils.remove Rails.root.join('uploaded', ln)
        end
        for i in 0 .. targets.size - 1
          regist_record("刪除了檔案",
                       "#{titles[i]}#{extnames[i]}")
        end
        head 200
      else
        head 500
      end
    end
  end

  def rename
    if params[:mode] == "0"
      target = Document.find(params[:id])
      origin = {title: target.title, extname: target.extname}
      unless target.update title: params[:title]
        head 500
      end
      Rails.cache.delete :files
      regist_record("重新命名了檔案",
                    "#{origin[:title]}#{origin[:extname]} -> #{target.title}#{target.extname}")
    elsif params[:mode] == "1"
      targets = params[:ids].split(',')
      Document.transaction do
        Document.where(id: targets).order("created_at DESC").each_with_index do |doc,i|
          origin = {title: doc.title, extname: doc.extname}
          affix = "(#{i+1})"
          doc.update(title: params[:title] + affix)
          regist_record("重新命名了檔案",
                        "#{origin[:title]}#{origin[:extname]} -> #{doc.title}#{doc.extname}")
        end
      end
      Rails.cache.delete :files
    end
  end

  def tag_create
    @new_tag = Tag.new(name: params[:tag_name])
    if @new_tag.save
      Rails.cache.delete :tags
      regist_record("新增了標籤",
                    "#{@new_tag.name}")
      render json: {newTagId: @new_tag.id}
    else
      head 500
    end
  end

  def tag_del
    if (new_tag = Tag.find(params[:tag_id]).destroy)
      Rails.cache.delete :tags
      regist_record("刪除了標籤",
                    "#{new_tag.name}")
      head 200
    else
      head 500
    end
  end

  def rename_tag
    @target_tag = Tag.find(params[:id])
    origin = @target_tag.name
    if @target_tag.update(name: params[:name])
      Rails.cache.delete :tags
      regist_record("重新命名了標籤",
                    "#{origin} -> #{@target_tag.name}")
      head 200
    else
      head 500
    end
  end

  def tag_toggle
    if params[:multi_tag] == 1
      doc_array = params[:doc_id].split(',')
      if params[:mode] == 'add'
        target_tag = Tag.find(params[:tag_id])
        TagDocship.transaction do
          doc_array.each do |d|
            if !TagDocship.exists?(tag: params[:tag_id], document: d)
              if (target_doc = Document.find(d)) && target_tag
                new_bind = TagDocship.new document: target_doc, tag: target_tag
                new_bind.save!
                regist_record("替#{target_doc.title}#{target_doc.extname}貼上了標籤",
                              "#{target_tag.name}")
              else
                head 500
              end
            end
          end
        end
        Rails.cache.delete :files
        Rails.cache.delete :tags
      elsif params[:mode] == 'minus'
        target_tag = Tag.find(params[:tag_id])
        TagDocship.transaction do
          doc_array.each do |d|
            target_doc = Document.find(d)
            if target_ship = TagDocship.find_by(document: target_doc, tag: target_tag)
              target_ship.destroy
              regist_record("替#{target_doc.title}#{target_doc.extname}撕下了標籤",
                            "#{target_tag.name}")
            else
              head 500
            end
          end
        end
        Rails.cache.delete :files
        Rails.cache.delete :tags
      end
    elsif params[:multi_tag] == 0
      if params[:mode] == 'add'
        if (target_doc = Document.find(params[:doc_id])) && (target_tag = Tag.find(params[:tag_id]))
          new_bind = TagDocship.new document: target_doc, tag: target_tag
          new_bind.save!
          Rails.cache.delete :files
          Rails.cache.delete :tags
          regist_record("替#{target_doc.title}#{target_doc.extname}貼上了標籤",
                        "#{target_tag.name}")
        else
          head 500
        end
      elsif params[:mode] == 'minus'
        target_doc = Document.find(params[:doc_id])
        target_tag = Tag.find(params[:tag_id])
        if target_ship = TagDocship.find_by(document: target_doc, tag: target_tag)
          Rails.cache.delete :files
          Rails.cache.delete :tags
          regist_record("替#{target_doc.title}#{target_doc.extname}撕下了標籤",
                        "#{target_tag.name}")
          target_ship.destroy
        else
          head 500
        end
      end
    end
  end
end
