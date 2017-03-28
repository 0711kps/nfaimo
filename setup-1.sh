su -c "
apt install -y --no-install-recommends sudo wget curl build-essential libssl-dev libreadline-dev zlib1g-dev libmariadb-dev libcurl4-openssl-dev nodejs mariadb-server mariadb-client memcached
apt remove -y --purge firefox-esr gnome-software mpv mplayer totem nano
sed -i \"/root\t/anfaimo\tALL=(ALL:ALL) ALL\" /etc/sudoers
mysql --execute=\"create database nfaimo CHARACTER set utf8 COLLATE=utf8_general_ci;create user 'nfaimo'@'localhost' identified by 'nfaimonfaimo';grant all privileges on *.* to 'nfaimo'@'localhost';flush privileges\"
cp /home/nfaimo/nfaimo/nfaimo.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable nfaimo
chown -R nfaimo:nfaimo /home/nfaimo
"
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
cd ~/.rbenv && src/configure && make -C src && cd ..
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
