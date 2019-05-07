set -e

BASEDIR="$( cd "$(dirname "$0")" ; pwd -P )"
VERSION=$(node -p "require('$BASEDIR/../package.json').version") 
echo "version $VERSION"

echo "Bundle source map ANDROID"
yarn react-native bundle -- \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/waprojectapp.android.bundle \
  --sourcemap-output /tmp/waprojectapp.android.sourcemap

yarn bugsnag-sourcemaps upload -- \
     --api-key be00ba79aeb4c0d0bc52e7be19a48462 \
     --app-version $VERSION \
     --minified-file /tmp/waprojectapp.android.bundle \
     --source-map /tmp/waprojectapp.android.sourcemap \
     --minified-url index.android.bundle \
     --upload-sources \
     --overwrite