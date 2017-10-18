from moxel.utils import parse_model_id


def test_parse_model_id():
    model_id = 'strin/tf-object-detection:latest'
    (user, model, tag) = parse_model_id(model_id)

    assert user == 'strin'
    assert model == 'tf-object-detection'
    assert tag == 'latest'

