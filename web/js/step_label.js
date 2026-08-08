import { app } from "../../../scripts/app.js";

const EXTENSION_NAME = "BlueGlassStudio.StepLabel";
const NODE_NAME = "StepLabel";
const THEME_CLASS = "bgs-step-label-theme";

const LAYOUT = {
    tabHeight: 38,
    bodyHeight: 68,
    iconPaddingX: 18,
    stepPaddingX: 8,
    titlePaddingX: 20,
    minimumWidth: 220,

    // D案
    tabRadius: 11,
    tabCut: 14,
    cardRadius: 8,
    accentLineHeight: 4,

    gapAboveNode: 8,
};

let palette;

const DEFAULT_PALETTE = {
    accent: "#2d64c0",
    accentLine: "#3f83ef",
    surface: "#20242a",
    title: "#f5f8ff",
    step: "#ffffff",
};

const COLOR_MAP = {
    "🔵 ブルー": {
        accent: "#2d64c0",
        line: "#3f83ef",
    },

    "🟣 パープル": {
        accent: "#7040b8",
        line: "#9b6be0",
    },

    "🟢 グリーン": {
        accent: "#287a52",
        line: "#4caf7d",
    },

    "🟠 オレンジ": {
        accent: "#c66a20",
        line: "#f09a45",
    },

    "🔴 レッド": {
        accent: "#a83232",
        line: "#e45a5a",
    },

    "🩵 シアン": {
        accent: "#25839a",
        line: "#50bfd7",
    },

    "🩷 ピンク": {
        accent: "#b83f72",
        line: "#e875a0",
    },

    "🟡 イエロー": {
        accent: "#a47b18",
        line: "#d6ad3c",
    },
};

const ICON_MAP = {
    "📥 モデル": "📥",
    "📝 CLIP / Text": "📝",
    "✨ 生成": "✨",
    "🖼️ 画像": "🖼️",
    "💫 加工": "💫",
    "💾 保存": "💾",
    "🔧 処理": "🔧",
    "⚙️ 設定": "⚙️",
    "🔍 解析": "🔍",
    "🎯 制御": "🎯",
    "🔗 参照": "🔗",
    "🧩 構築": "🧩",
    "🔀 合成": "🔀",
    "✂️ 切抜き": "✂️",
    "🎭 マスク": "🎭",
    "🔄 リサイズ": "🔄",
    "🎚️ 補正": "🎚️",
    "🧪 サンプル": "🧪",
    "🧬 LoRA": "🧬",
    "💠 VAE": "💠",
    "💡 プロンプト": "💡",
    "🧊 立体": "🧊",
    "🥽 VR": "🥽",
};

function loadStylesheet() {
    const stylesheetId =
        "bgs-step-label-styles";

    if (document.getElementById(stylesheetId)) {
        return;
    }

    const link = document.createElement("link");

    link.id = stylesheetId;
    link.rel = "stylesheet";
    link.href =
        new URL("../style.css", import.meta.url).href;

    document.head.appendChild(link);
}

function readPalette() {
    const probe =
        document.createElement("span");

    probe.className =
        THEME_CLASS;

    probe.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.appendChild(probe);

    const styles =
        getComputedStyle(probe);

    const value = (name) =>
        styles
            .getPropertyValue(name)
            .trim();

    const result = {
        accent:
            value(
                "--bgs-step-label-accent"
            ) ||
            DEFAULT_PALETTE.accent,

        accentLine:
            value(
                "--bgs-step-label-accent-line"
            ) ||
            DEFAULT_PALETTE.accentLine,

        surface:
            value(
                "--bgs-step-label-surface"
            ) ||
            DEFAULT_PALETTE.surface,

        title:
            value(
                "--bgs-step-label-title"
            ) ||
            DEFAULT_PALETTE.title,

        step:
            value(
                "--bgs-step-label-step"
            ) ||
            DEFAULT_PALETTE.step,
    };

    probe.remove();

    return result;
}

function getWidgetValue(
    node,
    name,
    fallback
) {
    return (
        node.widgets?.find(
            (widget) =>
                widget.name === name
        )?.value ?? fallback
    );
}

/* =========================================================
   設定UI 表示 / 非表示
   ========================================================= */

function getSettingsVisible(node) {
    return (
        node.properties?.bgsShowSettings ===
        true
    );
}

