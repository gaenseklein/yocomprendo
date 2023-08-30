const game = {
  points: 0,
  allChars: '',
  tuxTop: 0,
  tuxBottom:0,
  tuxLeft:0,
  tuxRight:0,
  tuxHeight:0,
  tuxWidth: 0,
  spaceBottom:0,
  spaceRight: 0,
  init: async function(){
      await gui.loadFile('phoneticslistde.js')
      this.spacetux = gui.createElement('div',{
        id:'spacetux',
        innerHTML: `<img src="images/space/tux_spaceship.svg">`
      })
      this.spacewrapper = gui.createElement('div',{id:'space'})
      main.appendChild(this.spacewrapper)
      this.spacewrapper.appendChild(this.spacetux)
      this.metawrapper = gui.createElement('div',{id:'metawrapper', innerText:'0'})
      this.targetwrapper = gui.createElement('div',{id:'target'})
      main.appendChild(this.metawrapper)
      main.appendChild(this.targetwrapper)
      this.allexamples = phoneticslist.giveList()
      for(let x=0;x<this.allexamples.length;x++){
        for(let l=0;l<this.allexamples[x].text.length;l++){
          if(this.allChars.indexOf(this.allexamples[x].text[l])==-1)this.allChars+=this.allexamples[x].text[l]
        }
      }
      this.updateTuxValues()
      this.spacetux.style.left = this.tuxLeft + 'px'
      this.spacetux.style.top = this.tuxTop + 'px'
      this.addKeyControl()
      // await audiospeaker.wait(2000)
      // game.updateTuxValues()
      this.levelcounter = gui.addLevelcounter({
        maxLevel: 6,
        onLevelUp: function(){
          game.loadLevel()
        },
        onLevelDown: function(){
          game.loadLevel()
        }
      })
      await audiospeaker.wait(500)
      game.startGame()

  },
  updateTuxValues: function(){
    this.spaceBottom = this.spacewrapper.clientHeight
    this.tuxBottom = this.spaceBottom
    this.tuxHeight = this.spacetux.clientHeight
    this.tuxWidth = this.spacetux.clientWidth
    this.tuxTop = this.tuxBottom - this.tuxHeight
    this.spaceRight = this.spacewrapper.clientWidth
    this.tuxLeft = this.spacetux.offsetLeft || Math.floor(this.spaceRight/2 - this.tuxWidth/2)
    this.tuxRight = this.tuxLeft + this.tuxWidth
  },
  addKeyControl: function(){
    // document.onkeydown = function(e){
    //   if(e.key=='ArrowLeft'){
    //     game.moveTux(-1,0)
    //   }else if(e.key=='ArrowRight'){
    //     game.moveTux(1,0)
    //   }else if(e.key=='ArrowUp'){
    //     game.moveTux(0,-1)
    //   }else if(e.key=='ArrowDown'){
    //     game.moveTux(0,1)
    //   }
    // }
    document.onkeydown = function(e){
      if(e.key=='ArrowLeft'){
        game.moveTuxX=-1
      }else if(e.key=='ArrowRight'){
        game.moveTuxX=1
      }else if(e.key=='ArrowUp'){
        game.moveTuxY=-1
      }else if(e.key=='ArrowDown'){
        game.moveTuxY=1
      }else if(e.key==' '){
        game.pauseGame = !game.pauseGame
        main.classList.toggle('paused',game.pauseGame)
      }else if(e.key=='Enter' && game.stopGame){
        game.startGame()
      }

    }
    document.onkeyup = function(e){
      if(e.key=='ArrowLeft' || e.key=='ArrowRight'){
        game.moveTuxX=0
      }else if(e.key=='ArrowUp' || e.key=='ArrowDown'){
        game.moveTuxY=0
      }
    }
  },
  createNewTarget: function(){
      let target = this.allexamples[Math.floor(Math.random()*this.allexamples.length)]
      this.targetWord = target.text
      this.solvedChars = 0
      // let targetdiv = gui.createElement('div',{innerHTML:`
      //   <img src="${target.image}">
      //   <span id="targetsolved"></span><span id="targetunsolved">${target.text}</span>
      //   `})
      //   this.targetwrapper.innerHTML = targetdiv.innerHTML
      this.targetwrapper.innerHTML = `<img src="${target.image}">
      <div>
      <span id="targetsolved"></span><span id="targetunsolved">${target.text}</span>
      </div>`
      // this.targetwrapper.appendChild(targetdiv)
  },
  hitChar: async function(char){
      if(this.targetWord[this.solvedChars]!=char){
          await audiospeaker.playAudio('audios/sounds/crash.ogg')
          this.endGame()
          return false
      }
      this.solvedChars++
      this.points++
      targetsolved.innerText = this.targetWord.substring(0,this.solvedChars)
      targetunsolved.innerText = this.targetWord.substring(this.solvedChars)
      if(this.solvedChars==this.targetWord.length){
          this.points+=this.targetWord.length
          target.classList.add('won')
          async function speakAudios(){
            await audiospeaker.playWord(game.targetWord)
            await audiospeaker.playAudio('audios/sounds/bonus.ogg')
          }
          speakAudios()
          // this.createNewTarget()
          setTimeout(function(){
            game.createNewTarget()
            target.classList.remove('won')
          },2000)
      }else{
        async function speakAudios(){
          await audiospeaker.playAudio('audios/sounds/win.ogg')
          audiospeaker.speakPhonetic(char)
        }
        speakAudios()
      }
      this.metawrapper.innerText=this.points
      return true
  },
  endGame: function(){
      this.stopGame = true
      clearTimeout(this.addCharTimer)
  },
  startGame: function(){
      this.createNewTarget()
      this.points = 0
      this.metawrapper.innerText=this.points
      for(let x=0;x<this.movingChars.length;x++){
        if(this.movingChars[x].parentElement){
          this.movingChars[x].parentElement.removeChild(this.movingChars[x])
        }
      }
      this.movingChars = []
      this.stopGame=false
      this.round()
      this.addMovingChar()
  },
  loadLevel: async function(lev){
    let level = lev || this.levelcounter.actLevel()
    level--
    this.endGame()
    console.log(level);
    let levelchartimes = [3000,2500,2000,1500,1000,500]
    let levelchartimesminimum = [4000,3900,1800,1700,1600,500]
    let levelinvchar = [2,2,3,3,4,4]
    let levelmoveperround = [0.5,0.8,1,1.5,2,2]
    this.addCharTime = levelchartimes[level]
    this.addCharTimeMinimum = levelchartimesminimum[level]
    this.maxInvalidChar = levelinvchar[level]
    this.movePerRound = levelmoveperround[level]
    await audiospeaker.wait(1000)
    this.startGame()
  },
  round: async function(){
      if(!this.pauseGame){
        this.moveTux()
        await this.moveChars()
        this.roundcounter++
      }
      if(!this.stopGame)this.roundTimer = setTimeout(function(){game.round()},this.roundTime)
  },
  roundcounter: 0,
  roundTime: 10,
  roundTimer:null,
  stopGame: false,
  movingChars: [],
  movePerRound:1,
  addCharTimer: null,
  addCharTime: 1500,
  addCharTimeMinimum: 500,
  maxInvalidChar: 3,
  countInvalidChar:0,
  addMovingChar: function(){
    if(this.stopGame)return
    let char = this.allChars[Math.floor(Math.random()*this.allChars.length)]

    if(this.pauseGame || char==undefined){
      setTimeout(function(){game.addMovingChar()},Math.floor(Math.random()*this.addCharTime)+this.addCharTimeMinimum)
      return
    }
    if(this.targetWord.indexOf(char)==-1)this.countInvalidChar++;
    if(this.countInvalidChar>=this.maxInvalidChar && this.targetWord[this.solvedChars]){
      this.countInvalidChar = 0
      char = this.targetWord[this.solvedChars]
    }

    let leftmax = this.spacewrapper.clientWidth - 50
    let left = leftmax - (Math.floor(Math.random()*leftmax))
    console.log('new char with left',left,leftmax);
    left+='px'
    let newChar = gui.createElement('div',{
      className: 'movingChar',
      innerText: char,
      value: char,
      style:{
        left: left,
        top:'-100px',
      },
    })
    this.spacewrapper.appendChild(newChar)
    this.movingChars.push(newChar)
    this.addCharTimer = setTimeout(function(){game.addMovingChar()},Math.floor(Math.random()*this.addCharTime)+1000)
  },
  moveChars: async function(){
    let tuxleft = this.tuxLeft//this.spacetux.style.left
    let tuxright = this.tuxRight//tuxleft + this.spacetux.clientWidth
    let tuxtop = this.tuxTop//this.spacetux.style.top
    let tuxbottom = this.tuxBottom//tuxtop + this.spacetux.clientHeight
    let spacebottom = this.spaceBottom//this.spacewrapper.clientHeight

    for(let x=this.movingChars.length-1;x>=0;x--){
        let chardiv = this.movingChars[x]
        let chartop = chardiv.style.top.substring(0,chardiv.style.top.indexOf('px'))*1
        chartop+=this.movePerRound
        if(chartop>spacebottom+300){
          //remove char as its out of space
          this.movingChars.splice(x,1)
          chardiv.parentElement.removeChild(chardiv)
          console.log('removed char');
          continue
        }
        chardiv.style.top = chartop + 'px'
        let charbottom = chartop + chardiv.clientHeight
        if((chartop>tuxtop && chartop <tuxbottom)||
          (charbottom>tuxtop && charbottom < tuxbottom)){
            let charleft = chardiv.style.left.substring(0,chardiv.style.left.indexOf('px'))*1
            let charright = charleft + chardiv.clientWidth
            console.log('same height:',chardiv.innerText, charleft, charright, tuxleft, tuxright);
            if((charleft>tuxleft && charleft<tuxright)||
              (charright>tuxleft && charright<tuxright)){
              //we hit the char
              console.log('hit it',chardiv.value);
              let good = await this.hitChar(chardiv.value)
              if(good)this.movingChars.splice(x,1)
              if(!good)break
              chardiv.parentElement.removeChild(chardiv)
            }
          }
    }//forx
  },
  moveTuxPerStroke:3,
  moveTux: function(nx,ny){
    let x = nx || this.moveTuxX
    let y = ny || this.moveTuxY
    let moving = (x!=0 || y!=0)
    this.spacetux.classList.toggle('moving',moving)
    if(!moving)return
    let newtop = this.tuxTop+(y*this.moveTuxPerStroke)
    let newleft = this.tuxLeft+(x*this.moveTuxPerStroke)
    // console.log('movetux',x,y,newleft, newtop,this.tuxTop, this.tuxLeft);
    if(newtop<this.spaceBottom-this.tuxHeight && newtop>0){
      this.tuxTop = newtop
      this.tuxBottom = newtop + this.tuxHeight
      this.spacetux.style.top = this.tuxTop + 'px'
    }
    if(newleft > 0 && newleft < this.spaceRight-this.tuxWidth){
      this.tuxLeft = newleft
      this.tuxRight = newleft + this.tuxWidth
      this.spacetux.style.left = newleft + 'px'
    }
  }
}
game.init()
// setTimeout(game.startGame(), 5000)
