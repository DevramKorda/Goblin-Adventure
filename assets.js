//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Игрок.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================
function Player(dx, dy) {
	this.sx = {
		stay:       [2,6],
		goLeft:     [1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4],
		goRight:    [5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,8,8,8,8,8,8,8,8,8,8,8,8],
		jumpLeft:   9,
		jumpRight:  10,
		throwLeft:  11,
		throwRight: 12,
		hitedLeft:  13,
		hitedRight: 14,
		dead: [15,16]
	};
	this.sy = 0;
	this.sw = 32;
	this.sh = 32;
	this.dx = dx;
	this.dy = dy;
	this.dw = 32;
	this.dh = 32;

	this.hard = true;

  //Скорость
	this.Vx = 0;
	this.Vy = 0;

	//Падение, бег, бросок кинжала, подвергнут удару, мертв
	this.fall  = true;
	this.run   = false;
	this.throw = false;
	this.hited = false;
	this.dead  = false;

	//Здоровье
	this.hpCur  = 5;
	this.hpMax  = 5;	

  this.slideCountCur = 8;
  this.slideCountMax = 8;

	this.frameNum    = 0; //Начало отсчета кадров с нуля для сосояния бега
	this.throwNum    = 1; //Начало отсчета броска
	this.throwNumMax = 8;

	this.deathTimerCur = 90;    //для управления анимацией смерти
	this.deathTimerMax = 90;
	this.respawnTimerCur = 180; //отсрочка респавна после обнуления жизней
	this.respawnTimerMax = 180;

	//Удар
	this.swordHitMode = false;

	//Режим суперудара
	this.strikeMode    = false;   //Маркер состояния
	this.targStrikePos = null;    //Конечная точка движения
	
	//Ограничивающий прямоугольник
	this.left    = null;
	this.right   = null;	
	this.top     = null;
	this.bottom  = null;
	this.centerX = null;
	this.centerY = null;

	//Направление. Нужно для отпределения направления метания кинжала
	this.direction = {
		right: true,
		left:  false
	};

	//Состояние нажатия клавиш
	this.isKeyPressed = {
		left:  false,
		right: false,
		space: false,
		D:     false,
		E:     false,
		F:     false
	};
};

