const Q = require('q');
const MYSQL = require('mysql');
const CODE = require('./mysql.code');
const CONFIG = require('./mysql.config');
const FORMAT = require('./utility.date');
const FILESYSTEM = require('../services/file.system.service');
const log4js = require("../services/log4js.service");
const LOGGER = log4js.getLogger("default");

var handler =
    {
        // 使用mysql.config.js的配置信息创建一个MySQL连接池
        pool: MYSQL.createPool(CONFIG.mysql),

        /**
         * 建立连接
         * @param parameters
         * @returns {*|Promise|promise}
         */
        setUpConnection: function (parameters) {
            var deferred = Q.defer();
            // 从连接池获取连接
            this.pool.getConnection(function (err, connection) {
                LOGGER.info("==> setUpConnection ==> callback | " + err);
                if (err) {
                    deferred.reject({
                        connection: connection,
                        code: CODE.databaseErrorCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve({
                        connection: connection,
                        params: parameters
                    });
                }
            });
            return deferred.promise;
        },

        /**
         * 启动事务
         * @param request
         * @returns {*|Promise|promise}
         */
        beginTransaction: function (request) {
            var deferred = Q.defer();
            // 启动事务
            request.connection.beginTransaction(function (err) {
                LOGGER.info("==> beginTransaction ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve(request);
                }
            });

            return deferred.promise;
        },

        /**
         * 提交事务
         * @param request
         * @returns {*|Promise|promise}
         */
        commitTransaction: function (request) {
            var deferred = Q.defer();

            request.connection.commit(function (err) {
                LOGGER.info("==> commitTransaction ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve(request);
                }
            });

            return deferred.promise;
        },

        /**
         * 添加 - 基本信息
         * @param request
         * @returns {*|Promise|promise}
         */
        setBasicInfo: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.sqlBasicInfo, [request.params.information], function (err, result) {
                LOGGER.info("==> setBasicInfo ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve({
                        connection: request.connection,
                        params: request.params,
                        result: result
                    });
                }
            });

            return deferred.promise;
        },

        /**
         * 编辑 - 基本信息
         * @param request
         * @returns {*|Promise|promise}
         */
        updateBasicInfo: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.sqlUpdateInfo, request.params.updateDataSet, function (err, result) {
                LOGGER.info("==> updateBasicInfo ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve({
                        connection: request.connection,
                        params: request.params,
                        result: result
                    });
                }
            });

            return deferred.promise;
        },

        /**
         * 删除 - 基本信息
         * @param request
         * @returns {*|Promise|promise}
         */
        deleteBasicInfo: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.sqlDeleteInfo, request.params.deleteDataSet, function (err, result) {
                LOGGER.info("==> deleteBasicInfo ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve({
                        connection: request.connection,
                        params: request.params,
                        result: result
                    });
                }
            });

            return deferred.promise;
        },

        /**
         * 注册
         * @param request
         * @returns {jQuery.promise|promise|*|Promise}
         */
        register: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.sqlRegister, [request.params.extra], function (err, result) {
                LOGGER.info("==> register ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve({
                        connection: request.connection,
                        params: request.params,
                        result: result
                    });
                }
            });

            return deferred.promise;
        },

        /**
         * 检查目标项是否存在
         * @param request
         * @returns {*|promise|Promise}
         */
        isExist: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.sqlIsExist, request.params.queryCondition, function (err, result) {
                LOGGER.info("==> isExist ==> callback | " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    LOGGER.info(result);
                    if (result.length === 0 || result[0].number === 0) {
                        deferred.reject({
                            connection: request.connection,
                            code: CODE.notFoundErrorCode,
                            errMsg: 'Not found.'
                        });
                    } else {
                        deferred.resolve({
                            connection: request.connection,
                            params: request.params,
                            result: result[0]
                        });
                    }
                }
            });

            return deferred.promise;
        },

        /**
         * 同样是检查目标项是否存在
         * 与isExist相反，如果不存在就正常执行下面流程
         * @param request
         * @returns {promise|jQuery.promise|*|Promise}
         */
        isRepeat: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.sqlIsRepeat, request.params.checkCondition, function (err, result) {
                LOGGER.info("==> isRepeat ==> callback | " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    LOGGER.info(result);
                    if (result.length === 0 || result[0].number === 0) {
                        deferred.resolve({
                            connection: request.connection,
                            params: request.params,
                            result: result[0]
                        });
                    } else {
                        deferred.reject({
                            connection: request.connection,
                            params: request.params,
                            code: CODE.resubmitErrorCode,
                            errMsg: 'Already have one. Maybe resubmit.'
                        });
                    }
                }
            });

            return deferred.promise;
        },

        /**
         * 获取微信账户
         * @param request
         * @returns {jQuery.promise|*|promise|Promise}
         */
        fetchWeChatAccount: function (request) {
            var deferred = Q.defer();

            LOGGER.info("==> fetchWeChatAccount | SQL - " + request.params.sqlFetchUser + " | uid - " + request.params.uid);
            request.connection.query(request.params.sqlFetchUser, request.params.uid, function (err, result) {
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    LOGGER.info(result);
                    if (result.length === 0) {
                        deferred.reject({
                            connection: request.connection,
                            code: CODE.notFoundErrorCode,
                            errMsg: 'Not found.'
                        });

                    } else {
                        request.params.deleteDataSet = [
                            result[0].wechat
                        ];
                        request.params.information = {
                            openid: result[0].wechat,
                            nickname: request.params.userInfo.nickName,
                            sex: request.params.userInfo.gender,
                            headimgurl: request.params.userInfo.avatarUrl,
                            country: request.params.userInfo.country,
                            province: request.params.userInfo.province,
                            city: request.params.userInfo.city
                        };

                        deferred.resolve({
                            connection: request.connection,
                            params: request.params
                        });
                    }
                }
            });

            return deferred.promise;
        },

        /**
         * 一步 - 删除（实验）
         * 用于实现批量操作（串联）
         * @param request
         * @returns {*|Promise|promise}
         */
        oneStepDelete: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.execSQLs[request.params.index], request.params.information, function (err, result) {
                LOGGER.info("==> oneStepDelete ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    request.params.index = request.params.index + 1;
                    request.result = result;
                    deferred.resolve(request);
                }
            });

            return deferred.promise;
        },

        /**
         * 删除数据集
         * 实现串行操作
         * @param request
         * @returns {Promise|*|promise}
         */
        deleteDataSet: function (request) {
            var i,
                length,
                promise,
                tasks = [];

            for (i = 0, length = request.params.execSQLs.length; i < length; i++) {
                tasks.push(handler.oneStepDelete);
            }

            promise = Q(request);

            for (i = 0, length = tasks.length; i < length; i++) {
                promise = promise.then(tasks[i]);
            }

            return promise;
        },

        /**
         * 一步 - 正式
         * 在批量删除的基础上进行改进
         * 在执行SQL语句同时，遍历传入的参数
         * @param request
         * @returns {promise|jQuery.promise|*|Promise}
         */
        oneStep: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.execSQLs[request.params.index], request.params.execSQLParams[request.params.index], function (err, result) {
                LOGGER.info("==> oneStep ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    request.params.index = request.params.index + 1;
                    request.result = result;
                    deferred.resolve(request);
                }
            });

            return deferred.promise;
        },

        /**
         * 依次执行execSQLs中的指令
         * 参数数组与SQL指令数组相对应
         * @param request
         * @returns {*}
         */
        executeInOrder: function (request) {
            var i,
                length,
                promise,
                tasks = [];

            for (i = 0, length = request.params.execSQLs.length; i < length; i++) {
                tasks.push(handler.oneStep);
            }

            promise = Q(request);

            for (i = 0, length = tasks.length; i < length; i++) {
                promise = promise.then(tasks[i]);
            }

            return promise;
        },

        /**
         * 批量拷贝图片文件
         *  --  封装
         * @param request
         * @returns {*|promise|Promise}
         */
        batchCopyWrapper: function (request) {
            var
                deferred = Q.defer();

            LOGGER.info("==>   batchCopyWrapper");
            LOGGER.info(request.params.gallery);
            /**
             * 未找到上传图集 直接跳过
             */
            if (!request.params.gallery instanceof Array) {
                deferred.resolve({
                    connection: request.connection,
                    params: request.params,
                    insertId: request.result.insertId
                });
            } else if (request.params.gallery.length === 0) {
                deferred.resolve({
                    connection: request.connection,
                    params: request.params,
                    insertId: request.result.insertId
                });
            } else {

                FILESYSTEM
                    .batchCopy(request.params.gallery, "temp", "screenshot")
                    .then(
                        function (result) {
                            deferred.resolve({
                                connection: request.connection,
                                params: request.params,
                                insertId: request.result.insertId
                            });
                        },
                        function (err) {
                            deferred.reject({
                                connection: request.connection,
                                code: CODE.failedCode,
                                errMsg: err.msg
                            });
                        }
                    );
            }

            return deferred.promise;
        },

        /**
         * 批量删除图片文件
         *  --  封装
         * @param request
         * @returns {*|promise|Promise}
         */
        batchRemoveWrapper: function (request) {
            var
                deferred = Q.defer();

            LOGGER.info("==>   batchRemoveWrapper");
            LOGGER.info(request.result);

            if (request.result.length === 0) {
                deferred.resolve({
                    connection: request.connection,
                    params: request.params
                });
            } else {
                FILESYSTEM
                    .batchRemove(request.result, "screenshot")
                    .then(
                        function (result) {
                            deferred.resolve({
                                connection: request.connection,
                                params: request.params
                            });
                        },
                        function (err) {
                            deferred.reject({
                                connection: request.connection,
                                code: CODE.failedCode,
                                errMsg: err.msg
                            });
                        }
                    );
            }

            return deferred.promise;
        },

        /**
         * 数据库操作 - 插入图集
         * @param request
         * @returns {*|Promise|promise}
         */
        insertGallery: function (request) {
            var i,
                length,
                values = [],
                deferred = Q.defer();

            LOGGER.info("==>   insertGallery");
            LOGGER.info(request.params.gallery);
            /**
             * 未找到上传图集 直接跳过
             */
            if (!request.params.gallery instanceof Array) {
                deferred.resolve({
                    connection: request.connection,
                    params: request.params,
                    result: "DONE"
                });
            } else if (request.params.gallery.length === 0) {
                deferred.resolve({
                    connection: request.connection,
                    params: request.params,
                    result: "DONE"
                });
            }
            else {
                for (i = 0, length = request.params.gallery.length; i < length; i++) {
                    values[i] = [
                        request.params.gallery[i].imageurl,
                        request.params.gallery[i].type,
                        request.insertId
                    ]
                    // request.params.gallery[i].relative = request.result.insertId;
                }
                LOGGER.info(values);

                request.connection.query(request.params.sqlInsertGallery, [values], function (err, result) {
                    LOGGER.info("==> insertGallery ==> callback |  " + err);
                    if (err) {
                        deferred.reject({
                            connection: request.connection,
                            code: CODE.failedCode,
                            errMsg: err
                        });
                    }
                    deferred.resolve({
                        connection: request.connection,
                        params: request.params,
                        result: result
                    });
                });
            }

            return deferred.promise;
        },

        /**
         * 数据库操作 - 删除图集
         * @param request
         * @returns {*|promise|Promise}
         */
        removeGallery: function (request) {
            var
                values = [request.params.id],
                deferred = Q.defer();

            request.connection.query(request.params.sqlDeleteGallery, [values], function (err, result) {
                LOGGER.info("==> removeGallery ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve({
                        connection: request.connection,
                        params: request.params,
                        result: {
                            insertId: request.params.id
                        }
                    });
                }
            });

            return deferred.promise;
        },

        /**
         * 获取 - 图集
         * @param request
         * @returns {*|Promise|promise}
         */
        fetchGallery: function (request) {
            var
                values = [request.params.id],
                deferred = Q.defer();

            request.connection.query(request.params.sqlFetchGallery, [values], function (err, result) {
                LOGGER.info("==> fetchGallery ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve({
                        connection: request.connection,
                        params: request.params,
                        result: result
                    });
                }
            });

            return deferred.promise;
        },

        /**
         * 获取列表
         * @param request
         * @returns {*|Promise|promise}
         */
        fetchList: function (request) {
            var deferred = Q.defer();

            LOGGER.info("==>   fetchList | execSQL: " + request.params.execSQL);
            request.connection.query(request.params.execSQL, request.params.values, function (err, result) {
                LOGGER.info("==> fetchList ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve({
                        connection: request.connection,
                        tableName: request.params.tableName,
                        result: result
                    });
                }
            });

            return deferred.promise;
        }
        ,

        /**
         * 获取指定行
         * @param request
         * @returns {*|jQuery.promise|promise|Promise}
         */
        fetchSpecificRow: function (request) {
            var deferred = Q.defer();

            LOGGER.info("==>   fetchSpecificRow | execSQL: " + request.params.sqlSpecificRow);
            request.connection.query(request.params.sqlSpecificRow, request.params.specificCondition, function (err, result) {
                LOGGER.info("==> fetchSpecificRow ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                } else {
                    deferred.resolve({
                        connection: request.connection,
                        params: request.params,
                        result: result
                    });
                }
            });

            return deferred.promise;
        }
        ,

        /**
         * 获取所有数据
         * 实现并行操作
         * @param request
         * @returns {*|Promise|promise}
         */
        fetchDataSet: function (request) {
            var item,
                value,
                promises = [],
                deferred = Q.defer();

            LOGGER.info("==>   fetchDataSet");
            for (item in request.params) {
                value = {
                    connection: request.connection,
                    params: {
                        tableName: item,
                        execSQL: request.params[item].sql,
                        values: request.params[item].values
                    }
                };

                promises.push(handler.fetchList(value));
            }

            Q.all(promises)
                .then(
                    function (result) {
                        var final = {};

                        LOGGER.info("==>  Q.all  ==>  callback");
                        result.forEach(function (element) {
                            final[element.tableName] = JSON.stringify(element.result);
                        });

                        deferred.resolve({
                            connection: request.connection,
                            result: final
                        });
                    },
                    function (error) {
                        deferred.reject(error);
                    }
                );

            return deferred.promise;
        },

        /**
         * 设置数据集
         * @param request
         * @returns {*|promise|Promise}
         */
        setColumnData: function (request) {
            var promise,
                deferred = Q.defer();

            promise = Q(request);
            LOGGER.info("==>   setColumnData | CheckResult: " + request.params.checkResult);
            if (request.params.checkResult) {
                promise = promise.then(handler.updateBasicInfo);
            }

            return promise;
        },

        /**
         * 扫尾 - 释放连接
         * @param request
         * @returns {*|Promise|promise}
         */
        cleanup: function (request) {
            var deferred = Q.defer();

            LOGGER.info("==>   cleanup");
            request.connection.release();
            deferred.resolve({
                code: CODE.successCode,
                msg: request.result
            });

            return deferred.promise;
        },

        /**
         * 扫尾 - 深度清理
         * 释放连接
         * 删除临时文件
         * @param request
         * @returns {*|Promise|promise}
         */
        deepClean: function (request) {
            var deferred = Q.defer();

            LOGGER.info("==>   deepClean");
            request.connection.release();
            if (request.params.hasOwnProperty("gallery") && request.params.gallery.length > 0) {
                FILESYSTEM
                    .batchRemove(request.params.gallery, "temp")
                    .then(
                        function (result) {
                            deferred.resolve({
                                code: CODE.successCode,
                                msg: result.msg
                            });
                        },
                        function (err) {
                            deferred.reject({
                                code: CODE.failedCode,
                                msg: err.msg
                            });
                        }
                    );
            } else {
                deferred.resolve({
                    code: CODE.successCode,
                    msg: request.result
                });
            }

            return deferred.promise;
        },

        /**
         * 错误处理
         * 如果不释放链接，当连接数达connectionLimit后，会无法获取新链接，而发生死锁
         * @param request
         * @param response
         */
        onReject: function (request, response) {
            LOGGER.info("==>   onReject - release connection");
            if (request.hasOwnProperty('connection')) {
                request.connection.release();
                response({
                    code: request.code,
                    msg: request.errMsg
                });
            } else {
                response({
                    code: CODE.unknownErrorCode,
                    msg: '发生未知错误'
                });
            }
        }
        ,

        /**
         * 错误处理 - 带回滚
         * @param request
         * @param response
         */
        onRejectWithRollback: function (request, response) {
            LOGGER.info("==>   onRejectWithRollback");
            if (request.hasOwnProperty('connection')) {
                request.connection.rollback(function () {
                    LOGGER.info("==>   onRejectWithRollback    ==>     rollback");
                    request.connection.release();
                });
                response({
                    code: request.code,
                    msg: request.errMsg
                });
            } else {
                response({
                    code: CODE.unknownErrorCode,
                    msg: '发生未知错误'
                });
            }
        }
        ,

        /**
         * 转化时间格式
         * 将 iso-8601 datetime 转换成 MySQL 可识别的 datetime
         * @param request
         * @returns {Promise|*|promise}
         */
        transformRequest: function (request) {
            var deferred = Q.defer();

            LOGGER.info("==>   transformRequest");
            Date.prototype.format = FORMAT.format;
            request.body.information.founding = new Date(request.body.information.founding).format("yyyy-MM-dd");
            LOGGER.info(request.body.information);

            deferred.resolve(request);

            return deferred.promise;
        }
        ,

        transformResponse: function (request) {
            var i,
                length,
                deferred = Q.defer();

            LOGGER.info("==>   transformResponse");
            for (i = 0, length = request.result.length; i < length; i++) {
                LOGGER.info(request.result[i]);
                if (request.result[i].hasOwnProperty("founding")) {
                    Date.prototype.format = FORMAT.format;
                    request.result[i].founding = new Date(request.result[i].founding).format("yyyy-MM-dd");
                    LOGGER.info(request.result[i].founding);
                }
            }

            deferred.resolve({
                connection: request.connection,
                result: request.result
            });

            return deferred.promise;
        }
    }
;

module.exports = handler;
