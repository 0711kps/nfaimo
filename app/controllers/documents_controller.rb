class DocumentsController < ApplicationController

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

  def download
    if params[:download_mode] == 'single'
      if (target = Document.select(:local_name, :title, :extname).where(id: params[:file_id]).first).present?
        send_file Rails.root.join("uploaded", target.local_name), filename: target.title + target.extname
      else
        head 404
      end
    elsif params[:download_mode] == 'multiple'
      require 'zip'
      ids = params[:file_id].split(',')
      if (targets=Document.select(:local_name, :title, :extname).where(id: ids)).size == ids.size
        zip_name = ('資訊室打包檔案-'+Time.now.strftime('%Y%m%d%H%M%S.zip'))
        File.delete(zip_name) if File.exists?(Rails.root.join('uploaded',zip_name))
        io = StringIO.new
        io.set_encoding(Encoding::BIG5)
        stringio = Zip::OutputStream::write_buffer(io) do |zio|
          targets.each do |t|
            zio.put_next_entry("#{t.title}#{t.extname}".encode(Encoding::BIG5))
            tmp_read = File.read(Rails.root.join('uploaded',t.local_name))
            zio.write(tmp_read)
          end
        end
        stringio.rewind
        binary_data = stringio.sysread
        send_data(binary_data,filename: zip_name)
      else
        head 404
      end
    end
  end
end
