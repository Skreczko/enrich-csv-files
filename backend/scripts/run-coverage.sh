##!/bin/bash
#set -eu
#DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
#tmpfile=$(mktemp /tmp/XXXXXX-coverage.txt)
#
#cd $DIR/../backend && \
#  coverage run ./manage.py test -- "$*" && \
#  coverage report -m > "$tmpfile"
#$DIR/check_coverage.py "$tmpfile"
#rm "$tmpfile"

#!/bin/bash
set -eu
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
tmpfile=$(mktemp /tmp/XXXXXX-coverage.txt)

cd $DIR/.. && \
  coverage run ./manage.py test -- "$*" && \
  coverage xml -o coverage.xml && \
  coverage report -m > "$tmpfile"
$DIR/check_coverage.py "$tmpfile"
rm "$tmpfile"

