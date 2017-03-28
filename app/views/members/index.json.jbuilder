json.members @members do |member|
  json.extract! member, :id, :name, :title, :resp, :ext, :mail
end
