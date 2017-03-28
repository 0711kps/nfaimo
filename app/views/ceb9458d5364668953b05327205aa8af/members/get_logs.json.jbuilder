json.logs @logs do |log|
  json.extract! log, :content
end
