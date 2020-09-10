curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash

. ~/.nvm/nvm.sh
nvm install lts/carbon
nvm use lts/carbon

sudo yum groupinstall "Development Tools"

npm i