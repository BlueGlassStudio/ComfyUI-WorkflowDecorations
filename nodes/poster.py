class PosterNode:
    """A non-processing node used to place visual posters in a workflow."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {}
        }

    RETURN_TYPES = ()
    FUNCTION = "show"
    CATEGORY = "Workflow Decorations"

    OUTPUT_NODE = True

    def show(self):
        return ()


NODE_CLASS_MAPPINGS = {
    "PosterNode": PosterNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PosterNode": "🖼️ Poster",
}