const game = {
  init: async function(){
    // this.level = 1
    //add levelcounter
    this.levelcounter = gui.addLevelcounter({
      maxLevel: 20,
      onLevelUp: function(){
        game.initRound()
      },
      onLevelDown: function(){
        game.initRound()
      }
    })
    await gui.loadFile('phoneticslistde.js')
    let wrapper = gui.createElement('div',{
      id: 'map'
    })
    let left = gui.createElement('div',{id:'left'})
    let right = gui.createElement('div',{id: 'right'})
    let drawmap = gui.createElement('canvas',{id:'drawmap'})
    wrapper.appendChild(left)
    wrapper.appendChild(right)
    main.appendChild(wrapper)
    this.wrapper = wrapper
    this.leftwrapper = left
    this.rightwrapper = right
    this.drawmap = drawmap
    this.plist = phoneticslist.givePairList()
    this.initRound()
    let bgcanvas = gui.createElement('canvas',{id:'bgcanvas'})
    this.bgcanvas = bgcanvas
    wrapper.appendChild(bgcanvas)
    wrapper.appendChild(drawmap)
    this.setCanvasSize()
    let bgctx = bgcanvas.getContext('2d')
    let ctx = drawmap.getContext('2d')
    this.ctx=ctx
    this.bgctx = bgctx
    wrapper.onmousemove = function(e){
      // if(!game.isdrawing)return
      if(game.isdrawing){
        // console.log('mousemove',game.isdrawing,e);
        game.ctx.fillRect(e.clientX,e.clientY,10,10)
      }
      // game.ctx.fillRect(e.)
    }
    wrapper.onmouseleave = function(e){
      game.abortDraw()
    }
    wrapper.onmouseup = function(e){
      console.log('mouseup on wrapper');
      game.abortDraw()
    }
    this.lines = []
  },
  initRound: function(level){
    let lvl = level || this.levelcounter.actLevel()

    let max = 3+Math.floor(lvl/4)
    let usedind = []
    let leftbuttons = []
    let rightbuttons = []

    for(let x=0;x<max;x++){
        let ind = Math.floor(Math.random()*this.plist.length)
        while(usedind.indexOf(ind)>-1)ind = Math.floor(Math.random()*this.plist.length)
        usedind.push(ind)
        let actlist = this.plist[ind]
        let leftind = 0
        let rightind = 0
        if(actlist.length>2){
          leftind = Math.floor(Math.random()*actlist.length)
          rightind = Math.floor(Math.random()*actlist.length)
          while(rightind==leftind)rightind = Math.floor(Math.random()*actlist.length)
        }
        leftbuttons.push(actlist[leftind])
        rightbuttons.push(actlist[rightind])
    }
    this.initButtons(leftbuttons,rightbuttons)
  },
  initButtons: function(leftkeys, rightkeys){
    console.log('init buttons',leftkeys,rightkeys);
    this.leftwrapper.innerHTML=''
    this.rightwrapper.innerHTML=''
    this.leftkeys = leftkeys
    this.rightkeys = rightkeys
    for(let x=0;x<leftkeys.length;x++){
      let wrapper = gui.createElement('div',{
        // innerHTML: `<img src="${leftkeys[x].image}">`,
        style:{backgroundImage: `url("${leftkeys[x].image}")`},
        className: 'elementwrapper',
        id: 'leftelement'+x,
        ind: x,
        left: true,
        dragable:false,
        onmouseup: function(e){
          console.log('mouseup on',this.id);
          game.stopDraw(this,e)
        },
        onmousedown: function(e){
          console.log('mousedown on',this.id);
          game.startDraw(this, e)
        },
      })
      console.log('adding left',wrapper);
      if(Math.random()>0.5 || this.leftwrapper.children.length==0)this.leftwrapper.appendChild(wrapper)
      else this.leftwrapper.insertBefore(wrapper, this.leftwrapper.firstChild)
    }
    for(x=0;x<rightkeys.length;x++){
      let wrapper = gui.createElement('div',{
        id:'rightelement'+x,
        ind: x,
        right: true,
        // innerHTML: `<img src="${rightkeys[x].image}">`,
        style:{backgroundImage: `url("${rightkeys[x].image}")`},
        className: 'elementwrapper',
        onmouseup: function(e){
          console.log('mouseup on',this.id);
          game.stopDraw(this,e)
        },
        onmousedown: function(e){
          console.log('mousedown on',this.id);
          game.startDraw(this,e)
        },
      })
      console.log('adding right',wrapper);
      if(Math.random()>0.5 || this.rightwrapper.children.length==0)this.rightwrapper.appendChild(wrapper)
      else this.rightwrapper.insertBefore(wrapper, this.rightwrapper.firstChild)
    }
  },
  setCanvasSize: function(){
    let w=map.clientWidth
    let h = map.clientHeight
    this.drawmap.width = w
    this.drawmap.height = h
    this.bgcanvas.width = w
    this.bgcanvas.height = h

  },
  startDraw: function(button, event){
    this.isdrawing=true;
    this.startingObject = button
  },
  stopDraw: function(button, event){
    if(!button || button == this.startingObject ||
      (button.left == this.startingObject.left)){
      console.log('wrong line');
      this.abortDraw()
      return
    }
    this.isdrawing=false;

    console.log('draw line from',this.startingObject.id, 'to',button.id);
    let line = {
      imagedata: this.ctx.getImageData(0,0,this.drawmap.width,this.drawmap.height)
    }
    if(button.left){
      line.left=button
      line.right = this.startingObject
    }else{
      line.left=this.startingObject
      line.right=button
    }
    //line is ready - check and delete lines with same left or right
    for(let x=this.lines.length-1;x>=0;x--){
      if(this.lines[x].left==line.left ||
        this.lines[x].right==line.right){
          this.lines.splice(x,1)
        }
    }
    this.lines.push(line)
    this.refreshBackground()
    this.ctx.clearRect(0,0,this.drawmap.width,this.drawmap.height)
    if(this.lines.length>=this.leftkeys.length){
      this.endRound()
    }
  },
  abortDraw: function(){
    if(this.isdrawing){
      this.isdrawing = false;
      this.ctx.clearRect(0,0,this.drawmap.width,this.drawmap.height)
      console.log('aborted draw');
    }
  },
  refreshBackground: function(){
    // this.bgctx.clearRect(0,0,this.bgcanvas.width,this.bgcanvas.height)
    let newImageData = this.bgctx.createImageData(this.bgcanvas.width, this.bgcanvas.height)
    for(let x=0;x<this.lines.length;x++){
        // this.bgctx.putImageData(this.lines[x].imagedata,0,0)
        let data = this.lines[x].imagedata.data
        for(let i=0;i<data.length;i+=4){
          if(data[i+3]>0){
            newImageData.data[i]=data[i]
            newImageData.data[i+1]=data[i+1]
            newImageData.data[i+2]=data[i+2]
            newImageData.data[i+3]=data[i+3]
          }
        }
    }
    this.bgctx.putImageData(newImageData,0,0)
  },
  endRound: async function(){
    let won = true
    for(let i=0;i<this.lines.length;i++){
      let left = this.leftkeys[this.lines[i].left.ind]
      let right = this.rightkeys[this.lines[i].right.ind]
      if(left.key!=right.key){
        won=false
        break
      }
    }
    if(won){
      await gui.showCongratulation(true)
      // this.level++
      // this.initRound()
      this.levelcounter.levelup()
    }else{
      await gui.showCongratulation(false)
    }
    this.lines = []
    this.refreshBackground()

  },

}
game.init()
