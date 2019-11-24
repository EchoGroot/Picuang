var adminOnly;

$(function () {
    $("[data-toggle='popover']").popover();
});

function showConfig() {
    setTimeout(function () {
        // 一列
        axios.get('/api/admin/getConf?conf=imageUploadedCount')
            .then(function (response) {
                $("#config-row").prepend("<div class='col-lg-6'><div class='input-group'><span class='input-group-addon' style='text-shadow: none !important;'><span class=\"glyphicon glyphicon-globe\"></span> 存储图片数量</span><input id='imageUploadedCount-input' aria-label='...' class='form-control' type='text' value='" + response.data + "'><span class='input-group-btn'><button type=\"button\" class=\"btn btn-primary\" aria-label=\"Help\"><span class=\"glyphicon glyphicon-question-sign\"></span></button><button class='btn btn-primary' type='button' onclick='editConfig(\"imageUploadedCount\")'>修改</button></span></div></div>");
            });
        axios.get('/api/admin/getConf?conf=password')
            .then(function (response) {
                $("#config-row").prepend("<div class='col-lg-6'><div class='input-group'><span class='input-group-addon' style='text-shadow: none !important;'><span class=\"glyphicon glyphicon-user\"></span> 后台管理密码</span><input id='password-input' aria-label='...' class='form-control' type='text' value='" + response.data + "'><span class='input-group-btn'><button type=\"button\" class=\"btn btn-primary disabled\" aria-label=\"Help\"><span class=\"glyphicon glyphicon-question-sign\"></span></button><button class='btn btn-primary' type='button' onclick='editConfig(\"password\")'>修改</button></span></div></div>");
            });
        axios.get('/api/admin/getConf?conf=cloneLimit')
            .then(function (response) {
                $("#config-row").prepend("<div class='col-lg-6'><div class='input-group'><span class='input-group-addon' style='text-shadow: none !important;'><span class=\"glyphicon glyphicon-cutlery\"></span> 克隆频率限制</span><input id='cloneLimit-input' aria-label='...' class='form-control' type='text' value='" + response.data + "'><span class='input-group-btn'><button type=\"button\" class=\"btn btn-primary\" aria-label=\"Help\"><span class=\"glyphicon glyphicon-question-sign\"></span></button><button class='btn btn-primary' type='button' onclick='editConfig(\"cloneLimit\")'>修改</button></span></div></div>");
            });
        axios.get('/api/admin/getConf?conf=uploadLimit')
            .then(function (response) {
                $("#config-row").prepend("<div class='col-lg-6'><div class='input-group'><span class='input-group-addon' style='text-shadow: none !important;'><span class=\"glyphicon glyphicon-open\"></span> 上传频率限制</span><input id='uploadLimit-input' aria-label='...' class='form-control' type='text' value='" + response.data + "'><span class='input-group-btn'><button type=\"button\" class=\"btn btn-primary\" aria-label=\"Help\"><span class=\"glyphicon glyphicon-question-sign\"></span></button><button class='btn btn-primary' type='button' onclick='editConfig(\"uploadLimit\")'>修改</button></span></div></div>");
            });
        // 二列
        axios.get('/api/admin/getConf?conf=adminOnly')
            .then(function (response) {
                if (response.data === "on") {
                    adminOnly = "启用";
                } else if (response.data === "off") {
                    adminOnly = "停用";
                } else {
                    adminOnly = "未知";
                }
                $("#adminOnlyStatus").html(adminOnly);
            });
        $("#logout").show(200);
        $("#config").show(500);
    }, 250);
}

function adminOnlyToggle() {
    if (adminOnly === "启用") {
        axios.get('/api/admin/setConf?conf=adminOnly&value=off')
            .then(function (response) {
                    adminOnly = "停用";
                    $("#adminOnlyStatus").html(adminOnly);
                    sendInnerNotify("已停用：仅管理员上传模式。");
                }
            );
    } else if (adminOnly === "停用") {
        axios.get('/api/admin/setConf?conf=adminOnly&value=on')
            .then(function (response) {
                    adminOnly = "启用";
                    $("#adminOnlyStatus").html(adminOnly);
                    sendInnerNotify("已启用：仅管理员上传模式。");
                }
            );
    } else {
        sendInnerNotify("无法读取管理员上传模式。请检查配置文件是否有adminOnly项，且值为on或off，修改后重启服务端重试。");
    }
}

function editConfig(sheet) {
    var value = $("#" + sheet + "-input").val();
    axios.get('/api/admin/setConf?conf=' + sheet + '&value=' + value)
        .then(function (response) {
                sendInnerNotify(sheet + " 的值已成功修改为：" + value);
            }
        );
}

function exportConfig() {
    window.open("/api/admin/export");
}

function importConfig() {
    var file = document.getElementById("import").files[0];
    uploadConfigToServer(file);
}

function uploadConfigToServer(file) {
    var param = new FormData();
    param.append('file', file);
    var config = {
        headers: {'Content-Type': 'multipart/form-data'}
    };
    axios.post('/api/admin/import', param, config)
        .then(function (response) {
                if (response.data.code === 200) {
                    sendInnerNotify("配置导入成功！重启服务端后生效。");
                } else {
                    sendInnerNotify("配置导入失败！请检查你的配置文件后缀名是否是.ini，且确认其可用性。")
                }
            }
        );
}