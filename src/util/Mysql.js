/**
 * @author chenx
 * @date 2015.11.20
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * mysql 数据库操作模块
 */

var mysql = require('mysql'),
    config = require('../../config/Config.js');


var Dao = function(){
    this._mysqlDb = null;
    this.init();
};

/* 内部函数 */

// post init 回调函数
Dao.prototype.init = function(){
    var self = this;
    // 连接所有配置的 mysql 服务器
    // 缓存连接池
    self._mysqlDb = mysql.createPool(config.mysqlDb);

    // 连接mysql
    console.log('连接 mysql 数据库中...');
    self._mysqlDb.getConnection(function(err, connection){
        if(err){
            console.error(err);
            return;
        }
        console.log('连接 mysql 数据库成功');
    });
};

/**
 * 执行 mysql 命令
 * @method MYSQL_D.query
 * @param {string} dbName - Config 配置文件中配置的 database
 * @param {string} sql - mysql sql
 *    比如 select * from test;
 */
Dao.prototype.query = function (sql, params){
    var self = this;
    return new Promise(function(resolve, reject){
        var dbPool = self._mysqlDb;
        if (!dbPool){
            reject(-1);
            return;
        }

        // 先取得一个 mysql 连接
        dbPool.getConnection(function(err, connection) {
            if (err){
                // 取连接失败
                console.error(err.stack);
                reject(err);
                return;
            }

            // 执行 mysql 语句
            connection.query(sql, params ? params : [], function(err, rows){
                // 执行完成，将连接移回 pool 中
                connection.release();
                if (err)
                    reject(err);
                else{
                    resolve(rows);
                }
            })
        });
    });
}


Dao.prototype.getDbPool = function (dbName){
    return _mysqlDb[dbName];
}

/**
 * 执行 mysql transaction 命令
 * @method MYSQL_D.transaction
 * @param {string} dbName - Config 配置文件中配置的 database
 * @param {string} sqlList - mysql sql list
 *    比如 ['update test set value = 1 where id =1;', 'update test set value = 2 where id = 2']
 * @param {function} callback - 回调函数
 */
Dao.prototype.transaction = function (sqlList, callback){
    return new Promise(function(resolve, reject){
        var dbPool = self._mysqlDb;
        if (!dbPool) {
            reject(-1);
            return;
        }

        // 先取得一个 mysql 连接
        dbPool.getConnection(function(err, connection) {
            if (err) {
                // 取连接失败
                error(err.stack);
                reject(err);
                return;
            }

            // 执行 mysql begin transaction 语句
            connection.beginTransaction(function(err) {
                if (err) {
                    // 取连接失败
                    error(err.stack);
                    reject(err);
                    return;
                }

                // 依次执行 sql 语句
                async.eachSeries(sqlList, function(sql, callback) {

                     // 执行 mysql 语句
                    connection.query(sql, function(err, rows){
                        callback(err, rows);
                    })
                }, function(err) {
                    if (err) {
                        // 有错误，回滚
                        connection.rollback(function() {
                            // 执行完成，将连接移回 pool 中
                            connection.release();

                            // 调用回调
                            reject(err);
                        });
                    }
                    else {
                        // 成功，提交
                        connection.commit(function(err) {
                            // 执行完成，将连接移回 pool 中
                            connection.release();

                            if (err)
                                reject(err);
                            else
                                resolve({});
                        });
                    }
                });
            });
        });
    });
}

/**
 * 与 transation 不同的是，总是执行 commit 操作
 * @method MYSQL_D.batchQuery
 * @param {string} dbName - Config 配置文件中配置的 database
 * @param {string} sqlList - mysql sql list
 *    比如 ['update test set value = 1 where id =1;', 'update test set value = 2 where id = 2']
 * @param {function} callback - 回调函数
 */
Dao.prototype.batchQuery = function (dbName, sqlList, callback){
    return new Promise(function(resolve, reject){
        var dbPool = _mysqlDb[dbName];
        if (!dbPool)
        {
            reject(-1);
            return;
        }

        // 先取得一个 mysql 连接
        dbPool.getConnection(function(err, connection) {
            if (err) {
                // 取连接失败
                error(err.stack);
                reject(err);
                return;
            }

            // 执行 mysql begin transaction 语句
            connection.beginTransaction(function(err) {
                if (err) {
                    // 取连接失败
                    error(err.stack);
                    reject(err);
                    return;
                }

                // 依次执行 sql 语句
                var tempErr;
                async.eachSeries(sqlList, function(sql, callback) {

                     // 执行 mysql 语句
                    connection.query(sql, function(err, rows){
                        if (err)
                            // 若有错误，缓存之
                            tempErr = err;

                        callback(null, rows);
                    })
                }, function(err) {

                    // 总是提交
                    connection.commit(function(e) {
                        // 执行完成，将连接移回 pool 中
                        connection.release();

                        if (tempErr)
                            reject(tempErr);
                        else if (e)
                            reject(e);
                        else
                            resolve({});
                    });
                });
            });
        });
    });
}

module.exports = new Dao();