function setSettingsVisible(
    node,
    visible
) {
    if (!node.properties) {
        node.properties = {};
    }

    node.properties.bgsShowSettings =
        visible;

    if (!node.widgets) {
        return;
    }

    for (const widget of node.widgets) {
        if (
            widget.name ===
                "step_number" ||
            widget.name === "title" ||
            widget.name === "icon" ||
            widget.name === "color"
        ) {
            widget.hidden = !visible;
        }

        if (
            widget.name ===
            "custom_icon"
        ) {
            const iconWidget =
                node.widgets.find(
                    (item) =>
                        item.name ===
                        "icon"
                );

            const isCustom =
                iconWidget?.value ===
                "✏️ カスタム";

            widget.hidden =
                !visible ||
                !isCustom;
        }
    }

    if (
        node.computeSize &&
        node.setSize
    ) {
        const size =
            node.computeSize();

        if (size) {
            node.setSize(size);
        }
    }

    app.graph?.setDirtyCanvas?.(
        true,
        true
    );
}

/* =========================================================
   カスタムアイコン表示
   ========================================================= */

function updateCustomIconVisibility(
    node
) {
    const iconWidget =
        node.widgets?.find(
            (widget) =>
                widget.name === "icon"
        );

    const customWidget =
        node.widgets?.find(
            (widget) =>
                widget.name ===
                "custom_icon"
        );

    if (
        !iconWidget ||
        !customWidget
    ) {
        return;
    }

    const isCustom =
        iconWidget.value ===
        "✏️ カスタム";

    const settingsVisible =
        getSettingsVisible(node);

    customWidget.hidden =
        !settingsVisible ||
        !isCustom;

    if (
        node.computeSize &&
        node.setSize
    ) {
        const size =
            node.computeSize();

        if (size) {
            node.setSize(size);
        }
    }

    app.graph?.setDirtyCanvas?.(
        true,
        true
    );
}

function setupCustomIconVisibility(
    node
) {
    if (!node.widgets) {
        return;
    }

    if (!node.properties) {
        node.properties = {};
    }

    if (
        typeof node.properties
            .bgsShowSettings !==
        "boolean"
    ) {
        node.properties
            .bgsShowSettings = false;
    }

    if (
        typeof node.properties
            .bgsColor !==
        "string"
    ) {
        node.properties.bgsColor =
            "🔵 ブルー";
    }

    setSettingsVisible(
        node,
        node.properties
            .bgsShowSettings
    );

    const iconWidget =
        node.widgets.find(
            (widget) =>
                widget.name === "icon"
        );

    if (iconWidget) {
        if (
            !iconWidget
                .__bgsCallbackWrapped
        ) {
            const originalCallback =
                iconWidget.callback;

            iconWidget.callback =
                function(value) {
                    originalCallback?.apply(
                        this,
                        arguments
                    );

                    updateCustomIconVisibility(
                        node
                    );

                    app.graph?.setDirtyCanvas?.(
                        true,
                        true
                    );
                };

            iconWidget
                .__bgsCallbackWrapped = true;
        }
    }

    const colorWidget =
        node.widgets.find(
            (widget) =>
                widget.name === "color"
        );

    if (colorWidget) {
        if (
            !colorWidget
                .__bgsCallbackWrapped
        ) {
            const originalCallback =
                colorWidget.callback;

            colorWidget.callback =
                function(value) {
                    originalCallback?.apply(
                        this,
                        arguments
                    );

                    node.properties
                        .bgsColor =
                        value;

                    app.graph?.setDirtyCanvas?.(
                        true,
                        true
                    );
                };

            colorWidget
                .__bgsCallbackWrapped = true;
        }
    }

    updateCustomIconVisibility(
        node
    );
}

/* =========================================================
   アイコン取得
   ========================================================= */

function getSelectedIcon(
    iconChoice,
    customIcon
) {
    if (
        iconChoice ===
        "✏️ カスタム"
    ) {
        return (
            String(customIcon).trim() ||
            "📦"
        );
    }

    return (
        ICON_MAP[iconChoice] ||
        "📥"
    );
}

/* =========================================================
   カラー取得
   ========================================================= */

function getSelectedColor(node) {
    const colorChoice =
        getWidgetValue(
            node,
            "color",
            "🔵 ブルー"
        );

    return (
        COLOR_MAP[colorChoice] ||
        COLOR_MAP["🔵 ブルー"]
    );
}

/* =========================================================
   ラベルデータ
   ========================================================= */

