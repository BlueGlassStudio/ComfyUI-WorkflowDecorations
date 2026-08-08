import { app } from "../../../scripts/app.js";

const EXTENSION_NAME = "BlueGlassStudio.Poster";
const NODE_NAME = "PosterNode";

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 180;

const MIN_WIDTH = 160;
const MIN_HEIGHT = 90;


/*
 * =========================================================
 * プレースホルダー
 * =========================================================
 */
function drawPlaceholder(ctx, node) {

    const width = node.size[0];
    const height = node.size[1];

    ctx.save();

    ctx.fillStyle = "rgba(120, 120, 120, 0.08)";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    ctx.fillStyle = "rgba(220, 220, 220, 0.55)";

    ctx.font =
        "32px Arial, sans-serif";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        "🖼️",
        width / 2,
        height / 2 - 18
    );

    ctx.font =
        "15px Arial, sans-serif";

    ctx.fillText(
        "ここに画像を設定できます",
        width / 2,
        height / 2 + 20
    );

    ctx.restore();
}


/*
 * =========================================================
 * 画像描画
 * =========================================================
 */
function drawImage(ctx, node) {

    if (!node.posterImage) {

        drawPlaceholder(
            ctx,
            node
        );

        return;
    }

    const image =
        node.posterImage;

    const width =
        node.size[0];

    const height =
        node.size[1];


    ctx.save();

    ctx.drawImage(
        image,
        0,
        0,
        width,
        height
    );

    ctx.restore();
}


/*
 * =========================================================
 * 画像の縦横比
 * =========================================================
 */
function getImageRatio(node) {

    if (
        !node.posterImage ||
        !node.posterImage.naturalWidth ||
        !node.posterImage.naturalHeight
    ) {
        return null;
    }

    return (
        node.posterImage.naturalWidth /
        node.posterImage.naturalHeight
    );
}


/*
 * =========================================================
 * 画像読み込み
 *
 * resize = true
 *   新しい画像を設定したとき
 *
 * resize = false
 *   ワークフロー読み込み時
 *   → 保存済みサイズを維持
 * =========================================================
 */
function loadPosterImage(
    node,
    filename,
    resize = true
) {

    if (!filename) {

        node.posterImage = null;

        node.posterFilename = null;

        if (node.properties) {

            node.properties.posterFilename =
                null;

        }


        if (resize) {

            node.setSize([
                DEFAULT_WIDTH,
                DEFAULT_HEIGHT
            ]);

        }


        node.setDirtyCanvas(
            true,
            true
        );

        return;
    }


    const image =
        new Image();


    image.onload = () => {

        node.posterImage =
            image;

        node.posterFilename =
            filename;


        /*
         * propertiesにも保存
         */
        if (!node.properties) {

            node.properties = {};

        }

        node.properties.posterFilename =
            filename;


        /*
         * 新規画像設定時だけ
         * 元画像の比率で自動サイズ
         */
        if (resize) {

            const ratio =
                image.naturalWidth /
                image.naturalHeight;


            let width =
                DEFAULT_WIDTH;

            let height =
                width / ratio;


            /*
             * 最小サイズ
             */
            if (
                height < MIN_HEIGHT
            ) {

                height =
                    MIN_HEIGHT;

                width =
                    height * ratio;
            }


            if (
                width < MIN_WIDTH
            ) {

                width =
                    MIN_WIDTH;

                height =
                    width / ratio;
            }


            node._posterResizing =
                true;

            node.setSize([
                width,
                height
            ]);

            node._posterResizing =
                false;
        }


        node.setDirtyCanvas(
            true,
            true
        );

    };


    image.onerror = () => {

        node.posterImage =
            null;

        node.setDirtyCanvas(
            true,
            true
        );

        console.error(
            "[Poster] Failed to load image:",
            filename
        );

    };


    image.src =
        `/view?filename=${encodeURIComponent(filename)}&type=input`;
}


/*
 * =========================================================
 * 画像変更
 * =========================================================
 */
async function changePosterImage(node) {

    const input =
        document.createElement("input");

    input.type =
        "file";

    input.accept =
        "image/png,image/jpeg,image/webp";


    input.onchange =
        async () => {

            const file =
                input.files?.[0];


            if (!file) {
                return;
            }


            const formData =
                new FormData();


            formData.append(
                "image",
                file,
                file.name
            );


            formData.append(
                "type",
                "input"
            );


            formData.append(
                "overwrite",
                "false"
            );


            try {

                const response =
                    await fetch(
                        "/upload/image",
                        {
                            method: "POST",
                            body: formData,
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `Upload failed: ${response.status}`
                    );

                }


                const result =
                    await response.json();


                const filename =
                    result.name ||
                    file.name;


                /*
                 * 新しい画像なので
                 * 自動サイズ調整ON
                 */
                loadPosterImage(
                    node,
                    filename,
                    true
                );


            } catch (error) {

                console.error(
                    "[Poster] Image upload failed:",
                    error
                );

            }

        };


    input.click();
}


/*
 * =========================================================
 * 画像削除
 * =========================================================
 */
