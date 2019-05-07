set -e

BASEDIR="$( cd "$(dirname "$0")" ; pwd -P )"
VERSION=$(node -p "require('$BASEDIR/../package.json').version") 


node $BASEDIR/change-version.js

rm -f $BASEDIR/../App.apk
(cd $BASEDIR/../android && ./gradlew assembleRelease)
mv $BASEDIR/../android/app/build/outputs/apk/release/app-release.apk $BASEDIR/../App.apk

sh $BASEDIR/upload-sourcemap.android.sh