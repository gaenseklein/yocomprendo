const audiospeaker = {
  de:{
    getAudiosForNumber:function(num){
        let result = []
        let numstr = num+''
        //let zehnerdigs = num%100
        function zehnerdiggs(zehnerdigs){
            if(zehnerdigs>0 && (zehnerdigs<20 || zehnerdigs%10==0)){
                result.unshift(zehnerdigs+'.ogg')
            }else if(zehnerdigs>20){
                let einer = zehnerdigs%10
                let zehner = Math.floor(zehnerdigs/10)*10
                result.unshift('und'+zehner+'.ogg')
                if(einer==1)result.unshift('1b.ogg')
                else result.unshift(einer+'.ogg')
            }
        }
        function hunderterdiggs(h){
            if(h>0)result.unshift('hundert.ogg')
            if(h==1)result.unshift('1b.ogg')
            else if(h>1)result.unshift(h+'.ogg')
        }
        zehnerdiggs(num%100)
        if(num<100)return result
        let hunderter = numstr[numstr.length-3]*1
        hunderterdiggs(hunderter)
        if(num<1000)return result
        result.unshift('tausend.ogg')
        let tausendzehnerdigs = Math.floor(num/1000)%100
        zehnerdiggs(tausendzehnerdigs)
        if(num<100000)return result
        let hunderttausender = Math.floor((num%1000000)/100000)
        hunderterdiggs(hunderttausender)
        if(num<1000000)return result
    },
  }, //de
  lang: 'de',
  speakNumber: function(num){
    let numlist = this[this.lang].getAudiosForNumber(num)
    for(let x=0;x<numlist.length;x++){
      numlist[x]='audios/numbers/de/'+numlist[x]
    }
    this.playAudiosOnce(numlist)

  },
  speakPhonetic: function(letter, promise){
    let path = 'audios/phonetic/'+this.lang+'/'+letter+'.ogg'
    if(promise)return this.playAudio(path)
    this.playAudiosOnce([path])
  },
  playingAudios: [],
  playAudiosOnce: async function(audiolist,options){
    let list = audiolist
    let actaudio = list.shift()
    try {
      let playingAudio = new Audio(actaudio)
      this.playingAudios.push(playingAudio)
      playingAudio.onended = async function(){
        if(list.length==0){
          let ind = audiospeaker.playingAudios.indexOf(playingAudio)
          if(ind>-1)audiospeaker.playingAudios.splice(ind,1)
          return
        }
        playingAudio.src = list.shift()
        if(options && options.pause)await this.wait(options.pause)
        playingAudio.play()
      }
      playingAudio.play()
    } catch (e) {
      console.log('could not load audio',e);
    }
  },
  wait: function(time){
    return new Promise(function(resolve, reject) {
      console.log('wait for',time);
      setTimeout(function(){resolve(true)},time)
    });
  },
  playAudio: function(audio){
    //audio is path to existing audiofile
    return new Promise(function(resolve, reject) {
      try {
        let playingAudio = new Audio(audio)
        playingAudio.onended = function(){
          console.log('audio ended',audio);
          resolve(true)
        }
        playingAudio.onerror = function(e){
          console.log('audio not played',e);
          resolve(false)
        }
        playingAudio.play()
      } catch (e) {
        console.error('playing audio error',e)
        resolve(false)
      }
    });
  },
  loops:{},
  playLoop: function(src){
    try {
      let playingAudio = new Audio(src)
      playingAudio.onended = function(){
        console.log('audio ended',playingAudio);
        this.currentTime = 0;
        this.play()
      }
      playingAudio.onerror = function(e){
        console.log('audio not played',e);
      }
      let id = Math.floor(Math.random()*1000000)
      playingAudio.play()
      this.loops[id]=playingAudio
      return id
    } catch (e) {
      console.log('audio not played',e);
    }
  },
  abortLoop: function(id){
    if(!this.loops[id])return
    this.loops[id].pause()
    delete this.loops[id]
  },
  playWord: function(word){
    return this.playAudio('audios/words/de/'+word+'.ogg')
  },
}
