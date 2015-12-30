var mysqlDB = require('../util/Mysql.js');

var PlayerScoreDao = {};
var TABLE_ITEMS = '';
//查询所有
PlayerScoreDao.queryAll = function(){
    return mysqlDB.query('select * from player_score');
};

//查询名称
PlayerScoreDao.queryByName = function(name){
    return mysqlDB.query('select * from player_score where player_name = ?', [name]);
};

//查询名称
PlayerScoreDao.queryByUid = function(uid){
    return mysqlDB.query('select * from player_score where uid = ?', [uid]);
};

//更新分数
PlayerScoreDao.updateScore = function(uid, score){
    return mysqlDB.query('update player_score set score = ? where uid = ?', [score, uid]);
};

//插入
PlayerScoreDao.insert = function(obj){
    var sql = 'insert into player_score(uid, player_name, score) values(?, ?, ?)',
        params = [obj.uid, obj.name, obj.score];
    mysqlDB.query(sql, params).then(function(r){
        console.info(r);
    });
};
module.exports = PlayerScoreDao;
