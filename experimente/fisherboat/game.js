const game = {
  boat: {
    x: 100,
    y: 100,
    fishes: 0,
    direction: 'right',
    moveX: 0,
    moveY: 0,
    speed: 2,
    loadedFishes:0,
  },
  activeFishes:[],
  totalFishColected:0,
  currentLevel: 0,
  levellist: [
    {fishes:3, movingFishes:false, obstacles:2, obstaclenr:0, wind:false,bg:0, portxstart: 0, portxend: 100, portystart: 180, portyend: 250, backgroundnr: 0},
    {fishes:3, movingFishes:false, obstacles:4, obstaclenr:0, wind:false,bg:0, portxstart: 0, portxend: 100, portystart: 180, portyend: 250, backgroundnr: 0},
    {fishes:3, movingFishes:false, wind:false,bg:0, portxrelstart: 240, portxrelend: 300, portyrelstart: 70, portyrelend: 160, backgroundnr: 2, position: 'center'},
    {fishes:3, movingFishes:false, wind:false,bg:0, portxstart: 0, portxend: 100, portystart: 180, portyend: 250, backgroundnr: 0},
    {fishes:4, movingFishes:false, wind:false,bg:0, portxstart: 0, portxend: 100, portystart: 180, portyend: 250, backgroundnr: 0},
    {fishes:3, movingFishes:false, wind:false,bg:0, portxrelstart: -75, portxrelend: 5, portyrelstart: 110, portyrelend: 200, backgroundnr: 1, position: 'center'},
    {fishes:4, movingFishes:false, wind:false,bg:0, portxrelstart: -75, portxrelend: 5, portyrelstart: 110, portyrelend: 200, backgroundnr: 1, position: 'center'},
    {fishes:4, movingFishes:false, wind:false,bg:0, portxstart: 0, portxend: 100, portystart: 180, portyend: 250, backgroundnr: 0},
    {fishes:5, movingFishes:false, wind:false,bg:0, portxstart: 0, portxend: 100, portystart: 180, portyend: 250, backgroundnr: 0},
  ],
  keyDowns: {},
  pauseGame: false,
  init: async function(){
    await gui.loadFile('fisherboat/level.js')
    await this.initObstacles()
    this.boat.node = gui.createElement('div',{
      id: 'boat',
      innerHTML: `<img src="images/characters/boat.svg" onload="game.boat.width=this.clientWidth;game.boat.height=this.clientHeight">`
    })
    // this.boat.width = this.boat.node.clientWidth
    // this.boat.height = this.boat.node.clientHeight
    this.sea = gui.createElement('div',{id:'sea'})
    main.appendChild(this.sea)
    this.sea.appendChild(this.boat.node)
    this.addKeyControl()

    // this.round(0)
    let fish = new Image()
    main.appendChild(fish)
    fish.onload = function(){
      game.fish = {
        width: fish.clientWidth,
        height: fish.clientHeight,
        src:fish.src
      }
      main.removeChild(fish)
      game.initGame()
    }
    fish.src = 'images/characters/fish.svg'
  },
  initObstacles: function(){
    return new Promise(function(resolve,reject){
      game.obstacles = []
      for(let x=0;x<obstacles.length;x++){
        let obst = new Image()
        obst.onload = function(){
          game.obstacles.push(obst)
          if(game.obstacles.length>=obstacles.length)resolve()
        }
        obst.src = `data:img/png;base64,${obstacles[x]}`
      }
    })
  },
  initGame: async function(){
    let lvl = game.levellist[game.currentLevel]
    console.log('initialising game on level', game.currentLevel);
    this.activeLevel = lvl
    await this.initBackground(lvl.backgroundnr)
    console.log('background initialized', this.colisionmap);
    this.activeFishes = []
    for(let x=0;x<lvl.fishes;x++){
      this.addFish()
    }
    this.pauseGame=false
    this.boat.x=lvl.portxstart+1
    this.boat.y=lvl.portystart+1
    this.round(0)
  },
  checkGameEnd: async function(){
    let boatposx = game.boat.x + game.boat.width/2
    let boatposy = game.boat.y + game.boat.height/2
    if(boatposx > game.activeLevel.portxstart && boatposx < game.activeLevel.portxend
    && boatposy > game.activeLevel.portystart && boatposy < game.activeLevel.portyend
    && game.activeFishes.length == 0){
      //level won
      game.pauseGame = true
      await gui.showCongratulation(true, gui.standardCongratTime)
      game.currentLevel++
      if(game.currentLevel>=game.levellist.length)game.currentLevel--
      game.initGame()
    }
  },
  initBackground: async function(level){
    return new Promise(function(resolve,reject){

      console.log('initializing background');
      let b64 = b64backgrounds[level]
      if(!b64)b64 = b64backgrounds[0]

      // backgrounds = ['default']
      // let bg = backgrounds[level]
      // if(!bg)bg=backgrounds[0]
      let oldcanv = document.getElementById('backgroundmap')
      if(oldcanv)oldcanv.parentElement.removeChild(oldcanv)
      delete oldcanv
      let canvas = document.createElement('canvas')
      canvas.id='backgroundmap'
      canvas.width = game.sea.clientWidth
      canvas.height = game.sea.clientHeight
      sea.appendChild(canvas)
      var bgimg = new Image()
      var ctx = canvas.getContext('2d')
      game.backgroundcanvas = canvas
      game.backgroundctx = ctx
      // main.appendChild(bgimg)
      bgimg.onload = function(){
        // let raw = Buffer.from(bgimg.data).toString('base64');
        // let b64 = "data:" + bgimg.headers["content-type"] + ";base64,"+raw;
        // let img = new Image()
        // img.onload = function(){
          let cx=0; let cy=0;
          if(game.levellist[game.currentLevel].position=='center'){
            cx = canvas.width/2 - bgimg.width/2
            cy = canvas.height/2 - bgimg.height/2
          }
          ctx.drawImage(bgimg,cx,cy)
          game.backgroundData = ctx.getImageData(0,0,game.sea.clientWidth, game.sea.clientHeight)
          let data = game.backgroundData.data
          let colisionmap = []
          for(let x=0;x<=canvas.width;x++){
            colisionmap[x]=[]
            for(let y=0;y<=canvas.height;y++){
              if(y==0||y==canvas.height||x==0||x==canvas.width){
                colisionmap[x][y]=true
                continue
              }
              let posInBuffer = x*4+y*canvas.width*4
              let totalInBuffer = data[posInBuffer]+data[posInBuffer+1]+data[posInBuffer+2]+data[posInBuffer+3]
              colisionmap[x][y]=(totalInBuffer>0)
            }
          }
          game.colisionmap = colisionmap
          //remove all old obstacles
          let oldobstacles = document.querySelectorAll('#sea .obstacle')
          for(let ol=oldobstacles.length-1;ol>=0;ol--)sea.removeChild(oldobstacles[ol])
          //add obstacles if any:
          if(game.activeLevel.obstacles && game.obstacles[game.activeLevel.obstaclenr]){
            for(let obs = 0;obs<game.activeLevel.obstacles;obs++){
              let obstacle = game.addObstacle(game.obstacles[game.activeLevel.obstaclenr])
              for(let obx=obstacle.x;obx<obstacle.x+obstacle.width;obx++){
                for(let oby=obstacle.y;oby<obstacle.y+obstacle.height;oby++){
                  colisionmap[obx][oby]=true
                }
              }
            }
          }
          //remove port from colisionmap:
          if(game.activeLevel.position == 'center'){
            game.activeLevel.portxstart = Math.floor(canvas.width/2 + game.activeLevel.portxrelstart)
            game.activeLevel.portxend = Math.floor(canvas.width/2 + game.activeLevel.portxrelend)
            game.activeLevel.portystart = Math.floor(canvas.height/2 + game.activeLevel.portyrelstart)
            game.activeLevel.portyend = Math.floor(canvas.height/2 + game.activeLevel.portyrelend)
          }
          let pxstart = game.activeLevel.portxstart
          let pxend = game.activeLevel.portxend
          let pystart = game.activeLevel.portystart
          let pyend = game.activeLevel.portyend
          // if(game.activeLevel.position == 'center'){
          //   pxstart += Math.floor(canvas.width/2)
          //   pxend += Math.floor(canvas.width/2)
          //   pystart += Math.floor(canvas.height/2)
          //   pyend += Math.floor(canvas.height/2)
          // }
          // ctx.fillStyle('#FF0000')
          let pwidth=pxend-pxstart
          let pheight=pyend-pystart
          ctx.fillStyle='#FF000055'
          ctx.fillRect(pxstart,pystart,pwidth,pheight)
          // ctx.fillRect(10,10,100,100)
          for(let px=pxstart;px<pxend;px++){
            for(let py=pystart;py<pyend;py++){
              colisionmap[px][py]=false
            }
          }
          game.colisionmap=colisionmap
          resolve(true)
          // }
          // img.src = b64
        }
        bgimg.src = `data:img/png;base64,${b64}`
        // bgimg.src = 'fisherboat/'+bg+'.png'
        // let raw = ``
    })
  },
  checkColisionMap: function(colisionobj){
    let xmax=colisionobj.x+colisionobj.width
    let ymax=colisionobj.y+colisionobj.height
    // console.log(colisionobj.x,colisionobj.width);
    for(let x=colisionobj.x;x<xmax;x++){
      for(let y=colisionobj.y;y<ymax;y++){
        if(game.colisionmap[x]===undefined || game.colisionmap[x][y]===undefined)return true //outside of map

        if(colisionobj.map){
          if(colisionobj.map[x][y] && game.colisionmap[x][y])true
        }else{
          if(game.colisionmap[x][y])return true
        }
      }
    }
    return false
  },
  addObstacle: function(obstimg){
    let obstacle = {
      x: Math.floor(Math.random()*game.backgroundcanvas.width),
      y: Math.floor(Math.random()*game.backgroundcanvas.height),
      width:obstimg.width,
      height: obstimg.height
    }
    let failedtrys = 0
    while(this.checkColisionMap(obstacle)){
      console.log('generating random obstacle');
      obstacle = {
        x: Math.floor(Math.random()*game.backgroundcanvas.width),
        y: Math.floor(Math.random()*game.backgroundcanvas.height),
        width:obstimg.width,
        height: obstimg.height
      }
      failedtrys++
      if(failedtrys>100)break;
    }
    obstacle.image = new Image()
    obstacle.image.src = obstimg.src
    obstacle.image.classList.add('obstacle')
    obstacle.image.style.left = obstacle.x+'px'
    obstacle.image.style.top = obstacle.y+'px'
    this.sea.appendChild(obstacle.image)
    return obstacle
  },
  addFish: function(){
    let fish = {
      x: Math.floor(Math.random()*game.backgroundcanvas.width),
      y: Math.floor(Math.random()*game.backgroundcanvas.height),
      width:game.fish.width,
      height: game.fish.height
    }
    let failedtrys = 0
    while(this.checkColisionMap(fish)){
      console.log('generating random fish');
      fish = {
        x: Math.floor(Math.random()*game.backgroundcanvas.width),
        y: Math.floor(Math.random()*game.backgroundcanvas.height),
        width:game.fish.width,
        height: game.fish.height
      }
      failedtrys++
      if(failedtrys>100)break;
    }
    fish.image = new Image()
    fish.image.src = game.fish.src
    fish.image.classList.add('fish')
    fish.image.style.left = fish.x+'px'
    fish.image.style.top = fish.y+'px'
    this.sea.appendChild(fish.image)
    game.activeFishes.push(fish)
  },
  checkFishColision: function(){
    for(let x=0;x<this.activeFishes.length;x++){
        let fish = this.activeFishes[x]
        let fishposx = fish.x + (fish.width/2)
        let fishposy = fish.y + (fish.height/2)
        if(fishposx > game.boat.x && fishposx < game.boat.x+game.boat.width
        && fishposy > game.boat.y && fishposy < game.boat.y+game.boat.height){
          console.log('catched a fish');
          game.sea.removeChild(fish.image)
          this.activeFishes.splice(x,1)
          break;
        }
    }
  },
  round: function(timestamp){
    if(this.pauseGame)return
    window.requestAnimationFrame(game.reqAnFrame)
    let keyinput = this.getKeyInput()
    if(keyinput.pauseGame || keyinput.abortGame)return
    this.boat.node.className = keyinput.direction
    // this.boat.direction = keyinput.direction
    // this.boat.moveX = keyinput.moveX
    // this.boat.moveY = keyinput.moveY
    let newx = this.boat.x+(keyinput.moveX * this.boat.speed)
    let newy = this.boat.y+(keyinput.moveY * this.boat.speed)
    //check for colision:
    if(this.checkColisionMap({x:newx,y:newy,width:this.boat.width,height:this.boat.height})){
      return
    }
    this.boat.x = newx
    this.boat.y = newy
    this.boat.node.style.left = this.boat.x + 'px'
    this.boat.node.style.top = this.boat.y + 'px'
    this.checkFishColision()
    this.checkGameEnd()
  },
  reqAnFrame: function(timestamp){
    game.round(timestamp)
  },
  getKeyInput: function(){
    if(this.keyDowns[' '])return {pauseGame:true}
    if(this.keyDowns.Escape)return {abortGame:true}
    let direction = ""
    let moveX = 0
    let moveY = 0
    game.gamepad = navigator.getGamepads()[0]
    if(this.keyDowns.ArrowUp ||
      (game.gamepad && game.gamepad.axes[1]<0)
      ){
      direction+='up'
      moveY = -1
    }else if(this.keyDowns.ArrowDown ||
      (game.gamepad && game.gamepad.axes[1]>0)
      ){
      direction+='down'
      moveY = 1
    }
    if(this.keyDowns.ArrowLeft ||
      (game.gamepad && game.gamepad.axes[0]<0)
      ){
      direction+='left'
      moveX = -1
    }else if(this.keyDowns.ArrowRight ||
      (game.gamepad && game.gamepad.axes[0]>0)
      ){
      direction+='right'
      moveX = 1
    }
    return {direction: direction, moveX:moveX, moveY: moveY}
  },
  logGamepadKeys: function(){
    game.gamepad = navigator.getGamepads()[0]
    if(!game.gamepad){
      console.log('no gamepad found');
      return
    }
    for(let x=0;x<game.gamepad.buttons.length;x++){
      if(!game.gamepad.buttons[x]){
        console.log('button '+x+' not found');
        break;
      }
      if(game.gamepad.buttons[x].pressed)console.log('button '+x+' pressed');
    }
    game.loggamepadtimer = setTimeout("game.logGamepadKeys()",10)
  },
  addKeyControl: function(){
    document.onkeydown = function(e){
      game.keyDowns[e.key] = true
    }
    document.onkeyup = function(e){
      delete game.keyDowns[e.key]
    }
    window.addEventListener("gamepadconnected", (e) => {
      console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
        if(game.gamepad){
          game.gamepad2 = e.gamepad
        }else{
          game.gamepad = e.gamepad
        }
    });
    window.addEventListener("gamepaddisconnected", (e) => {
      console.log("Gamepad disconnected from index %d: %s",
        e.gamepad.index, e.gamepad.id);
    });

  },

}

// game.init()


game.init()
