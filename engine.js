var eng = {

	//====================================================================
	//Создание объектов мира.
	//====================================================================
	createWorld: function() {

		//создание объктов карты
		for (var i in map) {
			var m = map[i];
			for (var j in map[i]) {
				//обычный блок
				if      (m[j]=== 1) {mapObjs.push(new Blocks(sprites.block.sx, sprites.block.sy, sprites.block.sw, 32 * j, 32 * i, sprites.block.id, false));}
				//ненадежный блок
				else if (m[j]===2) {mapObjs.push(new Blocks(sprites.unsafeBlock.sx, sprites.unsafeBlock.sy, sprites.unsafeBlock.sw, 32 * j, 32 * i, sprites.unsafeBlock.id, true));}
				//деревянный блок
				else if (m[j]===3) {mapObjs.push(new Blocks(sprites.woodenBlock.sx, sprites.woodenBlock.sy, sprites.woodenBlock.sw, 32 * j, 32 * i, sprites.woodenBlock.id, false));}
				//полноразмерный блок
				else if (m[j]===4) {mapObjs.push(new Blocks(sprites.fullBlock.sx, sprites.fullBlock.sy, sprites.fullBlock.sw, 32 * j, 32 * i, sprites.fullBlock.id, false));}
				//двойной блок
				else if (m[j]===5) {mapObjs.push(new Blocks(sprites.dblBlock.sx, sprites.dblBlock.sy, sprites.dblBlock.sw, 32 * j, 32 * i, sprites.dblBlock.id, false));}
				//двойной ненадежный блок
				else if (m[j]===6) {mapObjs.push(new Blocks(sprites.unsafeDblBlock.sx, sprites.unsafeDblBlock.sy, sprites.unsafeDblBlock.sw, 32 * j, 32 * i, sprites.unsafeDblBlock.id, true));}
				//блок с шипами
				else if (m[j]===7) {mapObjs.push(new Blocks(sprites.spikesBlock.sx, sprites.spikesBlock.sy, sprites.spikesBlock.sw, 32 * j, 32 * i, sprites.spikesBlock.id, false));}	
				

				//шипы
				else if (m[j]===8) {mapObjs.push(new Spikes(32 * j, 32 * i));}


				//1 часть механизма
				else if (m[j]===9) {itemObjs.push(new Item(sprites.mech1.sx, sprites.mech1.sy, 32 * j, 32 * i, sprites.mech1.id));}
				//2 часть механизма
				else if (m[j]===10) {itemObjs.push(new Item(sprites.mech2.sx, sprites.mech2.sy, 32 * j, 32 * i, sprites.mech2.id));}
				//3 часть механизма
				else if (m[j]===11) {itemObjs.push(new Item(sprites.mech3.sx, sprites.mech3.sy, 32 * j, 32 * i, sprites.mech3.id));}
				//эликсир здоровья
				else if (m[j]===12) {itemObjs.push(new Item(sprites.potion.sx, sprites.potion.sy, 32 * j, 32 * i, sprites.potion.id));}
				//оружие
				//else if (m[j] === 13) {itemObjs.push(new Item(sprites.weapon.sx, sprites.weapon.sy, 32 * j, 32 * i, sprites.weapon.id));}
				//олово
				//else if (m[j] === 14) {itemObjs.push(new Item(sprites.prill.sx, sprites.prill.sy, 32 * j, 32 * i, sprites.prill.id));}
				//мина
				else if (m[j]===15) {bombs.push(new Bomb({
					sx : {
						charged : 7,
						explode : [8,8,8,9,9,9,10,10,10,11,11,11,12,12,12,13,13,13],
						destroyed : 14
					},
					sy : 160,
					dx : 32 * j,
					dy : 32 * i,
					damage : 2
				}));}

				else if (m[j]===16) {mapObjs.push(new TurretBlock({
					sx : {
						sleep : 0,
						opening : [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7],
						opened : 7
					},
					sy : 128,
					dx : 32 * j,
					dy : 32 * i,
					id : sprites.turretBlock.id
				}));}
			}
		}

		//создание объекта "Игрок"		
		me = new Player(respawnX, respawnY);

		//создание объекта "Жук"
		mapObjs.push(new Bug(32 * 22, 32 * 12, true, false));
		mapObjs.push(new Bug(32 * 7, 32 * 15, true, false));		
		//mapObjs.push(new Bug(32 * 6, 32 * 10, true, false));

		//запуск игры
		//gameLoop = setInterval(game, frameRate);
		game();
	},



	//====================================================================
	//Камера.
	//====================================================================
	camera: {
		x : 0,
		y : 0,

		move : function(x, y) {
			this.x += x;
			this.y += y;
		},

		control: function() {
			//вывод камеры на старт
			if (!onStart) {
				if (me.dy - this.y > startPosY) {
					this.move(0, 8);
				}	
				if (me.dx - this.x < startPosX) {
					this.move(-8, 0);
				} 
				if (me.dy - this.y <= startPosY && me.dx - this.x >= startPosX) {
					onStart = true;
				}
			}

			//игровое поведение камеры
			if (onStart) {

				//по оси Y
				if (
					//поведение камеры вблизи границ карты
					(mapLowerBorder - this.y <= cnv.height - 32 && me.Vy > 0) ||
					(mapUpperBorder - this.y >= 32 && me.Vy < 0)
					  ) {
					this.move(0, 0);
				} else {
					//поведение камеры в центре карты
					if (me.dy - this.y >= upperBorder && me.dy - this.y <= lowerBorder) {
						this.move(0, 0);
					} else if (
						(me.dy - this.y > lowerBorder && me.Vy > 0) || 
						(me.dy - this.y < upperBorder && me.Vy < 0)
											) {
						this.move(0, me.Vy)
					}
				}

				//по оси X
				if (
					//поведение камеры вблизи границ карты
					(mapLeftBorder - this.x >= 32 && me.Vx < 0) || 
					(mapRightBorder - this.x <= cnv.width - 32 && me.Vx > 0) 
					  ) {
					this.move(0, 0);
				} else {
					//поведение камеры в центре карты
					if (me.dx - this.x >= leftBorder && me.dx - this.x <= rightBorder) {
						this.move(0, 0);
					} 
					else if ((me.dx - this.x < leftBorder && me.Vx < 0) || (me.dx - this.x > rightBorder && me.Vx > 0)) {
						this.move(me.Vx, 0);
					}
				}
			}
		}
	},



	//====================================================================
	//Получение координат курсора мыши.
	//====================================================================
	getMouseCoords: function(e) {
		mX = e.clientX - 8; //поправка на положение канваса в окне браузера
		mY = e.clientY - 8; //поправка на положение канваса в окне браузера
	},



	//=====================================================================
	//Тест коллизии.
	//=====================================================================
	isCollide: function(obj, subj) {
		ctx.beginPath();
		if (obj.id === sprites.turretBlock.id) {
			ctx.rect(obj.sensLeft, obj.sensTop, obj.sensRight - obj.sensLeft, obj.sensBottom - obj.sensTop);
		} else {
			ctx.rect(obj.left, obj.top, obj.right - obj.left, obj.bottom - obj.top);
		}

		if ((ctx.isPointInPath(subj.left, subj.bottom)  ||
		     ctx.isPointInPath(subj.right, subj.bottom) ||
		     ctx.isPointInPath(subj.left, subj.top)     ||
		     ctx.isPointInPath(subj.right, subj.top)    ||
		     ctx.isPointInPath(subj.left, subj.top + (subj.bottom-subj.top)/2)  ||
		     ctx.isPointInPath(subj.right, subj.top + (subj.bottom-subj.top)/2)) 
				 && (obj.hard || obj.type === 'item')) return true;

		return false;
	},



	//=====================================================================
	//Отбрасывание игрока при получении урона.
	//=====================================================================
	discardPlayer:  function(obj) {
		me.hited = true;
		me.Vy = slidey;
		if (me.centerX > obj.right) {
			me.Vx = slidex;
			me.direction.left = false;
			me.direction.right = true;
		} else {
			me.Vx = -slidex;
			me.direction.left = true;
			me.direction.right = false;
		}
	},



	//====================================================================
	//Отрисовка объектов мира (надо вызывать по отдельности).
	//====================================================================
	draw: {
		me: function() {
			me.getCollideObjects();
			me.handleCollisions();
			if (me.hited) me.hitedCounter();			
			me.grav();
			me.move();
			me.deathControl();    //вызов этой ф-ции дб именно после движений и перед рассчетом ОП
			me.calcBorderFrame();
			me.runCondition();
			me.draw();
		},
	
		map: function() {
			for (var i in mapObjs) {

				if (mapObjs[i].type === 'enemy') {

					mapObjs[i].countFrontiers();					

					if (mapObjs[i].removeThis()) {
						mapObjs.splice(i, 1);
						return;
					}
					
					mapObjs[i].calcBorderFrame();
					mapObjs[i].move();
				} 

				//контроль ломающихся блоков
				else if (mapObjs[i].type === 'ground' && mapObjs[i].breakable) {					
					mapObjs[i].breakHandle();
				}

				else if (mapObjs[i].type === 'spikes') {
					mapObjs[i].handleStatus();
				}

				//посчитаем ОП
				mapObjs[i].calcBorderFrame();

				if (mapObjs[i].id === sprites.turretBlock.id) {
					if (eng.isCollide(mapObjs[i], me)) {
						if (mapObjs[i].cond.sleep) {
							mapObjs[i].cond.sleep = false;
							mapObjs[i].cond.opening = true;
						}
					}
				}

				if (mapObjs[i].type === 'turret') mapObjs[i].launchControl();
				
				//нарисуем, хи-хи)
				mapObjs[i].draw();
			}
		},

		items: function() {
			for (var i in itemObjs) {

				if (!itemObjs[i].bordFrameCalculated) {
					itemObjs[i].calcBorderFrame();
				}

				if (!itemObjs[i].collected) {
					if (eng.isCollide(itemObjs[i], me)) {

						if (itemObjs[i].id !== sprites.potion.id) {
							itemObjs[i].collection();
							mechNum++;
						}

						if(itemObjs[i].id === sprites.potion.id && me.hpCur < me.hpMax) {							
							itemObjs[i].collection();
							me.hpCur += 1;							
						}
					}
				}				

				itemObjs[i].draw();

			}
		},

		bombs: function() {
			for (var i in bombs) {

				//Step 1
				bombs[i].calcBorderFrame();

				//Step 2
				//столкновения с Игроком
				if (eng.isCollide(bombs[i], me)) {
					bombs[i].hard = false;
					bombs[i].cond.charged = false;
					bombs[i].cond.explode = true;
					boom01.play();

					if (me.hpCur > bombs[i].damage-1) {
						me.hpCur -= bombs[i].damage;
					} else {
						me.hpCur = 0;
					}

					if (!me.hited) eng.discardPlayer(bombs[i]);
				}

				//столкновения с кинжалами
				/*
				for (var j in daggerObjs) {
					if (eng.isCollide(bombs[i], daggerObjs[j])) {
						if (daggerObjs[j].hard) {
							if (bombs[i].hp > 0) {
								bombs[i].hp--;							
							} else {
								bombs[i].hard = false;
								bombs[i].cond.charged = false;
								bombs[i].cond.explode = true;
								boom01.play();
							}
							
							daggerObjs[j].hard = false;
							daggerObjs[j].Vx = 0;
						}
					}
				}
				*/
				
				//Step 3
				bombs[i].draw();				
			}
		},

		/*
		turrets: function() {
			for (var i in turrets) {
				turrets[i].calcBorderFrame();
				turrets[i].draw();
				turrets[i].launchControl();
			}
		},
		*/

		daggers: function() {
			for (var i in daggerObjs) {				
				daggerObjs[i].calcBorderFrame();
				daggerObjs[i].handleCollisions(daggerObjs[i])
				daggerObjs[i].move();
				daggerObjs[i].calcBorderFrame();
				daggerObjs[i].draw();
				if (daggerObjs[i].delete) daggerObjs.splice(i, 1);
			}
		},

		cameraCoordGrid: function() {
			ctx.strokeStyle = 'white';
			ctx.strokeRect(0, upperBorder, cnv.width, lowerBorder - upperBorder);
			ctx.strokeStyle = 'white';
			ctx.strokeRect(leftBorder, 0, rightBorder - leftBorder, cnv.height);
		}
	},





	//=====================================================================
	//Строка статуса.
	//=====================================================================
  statusBar: {
  	drawHP: function() {
  		if (me.hpCur === 5) {ctx.drawImage(img,sprites.hp5.sx,sprites.hp5.sy,sprites.hp5.sw,sprites.hp5.sh,0,0,sprites.hp5.sw,sprites.hp5.sh);}
  		else if (me.hpCur === 4) {ctx.drawImage(img,sprites.hp4.sx,sprites.hp4.sy,sprites.hp4.sw,sprites.hp4.sh,0,0,sprites.hp4.sw,sprites.hp4.sh);}
  		else if (me.hpCur === 3) {ctx.drawImage(img,sprites.hp3.sx,sprites.hp3.sy,sprites.hp3.sw,sprites.hp3.sh,0,0,sprites.hp3.sw,sprites.hp3.sh);}
  		else if (me.hpCur === 2) {ctx.drawImage(img,sprites.hp2.sx,sprites.hp2.sy,sprites.hp2.sw,sprites.hp2.sh,0,0,sprites.hp2.sw,sprites.hp2.sh);}
  		else if (me.hpCur === 1) {ctx.drawImage(img,sprites.hp1.sx,sprites.hp1.sy,sprites.hp1.sw,sprites.hp1.sh,0,0,sprites.hp1.sw,sprites.hp1.sh);}
  		else if (me.hpCur === 0) {ctx.drawImage(img,sprites.hp0.sx,sprites.hp0.sy,sprites.hp0.sw,sprites.hp0.sh,0,0,sprites.hp0.sw,sprites.hp0.sh);}  		
  	},

  	drawMech: function() {
  		if (mechNum === 0)      {ctx.drawImage(img,sprites.statusMech0.sx,sprites.statusMech0.sy,sprites.statusMech0.sw,sprites.statusMech0.sh,0,16,sprites.statusMech0.sw,sprites.statusMech0.sh);}
  		else if (mechNum === 1) {ctx.drawImage(img,sprites.statusMech1.sx,sprites.statusMech1.sy,sprites.statusMech1.sw,sprites.statusMech1.sh,0,16,sprites.statusMech1.sw,sprites.statusMech1.sh);}
  		else if (mechNum === 2) {ctx.drawImage(img,sprites.statusMech2.sx,sprites.statusMech2.sy,sprites.statusMech2.sw,sprites.statusMech2.sh,0,16,sprites.statusMech2.sw,sprites.statusMech2.sh);}
  		else if (mechNum === 3) {ctx.drawImage(img,sprites.statusMech3.sx,sprites.statusMech3.sy,sprites.statusMech3.sw,sprites.statusMech3.sh,0,16,sprites.statusMech3.sw,sprites.statusMech3.sh);}
  	}
  },
	
	
	//=====================================================================
	//Обработка нажатия кливиш клавиатуры.
	//=====================================================================
	keyPressHandler: {

		//-----------------
		//Нажатие клавиши.
		//-----------------
		keyIsDown: function(e) {
			var code = keyBind(e.keyCode);

			//Движение ВЛЕВО. ------------------------------------------------------V
			if (code === 'left' && !me.hited) {

				me.Vx = -horStep;
				me.isKeyPressed.left = true;
				
				me.direction.right = false;
				me.direction.left  = true;

				step01.play();
			}
			//_______________________________________________________________________


			//Движение ВПРАВО. -----------------------------------------------------V
			if (code === 'right' && !me.hited) {

				me.Vx = horStep;
				me.isKeyPressed.right = true;

				me.direction.right = true;
				me.direction.left  = false;

				step01.play();
			}
			//_______________________________________________________________________


			//ПРЫЖОК. --------------------------------------------------------------V
			if (code === 'space' && !me.fall && !me.hited) {			
				me.Vy = jumpStep; //столько пикселей Игрок преодолевает за одну итерацию
				//me.fall = true;
				jump01.play();
			}
			//_______________________________________________________________________


			//КИНЖАЛ. --------------------------------------------------------------V
			if (code === 'D' && !me.isKeyPressed.D && !me.hited) {
				var dagDy = me.dy;
				me.isKeyPressed.D = true;
				me.throw = true;
				throw01.play();

				//Летит влево.
				if (me.direction.left) {					
					var dagDx = me.dx - me.dw;
					daggerObjs.push(new Dagger(dagDx, dagDy, -daggerStep, 'dagger'));
				} else {
					var dagDx = me.dx + me.dw;			
					daggerObjs.push(new Dagger(dagDx, dagDy, daggerStep, 'dagger'));
				}	
			}
			//_______________________________________________________________________


			//СУПЕРУДАР. -----------------------------------------------------------V
			if (code === 'F' && !me.isKeyPressed.F && !me.strikeMode && !me.fall &&
				  (me.isKeyPressed.left || me.isKeyPressed.right)) {

				me.isKeyPressed.F = true;
				me.strikeMode = true;

				if (me.direction.right) {
					me.targStrikePos = me.dx + maxStrikeDist;
				} else {
					me.targStrikePos = me.dx - maxStrikeDist;
				}
			}
			//_______________________________________________________________________


			//Удар МЕЧОМ. -----------------------------------------------------------V
			if (code ==='E' && !me.isKeyPressed.E) {
				me.isKeyPressed.E = true;
				me.swordHitMode = true;
			}
			//_______________________________________________________________________
		},


		//-----------------
		//Отжатие клавиши.
		//-----------------
		keyIsUp: function(e) {
			var code = keyBind(e.keyCode);

			//Отжим стрелки влево. ---------------V
			if (code === 'left') {
				if (!me.isKeyPressed.right) {				
					me.Vx = 0;
				}

				me.isKeyPressed.left = false;		
			}
			//_____________________________________


			//Oтжим стрелки вправо. --------------V
			if (code === 'right') {
				if (!me.isKeyPressed.left) {				
					me.Vx = 0;
				}

				me.isKeyPressed.right = false;		
			}
			//_____________________________________


			//Отжим кнопки D. --------------------V
			if (code === 'D') {
				me.isKeyPressed.D = false;
			}
			//_____________________________________
			

			//Отжим кнопки F. --------------------V
			if (code === 'F') {
				me.isKeyPressed.F = false;
			}
			//_____________________________________


			//Отжим кнопки E. --------------------V
			if (code === 'E') {
				me.isKeyPressed.E = false;
			}
			//_____________________________________
		}
	}
};