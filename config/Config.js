/**
 * 服务器的配置信息
 */
module.exports = {
    // 服务器名字与ID
    id : 1,
    name : 'GS1',

    // 监听的端口号
    port : 8900,

    // telnet 的端口号
    telnetPort : 5001,

    // cluster 进程数量
    clusterNum : 4,

    // mysql 配置(前缀必须为 mysqlDb)
    mysqlDb : {
        host : '127.0.0.1',
        port: 3306,
        database : 'landlord',
        user : 'root',
        password : 'abc123',
    },
}
