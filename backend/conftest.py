########################
# Pytest configuration #
########################


class PytestTestRunner:
    """Runs pytest to discover and run tests."""

    def __init__(self, verbosity=1, failfast=False, keepdb=False, **kwargs):
        self.verbosity = verbosity
        self.failfast = failfast
        self.keepdb = keepdb

    def run_tests(self, test_labels, extra_tests=None, **kwargs):
        import pytest

        verbosity = kwargs.get("verbosity", self.verbosity)
        argv = []
        if verbosity == 0:
            argv.append("--quiet")
        if verbosity == 2:
            argv.append("--verbose")
        if verbosity == 3:
            argv.append("-vv")
        if self.failfast:
            argv.append("--exitfirst")
        if self.keepdb:
            argv.append("--reuse-db")

        argv.extend(test_labels)
        if extra_tests:
            argv.extend(extra_tests)
        return pytest.main(argv)
