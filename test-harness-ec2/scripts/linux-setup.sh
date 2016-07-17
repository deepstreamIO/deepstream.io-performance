#!/bin/bash
function e {
	echo "====================================="
	echo $1
	echo "====================================="
}

cd ~
e "Updating packages"
sudo yum update -y

#Install sysstat
e "Installing sysstat"
sudo yum install -y sysstat

#Install git
e "Installing git"
sudo yum install -y git

#Not strictly necessary, but good to have a task manager
e "Installing htop"
sudo yum install -y htop

e "Installing deepstream"
sudo wget https://bintray.com/deepstreamio/rpm/rpm -O /etc/yum.repos.d/bintray-deepstreamio-rpm.repo
sudo yum install -y deepstream.io

e "Installing Performance Framework"
cd ~
git clone https://github.com/deepstreamIO/deepstream.io-performance.git
cd ~/deepstream.io-performance
git pull https://github.com/deepstreamIO/deepstream.io-performance.git
npm install

e "DONE!"