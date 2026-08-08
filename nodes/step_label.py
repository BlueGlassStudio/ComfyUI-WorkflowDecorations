class StepLabel:
    """A non-processing node used to visually separate workflow steps."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "step_number": ("INT", {
                    "default": 1,
                    "min": 1,
                    "step": 1,
                }),

                "title": ("STRING", {
                    "default": "モデルの読込み",
                    "multiline": False,
                }),

                "icon": ([
                    "📥 モデル",
                    "📝 CLIP / Text",
                    "✨ 生成",
                    "🖼️ 画像",
                    "💫 加工",
                    "💾 保存",
                    "🔧 処理",
                    "⚙️ 設定",
                    "🔍 解析",
                    "🎯 制御",
                    "🔗 参照",
                    "🧩 構築",
                    "🔀 合成",
                    "✂️ 切抜き",
                    "🎭 マスク",
                    "🔄 リサイズ",
                    "🎚️ 補正",
                    "🧪 サンプル",
                    "🧬 LoRA",
                    "💠 VAE",
                    "💡 プロンプト",
                    "🧊 立体",
                    "🥽 VR",
                    "✏️ カスタム",
                ], {
                    "default": "📥 モデル",
                }),

                "custom_icon": ("STRING", {
                    "default": "📦",
                    "multiline": False,
                }),

                "color": ([
                    "🔵 ブルー",
                    "🟣 パープル",
                    "🟢 グリーン",
                    "🟠 オレンジ",
                    "🔴 レッド",
                    "🩵 シアン",
                    "🩷 ピンク",
                    "🟡 イエロー",
                ], {
                    "default": "🔵 ブルー",
                }),
            }
        }

    RETURN_TYPES = ()
    FUNCTION = "show"
    CATEGORY = "Workflow Decorations"

    OUTPUT_NODE = True

    def show(
        self,
        step_number,
        title,
        icon,
        custom_icon,
        color,
    ):
        print(
            f"[Step Label] {icon} "
            f"STEP {step_number}: {title} "
            f"[{color}]"
        )

        return ()


NODE_CLASS_MAPPINGS = {
    "StepLabel": StepLabel,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "StepLabel": "⭐ Step Label",
}