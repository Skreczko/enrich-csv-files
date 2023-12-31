#!/usr/bin/env python3
import os
import subprocess
import sys
import xml.etree.ElementTree
from collections import namedtuple


RED_START = "\033[91m"
GREEN_START = "\033[92m"
YELLOW_START = "\033[93m"
COLOR_END = "\033[0m"

# In percentage, how many lines of newly added code should be covered
COVERAGE_THRESHOLD = 0.8


# format_lines copied from coverage.py to avoid a dependency
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
    if os.environ.get("GITHUB_ACTIONS"):
        git_command = [
            "git",
            "diff",
            "--name-only",
            "--relative=app",
            "origin/" + target_branch,
        ]
    else:
        git_command = [
            "git",
            "--git-dir",
            "/home/user/.git",
            "diff",
            "--name-only",
            "--relative=app",
            "origin/" + target_branch,
        ]

    return subprocess.check_output(git_command).decode("utf-8").split("\n")


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
            line_rate=line_rate,
            lines=lines,
            uncovered=uncovered,
        )
    return coverage


def get_files_to_ignore() -> list[str]:
    files_to_ignore = []
    # backend files

    # frontend files
    files_to_ignore.extend(
        [
            "static/js/api/enums.ts",
            "static/js/components/body/upload_csv/types.ts",
            "static/js/components/body/upload_list/table_management/types.ts",
            "static/js/components/body/upload_list/upload_list_table/enums.ts",
            "static/js/components/notification/helpers.ts",
            "static/js/redux/FileListParamSlice.ts",
            "static/js/redux/NotificationPopupSlice.ts",
            "static/js/redux/PreviewListReducer.ts",
            "static/js/redux/TaskListReducer.ts",
            "static/js/redux/UploadSectionSlice.ts",
            "static/js/router/config/routes.ts",
            "static/js/utils/testing-utils.tsx",
            "static/js/components/hooks/useFetchPreviewChunk.ts", # main functions are covered. Ignored debounce in tests.
            "static/js/components/body/upload_csv/UploadFileDragAndDrop.tsx", # tested. provided 72.22%. cannot test ie. e.preventDefault()
        ]
    )
    return files_to_ignore


def main():
    if len(sys.argv) != 3:
        print("Need two filenames")
        return 0

    new_coverage = get_coverage(sys.argv[1])
    old_coverage = get_coverage(sys.argv[2])
    failed_lines = False

    files_to_ignore = get_files_to_ignore()
    for filename, new_data in new_coverage.items():
        if filename in files_to_ignore:
            continue
        old_data = old_coverage.get(filename)

        if old_data and new_data.line_rate == 0:
            print(
                "{filename}: has {red_start}0%{color_end} coverage.".format(
                    filename=filename, red_start=RED_START, color_end=COLOR_END
                )
            )
            failed_lines = True
            continue

        if not old_data:
            if new_data.line_rate < COVERAGE_THRESHOLD * 100:
                print(
                    "{filename}: expected at least {green_start}{threshold:.2f}%{color_end} coverage, got {red_start}{new_lines:.2f}%{color_end}.".format(
                        filename=filename,
                        threshold=COVERAGE_THRESHOLD * 100,
                        new_lines=new_data.line_rate,
                        green_start=GREEN_START,
                        red_start=RED_START,
                        color_end=COLOR_END,
                    )
                )
                failed_lines = True
            continue

        if new_data.line_rate < old_data.line_rate:
            print(
                "{filename}: coverage decreased from {yellow_start}{old_lines:.2f}%{color_end} to {red_start}{new_lines:.2f}%{color_end}.".format(
                    filename=filename,
                    old_lines=old_data.line_rate,
                    new_lines=new_data.line_rate,
                    yellow_start=YELLOW_START,
                    red_start=RED_START,
                    color_end=COLOR_END,
                )
            )
            failed_lines = True
        elif (
            new_data.line_rate > old_data.line_rate
            and new_data.line_rate < COVERAGE_THRESHOLD * 100
        ):
            print(
                "{filename}: coverage increased but did not reach the threshold. Expected at least {green_start}{threshold:.2f}%{color_end} coverage, got {red_start}{new_lines:.2f}%{color_end}.".format(
                    filename=filename,
                    threshold=COVERAGE_THRESHOLD * 100,
                    new_lines=new_data.line_rate,
                    green_start=GREEN_START,
                    red_start=RED_START,
                    color_end=COLOR_END,
                )
            )
            failed_lines = True

    if failed_lines:
        print(
            f"{RED_START}\nERROR: Coverage issues detected, please review the failures reported above.{COLOR_END}"
        )
        return 1

    print(f"{GREEN_START}Coverage is good!{COLOR_END}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
