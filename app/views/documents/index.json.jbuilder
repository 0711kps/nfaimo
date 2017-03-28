json.docs @files do |doc|
  json.id doc.id
  json.title doc.title
  json.ext doc.extname
  json.localName  doc.local_name
  json.taggedWith doc.tags.ids.join(',')
  case doc.extname
  when '.jpg','.jpeg','.png','.gif'
    json.iconUrl '/assets/icon/icons.svg#image'
  when '.avi','.mp4','.webm','.wmv','.flv'
    json.iconUrl '/assets/icon/icons.svg#video'
  when '.doc','.docx'
    json.iconUrl '/assets/icon/icons.svg#word'
  when '.ppt','.pptx'
    json.iconUrl '/assets/icon/icons.svg#ppt'
  when '.xls','.xlsx'
    json.iconUrl '/assets/icon/icons.svg#excel'
  when '.pdf'
    json.iconUrl '/assets/icon/icons.svg#pdf'
  when '.zip','.rar','.7z'
    json.iconUrl '/assets/icon/icons.svg#archive'
  else
    json.iconUrl '/assets/icon/icons.svg#default'
  end
end
json.tags @tags do |tag|
  json.name tag.name
  json.id tag.id
  json.docCount tag.documents_count
  json.docIds tag.documents.pluck(:id).sort.join(',')
end
