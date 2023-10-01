#!/bin/bash
set -eu

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

coverage run manage.py test

coverage xml -o current_coverage.xml

#scripts/check_coverage.py current_coverage.xml previous-coverage.xml
