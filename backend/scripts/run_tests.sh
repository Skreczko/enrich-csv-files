#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

coverage run manage.py test

coverage xml -o coverage.xml

if [ ! -f previous-coverage.xml ]; then
    echo '<?xml version="1.0" ?><coverage line-rate="0.0"></coverage>' > previous-coverage.xml
fi

scripts/check_coverage.py coverage.xml previous-coverage.xml