function getLabelData(node) {
    const stepNumber =
        getWidgetValue(
            node,
            "step_number",
            1
        );

    const rawTitle =
        getWidgetValue(
            node,
            "title",
            "モデルの読込み"
        );

    const iconChoice =
        getWidgetValue(
            node,
            "icon",
            "📥 モデル"
        );

    const customIcon =
        getWidgetValue(
            node,
            "custom_icon",
            "📦"
        );

    const title =
        String(rawTitle).trim() ||
        "工程名";

    const icon =
        getSelectedIcon(
            iconChoice,
            customIcon
        );

    const color =
        getSelectedColor(node);

    return {
        stepText:
            `STEP ${stepNumber}`,
        title,
        icon,
        color,
    };
}

/* =========================================================
   サイズ計算
   ========================================================= */

function measureLabel(
    ctx,
    data
) {
    ctx.save();

    ctx.font =
        "600 19px Arial, sans-serif";

    const iconWidth =
        data.icon
            ? ctx.measureText(
                  data.icon
              ).width
            : 0;

    const stepWidth =
        iconWidth +
        ctx.measureText(
            data.stepText
        ).width +
        LAYOUT.iconPaddingX * 2 +
        LAYOUT.stepPaddingX;

    ctx.font =
        "600 21px Arial, sans-serif";

    const titleWidth =
        ctx.measureText(
            data.title
        ).width +
        LAYOUT.titlePaddingX * 2;

    ctx.restore();

    return Math.max(
        LAYOUT.minimumWidth,
        stepWidth + 26,
        titleWidth
    );
}

/* =========================================================
   D案：一体型タブ
   ========================================================= */

function drawTab(
    ctx,
    width,
    data
) {
    const tabWidth =
        Math.min(
            width * 0.62,
            width - 42
        );

    const cutStart =
        tabWidth -
        LAYOUT.tabCut;

    const tabRight =
        tabWidth + 14;

    const tabBottom =
        LAYOUT.tabHeight;

    /*
     * タブ本体
     */

    ctx.fillStyle =
        data.color.accent;

    ctx.beginPath();

    ctx.moveTo(
        0,
        LAYOUT.tabRadius
    );

    ctx.quadraticCurveTo(
        0,
        0,
        LAYOUT.tabRadius,
        0
    );

    ctx.lineTo(
        cutStart,
        0
    );

    ctx.lineTo(
        tabRight,
        tabBottom
    );

    ctx.lineTo(
        0,
        tabBottom
    );

    ctx.closePath();

    ctx.fill();

    /*
     * STEP文字
     */

    ctx.fillStyle =
        palette.step;

    ctx.font =
        "600 18px Arial, sans-serif";

    ctx.textBaseline =
        "middle";

    let textX =
        LAYOUT.iconPaddingX;

    if (data.icon) {
        ctx.fillText(
            data.icon,
            textX,
            LAYOUT.tabHeight / 2 +
                1
        );

        textX +=
            ctx.measureText(
                data.icon
            ).width +
            LAYOUT.stepPaddingX;
    }

    ctx.font =
        "600 19px Arial, sans-serif";

    ctx.fillText(
        data.stepText,
        textX,
        LAYOUT.tabHeight / 2 +
            1
    );

    return tabRight;
}

/* =========================================================
   カード形状
   ========================================================= */

function drawCardShape(
    ctx,
    width,
    height
) {
    const radius =
        LAYOUT.cardRadius;

    ctx.beginPath();

    ctx.moveTo(
        0,
        0
    );

    ctx.lineTo(
        width,
        0
    );

    ctx.lineTo(
        width,
        height - radius
    );

    ctx.quadraticCurveTo(
        width,
        height,
        width - radius,
        height
    );

    ctx.lineTo(
        radius,
        height
    );

    ctx.quadraticCurveTo(
        0,
        height,
        0,
        height - radius
    );

    ctx.lineTo(
        0,
        0
    );

    ctx.closePath();
}

/* =========================================================
   カード
   ========================================================= */

function drawCard(
    ctx,
    width,
    data
) {
    const y =
        LAYOUT.tabHeight - 2;

    const height =
        LAYOUT.bodyHeight;

    ctx.save();

    ctx.translate(
        0,
        y
    );

    ctx.fillStyle =
        palette.surface;

    drawCardShape(
        ctx,
        width,
        height
    );

    ctx.fill();

    ctx.fillStyle =
        palette.title;

    ctx.font =
        "600 21px Arial, sans-serif";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        data.title,
        LAYOUT.titlePaddingX,
        height / 2 + 1
    );

    ctx.restore();
}

