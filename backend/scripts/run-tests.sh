#!/bin/bash
set -eu

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

pytest --cov=. --cov-report=term-missing:skip-covered

coverage xml -o coverage.xml