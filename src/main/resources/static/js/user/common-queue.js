queue = 0;
tempCount = 0;
sourceAll = undefined;

function stopUploadThreads() {
    sourceAll.cancel('Operation canceled by the user.');
    $("#status").html("");
    change(0);
    tempCount = 0;
    queue = 0;
}

function upload() {
    if (document.getElementById("upload").files.length == 0) {
        $("#status").text("请选择图片！");
    } else {
        $("#status").text("准备传输，请稍等。");
        for (var i = 0; i < document.getElementById("upload").files.length; i++) {
            var file = document.getElementById("upload").files[i];
            suffixName = file.name.split(".");
            suffixName = suffixName[suffixName.length - 1];
            if (suffixName == "jpeg" || suffixName == "jpg" || suffixName == "png" || suffixName == "gif" || suffixName == "svg") {
                uploadToServer(file);
            } else {
                alert(file.name + " 格式不受支持，将跳过该图片的上传。（其它图片不受影响）");
            }
        }
    }
}

function uploadToServer(file) {
    if (sourceAll == undefined) {
        console.log("Generating new Token...");
        sourceAll = axios.CancelToken.source();
    }
    size = parseInt(((file.size / 1024)  / 1024).toFixed(1));
    picLimit = parseInt($("#picLimit").text().replace("MB", ""));
    if (size <= picLimit) {
        var param = new FormData();
        param.append('file', file);
        var config = {
            headers: {'Content-Type': 'multipart/form-data'},
            onUploadProgress: function (progressEvent) {
                if (progressEvent.lengthComputable) {
                    progress = progressEvent.loaded / progressEvent.total * 100 | 0;
                    $("#status").html('<button onclick="stopUploadThreads()" class="btn btn-info">终止上传</button><br><br>多线程传输中<br><strong>队列：' + queue + '</strong><br>' + file.name + '：' + progress + '%');
                    change(progress);
                }
            },
            cancelToken: sourceAll.token
        };
        ++queue;
        ++tempCount;
        axios.post('/upload', param, config)
            .then(function (response) {
                change(0);
                responseHandler(response);
                --queue;
                if (queue == 0) {
                    $("#status").html("<strong>" + tempCount + "张</strong> 图片已全部传输完毕。");
                    tempCount = 0;
                }
                sourceAll = undefined;
            })
            .catch(function (reason) {
                if (axios.isCancel(reason)) {
                    console.log('Request canceled', reason.message);
                } else {
                    change(0);
                    $("#status").html("您的图片大小超过限制:(");
                    --queue;
                    if (queue == 0) {
                        $("#status").html("<strong>" + tempCount + "张</strong> 图片部分传输成功。（部分图片大小超过限制）");
                        tempCount = 0;
                    }
                }
                sourceAll = undefined;
            });
    } else {
        alert(file.name + " 文件大小为" + size + "MB，超过限制的" + picLimit + "MB，将跳过传输！（其它图片不受影响）");
    }
}

function responseHandler(response) {
    code = response.data.code;
    msg = response.data.msg;
    switch (code) {
        case 200:
            filename = response.data.data;
            fullLocation = location.origin + msg;
            //$("#status").html("<strong>成功！轻击打开 </strong><a style='text-decoration: none;' href='" + fullLocation + "' target='_blank'>" + fullLocation + "</a>");
            appendLink(fullLocation, "<img alt=\"" + filename + "\" src=\"" + fullLocation + "\">", "![" + filename + "](" + fullLocation + ")");
            $("#links").css("display", "block");
            break;
        case 406:
            $("#status").html("未选择图片，请重试。");
            break;
        case 500:
            $("#status").html("图片错误，服务器拒绝解析！请检查图片格式。");
            break;
    }
}

var count = 0;

function appendLink(link, tag, markdown) {
    ++count;
    $("#appendLinks").prepend("<br><br><img src='" + link + "' style='width: auto; height: auto; max-width: 192px; max-height: 192px;' class=\"img-thumbnail\">" +
        "<div class='col-lg-12' style='padding-top: 24px;'>\n" +
        "    <div class='input-group'>\n" +
        "        <span class='input-group-addon' style='text-shadow: none'><span class='glyphicon glyphicon-link' aria-hidden='true'></span></span>\n" +
        "        <input id='outInHyperlink" + count + "' type='text' class='form-control' value='" + link + "'>\n" +
        "        <span class='input-group-btn'>\n" +
        "         <button id='copyURL' data-clipboard-target='#outInHyperlink" + count + "' class='copies btn btn-primary' type='button'><span class='glyphicon glyphicon-copy' aria-hidden='true'></span></button>\n" +
        "        </span>\n" +
        "    </div>\n" +
        "</div>\n" +
        "<div class='col-lg-12'>\n" +
        "    <div class='input-group'>\n" +
        "        <span class='input-group-addon' style='text-shadow: none'><span class='glyphicon glyphicon-paperclip' aria-hidden='true'></span></span>\n" +
        "        <input id='outInImgTag" + count + "' type='text' class='form-control' value='" + tag + "'>\n" +
        "        <span class='input-group-btn'>\n" +
        "         <button id='copyTag' data-clipboard-target='#outInImgTag" + count + "' class='copies btn btn-info' type='button'><span class='glyphicon glyphicon-copy' aria-hidden='true'></span></button>\n" +
        "        </span>\n" +
        "    </div>\n" +
        "</div>\n" +
        "<div class='col-lg-12'>\n" +
        "    <div class='input-group'>\n" +
        "        <span class='input-group-addon' style='text-shadow: none'><span class='glyphicon glyphicon-bookmark' aria-hidden='true'></span></span>\n" +
        "        <input id='outInMarkdown" + count + "' type='text' class='form-control' value='" + markdown + "'>\n" +
        "        <span class='input-group-btn'>\n" +
        "         <button id='copyMarkdown' data-clipboard-target='#outInMarkdown" + count + "' class='copies btn btn-warning' type='button'><span class='glyphicon glyphicon-copy' aria-hidden='true'></span></button>\n" +
        "        </span>\n" +
        "    </div>\n" +
        "</div>\n")
}