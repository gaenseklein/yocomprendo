var game = {
  init: async function(){
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
    this.wrapperleft = gui.createElement('div',{id:'left'})
    this.wrapperright = gui.createElement('div',{id:'right'})
    main.appendChild(this.wrapperleft)
    main.appendChild(this.wrapperright)
    this.initRound(1)
  },
  initRound: function(level){
    let lvl = level || this.levelcounter.actLevel() || 1;
    let maxnr = Math.floor(lvl/2)+3
    if(maxnr>9)maxnr=9
    let list = phoneticslist.giveList()
    let rightlist = []
    let solution = Math.floor(Math.random()*maxnr)+1 //1-maxnr, not 0-(maxnr-1)
    let solpos = Math.floor(Math.random()*3)
    let solimg = list[Math.floor(Math.random()*list.length)].image
    let solobj = {
      nr: solution,
      image:solimg
    }
    for(let i=0;i<3;i++){
      let nr = solution
      if(i!=solpos){
        while(nr==solution)nr=Math.floor(Math.random()*maxnr)+1
      }
      rightlist.push(
        {
          nr: nr,
          image:list[Math.floor(Math.random()*list.length)].image,
        }
      )
    }
    this.buildRound(solobj,rightlist)
  },
  buildRound: function(solution, choices){
    this.wrapperleft.innerHTML=''
    this.wrapperright.innerHTML=''
    let leftb = gui.createDice({
      value: solution.nr,
      diceimage: solution.image
    })
    this.wrapperleft.appendChild(leftb.node)
    for(let x=0;x<choices.length;x++){
      console.log(choices[x]);
      let rb = gui.createDice({
        value:choices[x].nr,
        diceimage: choices[x].image,
        onclick: function(){
          if(this.value==solution.nr){
            game.winRound()
          }else{
            game.loseRound()
          }
        }
      })
      this.wrapperright.appendChild(rb.node)
    }
  },
  winRound: async function(){
    await gui.showCongratulation(true)
    this.levelcounter.levelup()
    this.initRound(this.levelcounter.actLevel())
  },
  loseRound: async function(){
    await gui.showCongratulation(false)
  },
}

game.init()
