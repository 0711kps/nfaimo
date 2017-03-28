module ApplicationHelper
  def get_assets controller
  target = if controller.split("/").first == "ceb9458d5364668953b05327205aa8af"
    "admin-application"
  else
    "application"
  end
  return stylesheet_link_tag(target, media: 'all') + javascript_include_tag(target)
  end
end