Player.prototype = {

	draw: function() {

		if (me.hited && !me.dead) {
			if (me.direction.left) {
				ctx.drawImage(img, me.sx.hitedLeft * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);
			} else {
				ctx.drawImage(img, me.sx.hitedRight * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);
			}
		}
		
		else if (!me.fall && !me.run && !me.throw && !me.dead) {
			if (me.direction.left) {
				ctx.drawImage(img, me.sx.stay[0] * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);
			} else {
				ctx.drawImage(img, me.sx.stay[1] * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);				
			}

			me.frameNum = 0;
		}
		
		else if (!me.fall && me.run && !me.throw && !me.dead) {
			if (me.direction.left) {			
				ctx.drawImage(img, me.sx.goLeft[me.frameNum] * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);
			} else {
				ctx.drawImage(img, me.sx.goRight[me.frameNum] * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);
			}

			me.frameNum = (me.frameNum + 1) % me.sx.goLeft.length;
		}

		else if (me.fall && !me.throw && !me.dead) {
			if (me.direction.left) {
				ctx.drawImage(img, me.sx.jumpLeft * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);
			} else {
				ctx.drawImage(img, me.sx.jumpRight * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);
			}

			me.frameNum = 0;
		}

		else if (me.throw && !me.dead) {
			if (me.direction.left) {
				ctx.drawImage(img, me.sx.throwLeft * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);				
			} else {
				ctx.drawImage(img, me.sx.throwRight * me.sw, me.sy, me.sw, me.sh, me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);
			}

			if (me.throwNum <= me.throwNumMax) {
				me.throwNum += 1;
			} else {
				me.throwNum = 0;
				me.throw = false;
			}

			me.frameNum = 0;
		}

		else if (this.dead) {

			if (this.deathTimerCur > 0) {
				this.deathTimerCur--;
				ctx.drawImage(img, this.sx.dead[0] * this.sw, this.sy, this.sw, this.sh, this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
			} else {
				ctx.drawImage(img, this.sx.dead[1] * this.sw, this.sy, this.sw, this.sh, this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
			}			
		}


		//Полноразмерная рамка
		//ctx.strokeStyle = 'white';
		//ctx.strokeRect(me.dx - eng.camera.x, me.dy - eng.camera.y, me.dw, me.dh);

		//ОП
		//ctx.strokeStyle = 'red';
		//ctx.strokeRect(me.left - eng.camera.x, me.top - eng.camera.y, me.right - me.left, me.bottom - me.top);
	},


	hitedCounter: function() {
		if (this.slideCountCur > 0) {
			this.slideCountCur -= 1;
		} else {
			this.hited = false;
			this.slideCountCur = this.slideCountMax;
			this.Vx = 0;
			this.direction.left = !this.direction.left;
			this.direction.right = !this.direction.right;			
		}
	},


	deathControl: function() {
		if (this.hpCur !== 0) return;

		if (!this.dead) {
			this.dead = true;   //чтобы началась анимация смерти
			this.hard = false;  //чтобы предметы пролетали насквозь
		}

		if (this.respawnTimerCur > 0) {
			this.respawnTimerCur--;
		} else {
			this.dead = false;
			this.hard = true;
			this.dx = respawnX;
			this.dy = respawnY;
			this.hpCur = this.hpMax;				
			this.deathTimerCur = this.deathTimerMax;
			this.respawnTimerCur = this.respawnTimerMax;
			onStart = false;

			for (var i in mapObjs) {
				if (mapObjs[i].breakable) {
					mapObjs[i].hard = true;
					mapObjs[i].broken = false;
					mapObjs[i].counter = mapObjs[i].counterMax;
					mapObjs[i].sx = sprites.unsafeBlock.sx;
				}
			}

		}			
	},


	move: function() {
		if (!this.dead || (this.dead && this.Vy > 0)) {
			this.dy += this.Vy;
		}

		if (this.dead) return;
		this.dx += this.Vx;	
	},


	//Определение состояния Игрока "бежит/стоит"
	runCondition: function() {
		if (!this.fall && (this.isKeyPressed.left || this.isKeyPressed.right)) {
			this.run = true;
		} else {
			this.run = false;
		}
	},


	grav: function() {
		//Выход из функции, если Игрок не в падении (т.е. на замле).
		if (!this.fall) return;

		//Падение под действием гарвитации.
		if (this.Vy === maxGravStep) return;
		if (this.Vy < maxGravStep) this.Vy += gravBoost;
		else this.Vy = maxGravStep;

		/*
			//отскок от пола
			if (this.dy + this.dh >= sth.dy) {
				this.dy = sth.dy - this.dh; //обеспчивает стабильную прыгучесть
				this.Vy *= -0.5;              //за счет этого осуществляется отскок
			}

			//остановка бесконечной затухающей прыгучести
			if (Math.abs(this.Vy) < 0.1*2 && this.dy + this.dh >= sth.dy) {
				this.Vy = 0;
				this.fall = false;
			}
		*/
	},


	//Рассчет координат ограничивающей рамки.
	calcBorderFrame: function() {
		this.left    = this.dx + 6;
		this.right   = this.dx + 26;
		this.top     = this.dy + 2;
		this.bottom  = this.dy + this.dh;
		this.centerX = (this.right - this.left)/2 + this.left;
		this.centerY = (this.bottom - this.top)/2 + this.top;		
	},

	//Получаем список объектов, с которыми столкнулся Игрок.
	getCollideObjects: function() {

		//чистим массив
		collideObjs = [];

		//заполняем его новыми объектами
		for (var i in mapObjs) {
			if (this.isCollide(mapObjs[i])) {

				collideObjs.push(mapObjs[i]);

				//Замена ненадежного блока на сломанный
				if (mapObjs[i].type === 'ground') {
					if (mapObjs[i].breakable) {

						if (this.bottom >= mapObjs[i].top && this.bottom <= mapObjs[i].top + maxGravStep) {
							if (mapObjs[i].id === sprites.unsafeBlock.id) {
								mapObjs[i].sx = sprites.brokenBlock.sx;
							} 
							else if (mapObjs[i].id === sprites.unsafeDblBlock.id) {
								mapObjs[i].sx = sprites.brokenDblBlock.sx;
							}

							mapObjs[i].broken = true;
						}

					}
				}

			}
		}

		if (collideObjs.length === 0) {
			this.fall = true;
		}
	},


	//Обнаружение столкновений Игрока с остальными объектами.
	isCollide: function(obj) {
		ctx.beginPath();
		ctx.rect(obj.left, obj.top, obj.right - obj.left, obj.bottom - obj.top);

		if ((ctx.isPointInPath(this.left, this.bottom)  ||
		     ctx.isPointInPath(this.right, this.bottom) ||
		     ctx.isPointInPath(this.left, this.top)     ||
		     ctx.isPointInPath(this.right, this.top)    ||
		     ctx.isPointInPath(this.left, this.top + (this.bottom-this.top)/2)  ||
		     ctx.isPointInPath(this.right,this.top + (this.bottom-this.top)/2)) && obj.hard) return true;

		return false;
	},


	//Обработка столкновений Игрока с объктами. *handleCollisions
	handleCollisions: function() {

		for (var i in collideObjs) {
			var obj = collideObjs[i];

			//================================
			//Если Игрок столкнулся с землей.
			//================================
			if (obj.type === 'ground' || obj.type === 'turret') {				
				
				//Случай 1.
				//Игрок над землей=======================================================
				if (this.bottom > obj.top && this.bottom <= obj.top + maxGravStep) {
										
					//Если Игрок падает. *1
					if (this.Vy >= 0) {
						this.dy = obj.top - this.dh;
						this.fall = false;           //остановка гравитации
						this.Vy = 0;                 //остановка гравитации						
					} else {
						this.fall = true;
					}							
				}
				//=======================================================================

				//Случай 2.
				//Игрок под землей=======================================================
				if (this.top < obj.bottom && this.top >= obj.bottom + jumpStep + 1 && this.Vy < 0) {

					this.dy = obj.bottom - (this.top - this.dy);
					this.Vy *= -1;
					this.fall = true;
					return; // *2
				}
				//=======================================================================

				//Случай 3.
				//Игрок слева от земли===================================================
				if (this.right > obj.left && this.right <= obj.left + strikeStep &&	
				  this.bottom > obj.top + maxGravStep && this.top < obj.bottom - maxGravStep) {

					this.dx = obj.left - (this.right - this.dx) - 1;
					this.strikeMode = false;

					if (this.Vy < 0) {
						this.fall = true;
					}
				}
				//=======================================================================

				//Случай 4.
				//Игрок справа от земли==================================================
				if (this.left < obj.right && this.left >= obj.right - strikeStep &&
				  this.bottom > obj.top + maxGravStep && this.top < obj.bottom - maxGravStep ) {

					this.dx = obj.right - (this.left - this.dx) + 1;
					this.strikeMode = false;

					if (this.Vy < 0) {
						this.fall = true;
					}
				}
				//=======================================================================
			}

			//================================
			//Если Игрок столкнулся с врагом.
			//================================
			if (obj.type === 'enemy') {
				this.hpCur = 0;
				/*
				if (obj.alive) {
					if (this.bottom <= obj.top + maxGravStep) {
						mapObjs[mapObjs.indexOf(obj)].alive = false;
						mapObjs[mapObjs.indexOf(obj)].hard  = false;
						this.Vy *= -0.55;
					} else {
						this.hited = true;

						if (this.hpCur > 0) {
							this.hpCur -= 1;
						}

						this.Vy = slidey;
						if (this.centerX > mapObjs[mapObjs.indexOf(obj)].right) {
							this.Vx = slidex;
						} else {
							this.Vx = -slidex;
						}

						mapObjs[mapObjs.indexOf(obj)].direction.left = !mapObjs[mapObjs.indexOf(obj)].direction.left;
					  mapObjs[mapObjs.indexOf(obj)].direction.right = !mapObjs[mapObjs.indexOf(obj)].direction.right;
					}
				}
				*/

			}

			//Столкновение с шипами
			else if (obj.type === 'spikes')	{
				
				if (!obj.condition.disable) {
					this.hpCur = 0;
				}
			}
		}
	}
};





//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Блок земли.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================
function Blocks(sx, sy, sw, dx, dy, id, breakable) {
	this.sx = sx;
	this.sy = sy;
	this.sw = sw;
	this.sh = 32;
	this.dx = dx;
	this.dy = dy;
	this.dw = sw;
	this.dh = 32;

	this.id        = id;
	this.type      = 'ground';
	this.hard      = true;

	this.breakable = breakable;
	this.broken    = false;     //поступь Игрока
	this.counter   = 120;        //обратный отсчет до развала
	this.counterMax = 120;

	//Ограничивающий прямоугольник.
	this.left   = null;
	this.right  = null;	
	this.top    = null;
	this.bottom = null;
};

Blocks.prototype = {

	draw: function() {
		//Блок
		if (this.hard) {
			ctx.drawImage(img, this.sx, this.sy, this.sw, this.sh, this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
		} else {
			ctx.drawImage(img, sprites.emptyFrame.sx, sprites.emptyFrame.sy, this.sw, this.sh, this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
		}

		//Ограничивающий прямоугольник
		//ctx.strokeStyle = 'red';
		//ctx.strokeRect(this.left - eng.camera.x, this.top - eng.camera.y, this.right - this.left, this.bottom - this.top);
	},

	//Рассчет координат ограничивающей рамки.
	calcBorderFrame: function() {
		this.left  = this.dx;
		this.right = this.dx + this.dw;
		this.top   = this.dy;

		if (this.id === sprites.fullBlock.id) {			
			this.bottom = this.dy + this.dh;
		} else {
			this.bottom = this.dy + (this.dh/2);
		}
	},

	breakHandle: function() {
		if (this.broken) {
			if (this.counter > 0) {
				this.counter -= 1;
			} else {
				this.hard = false;
			}
		}
	}
};





//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Подбираемое.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================
function Item(sx, sy, dx, dy, id) {
	this.sx = sx;
	this.sy = sy;
	this.sw = 32;
	this.sh = 32;
	this.dx = dx;
	this.dy = dy;
	this.dw = 32;
	this.dh = 32;

	this.id        = id;
	this.type      = 'item';
	this.hard      = false;
	this.collected = false;

	this.bordFrameCalculated = false;

	this.left   = null;
	this.right  = null;	
	this.top    = null;
	this.bottom = null;
};

Item.prototype = {
	draw: function() {
		//ctx.strokeStyle = 'red';
		//ctx.strokeRect(this.left - eng.camera.x, this.top - eng.camera.y, this.right-this.left, this.bottom-this.top);

		ctx.drawImage(img,this.sx,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh);	
	},

	collection: function() {
		this.sx = sprites.emptyFrame.sx;
		this.sy = sprites.emptyFrame.sy;

		this.collected = true;
	},

	calcBorderFrame: function() {
		this.left   = this.dx + 10;
		this.right  = this.dx + this.dw - 10;
		this.top    = this.dy + 10;
		this.bottom = this.dy + this.dh;

		this.bordFrameCalculated = true;
	}
};



//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Шипы.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================
function Spikes(dx, dy) {
	this.sx = {
		disable: 6,
		goUp:    [2,3,4],
		upside:  5,
		goDown:  [4,4,4,3,3,3,2,2,2]
	};
	this.sy = 160;
	this.sw = 32;
	this.sh = 32;
	this.dx = dx;
	this.dy = dy;
	this.dw = 32;
	this.dh = 32;

	this.type = 'spikes';
	this.hard = false;

	this.breakable = false;

	this.frameNum = 0;

	this.counter = {
		underGroundPrim: 90,
		underGroundMod:  90,
		upperGroundPrim: 60,
		upperGroundMod: 60
	};

	this.condition = {
		disable: true,
		goUp: false,
		upside: false,
		goDown: false
	};

	//Ограничивающий прямоугольник.
	this.left = null;
	this.right = null;	
	this.top = null;
	this.bottom = null;
};

Spikes.prototype = {

	draw: function() {
		//Ограничивающая рамка
		//ctx.strokeStyle = 'red';
		//ctx.strokeRect(this.left - eng.camera.x, this.top - eng.camera.y, this.right - this.left, this.bottom - this.top);

		//Шипы
		if      (this.condition.disable) {
			ctx.drawImage(img, this.sx.disable * this.sw, this.sy, this.sw, this.sh, 
												 this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
		}

		else if (this.condition.goUp) {
			ctx.drawImage(img, this.sx.goUp[this.frameNum] * this.sw, this.sy, this.sw, this.sh, 
												 this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
			this.frameNum += 1;
		}

		else if (this.condition.upside) {
			ctx.drawImage(img, this.sx.upside * this.sw, this.sy, this.sw, this.sh, 
												 this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
		}

		else {
			ctx.drawImage(img, this.sx.goDown[this.frameNum] * this.sw, this.sy, this.sw, this.sh, 
												 this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
			this.frameNum += 1;
		}				
	},

	handleStatus: function() {
		if (this.condition.disable) {
			if (this.counter.underGroundMod > 0) {
				this.counter.underGroundMod -= 1;
			} else {
				this.counter.underGroundMod = this.counter.underGroundPrim;

				this.condition.disable = false;
				this.condition.goUp    = true;
				this.hard              = true;
			}
		}

		else if (this.condition.goUp) {
			if (this.frameNum >= this.sx.goUp.length) {
				this.frameNum = 0;
				this.condition.goUp   = false;
				this.condition.upside = true;
			}
		}

		else if (this.condition.upside) {
			if (this.counter.upperGroundMod > 0) {
				this.counter.upperGroundMod -= 1;
			} else {
				this.counter.upperGroundMod = this.counter.upperGroundPrim;
				this.condition.upside = false;
				this.condition.goDown = true;
			}
		}

		else {
			if (this.frameNum >= this.sx.goDown.length) {
				this.frameNum = 0;
				this.condition.goDown  = false;
				this.condition.disable = true;
				this.hard              = false;
			}
		}
	},

	//Рассчет координат ограничивающей рамки.
	calcBorderFrame: function() {
		this.left = this.dx + 3;
		this.right = this.dx + this.dw - 3;
		this.top = this.dy + 13;
		this.bottom = this.dy + this.dh;
	}
};





//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Мина.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================
function Bomb(param) {
	this.sx = {
		charged : param.sx.charged,
		explode : param.sx.explode,
		destroyed : param.sx.destroyed
	},
	this.sy = param.sy;
	this.sw = 32;
	this.sh = 32;
	this.dx = param.dx;
	this.dy = param.dy;
	this.dw = 32;
	this.dh = 32;

	this.type = 'bomb';
	this.hard = true;
	this.damage = param.damage;
	this.hp = 2;

	this.cond = {
		charged : true,
		explode : false,
		destroyed : false
	};

	this.frameNum = 0;

	this.bordFrameCalculated = false;

  this.left = null;
	this.right = null;	
	this.top = null;
	this.bottom = null;
};

Bomb.prototype = {
	draw: function() {
		//ОП
		//ctx.strokeStyle = 'red';
		//ctx.strokeRect(this.left - eng.camera.x,this.top - eng.camera.y,this.right-this.left,this.bottom-this.top);

		//Непосредственно бонба
		if (this.cond.charged) ctx.drawImage(img,this.sx.charged*this.dw,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh)
		
		else if (this.cond.explode) {
			if (this.frameNum < this.sx.explode.length) {
				ctx.drawImage(img,this.sx.explode[this.frameNum]*this.dw,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh);
				this.frameNum++;
			} else {
				this.cond.explode = false;
				this.cond.destroyed = true;
			}
		}
		
		else if (this.cond.destroyed) {
			ctx.drawImage(img,this.sx.destroyed*this.dw,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh)
		}
	},

	calcBorderFrame: function() {
		if (this.bordFrameCalculated) return;

		else {	
			this.left = this.dx + 8;
			this.right = this.dx + this.dw - 8;
			this.top = this.dy - 32;
			this.bottom = this.dy + this.dh;
		}
		this.bordFrameCalculated = true;
	}
};





//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Турельный блок.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================
function TurretBlock(param) {
	this.sx = {
		sleep : param.sx.sleep,
		opening : param.sx.opening,
		opened : param.sx.opened
	};
	this.sy = param.sy;
	this.sw = 32;
	this.sh = 32;
	this.dx = param.dx;
	this.dy = param.dy;
	this.dw = 32;
	this.dh = 32;

	this.id = param.id;

	this.type = 'ground';
	this.hard = true;
	this.breakable = false;

	this.turretTrigered = false;

	this.cond = {
		sleep : true,
		opening : false,
		opened : false
	};

	this.frameNum = 0;

	this.sensFrameCalculated = false;
	this.sensLeft = null;
	this.sensRight = null;
	this.sensTop = null;
	this.sensBottom = null;

	this.bordFrameCalculated = false;
  	this.left = null;
	this.right = null;	
	this.top = null;
	this.bottom = null;
};

TurretBlock.prototype = {
	draw: function() {
		//ОП
		//ctx.strokeStyle = 'red';
		//ctx.strokeRect(this.left - eng.camera.x,this.top - eng.camera.y,this.right-this.left,this.bottom-this.top);
		//Сенсор
		//ctx.strokeStyle = 'lime';
		//ctx.strokeRect(this.sensLeft - eng.camera.x,this.sensTop - eng.camera.y,this.sensRight-this.sensLeft,this.sensBottom-this.sensTop);

		//Блок
		if (this.cond.sleep) {
			ctx.drawImage(img,this.sx.sleep*this.dw,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh);
		}

		else if (this.cond.opening) {
			ctx.drawImage(img,this.sx.opening[this.frameNum]*this.dw,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh);
			if (this.frameNum < this.sx.opening.length - 1)	{
				this.frameNum = (this.frameNum + 1) % this.sx.opening.length;
				
				//Включение турели
				if (this.sx.opening[this.frameNum] === 5 && !this.turretTrigered) {
					mapObjs.push(new Turret({
						sx : {
							activating : [9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12],
							active : 13,
							destroyed : 14
						},
						sy : 128,
						dx : this.dx,
						dy : this.dy - 32
					}));

					this.turretTrigered = true;
				}		

			}
			else {
				this.cond.opening = false;
				this.cond.opened = true;
			}
		}

		else if (this.cond.opened) {
			ctx.drawImage(img,this.sx.opened*this.dw,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh);
		}

		},	

	calcBorderFrame: function() {
		if (this.bordFrameCalculated && this.sensFrameCalculated) return;
		else {	
			this.left = this.dx;
			this.right = this.dx + this.dw;
			this.top = this.dy;
			this.bottom = this.dy + this.dh;

			this.sensLeft = this.dx - 192;
			this.sensRight = this.dx + this.dw + 192;
			this.sensTop = this.dy - 64;
			this.sensBottom = this.dy;
		}
		this.bordFrameCalculated = true;
		this.sensFrameCalculated = true;
	}
};





//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                      Турель.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================111
function Turret(param) {
	this.sx = {
		activating : param.sx.activating,
		active : param.sx.active,
		destroyed : param.sx.destroyed
	};
	this.sy = param.sy;
	this.sw = 32;
	this.sh = 32;
	this.dx = param.dx;
	this.dy = param.dy;
	this.dw = 32;
	this.dh = 32;

	this.type = 'turret';
	this.hard = true;

	this.hp = 10;

	this.cond = {
		activating : true,
		active : false,
		destroyed : false
	};

	this.timer = {
		reloadCur : 120,
		reloadMax : 120,
		launchCur : 30,
		launchMax : 45,
		launchesCur : 3,
		launchesMax : 3
	};

	this.frameNum = 0;

	this.bordFrameCalculated = false;
  	this.left = null;
	this.right = null;	
	this.top = null;
	this.bottom = null;
	this.centerX = null;
};

Turret.prototype = {
	draw: function() {
		//ОП
		//ctx.strokeStyle = 'red';
		//ctx.strokeRect(this.left - eng.camera.x,this.top - eng.camera.y,this.right-this.left,this.bottom-this.top);

		//Турелька
		if (this.cond.activating) {
			ctx.drawImage(img,this.sx.activating[this.frameNum]*this.dw,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh);
			
			if (this.frameNum < this.sx.activating.length - 1) {
				this.frameNum++;
			} else {
				this.cond.activating = false;
				this.cond.active = true;
			}
		}

		else if (this.cond.active) {
			ctx.drawImage(img,this.sx.active*this.dw,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh);
		}

		else if (this.cond.destroyed) {
			ctx.drawImage(img,this.sx.destroyed*this.dw,this.sy,this.sw,this.sh,this.dx - eng.camera.x,this.dy - eng.camera.y,this.dw,this.dh);
		};
	},

	launchControl: function(player) {
		if (me.dead) return;
		if (this.cond.active) {
			
			if (this.timer.launchesCur > 0) {
				if (this.timer.launchCur > 0) {
					this.timer.launchCur -= 1;
					//console.log(this.timer.launchCur);
				} else {					
					this.timer.launchesCur -= 1;
					this.timer.launchCur = this.timer.launchMax;

					if (this.centerX > me.centerX) 
						daggerObjs.push(new Dagger(this.dx-32, this.dy, -(daggerStep), 'rocket'));
					else
						daggerObjs.push(new Dagger(this.dx+32, this.dy, (daggerStep), 'rocket'));
				}
			} else {				
				if (this.timer.reloadCur > 0) {
					this.timer.reloadCur -= 1; 
				} else {
					this.timer.reloadCur = this.timer.reloadMax;
					this.timer.launchesCur = this.timer.launchesMax;
				}
			}		

		}
	},

	calcBorderFrame: function() {
		if (this.bordFrameCalculated) return;
		else {	
			this.left = this.dx + 4;
			this.right = this.dx + this.dw - 4;
			this.top = this.dy + 18;
			this.bottom = this.dy + this.dh;
			this.centerX = this.left + (this.right-this.left)/2;
		}
		this.bordFrameCalculated = true;
	}
};




//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Враг. Жук.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================
function Bug(dx, dy, dirLeft, dirRight) {
	this.sx = {
		goLeft:   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		goRight:  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
		ripLeft:  4,
		ripRight: 5
	};
	this.sy = 96;
	this.sw = 32;
	this.sh = 32;
	this.dx = dx;
	this.dy = dy;
	this.dw = 32;
	this.dh = 32;

	this.type = 'enemy';
	this.hard = true;
	this.enemyType = 'bug';

	this.alive = true;

	this.deathCounter = 120;

	this.frameNum = 0;

	//Контроль здоровья
	this.hp = 2;        //изначальное кол-во жизней
	this.hpUpd = 2;     //обновленное кол-во жизней

  //Движение
	this.Vx = horStep + 1; //было +0.4
	this.direction = {
		left: dirLeft,
		right: dirRight
	};

	//Движение в рижме патруля
	this.leftPos = null;	//координата крайней левой точки патрулируемого пространства
	this.rightPos = null; //координата крайней правой точки патрулируемого пространства
	
	//Ограничивающий прямоугольник
	this.left = null;
	this.right = null;	
	this.top = null;
	this.bottom = null;
};

Bug.prototype = {

	draw: function() {

		//Полноразмерная рамка
		//ctx.strokeStyle = 'white';
		//ctx.strokeRect(this.dx, this.dy, this.dw, this.dh);		

		//Область патруля
		//ctx.strokeStyle = 'lime';
		//ctx.strokeRect(this.leftPos - eng.camera.x, this.top - eng.camera.y, this.rightPos - this.leftPos + this.dw, 
									 //this.bottom - this.top);

		//Ограничивающий прямоугольник
		//ctx.strokeStyle = 'red';
		//ctx.strokeRect(this.left - eng.camera.x, this.top - eng.camera.y, this.right - this.left, this.bottom - this.top);

		//Жук
		if (this.direction.left) {
			if (this.alive) {
				ctx.drawImage(img, this.sx.goLeft[this.frameNum] * this.sw, this.sy, this.sw, this.sh, 
										       this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
			} else {
				ctx.drawImage(img, this.sx.ripLeft * this.sw, this.sy, this.sw, this.sh, 
										       this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
			}
		} else {
			if (this.alive) {
				ctx.drawImage(img, this.sx.goRight[this.frameNum] * this.sw, this.sy, this.sw, this.sh, 
										       this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
			} else {
				ctx.drawImage(img, this.sx.ripRight * this.sw, this.sy, this.sw, this.sh, 
										       this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
			}
		}

		this.frameNum = (this.frameNum + 1) % this.sx.goLeft.length;
	},

	move: function() {
		if (this.alive) {
			if (this.direction.left) {
				if (this.dx > this.leftPos) {
					this.dx -= this.Vx;
				} else {
					this.direction.left  = false;
					this.direction.right = true;
					this.frameNum        = 0;
				}
			} else {
				if (this.dx < this.rightPos) {
					this.dx += this.Vx;
				} else {
					this.direction.left  = true;
					this.direction.right = false;
					this.frameNum        = 0;
				}
			}
		} else {
			this.Vx = 0;
		}	
	},

	countFrontiers: function() {
		if (this.leftPos == null && this.rightPos == null) {
			this.leftPos = this.dx - this.sw*2;
			this.rightPos = this.dx + this.sw*2;
		}
	},	

	calcBorderFrame: function() {
		this.left = this.dx + 3;
		this.right = this.dx + this.dw - 3;
		this.top = this.dy + 17;
		this.bottom = this.dy + this.dh;
	},

	removeThis: function() {
		if (!this.alive) {
			if (this.deathCounter > 0) {
				this.deathCounter -= 1;
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}
};





//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Кинжал.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================

function Dagger(dx, dy, Vx, subType) {
	this.sx = {
		daggerL : 0,
		daggerR : 32,
		rocketL : 480,
		rocketR : 512,
		break : [0,0,1,1,2,2,3,3,4,4,5,5,6,6]
	};
	this.sy = {
		solid : 160,
		broken : 192
	};
	this.sw = 32;
	this.sh = 32;
	this.dx = dx;
	this.dy = dy;
	this.dw = 32;
	this.dh = 32;

	this.type = 'dagger';
	this.subType = subType;
	this.hard = true;
	this.delete = false;

	this.frameNum = 0;

  //Скорость.
	this.Vx = Vx;
	
	//Ограничивающий прямоугольник.
	this.left = null;
	this.right = null;	
	this.top = null;
	this.bottom = null;

};

Dagger.prototype = {

	draw: function() {
		if (this.hard) {

			//Кинжал
			if (this.subType === 'dagger') {
				//летит влево
				if (this.Vx < 0) {
					ctx.drawImage(img, this.sx.daggerL, this.sy.solid, this.sw, this.sh, 
										         this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
				} else /*летит вправо*/{
					ctx.drawImage(img, this.sx.daggerR, this.sy.solid, this.sw, this.sh, 
										         this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
				}
			}

			//Ракета
			if (this.subType === 'rocket') {
				//летит влево
				if (this.Vx < 0) {
					ctx.drawImage(img, this.sx.rocketL, this.sy.solid, this.sw, this.sh, 
										         this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
				} else /*летит вправо*/{
					ctx.drawImage(img, this.sx.rocketR, this.sy.solid, this.sw, this.sh, 
										         this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);
				}
			}
			
			//ОП
			//ctx.strokeStyle = 'red';
			//ctx.strokeRect(this.left - eng.camera.x, this.top - eng.camera.y, this.right - this.left, this.bottom - this.top);	
		
		} else {

			ctx.drawImage(img, this.sx.break[this.frameNum] * this.sw, this.sy.broken, this.sw, this.sh, 
										     this.dx - eng.camera.x, this.dy - eng.camera.y, this.dw, this.dh);

			if (this.frameNum < this.sx.break.length - 1) {
				this.frameNum++;
			} else {
				this.delete = true;
			}

		}		
	},

	move: function() {
		this.dx += this.Vx;
	},	

	calcBorderFrame: function() {
		this.left = this.dx + 5;
		this.right = this.dx + this.dw - 5;
		this.top = this.dy + 10;
		this.bottom = this.dy + this.dh - 10;
	},

	handleCollisions: function(it) {
		for (var i in mapObjs) {
			if (this.isCollide(mapObjs[i])) {

				if (mapObjs[i].type === 'enemy') {

					this.hard = false;
					this.Vx = 0;

					/*
					if (this.hard) {
						if (mapObjs[i].hpUpd > 1) {
							mapObjs[i].hpUpd -= 1;
						} else {
							mapObjs[i].alive = false;
							mapObjs[i].hard = false;
						}	
					}
					*/
				}

				else if (mapObjs[i].type === 'turret') {					
					if (this.hard) {
						if (mapObjs[i].hp > 1) {
							mapObjs[i].hp -= 1;
						} else {
							mapObjs[i].cond.active = false;
							mapObjs[i].cond.destroyed = true;
							mapObjs[i].hard = false;
						}
					}
				}


				this.hard = false;
				this.Vx = 0;
			}  
		}

		for (var i in daggerObjs) {
			if (this.isCollide(daggerObjs[i])) {
				if (it !== daggerObjs[i] && daggerObjs[i].subType === 'rocket') {
					this.hard = false;
					this.Vx = 0;
				}
			}
		}

		for (var i in bombs) {
			if (this.isCollide(bombs[i])) {
				bombs[i].hard = false;
				bombs[i].cond.charged = false;
				bombs[i].cond.explode = true;
				boom01.play();

				this.hard = false;
				this.Vx = 0;

				/*
				if (this.hard) {
					if (bombs[i].hp > 0) {
						bombs[i].hp--;							
					} else if (bombs[i].hp===0){
						bombs[i].hard = false;
						bombs[i].cond.charged = false;
						bombs[i].cond.explode = true;
						boom01.play();
					}

					this.hard = false;
					this.Vx = 0;
				}
				*/


			}
		}

		if (this.isCollide(me)) {
			if (this.hard) {
				if (me.hpCur > 0) {
					me.hpCur -= 1;
				}

				this.hard = false;
				this.Vx = 0;
			}		
		}
	},

	isCollide: function(obj) {
		ctx.beginPath();
		ctx.rect(obj.left, obj.top, obj.right - obj.left, obj.bottom - obj.top);

		if ((ctx.isPointInPath(this.left, this.bottom)  ||
		     ctx.isPointInPath(this.right, this.bottom) ||
		     ctx.isPointInPath(this.left, this.top)     ||
		     ctx.isPointInPath(this.right, this.top)) && obj.hard) return true;

		return false;
	}
};





//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Клавиатура.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================
function keyBind(code) {
	if (code === 37) return 'left';
	if (code === 39) return 'right';
	if (code === 32) return 'space';
	if (code === 68) return 'D';
	if (code === 69) return 'E';
	if (code === 70) return 'F';	
};





//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                  Карта тайлов.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================
var sprites = {
	emptyFrame:     {sx: 192,	sy: 160, sw: 32,	sh: 32},

	block:          {sx:   0, sy:  32, sw:  32, sh: 32, id: 11},
	unsafeBlock:    {sx: 160, sy:  32, sw:  32, sh: 32, id: 12},  
	brokenBlock:    {sx:  32, sy:  32, sw:  32, sh: 32, id: 13},

	dblBlock:       {sx:   0, sy:  64, sw:  64, sh: 32, id: 21},
	unsafeDblBlock: {sx: 128, sy:  64, sw:  64, sh: 32, id: 22},
	brokenDblBlock: {sx:  64, sy:  64, sw:  64, sh: 32, id: 23},

	fullBlock:      {sx: 128, sy:  32, sw:  32, sh: 32, id: 31},
	woodenBlock:    {sx:  96,	sy:  32, sw:  32, sh: 32, id: 32},
	spikesBlock:    {sx:  64,	sy:  32, sw:  32, sh: 32, id: 33},	
	turretBlock:    {id: 34},

	mech1:          {sx:   0,	sy: 224, sw:  32, sh: 32, id: 41},
	mech2:          {sx:  32,	sy: 224, sw:  32, sh: 32, id: 42},
	mech3:          {sx:  64,	sy: 224, sw:  32, sh: 32, id: 43},
	potion:         {sx:  96,	sy: 224, sw:  32, sh: 32, id: 44},
	weapon:         {sx: 128,	sy: 224, sw:  32, sh: 32, id: 45},
	prill:          {sx: 160,	sy: 224, sw:  32, sh: 32, id: 46},

	hp5:            {sx:   0, sy: 256, sw: 120, sh: 16, id: 81},
	hp4:            {sx: 120, sy: 256, sw: 120, sh: 16, id: 82},
	hp3:            {sx: 240, sy: 256, sw: 120, sh: 16, id: 83},
	hp2:            {sx:   0, sy: 272, sw: 120, sh: 16, id: 84},
	hp1:            {sx: 120, sy: 272, sw: 120, sh: 16, id: 85},
	hp0:            {sx: 240, sy: 272, sw: 120, sh: 16, id: 86},

	statusMech0:    {sx: 192, sy: 288, sw:  64, sh: 16, id: 90},
	statusMech1:    {sx:   0, sy: 288, sw:  64, sh: 16, id: 87},
	statusMech2:    {sx:  64, sy: 288, sw:  64, sh: 16, id: 88},
	statusMech3:    {sx: 128, sy: 288, sw:  64, sh: 16, id: 89}
};





//==================================================================================
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                      Карта.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//==================================================================================

var map = [
[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,11, 4],
[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 4],
[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 4],
[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 4],
[4, 0, 0, 8, 8, 8,15, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 4],
[4,10, 0, 7, 7, 7, 5, 0, 3, 3, 5, 0,16, 3, 3, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
[4, 3,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
[4, 0, 1, 8, 8, 0, 0, 0, 0,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
[4, 0, 0, 7, 7, 3, 3, 3, 3, 1, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4], 
[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 8, 8, 0, 8, 8, 8, 4, 0, 0, 0, 0, 0, 0, 0, 4],
[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 2, 7, 7, 7, 0, 3, 3, 3, 3, 3, 0, 9, 4],
[4, 0, 0, 0,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4],
[4, 2, 4, 4, 4, 0, 0, 0, 0, 0, 8, 0, 8, 0, 8, 8, 8, 0, 8, 8, 8, 8, 8, 0, 0, 3, 0, 4],
[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 7, 4, 7, 4, 7, 7, 7, 4, 7, 7, 7, 7, 7, 4, 4, 4, 4, 4]
];


/*
var map = [
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0]
];
*/
