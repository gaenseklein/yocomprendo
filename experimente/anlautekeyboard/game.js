const anlaute = {
  list:{},
  init: function(anlautlist){
    let wrapper = gui.createElement('div',{
      id:'question'
    })
    main.appendChild(wrapper)
    this.buildList(gui.lang)
    this.buildKeyboard()
    main.appendChild(this.keyboard.node)
    this.buildQuestion()
  },
  addNewExample: function(begin, text, imagepath, audiopath){
    if(!this.list[begin])this.list[begin]=[]
    this.list[begin].push({text:text,image:imagepath,audio:audiopath, key:begin})
  },
  buildList: function(lang){
    if(lang=='de'){
      let keys = Object.keys(anlauteDE)
      for(let x=0;x<keys.length;x++){
        //begin, text, imagepath, audiopath
        let key = keys[x]
        let list = anlauteDE[key]
        for(let l=0;l<list.length;l++){
          let txt = list[l]
          this.addNewExample(key,txt,'images/flatanimals/'+txt+'.png','audios/words/de/'+txt+'.ogg')
        }
      }
      return keys
    }
  },
  buildQuestion: function(){
    let ind = Math.floor(Math.random()*this.keys.length)
    if(this.actind == ind)return this.buildQuestion()
    this.actind = ind
    let key = this.keys[ind]
    this.actkey = key
    let examples = this.list[key]
    let example = examples[Math.floor(Math.random()*examples.length)]
    let audiobutton = gui.buildAudioButton({
      audio: example.audio,
      image: example.image,
      className: 'question',
    })
    question.innerHTML = ''
    question.appendChild(audiobutton.node)
    audiospeaker.playAudio(example.audio)
  },
  buildKeyboard: function(){
    let keys = Object.keys(this.list)
    this.keys = keys
    this.keyboard = gui.createVirtualKeyboard({
      type:'keys',
      keys:keys,
      onclick: function(key){
        anlaute.tryKey(key)
      },
    })
  },
  tryKey: async function(key){
    await audiospeaker.speakPhonetic(key,true)
    if(key!=this.actkey){
      gui.showCongratulation(false)
      return
    }
    await gui.showCongratulation(true)
    this.buildQuestion()
  },
}

var anlauteDE = {
  a:['alpaka', 'antilope'],
  b:['bär'],
  ei:['eichhörnchen'],
  e:['elefant','elch'],
  f:['flamingo','fuchs'],
	g:['gams','gnu','giraffe'],
  h:['hase','hirsch'],
  i:['igel'],
  j:['jaguar'],
  k:['krokodil','kuh','katze','kaninchen'],
  l:['löwe','lama'],
  n:['nilpferd','nashorn'],
  pf:['pferd'],
	p:['panda'],
  sch:['schaf','schwein'],
  w:['wildschwein','waschbär'],
  z:['ziege','zebra'],
}

anlaute.init()
