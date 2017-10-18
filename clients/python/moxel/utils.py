import moxel.space as space


def parse_model_id(model_id):
    """ Return a tuple (user, model, tag)

    Parse the model_id in format <user>/<model>:<tag> into tuples.
    """
    parts = model_id.split(':')
    if len(parts) != 2:
        raise Exception('Ill-formated model_id: {}'.format(model_id))

    tag = parts[1]

    parts = parts[0].split('/')
    if len(parts) != 2:
        raise Exception('Ill-formated model_id: {}'.format(model_id))

    user = parts[0]
    model = parts[1]

    return (user, model, tag)



