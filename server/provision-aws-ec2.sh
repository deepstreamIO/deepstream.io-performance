#!/bin/bash
function e {
	echo "====================================="
	echo $1
	echo "====================================="
}

cd ~
e "Updating packages"
sudo yum update -y

#Install NodeJs and NPM
#sudo yum install nodejs npm -y --enablerepo=epel Only installs v 0.10.38

#Install NodeJs 0.12.x and NPM
e "Installing NodeJs 0.12.x & NPM"
sudo curl https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
source ~/.bashrc
nvm install 0.12

#Install sysstat
e "Installing git"
sudo yum install -y sysstat

#Install git
e "Installing git"
sudo yum install -y git

#Not strictly necessary, but good to have a task manager
e "Installing htop"
sudo yum install -y htop

e "Installing Performance Framework"
cd ~
git clone https://github.com/hoxton-one/deepstream.io-performance.git
cd ~/deepstream.io-performance
npm install

e "DONE!"