class StepLabel:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "label": ("STRING", {
                    "default": "STEP 1"
                }),
            }
        }

    RETURN_TYPES = ()
    FUNCTION = "show"
    CATEGORY = "Workflow Decorations"

    def show(self, label):
        print(f"Step Label: {label}")
        return ()

NODE_CLASS_MAPPINGS = {
    "StepLabel": StepLabel,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "StepLabel": "⭐ Step Label",
}