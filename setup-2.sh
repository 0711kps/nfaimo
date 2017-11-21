rbenv install 2.4.2
rbenv global 2.4.2
rbenv local 2.4.2
gem install rails 5.1.4
gem install passenger -v 5.1.11
sudo `which passenger-install-nginx-module`
scriptPath=`pwd`/`dirname $0`
prevPath=$(dirname `dirname $scriptPath`)
cd $prevPath
rails new nfaimo -MTCs --skip-turbolinks --skip-coffee
cd $scriptPath
RAILS_ENV=production rails db:migrate
RAILS_ENV=production rails db:seed
rails assets:precompile
keybase=`rails secret`
sed -i 's/<%= ENV\["SECRET_KEY_BASE"\] %>/'"$keybase/" config/secrets.yml
sudo cp -f nginx.conf /opt/nginx/conf
sudo reboot
