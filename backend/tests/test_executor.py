from app.pipeline.executor import run_pipeline


def test_pipeline_execution():
    pipeline = {
        "nodes": [
            {"id": "A", "type": "dataset"},
            {"id": "B", "type": "preprocess"},
            {"id": "C", "type": "model"}
        ],
        "edges": [
            {"source": "A", "target": "B"},
            {"source": "B", "target": "C"}
        ]
    }

    results = run_pipeline(pipeline)

    assert results["A"]["data"] == [1, 2, 3]
    assert results["B"]["data"] == [2, 4, 6]
    assert results["C"]["accuracy"] == 4.0