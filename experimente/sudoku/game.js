game = {
  active_sudoku_nr:0,
  init: async function(){
    await gui.loadFile('sudoku/sudokus.js')
    this.init_gui()
    this.init_sudoku(sudokus[this.active_sudoku_nr])
  },
  init_gui: function(){
    let sudokufield = gui.createElement('div',{
      id:'sudokufield'
    })
    for(let i=0;i<81;i++){
      let field = gui.createElement('div',{
        id:'field'+i,
        nr:i,
        changeable: true,
        innerHTML: '<div class="display"></div><div class="notes"></div>',
        onclick: function(){
          if(this.changeable)game.set_active_field(this.nr)
        }
      })
      sudokufield.appendChild(field)
    }
    let buttonfield = gui.createElement('div',{
      id:'buttons',
    })
    let pencilbutton = gui.createElement('button',{
      id:'pencil',
      className:'numberbutton',
      innerText: '✏',
      onclick: function(){
        game.pencil = !game.pencil
        this.classList.toggle('active',game.pencil)
      }
    })
    buttonfield.appendChild(pencilbutton)

    for(i=0;i<=9;i++){
      let button = gui.createElement('button',{
        id:'number'+i,
        className:'numberbutton',
        nr: i,
        innerText: i || "X",
        onclick: function(){
          game.insert_number(this.nr)
        },
      })
      buttonfield.appendChild(button)
    }

    main.appendChild(sudokufield)
    main.appendChild(buttonfield)
  },
  set_active_field: function(nr){
    this.activeField = nr
    let old = document.getElementsByClassName('activeField')
    while(old.length>0)old[0].classList.remove('activeField')
    document.getElementById('field'+nr).classList.add('activeField')
  },
  insert_number: function(nr){
    if(this.pencil){
      let nf = document.querySelector(`#field${this.activeField} .notes`)
      let ind = nf.innerText.indexOf(nr)
      if(ind>=0)nf.innerText = nf.innerText.substring(0,ind)+nf.innerText.substring(ind+1)
      else nf.innerText = nf.innerText + nr
      return
    }
    this.sudoku[this.activeField] = nr
    let t=nr || " "
    let af = document.getElementById('field'+this.activeField)
    af.firstChild.innerText=t
    af.classList.toggle('filled', nr!=0)
    
    this.check_after_change()
  },
  init_sudoku: function(sudokuarr){
    this.sudoku = sudokuarr || sudokus[0]
    let sudoku = this.sudoku
    for(let i=0;i<81;i++){
      let field = document.getElementById('field'+i)
      if(sudoku[i]==0){
        field.firstChild.innerText = " "
        field.changeable = true
        field.classList.remove('prefilled')
        this.activeField = i
      }
      else{
        field.firstChild.innerText = sudoku[i]
        field.changeable = false
        field.classList.add('prefilled')
      }
    }
  },
  check_after_change: function(){
    let number_count=[]
    let row_numbers=[]
    let col_numbers=[]
    let square_numbers=[]
    let wrong_numbers = []
    let oldwrongs = document.getElementsByClassName('wrong')
    let col = 0; let row=0; let squarenr=0;
    while(oldwrongs.length>0)oldwrongs[0].classList.remove('wrong')
    let i=0;
    for(i=0;i<81;i++){
      if(number_count[this.sudoku[i]])number_count[this.sudoku[i]]++
      else number_count[this.sudoku[i]]=1
      row = Math.floor(i / 9)
      col = i % 9
      squarenr = Math.floor(row/3)*3 + Math.floor(col/3)
      if(!row_numbers[row])row_numbers[row]=[]
      if(!square_numbers[squarenr])square_numbers[squarenr]=[]
      if(!col_numbers[col])col_numbers[col]=[]
      if(row_numbers[row][this.sudoku[i]])wrong_numbers[this.sudoku[i]]=true
      else row_numbers[row][this.sudoku[i]]=true
      if(col_numbers[col][this.sudoku[i]])wrong_numbers[this.sudoku[i]]=true
      else col_numbers[col][this.sudoku[i]]=true
      if(square_numbers[squarenr][this.sudoku[i]])wrong_numbers[this.sudoku[i]]=true
      else square_numbers[squarenr][this.sudoku[i]]=true
    }
    let cleared_numbers = 0
    for(i=1;i<=9;i++){
      let b = document.getElementById('number'+i)
      if(number_count[i]==9){
        cleared_numbers++
        b.disabled = true
        b.classList.add('disabled')
      }else{
        b.disabled = false
        b.classList.remove('disabled')
      }
      if(number_count[i]>9){
        wrong_numbers[i]=true
      }
    }
    for(i=0;i<81;i++){
      if(this.sudoku[i]==0)continue;
      if(wrong_numbers[this.sudoku[i]]){
        document.getElementById('field'+i).classList.add('wrong')
      }
    }
    if(cleared_numbers==9){
      alert('sudoku cleared')
      this.active_sudoku_nr++
      this.init_sudoku(sudokus[this.active_sudoku_nr])
    }
  },
}
game.init()
