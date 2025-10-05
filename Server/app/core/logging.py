import logging
import sys

def setup_logging(level: int = logging.INFO):
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        '{"level":"%(levelname)s","name":"%(name)s","message":"%(message)s"}'
    )
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(level)
    root.addHandler(handler)
