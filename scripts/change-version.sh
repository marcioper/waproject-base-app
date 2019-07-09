set -e

BASEDIR="$( cd "$(dirname "$0")" ; pwd -P )"
(cd $BASEDIR/../ && yarn)

node $BASEDIR/change-version.js -f $1