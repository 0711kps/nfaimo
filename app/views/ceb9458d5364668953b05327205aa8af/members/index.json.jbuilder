json.members @members do |member|
  json.extract! member, :id, :name, :title, :resp, :ext, :mail
end
json.token form_authenticity_token
