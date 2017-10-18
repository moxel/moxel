from moxel.space.string import String


def test_from_str():
    text = 'hello, world'
    data = String(20).from_str(text)
    assert data.to_str() == text
    assert data.to_bytes('utf_8') == text.encode('utf_8')

    has_exception = False
    try:
        data = String(5).from_str(text)
    except:
        has_exception = True

    if not has_exception:
        raise Exception('should raised an error')


