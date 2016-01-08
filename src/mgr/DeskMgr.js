var Desk = require('../model/Desk.js'),
 	util = require('../util/Util.js'),
	offline = require('../mgr/OfflinePlayerMgr.js');
//游戏分桌管理器
var DeskMgr = function (){
	this.desks = {};
	this.currentNo = 0;
};

//加入新玩家并分配桌号,并设置玩家的桌号和座位号
DeskMgr.prototype.playerJoin = function (player){
	var self = this;
	if(self.size() === 0){//没有任何桌位
		self.create(player);
	} else {//有桌位，进行匹配
		//先看是否存在于离线列表中
		var target = offline.find(player.uid);
		if(target){
			player.deskNo = target.deskNo;
			player.seatNo = target.seatNo;
			self.desks[player.deskNo].seats[player.seatNo].status = util.PLAYER_STATUS_NORMAL;
            if(self.desks[player.deskNo].seats[player.seatNo].timer){
                clearTimeout(self.desks[player.deskNo].seats[player.seatNo].timer);
                self.desks[player.deskNo].seats[player.seatNo].timer = null;
            }
			offline.remove(player.uid);
			return;
		}
		//寻找当前是否有空位
		for (var tb in self.desks) {
			if(self.desks[tb].size() < 3){
				for (var p in self.desks[tb].seats) {
					if(!self.desks[tb].seats[p]){
						self.desks[tb].seats[p] = player;
						player.seatNo = p;
						break;
					}
				}
				player.deskNo = self.desks[tb].deskNo;
				break;
			}
		}
		if(!player.deskNo){//没有找到需要开新的桌位
			self.create(player);
		}
	}
};

/**
 * 返回指定玩家对于该玩家的桌位信息
 * @method deskInfo
 * @param  {[type]} player [description]
 * @return {[type]}        [description]
 */
DeskMgr.prototype.deskInfo = function (player){
	return this.desks[player.deskNo].seats;
};

//开一张新桌,并返回桌号
DeskMgr.prototype.create = function(player){
	var self = this,
		deskNo = 'tb' + ( ++ self.currentNo)
		seatNo = 'p1';
	self.desks[deskNo] = new Desk(deskNo);
	player.deskNo = deskNo;
	player.seatNo = seatNo;
	self.desks[deskNo].seats[seatNo] = player;
};

//根据socketid获取用户信息
DeskMgr.prototype.getPlayerBySocketId = function(id){
	var self = this;
	for(var sn in self.desks){
		for(var p in self.desks[sn].seats){
			if(self.desks[sn].seats[p] && self.desks[sn].seats[p].socketId === id){
				return self.desks[sn].seats[p];
			}
		}
	}
	return null;
};

/**
 * 下一位玩家的座位
 * @method function
 * @param  {String} seatNo 要判断的座位号
 * @return {String}        下一个座位号
 */
DeskMgr.prototype.nextSeatNo = function(seatNo){
	if(seatNo === 'p1'){
		return 'p2';
	} else if(seatNo === 'p2'){
		return 'p3';
	} else {
		return 'p1';
	}
};

DeskMgr.prototype.deleteDesk = function(deskNo){
    delete this.desks[deskNo];
};

//返回当前总桌数
DeskMgr.prototype.size = function (){
	var self = this;
	var total = 0;
	for (var i in self.desks) {
		if (self.desks.hasOwnProperty(i)) {
			total ++;
		}
	}
	return total;
};
module.exports = DeskMgr;