/* =========================================================
   アクセントライン
   ★ D案 接続部分を修正
   ========================================================= */

function drawAccentLine(
    ctx,
    width,
    tabRight,
    data
) {
    /*
     * タブ先端の真下まで
     * ラインを食い込ませる。
     *
     * これにより
     *
     * タブ ╲━━━━━━
     *
     * の接続部分に隙間が出ない。
     */

    const lineStart =
        Math.max(
            0,
            tabRight - 2
        );

    const lineY =
        LAYOUT.tabHeight - 2;

    ctx.fillStyle =
        data.color.line;

    ctx.fillRect(
        lineStart,
        lineY,
        width - lineStart,
        LAYOUT.accentLineHeight
    );
}

/* =========================================================
   描画
   ========================================================= */

function drawStepLabel(ctx) {
    if (!palette) {
        palette =
            readPalette();
    }

    const data =
        getLabelData(this);

    const width =
        measureLabel(
            ctx,
            data
        );

    const height =
        LAYOUT.tabHeight +
        LAYOUT.bodyHeight -
        2;

    ctx.save();

    ctx.translate(
        0,
        -height -
            LAYOUT.gapAboveNode
    );

    /*
     * ① タブ
     */
    const tabRight =
        drawTab(
            ctx,
            width,
            data
        );

    /*
     * ② カード
     */
    drawCard(
        ctx,
        width,
        data
    );

    /*
     * ③ ラインを最後に描く
     *
     * カードに隠されないので、
     * タブ先端から右端まで
     * 完全につながって見える。
     */
    drawAccentLine(
        ctx,
        width,
        tabRight,
        data
    );

    ctx.restore();
}

/* =========================================================
   ComfyUI 拡張
   ========================================================= */

app.registerExtension({
    name:
        EXTENSION_NAME,

    setup() {
        loadStylesheet();

        requestAnimationFrame(
            () => {
                palette =
                    readPalette();

                app.graph?.setDirtyCanvas?.(
                    true,
                    true
                );
            }
        );
    },

    beforeRegisterNodeDef(
        nodeType,
        nodeData
    ) {
        if (
            nodeData.name !==
            NODE_NAME
        ) {
            return;
        }

        /* -----------------------------------------
           ノード作成時
           ----------------------------------------- */

        const originalOnNodeCreated =
            nodeType.prototype
                .onNodeCreated;

        nodeType.prototype
            .onNodeCreated =
            function() {
                originalOnNodeCreated?.apply(
                    this,
                    arguments
                );

                setupCustomIconVisibility(
                    this
                );
            };

        /* -----------------------------------------
           保存データ読み込み時
           ----------------------------------------- */

        const originalOnConfigure =
            nodeType.prototype
                .onConfigure;

        nodeType.prototype
            .onConfigure =
            function() {
                originalOnConfigure?.apply(
                    this,
                    arguments
                );

                requestAnimationFrame(
                    () => {
                        setupCustomIconVisibility(
                            this
                        );
                    }
                );
            };

        /* -----------------------------------------
           右クリックメニュー
           ----------------------------------------- */

        const originalGetExtraMenuOptions =
            nodeType.prototype
                .getExtraMenuOptions;

        nodeType.prototype
            .getExtraMenuOptions =
            function(
                canvas,
                options
            ) {
                originalGetExtraMenuOptions?.apply(
                    this,
                    arguments
                );

                const settingsVisible =
                    getSettingsVisible(
                        this
                    );

                options.push({
                    content:
                        settingsVisible
                            ? "⚙️ 設定を隠す"
                            : "⚙️ 設定を表示",

                    callback: () => {
                        setSettingsVisible(
                            this,
                            !settingsVisible
                        );

                        updateCustomIconVisibility(
                            this
                        );
                    },
                });
            };

        /* -----------------------------------------
           描画
           ----------------------------------------- */

        const originalDrawForeground =
            nodeType.prototype
                .onDrawForeground;

        nodeType.prototype
            .onDrawForeground =
            function(ctx) {
                originalDrawForeground?.apply(
                    this,
                    arguments
                );

                drawStepLabel.call(
                    this,
                    ctx
                );
            };
    },
});