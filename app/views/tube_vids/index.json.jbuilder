json.tube_vids @tube_vids do |tv|
  json.extract! tv, :id, :title, :vid
end
json.token form_authenticity_token
