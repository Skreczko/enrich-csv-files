class SerializationError(Exception):
    def __init__(self, instance, field):
        self.instance = instance
        self.field = field
