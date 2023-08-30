const game = {
  levelpairs : [3,4,5,6,8,10,12,4,5,6,8,10,12,14,16,18,20],
  init: async function(){
    this.wrapper = main
    this.actlevel = 0
    this.levelcounter = gui.addLevelcounter({
      maxLevel: this.levelpairs.length-1,
      onLevelDown: function(){
        game.actlevel --
        game.buildLevel(game.actlevel)
      },
      onLevelUp: function(){
        game.actlevel ++
        game.buildLevel(game.actlevel)
      },
    })
    await gui.loadFile('phoneticslistde.js')
    console.log('game initialized');
    // console.log(phoneticslist.giveList())
    this.buildList()
    this.buildLevel(0)
  },
  list: {},
  addNewExample: function(begin, text, imagepath, audiopath){
    if(!this.list[begin])this.list[begin]=[]
    this.list[begin].push({text:text,image:imagepath,audio:audiopath, key:begin})
  },
  buildList: function(type){
    //first just de:
    // let all = anlauteDeFruits.concat(anlauteDeAnimals).concat(anlauteDeInstruments)
    let all = phoneticslist.giveList(type)
    console.log('load list',all,'type',type);
    for(let x=0;x<all.length;x++)this.addNewExample(all[x].key, all[x].text,all[x].image, 'audios/words/de/'+all[x].text+'.ogg')
  },
  buildLevel: function(level){
    this.wrapper.innerHTML = ''
    document.body.classList.toggle('hideimages',(level>=7))
    this.buildMemory(this.levelpairs[level])
  },
  buildMemory: function(pairs){
    let keys = Object.keys(this.list)
    let cards = []
    let indize = []
    for(let x=0;x<pairs;x++){
      let ind = Math.floor(Math.random()*keys.length)
      let key = keys[ind]
      keys.splice(ind,1)
      let cardind1 = Math.floor(Math.random()*this.list[key].length)
      let cardind2 = Math.floor(Math.random()*this.list[key].length)
      if(this.list[key].length>1){
        while(cardind1==cardind2)cardind2=Math.floor(Math.random()*this.list[key].length)
      }
      let ex1 = this.list[key][cardind1]
      let ex2 = this.list[key][cardind2]
      cards.push(gui.createFlipcard({
        image: ex1.image,
        audio: ex1.audio,
        text: ex1.text,
        value: ex1.key,
        index: x*2,
        onclick: function(value){
          game.clickCard(value)
        },
      }))
      indize.push((x*2))
      cards.push(gui.createFlipcard({
        image: ex2.image,
        audio: ex2.audio,
        text: ex2.text,
        value: ex2.key,
        index: x*2+1,
        onclick: function(value, index){
          game.clickCard(value, index)
        },
      }))
      indize.push((x*2+1))
    }
    indize = gui.shuffleArray(indize)
    for(x=0;x<indize.length;x++){
      this.wrapper.appendChild(cards[indize[x]].node)
    }
    this.cards = cards
    this.flippedCards = []
    this.pairs = pairs
    this.pairsLeft = pairs
  },
  lockClick: false,
  clickCard: async function(key, index){
    let card = this.cards[index]
    console.log('clicked card',key,index,card);
    if(!card)return
    if(!card.isdownside)return
    if(this.lockClick)return
    this.lockClick = true
    await card.flip()
    await audiospeaker.playAudio(card.audio)
    await audiospeaker.wait(200)
    await audiospeaker.speakPhonetic(key, true)
    this.flippedCards.push(card)
    if(this.flippedCards.length==2){
      await audiospeaker.wait(500)
      if(this.flippedCards[0].value == key){
        //congrats - we have a match
        this.flippedCards[0].hide()
        await card.hide()
        this.pairsLeft--
        if(this.pairsLeft==0){
          //congrats - we have a winner
          this.winGame()
        }
      }else{
        this.flippedCards[0].flip()
        await card.flip()
      }
      this.flippedCards=[]
    }
    this.lockClick = false
  },
  winGame: async function(){
    await gui.showCongratulation(true)
    if(!this.levelcounter.levelup()){
      this.buildLevel(this.actlevel)
    }
  },

}

game.init()
