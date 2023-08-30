const game = {
  tux: {
    speed_states: {
      default: 0.2,
      increase: 0.01,
      downward: 0.3,
    },
    speed: 0.2, //px per ms
    vertical_speed: 0, //px per ms
    vertical_pos: 0, //pos of tux vertically in px
    jump_decrease_speed: 0.001, //decrease vertical speed in jump by this per ms
    jump_initial_speed: 1.1, //start speed of jump
    horizontal_pos: 100,
    width: 70,
    height: 100,
    runned_distance: 0,
    runned_time: 0,
    state: 'start',
    last_state: 'start',
    time_to_wait_after_crash: 1000,
    time_for_countdown: 3000,
    imagesources: {
      default: 'skatertux/images/skatertux.png',
      crashing: 'skatertux/images/skatertuxcrashing.png',
      crashed: 'skatertux/images/skatertuxcrashed.png',
      jumping: 'skatertux/images/skatertuxjump.png',
      start:  'skatertux/images/skatertuxstart.png',
      rampup: 'skatertux/images/skatertux.png',
      end: 'skatertux/images/skatertuxstand.png',
      grinding: 'skatertux/images/skatertuxgrind.png',
    },
  },
  current_level: {
    active_obstacles: [],
    remaining_obstacles: [],
    background: null,
    width: 1000,
    height:600,
    collected_items:[],
    grinded_obstacles:[],
  },
  paused: false,
  wait_time_to_start:1000,
  userinput:{
    pressed_keys:{},
    jump: false,
    grind: false,
    // duck: false,
    // brake: false,
    // accelerate: false,
    map:{
      keyboard: {
        jump: ' ', //spacebar on keyboard
        pause: 'p',
        grind: 'ArrowDown',
      },
      gamepad: {
        jump: 0, //buttonnr on gamepad
        pause: 11,
        grind: "ArrowDown",
      }
    }
  },
  init_key_control: function(){
    document.onkeydown = function(e){
      game.userinput.pressed_keys[e.key]=true
    }
    document.onkeyup = function(e){
      delete game.userinput.pressed_keys[e.key]
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
  update_user_input: function(){
    game.gamepad = navigator.getGamepads()[0]
    this.userinput.jump = this.check_button('jump')
    this.userinput.grind = this.check_button('grind')
    if(this.check_button('pause')){
      this.paused = !this.paused
    }
    // let input = this.userinput
    // this.userinput.jump = input.pressed_keys[input.map.keyboard.jump] || false
    // if(game.gamepad && game.gamepad.buttons[input.map.gamepad.jump])this.userinput.jump = true
  },
  log_gamepad_button: function(){
    for(let i=0;i<game.gamepad.buttons.length;i++){
      if(game.gamepad.buttons[i].pressed){
        console.log('gamepad button pressed',i);
      }
    }
  },
  check_button: function(action){
    // this.log_gamepad_button()
    if(this.userinput.pressed_keys[this.userinput.map.keyboard[action]])return true
    if(game.gamepad && this.userinput.map.gamepad[action] == this.userinput.map.gamepad[action] * 1 &&
       game.gamepad.buttons[this.userinput.map.gamepad[action]].pressed){
      // console.log(game.gamepad.buttons[this.userinput.map.gamepad[action]]);
      return true
    }else if(game.gamepad && typeof this.userinput.map.gamepad[action] === 'string'){
      // console.log(game.gamepad.buttons[this.userinput.map.gamepad[action]]);
      let gamepad_axes = this.userinput.map.gamepad[action]
      if(gamepad_axes === 'ArrowDown' &&
      (game.gamepad.axes[1]>0.5 || game.gamepad.axes[7]>0.5)){
        return true
      }
    }

    return false
  },
  roundtime: 20,
  loop:{
    stop: false,
    start: null,
  },
  init: async function(){
    await gui.loadFile('skatertux/level.js')
    this.init_graphics()
    this.init_key_control()
    this.init_gui()
    mapcreator.init()
  },
  init_gui: function(){
    this.levelcounter = gui.addLevelcounter({
      maxLevel: level.length,
      onLevelUp: function(){
        game.start_game(level[game.levelcounter.actLevel()-1])
        document.activeElement.blur()
      },
      onLevelDown: function(){
        game.start_game(level[game.levelcounter.actLevel()-1])
        document.activeElement.blur()
      },
    })
    this.restartbutton = gui.addFooterButton({
      image: 'images/bar_reload.svg',
      text: 'restart level',
      onclick: function(){
        game.start_game(level[game.levelcounter.actLevel()-1])
        this.blur()
      },
    })
  },
  init_graphics: function(){
    let map = gui.createElement('div', {id: 'map'})
    main.appendChild(map)
    let tux = new Image()
    tux.src= this.tux.imagesources.start
    tux.id='skatertux'
    tux.style.width = this.tux.width + 'px'
    tux.style.height = this.tux.height + 'px'
    tux.style.left = this.tux.horizontal_pos + 'px'
    tux.style.bottom = this.tux.vertical_pos + 'px'
    map.appendChild(tux)
    let countdown = gui.createElement('div',{id:'countdown'})
    map.appendChild(countdown)
    let background = gui.createElement('div',{
      id:'background', style:{
        left: '0px'
      }
    })
    // background.id = "background"
    // background.left = 0
    map.appendChild(background)
    this.dom={
      map: map,
      tux: tux,
      countdown: countdown,
      background: background,
    }

  },
  create_obstacle: function(obstacle_entry){
    let standard = obstacle_types[obstacle_entry.type]
    if(!standard){
      console.err('obstacle not found for type '+obstacle_entry.type,obstacle_entry);
      return
    }
    let obj = {
      type: obstacle_entry.type,
      spawn_time: obstacle_entry.spawn_time,
      spawn_distance: obstacle_entry.spawn_distance,
      // x1: this.current_level.width,
      // x2: this.current_level.width + standard.width,
      x1: obstacle_entry.spawn_distance,
      x2: obstacle_entry.spawn_distance + standard.width,
      y1: obstacle_entry.y || 0,
      y2: (obstacle_entry.y ? obstacle_entry.y + standard.height : standard.height),
      width: standard.width,
      height: standard.height,
      img: new Image(),
      skateable: standard.skateable,
      ramp: standard.ramp,
      upward: standard.upward,
      ramparr: standard.ramparr,
      multisrc: standard.multisrc,
      no_colision: standard.no_colision,
      collectible: standard.collectible,
      grindable: standard.grindable,
    }
    if(standard.grindable)obj.path = standard.path
    obj.img.src = standard.src
    obj.img.classList.add('obst-'+obj.type)
    obj.img.classList.add('obstacle')
    obj.img.style.width = obj.width + 'px'
    obj.img.style.height = obj.height + 'px'
    obj.img.style.bottom = obj.y1 + 'px'
    return obj
  },
  start_game: function(level){
    this.current_level.active_obstacles = []
    this.current_level.remaining_obstacles = []
    this.current_level.collected_items = []
    this.current_level.grinded_obstacles = []
    let oldobstacles = this.dom.map.getElementsByClassName('obstacle')
    while(oldobstacles.length>0)this.dom.map.removeChild(oldobstacles[0])
    this.current_level.run_time = level.run_time
    this.current_level.run_distance = level.run_distance || level.run_time * this.tux.speed_states.default
    this.tux.state = 'start'
    this.tux.runned_time = 0
    this.tux.runned_distance = 0
    this.tux.vertical_speed = 0
    this.wait_time_to_start = this.tux.time_for_countdown
    this.current_level.width = this.dom.map.clientWidth + 10
    this.current_level.max_collectibles=0
    if(level.background){
      this.dom.background.style.left = "0px"
      this.dom.background.style.backgroundImage = `url(${level.background})`
    }
    this.draw_tux()
    let obst=null

    for(let i=0;i<level.obstacles.length;i++){
      obst = this.create_obstacle(level.obstacles[i])
      if(!obst){
        console.warn('obstacle could not be created', obst)
        continue
      }
      if(obst.collectible)this.current_level.max_collectibles++
      this.current_level.remaining_obstacles.push(obst)
      if(obst.spawn_distance < this.current_level.width){
        this.add_obstacle_to_map()
        obst.spawned_at_time = 0
      }
    }
    this.loop.time_since_last_frame = 0
    this.loop.elapsed = 0
    this.move_obstacles() //draw the first items immediately
    this.start_game_loop()
  },
  start_game_loop: function(){
    this.loop.stop = false
    this.loop.start = null
    window.requestAnimationFrame(game_loop)
  },
  move_obstacles: function(){
    let obst = this.current_level.active_obstacles
    let movement = this.loop.time_since_last_frame * this.tux.speed
    for(let i=obst.length-1;i>=0;i--){
      obst[i].x1-=movement
      obst[i].x2-=movement
      obst[i].img.style.left = obst[i].x1 + 'px'
      if(obst[i].x2<0){
        let delobst = obst[i]
        debug.push(obst.splice(i,1))
        this.dom.map.removeChild(delobst.img)
      }
    }
    this.tux.runned_distance+=movement
    if(this.dom.background){
      // console.log('hello', this.dom.background.style.left);
      let oldleft = parseInt(this.dom.background.style.left) || 0
      this.dom.background.style.left =  Math.floor(oldleft- (movement / 100))+'px'
    }
  },
  move_tux: function(){
    //read keyboard/gamepad entrys to see if we have to jump
    let jump = false
    if(this.userinput.jump && this.tux.vertical_speed == 0 && this.tux.last_state != 'crashing'){
      this.tux.vertical_speed = this.tux.jump_initial_speed
      // console.log('do the jump', this.tux.vertical_speed);
      jump = true
      audiospeaker.playAudio('audios/sounds/skatertuxjump.ogg')
    }
    //move tux up- or downward if necesary
    if(this.tux.vertical_speed!=0){
      this.tux.vertical_pos+= this.tux.vertical_speed * this.loop.time_since_last_frame
    }
    if(this.tux.vertical_pos > 0 && this.tux.vertical_speed > this.tux.jump_initial_speed * -1){
      let decrease = this.tux.jump_decrease_speed * this.loop.time_since_last_frame
      if(this.tux.vertical_speed > 0.2) decrease*=3
      else if(this.tux.vertical_speed < -0.2) decrease*=2
      this.tux.vertical_speed -= decrease
    }
    if(this.tux.vertical_pos <= 0){
      this.tux.vertical_speed = 0
      this.tux.vertical_pos = 0
    }
    if(this.tux.vertical_speed > 0)this.tux.state = 'jumping'
    else this.tux.state = 'default'
    // if(this.tux.state=='jumping')console.log('jump');
    // if(jump)console.log('does the jump?', this.tux.vertical_speed);
  },
  check_colision: function(){
    let colides = false
    let obst;
    let tux = {
      x1: this.tux.horizontal_pos,
      x2: this.tux.horizontal_pos + this.tux.width,
      y1: this.tux.vertical_pos,
      y2: this.tux.vertical_pos + this.tux.height,
    }
    for(let i=0;i<this.current_level.active_obstacles.length;i++){
      if(this.current_level.active_obstacles[i].x1 > tux.x2){
        break; //nothing more to do as this and all following are without colision
      }
      obst = this.current_level.active_obstacles[i]
      if(obst.x2 >= tux.x1){
        //possible colision horizontaly - check vertical colision:
        if(tux.y1 > obst.y2)continue; //jumping over obstacle
        if(tux.y2 < obst.y1)continue; //skating underneath obstacle
        //additional checks can be inserted here for grinding or skating
        // over obstacles, reaching goal etc.
        // console.log('skateable obstacle colision', obst.skateable, (obst.y2 - tux.y1 ));
        if(obst.ramp){
          let ramppos = Math.floor(tux.x1 - obst.x1)
          // console.log('ramping up', obst.ramparr, ramppos, this.tux.state);
          console.log('ramping up', this.tux.state, this.tux.vertical_speed);
          if(this.tux.state=='jumping')continue; //let tux jump off the ramp
          if(obst.ramparr && obst.ramparr[ramppos]){
            this.tux.vertical_pos = obst.y1 + obst.ramparr[ramppos]+15
            this.tux.vertical_speed = 0
            // this.tux.state = "rampup"
            if(obst.upward)this.tux.state = "rampup"
          }
          // continue;
          break; //we dont want to check other obstacles and continue to ramp up?
        }
        if(obst.grindable){
          console.log('hit grindable, grinddown:',this.userinput.grind, 'jump down:',this.userinput.jump);
          let pathpos = Math.floor(tux.x1 - obst.x1)
          console.log('pathpos, tux.x1, obst.x1', pathpos, tux.x1, obst.x1);
          console.log('tux-state:',this.tux.state);
          let pathy = obst.path.route[pathpos] + obst.y1
          let difftopath = tux.y1 - pathy
          if(difftopath<0)difftopath*=-1
          if(this.userinput.grind && !this.userinput.jump &&
            difftopath < 10 && pathpos >=0 &&
            obst.path.route[pathpos]!=undefined){
            this.tux.state="grinding"
            console.log('enter grinding');
          }
          if(this.tux.state=="grinding" && pathpos >=0 && difftopath <10){
            //follow path.route
            this.tux.vertical_speed = 0
            this.tux.vertical_pos = obst.y1 + obst.path.route[pathpos]
            if(this.current_level.grinded_obstacles[this.current_level.grinded_obstacles.length-1]!=obst){
              this.current_level.grinded_obstacles.push(obst)
            }
            console.log("follow path.route number "+this.current_level.grinded_obstacles.length,
            'pathpos, pathy, obst.path.route[pathpos], tux y',
            pathpos,pathy, obst.path.route[pathpos],this.tux.vertical_pos);
            continue
          }
        }

        if(obst.skateable && obst.y2 - tux.y1 < 20){
          this.tux.vertical_speed = 0
          this.tux.vertical_pos = obst.y2
          continue;
        }

        if(obst.collectible){
          this.current_level.collected_items.push(obst)
          // obst.collectible=false
          // obst.multisrc = {
          //   count: 17,
          //   base: 'skatertux/images/obstacles/sparkle-',
          //   ending: 'png',
          //   animation_time: 1000,
          //   animation_count: 1,
          // }
          // obst.spawned_at_time = this.loop.elapsed
          // console.log('collectible found', obst);
          //remove collectible:
          // debug.push(this.current_level.active_obstacles[i])
          debug.push(obst)
          let spark = this.create_obstacle({
            type:'spark',
            y: obst.y1,
            spawn_distance: obst.x1,
          })
          spark.x1 = obst.x1
          spark.x2 = obst.x2
          spark.spawned_at_time = this.loop.elapsed
          this.current_level.active_obstacles[i]=spark
          this.dom.map.removeChild(obst.img)
          this.dom.map.appendChild(spark.img)
          audiospeaker.playAudio('audios/sounds/coin.ogg')
          continue;
        }
        if(obst.no_colision)continue;
        //if we reach this point a colision has been found, so break the loop:
        colides = true
        console.log('crashed into obstacle',obst,'tux:', tux);
        break
      }
    }
    if(colides){
      this.tux.state = 'crashing'
      if(this.tux.last_state != this.tux.state)audiospeaker.playAudio('audios/sounds/hurt.ogg')
    }else if(this.tux.last_state == 'crashing'){
      if(this.tux.vertical_speed ==0){
        this.tux.state = 'crashed'
        this.wait_time_to_start = this.tux.time_to_wait_after_crash
      }else{
        this.tux.state = 'crashing'
      }
    }
  },
  draw_tux: function(){
    this.dom.tux.style.bottom = this.tux.vertical_pos + 'px'
    this.dom.tux.style.left = this.tux.horizontal_pos + 'px'
    if(this.tux.state != this.tux.last_state){
      this.dom.tux.src = this.tux.imagesources[this.tux.state]
      this.tux.last_state = this.tux.state
    }
    if(this.tux.state == 'rampup')this.dom.tux.style.transform = "rotate(-18deg)"
    else this.dom.tux.style.transform = ""
    if(this.tux.state == 'grinding' && !this.grinding_audio_loop){
        this.grinding_audio_loop = audiospeaker.playLoop('audios/sounds/fizz.ogg')
    }else if(this.grinding_audio_loop && this.tux.state != 'grinding'){
      audiospeaker.abortLoop(this.grinding_audio_loop)
      this.grinding_audio_loop = false
    }
  },
  animate_obstacles: function(){
    for(let i=0;i<this.current_level.active_obstacles.length;i++){
      let obs = this.current_level.active_obstacles[i]
      if(!obs.multisrc)continue;
      // if(obs.multisrc.animation_count===0)continue
      // let index = Math.floor((this.loop.elapsed*100) % obs.multisrc.count)
      // let dividor = 300 / obs.multisrc.count
      // let eldiv = this.loop.elapsed / dividor
      // let index = Math.floor(eldiv % obs.multisrc.count)
      let livetime = this.loop.elapsed - obs.spawned_at_time
      livetime = livetime % obs.multisrc.animation_time
      let index = Math.floor(livetime / obs.multisrc.frame_time)
      obs.img.src = obs.multisrc.base + index + obs.multisrc.ending
      // if(obs.multisrc.animation_count > 0 && index>=obs.multisrc.count){
      //   obs.multisrc.animation_count--
      // }
    }
  },
  add_tux_runtime: function(){
    if(this.tux.state=='crashing')return
    this.tux.runned_time+=game.loop.time_since_last_frame
  },
  add_obstacle_to_map: function(){
    if(this.current_level.remaining_obstacles.length  == 0 ||
       // this.current_level.remaining_obstacles[0].spawn_time > this.tux.runned_time)return
       // this.current_level.remaining_obstacles[0].spawn_distance > this.tux.runned_distance)return
       this.current_level.remaining_obstacles[0].spawn_distance > this.tux.runned_distance + this.current_level.width)return
    let obstacle = this.current_level.remaining_obstacles.shift()
    this.current_level.active_obstacles.push(obstacle)
    this.dom.map.appendChild(obstacle.img)
    //as we dont spawn at a fixed point we have to substract the yet-runned-distance:
    obstacle.x1-=this.tux.runned_distance
    obstacle.x2-=this.tux.runned_distance
    //correct obstacle-distance:
    // let correction = this.tux.runned_distance - obstacle.spawn_distance
    // obstacle.x1 -= correction
    // obstacle.x2 -= correction
    // console.log(correction);
    obstacle.spawned_at_time = this.loop.elapsed
    // console.log('appending obstacle', obstacle);
  },
  round: async function(){
    if(this.paused == true){
      this.update_user_input()
      return
    }
    if(this.wait_time_to_start>0){
      this.wait_time_to_start-=this.loop.time_since_last_frame
      if(this.tux.state=='start'){
        this.dom.countdown.innerText = Math.floor((this.wait_time_to_start / 1000)+1)
        this.dom.countdown.classList.toggle('active', this.dom.countdown.innerText > 0)
      }
      this.draw_tux()
      return
    }else{
      if(this.tux.state=='crashed'){
        this.wait_time_to_start = this.tux.time_for_countdown
        this.tux.state='start'
        this.draw_tux()
        return
      }else{
        this.dom.countdown.classList.remove('active')
      }
    }
    this.update_user_input()
    this.move_obstacles()
    this.move_tux()
    this.check_colision()
    this.draw_tux()
    this.animate_obstacles()
    this.add_tux_runtime()
    this.add_obstacle_to_map()
    this.end_game()
  },
  end_game: async function(){
    // if(this.tux.runned_time<this.current_level.run_time)return
    if(this.tux.runned_distance<this.current_level.run_distance)return
    if(this.tux.vertical_pos>0)return //we dont want to end in mid-air
    game.loop.stop=true
    this.tux.state = 'end'
    this.draw_tux()
    // this.dom.countdown.innerText = 'Hurra gewonnen! '
    // this.dom.countdown.classList.add('active')
    audiospeaker.playAudio('audios/sounds/welldone.ogg')
    await gui.showCongratulation(true, 3000)
    // this.start_game(level[this.levelcounter.actLevel()-1])
    this.show_endgame()
  },
  show_endgame: async function(){
    this.endgame_time_start = null
    this.endgame_time = this.endgame_time_start
    this.endgame_items = []
    this.endgame_used_items = []
    let collectible_wait_time=500
    let first_wait_time=500
    let wait_till_now=first_wait_time
    let clock_dom_object = gui.createElement('div',{
      id: 'endgame_clock',
      // innerHTML: `<img src="skatertux/images/clock.png">
      // <div id="endgame_clock_time">${Math.floor(this.loop.elapsed/100)/10}</div>`,
      innerHTML: `<img src="skatertux/images/clock.png"><div id="endgame_clock_time"></div>`,
    })
    this.endgame_time_object = {
      clock: true,
      dom_object:clock_dom_object,
      spawn_time: wait_till_now,
      audio: 'audios/sounds/mr_treehit2.ogg',
      clock_time: Math.floor((game.loop.elapsed-game.tux.time_for_countdown)/100)/10,
      animation_time: 2200,
    }
    this.endgame_time_object.animation_multiply = this.endgame_time_object.clock_time / this.endgame_time_object.animation_time
    this.endgame_items.push(this.endgame_time_object)
    wait_till_now+=this.endgame_time_object.animation_time
    this.endgame_items.push({
      spawn_time:wait_till_now,
      audio: 'audios/sounds/tada.ogg',
    })
    wait_till_now+= first_wait_time*2
    for(let i=0;i<this.current_level.collected_items.length;i++){
      let collect={
        collectible: true,
        item: this.current_level.collected_items[i],
        spawn_time: wait_till_now,
        audio: 'audios/sounds/lifeup.ogg',
      }
      this.endgame_items.push(collect)
      wait_till_now+=collectible_wait_time
    }
    if(this.current_level.collected_items.length == this.current_level.max_collectibles){
      this.endgame_items.push({
        spawn_time:wait_till_now,
        audio: 'audios/sounds/bonus.ogg',
      })
    }
    wait_till_now+=500
    this.endgame_screen = gui.createElement('div',{id:'endgame_screen'})
    this.collectible_screen = gui.createElement('div',{id:'collectible_end_screen'})
    this.clock_wrapper = gui.createElement('div',{id:'endgame_clock_wrapper'})
    this.endgame_clock_set = false
    this.endgame_screen.appendChild(this.clock_wrapper)
    this.endgame_screen.appendChild(this.collectible_screen)
    main.appendChild(this.endgame_screen)
    window.requestAnimationFrame(this.show_endgame_loop)
  },
  show_endgame_loop: async function(timestamp){
    if(!game.loop.stop){
      main.removeChild(game.endgame_screen)
      return
    }
    if(game.endgame_time_start===null)game.endgame_time_start=timestamp
    // console.log('endgameloop',timestamp);
    let elapsed = timestamp-game.endgame_time_start

    if(game.endgame_items.length>0 && elapsed > game.endgame_items[0].spawn_time){
      let item = game.endgame_items.shift()
      console.log('adding endgame item',item, item.audio);
      if(item.collectible){
        let domitem = item.item.img
        game.endgame_used_items.push(item)
        game.collectible_screen.appendChild(domitem)
      }
      if(item.clock){
        game.clock_wrapper.appendChild(item.dom_object)
        game.endgame_clock_set = true
      }
      if(item.audio)audiospeaker.playAudio(item.audio)
    }
    if(elapsed > game.endgame_time_object.spawn_time + game.endgame_time_object.animation_time){
      endgame_clock_time.innerText = game.endgame_time_object.clock_time
    }else if(game.endgame_clock_set && endgame_clock_time){
      let to = game.endgame_time_object
      let clock_time = elapsed - to.spawn_time
      // console.log('clocktime1:',clock_time);
      clock_time*=to.animation_multiply
      // console.log('clocktime2:',clock_time);
      clock_time = Math.floor((clock_time)*10)/10
      // console.log('clocktime3:',clock_time);
      endgame_clock_time.innerText = clock_time
    }
    for(let i=0;i<game.endgame_used_items.length;i++){
      let act = game.endgame_used_items[i].item
      let resttime = elapsed % act.multisrc.animation_time
      let timeframe = act.multisrc.animation_time / act.multisrc.count
      let ind = Math.floor(resttime / timeframe)
      act.img.src = act.multisrc.base + ind + act.multisrc.ending
    }
    window.requestAnimationFrame(game.show_endgame_loop)
  },


}





async function game_loop(timestamp){
  if(game.loop.stop)return
  if(game.loop.start==null){
    game.loop.start=timestamp
    game.loop.last_frame = timestamp
  }
  game.loop.elapsed = timestamp - game.loop.start
  game.loop.time_since_last_frame = timestamp - game.loop.last_frame
  window.requestAnimationFrame(game_loop)
  await game.round()
  game.loop.last_frame = timestamp
}

const mapcreator = {
  backgrounds:{
    arctic: {src:'skatertux/images/backgrounds/semi_arctic.jpg'},
    forest: {src:'skatertux/images/backgrounds/blue-middle.jpg'},
  },
  level: {
    background: 'skatertux/images/backgrounds/semi_arctic.jpg',
    run_time: 30000,
    obstacles: [],
    entry_by_id: {},
  },
  reset_level: function(){
    this.level.obstacles = []
    this.level.entry_by_id = {}
    this.oldlevelnr = undefined
    // newlevel.innerHTML = ''
    let oldobstacles = newlevel.getElementsByClassName('obstacle')
    while(oldobstacles.length>0)oldobstacles[0].classList.remove('obstacle')
  },
  init_optionbar: function(){
    let optionbar = gui.createElement('div',{id:"optionbar"})
    let savebutton = gui.createElement('button', {
      id: 'save_new_level',
      innerHTML: `<img src="images/bar_ok.svg">`,
      onclick: function(){
        mapcreator.export_level()
        mapcreator.save_level()
        mapcreator.quit()
        // creator.classList.toggle('active',false)
      }
    })
    let bgstring = ""
    let bgnames = Object.keys(this.backgrounds)
    for(let i=0;i<bgnames.length;i++){
      bgstring+=`<option value="${bgnames[i]}">${bgnames[i]}</option>`
    }
    let backgroundselect = gui.createElement('select',{
      innerHTML:bgstring,
      onchange: function(e){
        mapcreator.level.background = mapcreator.backgrounds[this.value].src
        newlevel.style.backgroundImage = `url(${mapcreator.backgrounds[this.value].src})`
      },
    })
    optionbar.appendChild(backgroundselect)
    optionbar.appendChild(savebutton)
    return optionbar
  },
  init: function(){
    let creator = gui.createElement('div',{
      id: "creator"
    })
    let map = gui.createElement('div',{id: "newlevel"})
    let mapwrapper = gui.createElement('div',{id:"newlevelwrapper"})
    mapwrapper.appendChild(map)
    let obstaclebar = gui.createElement('div',{id:"obstaclebar"})
    let optionbar = this.init_optionbar()
    creator.appendChild(optionbar)
    creator.appendChild(mapwrapper)
    creator.appendChild(obstaclebar)
    main.appendChild(creator)

    let obstacle_names = Object.keys(obstacle_types)
    for(let i=0;i<obstacle_names.length;i++){
      let obst = obstacle_types[obstacle_names[i]]
      let obst_name = obstacle_names[i]
      let obstacle_button = gui.createElement('button', {
        innerHTML: `<img src="${obst.src}" class="obst-${obst_name}" alt="${obst_name}">`,
        name: obst_name,
        onclick: function(){
          mapcreator.add_obstacle(this.name)
        },
      })
      obstaclebar.appendChild(obstacle_button)
      newlevel.style.backgroundImage = `url(${this.level.background})`
      let newlevelwidth = this.level.run_time * game.tux.speed_states.default
      newlevelwidth+=2000
      newlevel.style.width = newlevelwidth + 'px'
    }
    window.onmousemove = function(e){
    // window.onmouseup = function(e){
      // console.log('move-start',mapcreator.grabbedObstacle, window.mouseup);
      if(!mapcreator.grabbedObstacle)return
      if(window.mouseup)return
      // console.log(mapcreator.grabbedObstacle);
      let entry = mapcreator.level.entry_by_id[mapcreator.grabbedObstacle.id]
      let movx = e.clientX - mapcreator.lastMouseX
      let movy = e.clientY - mapcreator.lastMouseY
      entry.spawn_distance += movx
      entry.y -= movy
      mapcreator.lastMouseX+=movx
      mapcreator.lastMouseY+=movy
      mapcreator.grabbedObstacle.style.left = entry.spawn_distance + 'px'
      mapcreator.grabbedObstacle.style.bottom = entry.y + 'px'
      // mapcreator.grabbedObstacle = false
      console.log('move-end',mapcreator.grabbedObstacle);
    }
    window.onmouseup = function(e){
      window.mouseup = true
      console.log('what? before', mapcreator.grabbedObstacle);
      delete mapcreator.grabbedObstacle
      console.log('what? after', mapcreator.grabbedObstacle);
    }
    gui.addFooterButton({
      image: 'images/bar_config.svg',
      text: 'new level',
      onclick: function(){
        creator.classList.toggle('active')
        game.loop.stop = true
      }
    })
    document.addEventListener('keydown',this.keylistener)
    this.addTux()
  },
  addTux: function(){
    let tux = new Image()
    tux.id = 'previewtux'
    tux.src =game.tux.imagesources.default
    tux.width = game.tux.width
    tux.height = game.tux.height
    tux.draggable = false
    tux.style.left = game.tux.horizontal_pos + 'px'
    tux.style.bottom = 0
    tux.onmousedown = function(e){
      mapcreator.tuxmoveX = e.clientX
      mapcreator.tuxmoveY = e.clientY
      mapcreator.tuxmove = true
    }
    window.addEventListener('mousemove',function(e){
      if(!mapcreator.tuxmove)return
      let movex = e.clientX - mapcreator.tuxmoveX
      let movey = e.clientY - mapcreator.tuxmoveY
      let newX = parseInt(previewtux.style.left) + movex
      let newY = parseInt(previewtux.style.left) - movey
      previewtux.style.left = newX + 'px'
      previewtux.style.bottom = newY + 'px'
    })
    window.addEventListener('mouseup', function(e){
      mapcreator.tuxmove = false
    })
    newlevel.appendChild(tux)
    newlevelwrapper.addEventListener('scroll',function(){
      previewtux.style.left = (this.scrollLeft + game.tux.horizontal_pos) + 'px'
      console.log('scrolling', previewtux.style.left, this.scrollLeft);
    })
  },
  keylistener: function(e){
    console.log('keydown', e.key, creator.classList.contains('active'), mapcreator.activeEntry);
    if(!creator.classList.contains('active'))return
    if(!mapcreator.activeEntry)return
    if(e.key=='ArrowLeft'){
      mapcreator.activeEntry.spawn_distance -= 10;
    }
    if(e.key=='ArrowRight'){
      mapcreator.activeEntry.spawn_distance += 10;
    }
    if(e.key=='ArrowUp'){
      mapcreator.activeEntry.y += 10;
    }
    if(e.key=='ArrowDown'){
      mapcreator.activeEntry.y -= 10;
    }
    if(e.key=='Delete'){
      let ind = mapcreator.level.obstacles.indexOf(mapcreator.activeEntry)
      if(ind>-1)mapcreator.level.obstacles.splice(ind,1)
      delete mapcreator.level.entry_by_id[mapcreator.activeEntry.id]
      newlevel.removeChild(mapcreator.activeEntry.dom_object)
      mapcreator.activeEntry = undefined
      return
    }
    mapcreator.activeEntry.dom_object.style.left = mapcreator.activeEntry.spawn_distance + 'px'
    mapcreator.activeEntry.dom_object.style.bottom = mapcreator.activeEntry.y + 'px'
  },
  activate_obstacle: function(id){
    mapcreator.activeEntry = mapcreator.level.entry_by_id[id]
    let oldobstacle = newlevel.getElementsByClassName('selected')
    while(oldobstacle.length>0)oldobstacle[0].classList.remove('selected')
    mapcreator.activeEntry.dom_object.classList.add('selected')
  },
  add_obstacle: function(name){
    let domobst = new Image()
    domobst.src = obstacle_types[name].src
    domobst.id = name + Math.floor(Math.random()*100000)
    domobst.width = obstacle_types[name].width
    domobst.height = obstacle_types[name].height
    domobst.classList.add('obstacle')
    domobst.classList.add('obst-'+name)
    domobst.draggable = false
    domobst.onmousedown = function(e){
      mapcreator.grabbedObstacle = this
      mapcreator.lastMouseX = e.clientX
      mapcreator.lastMouseY = e.clientY
      window.mouseup = false
      console.log('grabbed',this.id);
    }
    domobst.onclick = function(e){
      mapcreator.activate_obstacle(this.id)
      console.log('obstacle selected',this.id);
    }


    let entry = {
      type: name,
      y: 0,
      spawn_distance: newlevelwrapper.scrollLeft + 300,
      id: domobst.id,
      dom_object: domobst,
    }
    domobst.style.left = entry.spawn_distance + 'px'
    domobst.style.bottom = entry.y + 'px'
    newlevel.appendChild(domobst)
    this.level.obstacles.push(entry)
    this.level.entry_by_id[entry.id] = entry
    mapcreator.activate_obstacle(entry.id)
    return entry
  },
  cleanup_level: function(){
    if(this.level.obstacles.length==0)return
    this.level.obstacles.sort(function(a,b){
      return a.spawn_distance - b.spawn_distance
    })
    let firstpenguin = null
    for(let i=0;i<this.level.obstacles.length;i++){
      let ob = this.level.obstacles[i]
      if(ob.type=='penguin')firstpenguin=ob
    }
    let distance = this.level.obstacles[this.level.obstacles.length-1].spawn_distance + 500
    if(firstpenguin)distance =  firstpenguin.spawn_distance
    // distance += 500
    this.level.run_distance = distance
  },
  export_level: function(){
    this.cleanup_level()
    let obstarr = ''
    for(let i=0;i<this.level.obstacles.length;i++){
      let ob = this.level.obstacles[i]
      // if(ob.type=='penguin')firstpenguin=ob
      obstarr+=`{type:'${ob.type}', spawn_distance:${ob.spawn_distance}, y:${ob.y}},`
      obstarr+='\n\t'
    }
    let levelstring = `{
  background: '${this.level.background}',
  run_time: 30000,
  run_distance: ${this.level.run_distance},
  obstacles:[
    ${obstarr}
  ],
},`
  console.log(levelstring)
  },
  save_level: function(){
    this.cleanup_level()
    let lvl = {
      background: this.level.background,
      run_time: this.level.run_time,
      obstacles: [],
    }
    for(let i=0;i<this.level.obstacles.length;i++){
      lvl.obstacles[i]={
        type: this.level.obstacles[i].type,
        spawn_distance: this.level.obstacles[i].spawn_distance,
        y: this.level.obstacles[i].y,
      }
    }
    if(!this.level.oldlevelnr){
      level.push(lvl)
      game.levelcounter.node.maxLevel++
    }else level[this.level.oldlevelnr] = lvl
  },
  load_level: function(levelnr){
    this.reset_level()
    for(let i=0;i<level[levelnr].obstacles.length;i++){
      let oldobst = level[levelnr].obstacles[i]
      let obst = this.add_obstacle(oldobst.type)
      obst.spawn_distance = oldobst.spawn_distance
      obst.y = oldobst.y
      obst.dom_object.style.left = oldobst.spawn_distance + 'px'
      obst.dom_object.style.bottom = oldobst.y + 'px'
    }
    this.level.oldlevelnr = levelnr
    // this.level.obstacles = level[levelnr].obstacles
    this.level.run_time = level[levelnr].run_time
    this.level.background = level[levelnr].background
  },
  quit: function(){
    creator.classList.remove('active')
    if(this.level.oldlevelnr)game.start_game(level[this.level.oldlevelnr])
    else game.start_game(level[level.length-1])
  }

}

game.init()
setTimeout("game.start_game(level[0])",1000)
var debug = []
