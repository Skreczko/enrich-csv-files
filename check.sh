
#!/usr/bin/env sh
set -eux

BLACK_ARGS=". --config ./pyproject.toml"
RUFF_ARGS=". "
MYPY_ARGS="."
NPM_RUN_ARGS=""
CI=false

cd "$(dirname $0)"

# Ruff

echo "* ruff"
ruff $RUFF_ARGS


# Black

echo "* black"
black $BLACK_ARGS


# Mypy

echo "* mypy"
mypy $MYPY_ARGS


# Npm, if installed

if command -v npm > /dev/null; then
  echo "* npm"
  npm run $NPM_RUN_ARGS check
fi
exit 0
