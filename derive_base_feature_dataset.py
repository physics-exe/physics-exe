from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path


HISTORY_COLUMN_PATTERN = re.compile(r"_tminus\d+h$")


@dataclass(frozen=True)
class DatasetLayout:
    all_columns: list[str]
    base_columns: list[str]
    history_columns: list[str]
    kept_indices: list[int]


def parse_args() -> argparse.Namespace:
    repo_root = Path(__file__).resolve().parent
    default_input_dir = repo_root / "outputs" / "preprocessed_dataset"

    parser = argparse.ArgumentParser(
        description=(
            "Create base-feature-only copies of the preprocessed hourly datasets by "
            "dropping explicit lag/history columns like *_tminus24h."
        )
    )
    parser.add_argument(
        "--trainval-input",
        type=Path,
        default=default_input_dir / "trainval_hourly.csv",
    )
    parser.add_argument(
        "--test-input",
        type=Path,
        default=default_input_dir / "test_hourly.csv",
    )
    parser.add_argument(
        "--trainval-output",
        type=Path,
        default=default_input_dir / "trainval_hourly_base.csv",
    )
    parser.add_argument(
        "--test-output",
        type=Path,
        default=default_input_dir / "test_hourly_base.csv",
    )
    parser.add_argument(
        "--summary-output",
        type=Path,
        default=default_input_dir / "base_feature_dataset_summary.json",
    )
    return parser.parse_args()


def read_header(path: Path) -> list[str]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.reader(handle)
        try:
            return next(reader)
        except StopIteration as exc:
            raise ValueError(f"CSV has no header row: {path}") from exc


def build_layout(path: Path) -> DatasetLayout:
    header = read_header(path)
    history_columns: list[str] = []
    base_columns: list[str] = []
    kept_indices: list[int] = []

    for index, column_name in enumerate(header):
        if HISTORY_COLUMN_PATTERN.search(column_name):
            history_columns.append(column_name)
            continue
        base_columns.append(column_name)
        kept_indices.append(index)

    if not base_columns:
        raise ValueError(f"No base columns were detected in {path}.")

    return DatasetLayout(
        all_columns=header,
        base_columns=base_columns,
        history_columns=history_columns,
        kept_indices=kept_indices,
    )


def ensure_distinct_paths(input_path: Path, output_path: Path) -> None:
    if input_path.resolve() == output_path.resolve():
        raise ValueError(f"Refusing to overwrite input dataset: {input_path}")


def filter_dataset(input_path: Path, output_path: Path, layout: DatasetLayout) -> int:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    row_count = 0

    with (
        input_path.open("r", encoding="utf-8", newline="") as source_handle,
        output_path.open("w", encoding="utf-8", newline="") as target_handle,
    ):
        reader = csv.reader(source_handle)
        writer = csv.writer(target_handle)

        source_header = next(reader, None)
        if source_header is None:
            raise ValueError(f"CSV has no header row: {input_path}")
        if source_header != layout.all_columns:
            raise ValueError(f"Header changed while processing {input_path}.")

        writer.writerow(layout.base_columns)
        for row in reader:
            writer.writerow([row[index] for index in layout.kept_indices])
            row_count += 1

    return row_count


def write_summary(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)


def run() -> dict[str, object]:
    args = parse_args()
    trainval_input = args.trainval_input.resolve()
    test_input = args.test_input.resolve()
    trainval_output = args.trainval_output.resolve()
    test_output = args.test_output.resolve()
    summary_output = args.summary_output.resolve()

    for input_path in (trainval_input, test_input):
        if not input_path.exists():
            raise FileNotFoundError(f"Input dataset not found: {input_path}")

    ensure_distinct_paths(trainval_input, trainval_output)
    ensure_distinct_paths(test_input, test_output)

    trainval_layout = build_layout(trainval_input)
    test_layout = build_layout(test_input)
    if trainval_layout.base_columns != test_layout.base_columns:
        raise ValueError("Trainval and test base columns do not match.")

    trainval_row_count = filter_dataset(trainval_input, trainval_output, trainval_layout)
    test_row_count = filter_dataset(test_input, test_output, test_layout)

    summary = {
        "history_column_pattern": HISTORY_COLUMN_PATTERN.pattern,
        "base_column_count": len(trainval_layout.base_columns),
        "history_column_count": len(trainval_layout.history_columns),
        "base_columns": trainval_layout.base_columns,
        "history_column_sample": trainval_layout.history_columns[:30],
        "exports": {
            "trainval": {
                "input_path": str(trainval_input),
                "output_path": str(trainval_output),
                "row_count": trainval_row_count,
                "input_column_count": len(trainval_layout.all_columns),
                "output_column_count": len(trainval_layout.base_columns),
            },
            "test": {
                "input_path": str(test_input),
                "output_path": str(test_output),
                "row_count": test_row_count,
                "input_column_count": len(test_layout.all_columns),
                "output_column_count": len(test_layout.base_columns),
            },
        },
    }
    write_summary(summary_output, summary)
    summary["summary_output_path"] = str(summary_output)
    return summary


def main() -> None:
    summary = run()
    print(
        "Derived base-feature datasets created: "
        f"{summary['exports']['trainval']['output_path']}, "
        f"{summary['exports']['test']['output_path']}, and "
        f"{summary['summary_output_path']}."
    )


if __name__ == "__main__":
    main()
