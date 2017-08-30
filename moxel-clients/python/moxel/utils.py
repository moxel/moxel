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


def parse_space_dict(space_dict):
    new_space_dict = {}

    for k, v in space_dict.items():
        try:
            new_space_dict[k] = space.get_space(v)
        except:
            raise Exception('Unknown space name {}'.format(v))

    return new_space_dict