function removePosterImage(node) {

    node.posterImage =
        null;

    node.posterFilename =
        null;


    if (!node.properties) {

        node.properties = {};

    }


    node.properties.posterFilename =
        null;


    node._posterResizing =
        true;


    node.setSize([
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ]);


    node._posterResizing =
        false;


    node.setDirtyCanvas(
        true,
        true
    );
}


/*
 * =========================================================
 * リサイズ時の縦横比固定
 * =========================================================
 */
function keepAspectRatio(node) {

    if (node._posterResizing) {
        return;
    }


    const ratio =
        getImageRatio(node);


    if (!ratio) {
        return;
    }


    const width =
        node.size[0];

    const height =
        node.size[1];


    /*
     * 横幅を基準にする
     */
    let newWidth =
        Math.max(
            MIN_WIDTH,
            width
        );

    let newHeight =
        newWidth / ratio;


    /*
     * 高さが最小値未満なら
     * 高さを基準にする
     */
    if (
        newHeight < MIN_HEIGHT
    ) {

        newHeight =
            MIN_HEIGHT;

        newWidth =
            newHeight * ratio;
    }


    /*
     * 少数を整数化
     */
    newWidth =
        Math.round(newWidth);

    newHeight =
        Math.round(newHeight);


    /*
     * 変更が必要な場合だけ
     * setSizeする
     */
    if (
        Math.abs(
            node.size[0] -
            newWidth
        ) > 1 ||
        Math.abs(
            node.size[1] -
            newHeight
        ) > 1
    ) {

        node._posterResizing =
            true;


        node.setSize([
            newWidth,
            newHeight
        ]);


        node._posterResizing =
            false;
    }
}


/*
 * =========================================================
 * ComfyUI Extension
 * =========================================================
 */
app.registerExtension({

    name:
        EXTENSION_NAME,


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


        /*
         * タイトルバー非表示
         */
        nodeType.title_mode =
            LiteGraph.NO_TITLE;


        /*
         * =================================================
         * ノード作成
         * =================================================
         */
        const originalOnNodeCreated =
            nodeType.prototype.onNodeCreated;


        nodeType.prototype.onNodeCreated =
            function() {

                originalOnNodeCreated?.apply(
                    this,
                    arguments
                );


                this.posterImage =
                    null;

                this.posterFilename =
                    null;


                /*
                 * 保存用properties
                 */
                if (!this.properties) {

                    this.properties = {};

                }


                if (
                    this.properties.posterFilename ===
                    undefined
                ) {

                    this.properties.posterFilename =
                        null;

                }


                this._posterResizing =
                    true;


                this.setSize?.([
                    DEFAULT_WIDTH,
                    DEFAULT_HEIGHT
                ]);


                this._posterResizing =
                    false;
            };


        /*
         * =================================================
         * ワークフロー読み込み
         * =================================================
         */
        const originalOnConfigure =
            nodeType.prototype.onConfigure;


        nodeType.prototype.onConfigure =
            function() {

                originalOnConfigure?.apply(
                    this,
                    arguments
                );


                this.posterImage =
                    null;


                /*
                 * propertiesから復元
                 */
                let filename =
                    this.properties?.posterFilename;


                /*
                 * 旧形式との互換
                 */
                if (
                    !filename &&
                    this.posterFilename
                ) {

                    filename =
                        this.posterFilename;
                }


                if (filename) {

                    this.posterFilename =
                        filename;


                    /*
                     * 重要：
                     *
                     * 保存済みノードサイズを
                     * そのまま維持する。
                     */
                    loadPosterImage(
                        this,
                        filename,
                        false
                    );

                }

            };


        /*
         * =================================================
         * リサイズ
         * =================================================
         */
        const originalOnResize =
            nodeType.prototype.onResize;


        nodeType.prototype.onResize =
            function() {

                originalOnResize?.apply(
                    this,
                    arguments
                );


                keepAspectRatio(
                    this
                );

            };


        /*
         * =================================================
         * 描画
         * =================================================
         */
        const originalDrawForeground =
            nodeType.prototype.onDrawForeground;


        nodeType.prototype.onDrawForeground =
            function(ctx) {

                originalDrawForeground?.apply(
                    this,
                    arguments
                );


                drawImage(
                    ctx,
                    this
                );

            };


        /*
         * =================================================
         * 右クリックメニュー
         * =================================================
         */
        const originalGetExtraMenuOptions =
            nodeType.prototype
                .getExtraMenuOptions;


        nodeType.prototype
            .getExtraMenuOptions =
            function(_, options) {

                originalGetExtraMenuOptions?.apply(
                    this,
                    arguments
                );


                options.push(null);


                /*
                 * 画像変更
                 */
                options.push({

                    content:
                        "🖼️ 画像を変更",

                    callback: () => {

                        changePosterImage(
                            this
                        );

                    },

                });


                /*
                 * 画像削除
                 */
                options.push({

                    content:
                        "🗑️ 画像を削除",

                    callback: () => {

                        removePosterImage(
                            this
                        );

                    },

                });

            };

    },

});