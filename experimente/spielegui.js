const lang = {
  level_down:'level down',
  level_up: 'level up',
}

var gui = {
  standardCongratTime: 3000,
  lang: 'de',
  init: function(){
    this.loadGame()
  },
  loadFile: function(url){
    if(url.substring(url.length-3)=='.js'){
      return new Promise(function(resolve, reject) {
        var jsfile = document.createElement('script');
        jsfile.setAttribute("type","text/javascript");
        jsfile.onload=function(){
          console.log('file loaded',url);
          resolve(true)
        }
        jsfile.setAttribute("src", url);
        document.getElementsByTagName("head")[0].appendChild(jsfile);
      });
    }else{
      return new Promise(function(resolve, reject) {
        var cssfile = document.createElement('link')
        cssfile.rel="stylesheet"
        cssfile.onload = function(){
          console.log('file loaded',url);
          resolve(true)
        }
        cssfile.href=url
        document.getElementsByTagName("head")[0].appendChild(cssfile)
      });
    }
  },
  loadGame: function(){
    let gamename = location.search.substring(1)
    var jsfile = document.createElement('script');
    jsfile.setAttribute("type","text/javascript");
    jsfile.setAttribute("src", gamename+'/game.js');
    var cssfile = document.createElement('link')
    cssfile.rel="stylesheet"
    cssfile.href=gamename+'/style.css'
    document.getElementsByTagName("head")[0].appendChild(cssfile)
    document.getElementsByTagName("head")[0].appendChild(jsfile);
    document.body.classList.add(gamename)
  },
  addLevelcounter: function(options){
    //{maxLevel, onLevelUp, onLevelDown}
    let left = document.createElement('button')
    left.classList.add('level_down')
    left.innerHTML = `
    <span class="screenreaderonly">${lang.level_down}</span>
    <img src="images/bar_previous.svg" alt="">
    `
    left.disabled = true
    let right = document.createElement('button')
    right.classList.add('level_up')
    right.innerHTML = `
    <span class="screenreaderonly">${lang.level_up}</span>
    <img src="images/bar_next.svg" alt="">
    `
    let center = document.createElement('div')
    center.classList.add('levelcounter_show')
    center.innerText = '1'
    let wrapper = document.createElement('div')
    wrapper.classList.add('levelcounter')
    wrapper.appendChild(left)
    wrapper.appendChild(center)
    wrapper.appendChild(right)
    if(options.maxLevel)wrapper.maxLevel=options.maxLevel
    left.onclick = function(){
      let actlevel = this.nextElementSibling.innerText*1
      actlevel--
      if(actlevel<2){
        actlevel=1 //or go round in circles
        this.disabled = true
      }
      this.nextElementSibling.nextElementSibling.disabled = false
      this.nextElementSibling.innerText=actlevel
    }
    right.onclick = function(){
      let actlevel = this.previousElementSibling.innerText*1
      actlevel++
      if(this.parentElement.maxLevel && actlevel==this.parentElement.maxLevel){
        // actlevel--
        this.disabled = true
      }
      this.previousElementSibling.innerText=actlevel
      this.previousElementSibling.previousElementSibling.disabled = false
    }
    if(options.onLevelDown)left.addEventListener('click',options.onLevelDown)
    if(options.onLevelUp)right.addEventListener('click',options.onLevelUp)
    let levelcounter = {
      node: this.addButtonToFooter(wrapper),
      left: left,
      center: center,
      right: right,
      levelup: function(){
        if(this.right.disabled)return false
        this.right.click()
        return true
      },
      leveldown: function(){
        if(this.left.disabled)return false
        this.left.click()
        return true
      },
      actLevel: function(){
        return this.center.innerText*1
      }
    }
    return levelcounter
  },
  addFooterButton: function(options){
    let innerhtml = options.text
    if(options.image)innerhtml = `<img src="${options.image}" alt="${options.text}">`
    let button = this.createElement('button',{
      innerHTML: innerhtml,
      onclick: options.onclick
    })
    this.addButtonToFooter(button)
    return button 
  },
  addButtonToFooter: function(button){
    expandables.appendChild(button)
    return button
  },
  goHome: function(){
    if(this.onHome && typeof this.onHome=='function')this.onHome()
    // this.location.href="/"
  },
  createPointCounter: function(max, options){
    if(!this.pointcounter)this.pointcounter=[]
    let pc = {max: max, points:[]}
    let wrapper = document.createElement('div')
    wrapper.classList.add('pointcounter')
    if(options && options.id)wrapper.id= options.id
    else 'pointcounter'+this.pointcounter.length
    for(let x=0;x<max;x++){
        let point = null
        if(options && options.clickable === false){
          point = document.createElement('div')
        }else{
          point = document.createElement('button')
        }
        point.classList.add('pointcounterpoint')
        if(options && options.consecutive){
          point.onclick=function(){
            let clearrest = false
            for(let p=0;p<pc.points.length;p++){
              if(!clearrest && pc.points[p]==this){
                this.classList.toggle('active')
                clearrest = true
                continue
              }
              if(clearrest){
                pc.points[p].classList.remove('active')
                continue
              }
              if(!pc.points[p].classList.contains('active')){
                pc.points[p].classList.add('active')
                // clearrest = true
              }
            }
          }
        }else if(options && options.clickable === false){
          //speak function?
        }else{
          point.onclick=function(){this.classList.toggle('active')}
        }
        if(options && options.onclick){
          point.addEventListener('click',options.onclick)
        }
        point.innerHTML = `<span class="screenreaderonly active">$active</span>
        <span class="screenreaderonly inactive">$inactive</span>`
        wrapper.appendChild(point)
        pc.points.push(point)
    }
    pc.node=wrapper
    pc.count = function(){
      let count = 0
      for(let c=0;c<this.points.length;c++)if(this.points[c].classList.contains('active'))count++
      return count
    }
    pc.addOne = function(){
      let count = this.count()
      count++
      if(count>this.points.length)count=this.points.length
      for(let c=0;c<this.points.length;c++){
        this.points[c].classList.toggle('active',c<count)
      }
      return count
    }
    pc.substractOne = function(){
      let count = this.count()
      count--
      if(count<0)count=0
      for(let c=0;c<this.points.length;c++){
        this.points[c].classList.toggle('active',c<count)
      }
      return count
    }
    return pc
  },
  createVirtualKeyboard: function(options){
    let vk = {}
    if(options.type == 'dice'){
      let wrapper = this.createElement('div',{className:'virtualKeyboard dices'})
      let max = options.max || 6
      let min = options.min || 1
      vk.dices=[]
      for(let x=min;x<=max;x++){
          let extended = {
            className:'dice',
            onclick: function(){options.onclick(this.value)},
            value: x,
            innerHTML: `<span class="screenreaderonly">${x}</span><img src="images/dices/dice${x}.svg">`,
          }

          let dice = this.createElement('button',extended)
          vk.dices[x]=dice
          wrapper.appendChild(dice)
      }
      vk.node = wrapper
      return vk
    }else if(options.type == 'keys'){
      let wrapper = this.createElement('div',{className:'virtualKeyboard key'})
      vk.buttons = []
      for(let x=0;x<options.keys.length;x++){
        let extended = {
          className: 'key',
          value: options.keys[x],
          innerText: options.keys[x],
          onclick: function(){options.onclick(this.value)},
        }
        let b = this.createElement('button',extended)
        vk.buttons.push(b)
        wrapper.appendChild(b)
      }
      vk.node = wrapper
      return vk
    }
  },
  createDice: function(options){
    let dice = {
      value: options.value || options.min || 1,
    }
    if(options.onclick){
      dice.interactive=true
      let val = options.value || options.min || 1
      dice.node = this.createElement('button',{
        className: 'dice',
        value: val,
        onclick:function(){options.onclick(this.value)},
        innerHTML: `<span class="screenreaderonly">${val}</span><img src="images/dices/dice${val}.svg">`,
      })
    }else{
      dice.node = this.createElement('div',{
        className: 'dice',
        innerHTML: `<span class="screenreaderonly">${dice.value}</span><img src="images/dices/dice${dice.value}.svg">`,
      })
    }
    if(options.id)dice.node.id=options.id
    if(options.className)dice.node.className = 'dice '+options.className
    if(options.diceimage){
      dice.node.innerHTML=''
      dice.node.classList.add('customdice')
      dice.node.classList.add('customdice'+options.value)
      if(options.value%2==1)dice.node.classList.add('customdicemiddle')
      for(let x=0;x<options.value;x++){
        let di = new Image()
        di.src=options.diceimage
        dice.node.appendChild(di)
      }
    }
    dice.changeValue= function(val){
      if(this.interactive){
        dice.node.value=val
      }
      dice.value=val
      let scrsp = dice.node.querySelector('span')
      scrsp.innerText=val
      let img = dice.node.querySelector('img')
      img.src='images/dices/dice'+val+'.svg'
    }
    return dice
  },
  createElement: function(type, extended){
    let el = document.createElement(type)
    if(!extended)return el;
    let keys = Object.keys(extended)
    for(let x=0;x<keys.length;x++){
      let key=keys[x]
      if(key=='style'){
        let styles = Object.keys(extended.style)
        // console.log('style found',styles);
        for(let s=0;s<styles.length;s++){
          el.style[styles[s]]=extended.style[styles[s]]
        }
      }else {
        el[key]=extended[key]
      }
    }
    return el
  },
  showCongratulation: function(positive, timeInMs, type){
    let time = timeInMs || this.standardCongratTime
    alltypes = ['flower','gnu','lion','note','panda','smiley','star','sun','tux']
    return new Promise(function(resolve, reject) {
      let path = 'images/bonus/'
      if(type)path+=type
      else path+=alltypes[Math.floor(Math.random()*alltypes.length)]
      path+='_'
      if(positive==false)path+='bad'
      else path+='good'
      path+='.svg'
      let wrapper = gui.createElement('div',{
        className:'congratwrapper',
        id: 'congratwrapper',
        innerHTML: `<img src="${path}">`
      })
      document.body.appendChild(wrapper)
      if(positive==false)audiospeaker.playAudio('audios/sounds/youcannot.ogg')
      else audiospeaker.playAudio('audios/sounds/bonus.ogg')
      gui.congratTimer = setTimeout(function(){
        congratwrapper.parentElement.removeChild(congratwrapper)
        resolve(true)
      },time)
    });
  },
  buildAudioButton: function(options){
    if(!options)return
    if(!options.audio)return
    let type = options.type || 'button'
    let className = options.className || ''
    className+=' audiobuttonwrapper'

    // if(options.audio)audiolist.push(options.audio)
    let wrapper = this.createElement('div',{
      className: className,
    })
    if(options.class)wrapper.classList.add(options.class)
    let mainbutton = this.createElement(type,{
      className: 'audiobutton',
      innerHTML: `<img src="${options.image}">`,
      onclick: options.onclick,
    })

    let speakerbutton = this.createElement('button',{
      className:'speakerbutton',
      innerHTML: `<img src="images/bar_repeat.svg">`,
      audio: options.audio,
      onclick: function(){
        console.log('speak',this.audio);
        audiospeaker.playAudio(this.audio)
      },
    })
    wrapper.appendChild(mainbutton)
    wrapper.appendChild(speakerbutton)
    result = {node:wrapper}
    return result
  },
  createFlipcard: function(options){
    let ext = {
      value:options.value,
      index:options.index,
      className: 'flipcard downside',
      onclick: function(){
        game.clickCard(this.value,this.index)
      },
    }
    if(options.image){
      ext.innerHTML = `<img src="${options.image}">`
    }

    let flipcard = {
      image:options.image,
      audio: options.audio,
      text: options.text,
      value: options.value,
      index: options.index,
      isdownside: true,
      flip: async function(downside){
        if(downside)this.node.classList.toggle('downside',true)
        else this.node.classList.toggle('downside')
        if(downside)this.isdownside = true
        else this.isdownside = !this.isdownside
        //for now just wait, later return a promise
        await audiospeaker.wait(200)
        // return new Promise(function(resolve, reject) {
        //   resolve(true)
        // });
      },
      hide: async function(){
        this.node.classList.add('hidden')
        //for now just wait 1sec, later return a promise
        await audiospeaker.wait(1000)
        // return new Promise(function(resolve, reject) {
        //   resolve(true)
        // });
      },
      node: this.createElement('button',ext)
    }

    return flipcard
  },
  shuffleArray: function(sorted){
    let sortarr = []
    for(let x=0;x<sorted.length;x++)sortarr.push({
      value: sorted[x],
      random: Math.random()
    })
    sortarr.sort(function(a,b){return a.random-b.random})
    let shuffeldarr = []
    for(x=0;x<sortarr.length;x++)shuffeldarr.push(sortarr[x].value)
    return shuffeldarr
  },
  showDialog: function(dialog){
    let wrapper = this.createElement('div',{
      className: 'dialogwrapper',
    })
    let dialogwindow = this.createElement('div',{className:'dialog'})
    wrapper.appendChild(dialogwindow)
    let title = this.createElement('h2',{innerText: dialog.title || ''})
    let body = this.createElement('div',{innerText: dialog.body || ''})
    dialogwindow.appendChild(title)
    dialogwindow.appendChild(body)
    document.body.appendChild(wrapper)
    if(dialog.type=='alert' || dialog.type=='confirm'){
      return new Promise(function(resolve, reject) {
        let button = gui.createElement('button',{
          className:'ok',
          innerText: 'ok',
          onclick: function(){
            wrapper.parentElement.removeChild(wrapper)
            resolve(true)
          },
        })
        dialogwindow.appendChild(button)
        if(dialog.cancel || dialog.type=='confirm'){
          let cancelb = gui.createElement('button',{
            className:'cancel',
            innerText: 'abbrechen',
            onclick: function(){
              wrapper.parentElement.removeChild(wrapper)
              resolve(false)
            },
          })
          dialogwindow.appendChild(cancelb)
        }
        wrapper.onclick = function(e){
          if(e.target != wrapper)return
          wrapper.parentElement.removeChild(wrapper)
          resolve(false)
        }
      });
    }else if(dialog.type=='prompt'){
      return new Promise(function(resolve, reject) {
        let input = gui.createElement('input',{
          type:'text',
          onkeyup: function(e){
            if(e.key=='Enter' || e.key=='Escape')wrapper.parentElement.removeChild(wrapper)
            if(e.key=='Enter')resolve(this.value)
            if(e.key=='Escape')resolve(false)
          },
        })
        dialogwindow.appendChild(input)
        let okb = gui.createElement('button',{
          className: 'ok',
          innerText: 'ok',
          onclick: function(){
            wrapper.parentElement.removeChild(wrapper)
            resolve(input.value)
          }
        })
        dialogwindow.appendChild(okb)
        let cancelb = gui.createElement('button',{
          className:'cancel',
          innerText: 'abbrechen',
          onclick: function(){
            wrapper.parentElement.removeChild(wrapper)
            resolve(false)
          },
        })
        dialogwindow.appendChild(cancelb)
        wrapper.onclick = function(e){
          if(e.target != wrapper)return
          wrapper.parentElement.removeChild(wrapper)
          resolve(false)
        }
      });
    }
  },

}

gui.init()
// gui.addLevelcounter({maxLevel:5})
//
// let pc = gui.createPointCounter(5,{consecutive:true})
// main.appendChild(pc.node)
//
// let vk = gui.createVirtualKeyboard({
//   type:'dice',
//   onclick: function(val){alert(val)},
//   min:1,
//   max:8
// })
// main.appendChild(vk.node)
