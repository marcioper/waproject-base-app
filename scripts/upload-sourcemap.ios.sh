set -e

BASEDIR="$( cd "$(dirname "$0")" ; pwd -P )"
VERSION=$(node -p "require('$BASEDIR/../package.json').version") 
echo "version $VERSION"

echo "Bundle source map IOS"
yarn react-native bundle -- \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/waprojectapp.ios.bundle \
  --sourcemap-output /tmp/waprojectapp.ios.sourcemap

yarn bugsnag-sourcemaps upload -- \
     --api-key be00ba79aeb4c0d0bc52e7be19a48462 \
     --app-version $VERSION \
     --minified-file /tmp/waprojectapp.ios.bundle \
     --source-map /tmp/waprojectapp.ios.sourcemap \
     --minified-url index.ios.bundle \
     --upload-sources \
     --overwrite

yarn bugsnag-sourcemaps upload -- \
     --api-key be00ba79aeb4c0d0bc52e7be19a48462 \
     --app-version $VERSION \
     --minified-file /tmp/waprojectapp.ios.bundle \
     --source-map /tmp/waprojectapp.ios.sourcemap \
     --minified-url main.jsbundle \
     --upload-sources \
     --overwrite