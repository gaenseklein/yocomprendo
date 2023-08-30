const anlaute = {
  init: function(anlautlist){
    this.buildList(gui.lang)
    this.buildQuestion()
  },
  list: {

  },
  addNewExample: function(begin, text, imagepath, audiopath){
    if(!this.list[begin])this.list[begin]=[]
    this.list[begin].push({text:text,image:imagepath,audio:audiopath, key:begin})
  },
  buildQuestion: function(){
    let keys = Object.keys(this.list)
    let key = keys[Math.floor(Math.random()*keys.length)]
    while(this.list[key].length<2)key = keys[Math.floor(Math.random()*keys.length)]
    let list = this.list[key]
    let leftind = Math.floor(Math.random()*list.length)
    let rightind = Math.floor(Math.random()*list.length)
    while(rightind==leftind)rightind = Math.floor(Math.random()*list.length)
    let left = list[leftind]
    let right = list[rightind]
    let wrong1key = keys[Math.floor(Math.random()*keys.length)]
    while(wrong1key==key)wrong1key = keys[Math.floor(Math.random()*keys.length)]
    let wrong2key = keys[Math.floor(Math.random()*keys.length)]
    while(wrong2key==key || wrong2key == wrong1key)wrong2key = keys[Math.floor(Math.random()*keys.length)]
    let wrong1 = this.list[wrong1key][Math.floor(Math.random()*this.list[wrong1key].length)]
    let wrong2 = this.list[wrong2key][Math.floor(Math.random()*this.list[wrong2key].length)]
    let leftb = gui.buildAudioButton({
      class: 'left',
      image: left.image,
      audio: left.audio
    })
    let rightb = gui.buildAudioButton({
      class:'right',
      image: right.image,
      audio: right.audio,
      onclick: async function(){
        await anlaute.showComparison(left,right)
        await gui.showCongratulation(true, gui.standardCongratTime)
        anlaute.buildQuestion()
      },
    })
    let wrong1b = gui.buildAudioButton({
      class:'right',
      image: wrong1.image,
      audio: wrong1.audio,
      onclick: async function(){
        await anlaute.showComparison(left, wrong1)
        await gui.showCongratulation(false, gui.standardCongratTime, null)
      },
    })
    let wrong2b = gui.buildAudioButton({
      class:'right',
      image: wrong2.image,
      audio: wrong2.audio,
      onclick: async function(){
        await anlaute.showComparison(left, wrong2)
        await gui.showCongratulation(false, gui.standardCongratTime, null)
      },
    })
    main.innerHTML=''
    main.appendChild(leftb.node)
    let randomlist = [rightb.node]
    if(Math.random()>0.5)randomlist.push(wrong1b.node)
    else randomlist.unshift(wrong1b.node)
    if(Math.random()>0.5)randomlist.push(wrong2b.node)
    else randomlist.unshift(wrong2b.node)
    for(let x=0;x<randomlist.length;x++)main.appendChild(randomlist[x])
  },
  showComparison: async function(left,right){
    // audiospeaker.playAudiosOnce([left.audio,right.audio], {pause:500})
    let wrapper = gui.createElement('div',{
      className:'showComparisonWrapper',
    })
    let leftwr = gui.createElement('div',{
      className:'left',
      innerHTML: `<img src="${left.image}">`,
    })
    let rightwr = gui.createElement('div',{
      className:'right',
      innerHTML: `<img src="${right.image}">`,
    })
    let lefttitle  = gui.createElement('div',{
      className:'title',
      innerHTML: `<span class="key">${left.key}</span><span>${left.text.substring(left.key.length)}</span>`,
    })
    let righttitle  = gui.createElement('div',{
      className:'title',
      innerHTML: `<span class="key">${right.key}</span><span>${right.text.substring(right.key.length)}</span>`,
    })

    leftwr.appendChild(lefttitle)
    rightwr.appendChild(righttitle)
    wrapper.appendChild(leftwr)
    wrapper.appendChild(rightwr)
    document.body.appendChild(wrapper)

    leftwr.classList.add('speaking')
    await audiospeaker.playAudio(left.audio)
    leftwr.classList.remove('speaking')
    console.log('audio should have ended');

    await audiospeaker.wait(500)
    console.log('waited pause');
    leftwr.classList.add('speakingkey')
    await audiospeaker.speakPhonetic(left.key, true)
    leftwr.classList.remove('speakingkey')
    console.log('audio should have ended');

    await audiospeaker.wait(800)
    console.log('waited pause');

    rightwr.classList.add('speaking')
    await audiospeaker.playAudio(right.audio)
    rightwr.classList.remove('speaking')
    console.log('audio should have ended');

    await audiospeaker.wait(500)
    console.log('waited pause');

    rightwr.classList.add('speakingkey')
    await audiospeaker.speakPhonetic(right.key, true)
    rightwr.classList.remove('speakingkey')

    await audiospeaker.wait(1000)
    wrapper.parentElement.removeChild(wrapper)
  },
  buildList: function(lang){
    if(lang=='de'){
      // let keys = Object.keys(anlauteDE)
      // for(let x=0;x<keys.length;x++){
      //   //begin, text, imagepath, audiopath
      //   let key = keys[x]
      //   let list = anlauteDE[key]
      //   for(let l=0;l<list.length;l++){
      //     let txt = list[l]
      //     this.addNewExample(key,txt,'images/flatanimals/'+txt+'.png','audios/words/de/'+txt+'.ogg')
      //   }
      // }
      let allexamples = anlauteDeAnimals.concat(anlauteDeFruits).concat(anlauteDeInstruments)
      for(let x=0;x<allexamples.length;x++){
        let ex = allexamples[x]
        this.addNewExample(ex.key,ex.text, ex.image, 'audios/words/de/'+ex.text+'.ogg')
      }
    }
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

var anlauteDeAnimals = [
{key:'a', text:'alpaka', image:'images/flatanimals/alpaka.png'},
{key:'a', text:'antilope', image:'images/flatanimals/antilope.png'},
{key:'b', text:'bär', image:'images/flatanimals/bär.png'},
{key:'ei', text:'eichhörnchen', image:'images/flatanimals/eichhörnchen.png'},
{key:'e', text:'elefant', image:'images/flatanimals/elefant.png'},
{key:'e', text:'elch', image:'images/flatanimals/elch.png'},
{key:'f', text:'flamingo', image:'images/flatanimals/flamingo.png'},
{key:'f', text:'fuchs', image:'images/flatanimals/fuchs.png'},
{key:'g', text:'gams', image:'images/flatanimals/gams.png'},
{key:'g', text:'gnu', image:'images/flatanimals/gnu.png'},
{key:'g', text:'giraffe', image:'images/flatanimals/giraffe.png'},
{key:'h', text:'hase', image:'images/flatanimals/hase.png'},
{key:'h', text:'hirsch', image:'images/flatanimals/hirsch.png'},
{key:'i', text:'igel', image:'images/flatanimals/igel.png'},
{key:'j', text:'jaguar', image:'images/flatanimals/jaguar.png'},
{key:'k', text:'krokodil', image:'images/flatanimals/krokodil.png'},
{key:'k', text:'kuh', image:'images/flatanimals/kuh.png'},
{key:'k', text:'katze', image:'images/flatanimals/katze.png'},
{key:'k', text:'kaninchen', image:'images/flatanimals/kaninchen.png'},
{key:'l', text:'löwe', image:'images/flatanimals/löwe.png'},
{key:'l', text:'lama', image:'images/flatanimals/lama.png'},
{key:'n', text:'nilpferd', image:'images/flatanimals/nilpferd.png'},
{key:'n', text:'nashorn', image:'images/flatanimals/nashorn.png'},
{key:'pf', text:'pferd', image:'images/flatanimals/pferd.png'},
{key:'p', text:'panda', image:'images/flatanimals/panda.png'},
{key:'sch', text:'schaf', image:'images/flatanimals/schaf.png'},
{key:'sch', text:'schwein', image:'images/flatanimals/schwein.png'},
{key:'w', text:'wildschwein', image:'images/flatanimals/wildschwein.png'},
{key:'w', text:'waschbär', image:'images/flatanimals/waschbär.png'},
{key:'z', text:'ziege', image:'images/flatanimals/ziege.png'},
{key:'z', text:'zebra', image:'images/flatanimals/zebra.png'},
]

var anlauteDeFruits = [
{key:'a', text:'apfel', image:'images/fruits/apple.svg'},
{key:'b', text:'banane', image:'images/fruits/banana.svg'},
{key:'k', text:'kirsche', image:'images/fruits/cherries.svg'},
{key:'w', text:'weintrauben', image:'images/fruits/grapes.svg'},
{key:'z', text:'zitrone', image:'images/fruits/lemon.svg'},
{key:'o', text:'orange', image:'images/fruits/orange.svg'},
{key:'pf', text:'pfirsich', image:'images/fruits/peach.svg'},
{key:'b', text:'birne', image:'images/fruits/pear.svg'},
{key:'a', text:'ananas', image:'images/fruits/pineapple.svg'},
{key:'pf', text:'pflaume', image:'images/fruits/plum.svg'},
{key:'e', text:'erdbeere', image:'images/fruits/strawberry.svg'},
{key:'w', text:'wassermelone', image:'images/fruits/watermelon.svg'},
]

var anlauteDeInstruments = [
  {key:'a', text:'akkordeon', image:'images/instruments/accordion.svg'},
  {key:'b', text:'banjo', image:'images/instruments/banjo.svg'},
  {key:'b', text:'bongotrommel', image:'images/instruments/bongo.svg'},
  {key:'k', text:'klarinette', image:'images/instruments/clarinet.svg'},
  {key:'sch', text:'schlagzeug', image:'images/instruments/drum_kit.svg'},
  {key:'qu', text:'querflöte', image:'images/instruments/flute_traversiere.svg'},
  {key:'g', text:'gitarre', image:'images/instruments/guitar.svg'},
  {key:'m', text:'mundharmonika', image:'images/instruments/harmonica.svg'},
  {key:'h', text:'harfe', image:'images/instruments/harp.svg'},
  {key:'h', text:'horn', image:'images/instruments/horn.svg'},
  {key:'r', text:'rassel', image:'images/instruments/maracas.svg'},
  {key:'k', text:'klavier', image:'images/instruments/piano.svg'},
  {key:'s', text:'saxophon', image:'images/instruments/saxophone.svg'},
  {key:'t', text:'tambourine', image:'images/instruments/tambourine.svg'},
  {key:'p', text:'pauke', image:'images/instruments/timpani.svg'},
  {key:'p', text:'posaune', image:'images/instruments/trombone.svg'},
  {key:'t', text:'trompete', image:'images/instruments/trumpet.svg'},
  {key:'t', text:'tuba', image:'images/instruments/tuba.svg'},
  {key:'g', text:'geige', image:'images/instruments/violin.svg'},
]

anlaute.init()
