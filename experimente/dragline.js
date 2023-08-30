const dragliner = {
  init: async function(wrapper,endRound, options){
    this.oneLinePerObject = options.oneLinePerObject
    this.endRound = endRound || function(){}
    this.pairs = []
    this.wrapper = wrapper
    this.bgcanvas = gui.createElement('canvas',{id:'bgcanvas'})
    this.drawcanvas = gui.createElement('canvas',{id:'drawcanvas'})
    wrapper.appendChild(this.bgcanvas)
    wrapper.appendChild(this.drawcanvas)
    this.setCanvasSize()
    this.drawctx= this.drawcanvas.getContext('2d')
    this.bgctx= this.bgcanvas.getContext('2d')
    wrapper.onmousemove = function(e){
      if(dragliner.isdrawing){
        dragliner.drawctx.fillRect(e.clientX,e.clientY,10,10)
      }
    }
    wrapper.onmouseleave = function(e){
      dragliner.abortDraw()
    }
    wrapper.onmouseup = function(e){
      console.log('mouseup on wrapper');
      dragliner.abortDraw()
    }
    this.lines = []
  },
  startDraw: function(element, event){
    this.isdrawing=true;
    this.startingObject = element
  },
  stopDraw: function(button, event){
    if(!button || button == this.startingObject ||
      ((button.left || button.right) && button.left == this.startingObject.left)){
      console.log('wrong line');
      this.abortDraw()
      return
    }
    this.isdrawing=false;

    console.log('draw line from',this.startingObject.id, 'to',button.id);
    let line = {
      imagedata: this.drawctx.getImageData(0,0,this.drawmap.width,this.drawmap.height)
    }
    if(button.left){
      line.left=button
      line.right = this.startingObject
    }else{
      line.left=this.startingObject
      line.right=button
    }
    //line is ready - check and delete lines with same left or right
    if(this.oneLinePerObject){
      for(let x=this.lines.length-1;x>=0;x--){
        if(this.lines[x].left==line.left ||
          this.lines[x].right==line.right){
            this.lines.splice(x,1)
          }
        }
    }
    this.lines.push(line)
    this.refreshBackground()
    this.drawctx.clearRect(0,0,this.drawmap.width,this.drawmap.height)
    if(this.lines.length>=this.pairs.length){
      this.endRound()
    }
  },
  abortDraw: function(){
    if(this.isdrawing){
      this.isdrawing = false;
      this.drawctx.clearRect(0,0,this.drawmap.width,this.drawmap.height)
      console.log('aborted draw');
    }
  },
  clearAllLines: function(){
    this.lines = []
    this.refreshBackground()
    this.drawctx.clearRect(0,0,this.drawmap.width,this.drawmap.height)
  },
  addPair: function(left,right, options){
    //options.condition(left,right) returns true/false ?
    left.onmousedown = function(e){
      dragline.startDraw(this,e)
    }
    right.onmousedown = function(e){
      dragline.startDraw(this,e)
    }
    left.onmouseup = function(e){
      dragline.stopDraw(this,e)
    }
    right.onmouseup = function(e){
      dragline.stopDraw(this,e)
    }
    this.pairs.push({left:left,right:right, options:options})
  },
  setCanvasSize: function(){
    let w=this.wrapper.clientWidth
    let h = this.wrapper.clientHeight
    this.drawcanvas.width = w
    this.drawcanvas.height = h
    this.bgcanvas.width = w
    this.bgcanvas.height = h

  },
  refreshBackground: function(){
    // this.bgctx.clearRect(0,0,this.bgcanvas.width,this.bgcanvas.height) not necesary
    // we delete old imagedata by putting new imagedata
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



}
