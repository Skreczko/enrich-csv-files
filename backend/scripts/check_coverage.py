#!/usr/bin/env python3
import subprocess
import sys
import xml.etree.ElementTree
from collections import namedtuple

# In percentage, how many lines of newly added code should be covered
COVERAGE_THRESHOLD = 0.8


# Copyright 2001 Gareth Rees.  All rights reserved.
# Copyright 2004-2021 Ned Batchelder.  All rights reserved.
#
# Except where noted otherwise, this software is licensed under the Apache
# License, Version 2.0 (the "License"); you may not use this work except in
# compliance with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


def format_lines(statements, lines, arcs=None):
    """Nicely format a list of line numbers.

    Format a list of line numbers for printing by coalescing groups of lines as
    long as the lines represent consecutive statements.  This will coalesce
    even if there are gaps between statements.

    For example, if `statements` is [1,2,3,4,5,10,11,12,13,14] and
    `lines` is [1,2,5,10,11,13,14] then the result will be "1-2, 5-11, 13-14".

    Both `lines` and `statements` can be any iterable. All of the elements of
    `lines` must be in `statements`, and all of the values must be positive
    integers.

    If `arcs` is provided, they are (start,[end,end,end]) pairs that will be
    included in the output as long as start isn't in `lines`.

    """

    def nice_pair(pair):
        """Make a nice string representation of a pair of numbers.

        If the numbers are equal, just return the number, otherwise return the pair
        with a dash between them, indicating the range.

        """
        start, end = pair
        if start == end:
            return "%d" % start
        else:
            return "%d-%d" % (start, end)

    def _line_ranges(statements, lines):
        """Produce a list of ranges for `format_lines`."""
        statements = sorted(statements)
        lines = sorted(lines)

        pairs = []
        start = None
        lidx = 0
        for stmt in statements:
            if lidx >= len(lines):
                break
            if stmt == lines[lidx]:
                lidx += 1
                if not start:
                    start = stmt
                end = stmt
            elif start:
                pairs.append((start, end))
                start = None
        if start:
            pairs.append((start, end))
        return pairs

    line_items = [
        (pair[0], nice_pair(pair)) for pair in _line_ranges(statements, lines)
    ]
    if arcs:
        line_exits = sorted(arcs)
        for line, exits in line_exits:
            for ex in sorted(exits):
                if line not in lines:
                    dest = ex if ex > 0 else "exit"
                    line_items.append((line, "%d->%s" % (line, dest)))

    ret = ", ".join(t[-1] for t in sorted(line_items))
    return ret


def get_modified_files():
    target_branch = "main"
    return (
        subprocess.check_output(
            ["git", "diff", "--name-only", "--relative=app", "origin/" + target_branch],
        )
        .decode("utf-8")
        .split("\n")
    )


class CoverageData(namedtuple("CoverageData", "line_rate lines uncovered")):
    pass


def get_coverage(file_name):
    coverage = {}
    for package in xml.etree.ElementTree.parse(file_name).findall(".//class"):
        line_rate = float(package.attrib["line-rate"]) * 100
        uncovered = []
        lines = []
        for line in package.findall(".//line"):
            if line.attrib["hits"] == "0":
                uncovered.append(int(line.attrib["number"]))
            lines.append(int(line.attrib["number"]))

        coverage[package.attrib["filename"]] = CoverageData(
            line_rate=line_rate, lines=lines, uncovered=uncovered,
        )
    return coverage


def main():
    if len(sys.argv) != 3:
        print("Need two filenames")
        return 0
    modified_files = get_modified_files()
    new_coverage = get_coverage(sys.argv[1])
    old_coverage = get_coverage(sys.argv[2])
    failed_lines = False
    for filename, new_data in new_coverage.items():
        if filename not in modified_files:
            continue
        old_data = old_coverage.get(filename)

        if not old_data:
            minimum_rate = COVERAGE_THRESHOLD * 100
        else:
            minimum_rate = old_data.line_rate * COVERAGE_THRESHOLD
        if new_data.line_rate < minimum_rate:
            print(
                "{filename}: expected {old_lines:.2f}% coverage, got {new_lines:.2f}%, missing: {missing}.".format(
                    filename=filename,
                    old_lines=minimum_rate,
                    new_lines=new_data.line_rate,
                    missing=format_lines(new_data.lines, new_data.uncovered),
                )
            )
            failed_lines = True
        else:
            print("{filename} coverage passed".format(filename=filename))

    if failed_lines:
        print(
            "\nERROR: Missing coverage, please add more tests for the failures reported above."
        )
        return 1

    print("Coverage is good!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
