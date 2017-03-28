Rails.application.configure do
  config.cache_classes = true
  config.serve_static_assets = true
  config.eager_load = true
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true
  config.assets.compile = true
  config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for NGINX
  config.log_level = :error
  config.log_tags = [ :request_id ]
  config.cache_store = :dalli_store, {namespace: 'nfaimo_cache', expire_in: 1.year, compress: true}
  config.i18n.fallbacks = true
  config.active_support.deprecation = :notify
  config.log_formatter = ::Logger::Formatter.new
  if ENV["RAILS_LOG_TO_STDOUT"].present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger = ActiveSupport::TaggedLogging.new(logger)
  end
  config.active_record.dump_schema_after_migration = false
end
