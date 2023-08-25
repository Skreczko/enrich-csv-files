
#!/usr/bin/env sh
set -eux

NPM_RUN_ARGS=""
CI=false

cd "$(dirname $0)"

# npm

echo "* npm"
npm run $NPM_RUN_ARGS check


exit 0
