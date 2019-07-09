#!/bin/bash
# rm ./dist/sochi-modal.zip
yarn build
mv ./dist/templates/bromobile_selections/static/css/*.css ./dist/static/style.css
mv ./dist/templates/bromobile_selections/static/css/*.css.map ./dist/static/style.css.map
mv ./dist/templates/bromobile_selections/static/js/*.js ./dist/static/script.js
mv ./dist/templates/bromobile_selections/static/js/*.js.map ./dist/static/script.js.map
# zip -r ./dist/sochi-modal.zip ./dist/static
cp  ./dist/static/style.css /tmp/1/templates/bromobile_selections/static/css/style.css
cp  ./dist/static/style.css.map /tmp/1/templates/bromobile_selections/static/css/style.css.map
cp  ./dist/static/script.js /tmp/1/templates/bromobile_selections/static/js/script.js
cp  ./dist/static/script.js.map /tmp/1/templates/bromobile_selections/static/js/script.js.map
cp -r ./dist/templates/bromobile_selections/static/img /tmp/1/templates/bromobile_selections/static/
date

#products -> /tmp/1/templates/bromobile_selections/index.php #266
#page -> www/elitesochi.com/components/com_virtuemart/includes/product.php #511
