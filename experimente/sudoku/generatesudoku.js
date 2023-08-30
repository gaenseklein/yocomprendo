function create_sudoku(max_number){
  let sudoku = []
  let total_fields = max_number * max_number
  let squareroot = Math.sqrt(max_number)
  let squareheight = Math.floor(squareroot)
  let squarenr = 0
  let square_numbers = []
  let row_numbers = []
  let col_numbers = []
  let i = 0

  let row  = 0
  let col = 0
  let try_number = Math.floor(Math.random()*max_number)+1
  for(i=0;i<max_number;i++){
    col=i
    square_numbers.push([])
    row_numbers.push([])
    col_numbers.push([])
    while(row_numbers[0].indexOf(try_number)>-1)try_number = Math.floor(Math.random()*max_number)+1
    row_numbers[0].push(try_number)
    squarenr = Math.floor(col/squareheight)
    square_numbers[squarenr].push(try_number)
    col_numbers[i].push(try_number)
    sudoku.push(try_number)
  }
  for(i=max_number;i<total_fields;i++){
    row = Math.floor(i / max_number)
    col = i % max_number
    squarenr = Math.floor(row/squareheight)*squareheight + Math.floor(col/squareheight)
    field_possible_numbers = []
    for(let n=1;n<=max_number;n++){
      if(row_numbers[row].indexOf(n)==-1 &&
         col_numbers[col].indexOf(n)==-1 &&
         square_numbers[squarenr].indexOf(n)==-1
       ){
        field_possible_numbers.push(n)
       }
    }
    if(field_possible_numbers.length==0){
      // console.log('missed at', i)
      // console.log('row '+row+':', row_numbers[row],'col'+col+':',col_numbers[col],'square'+squarenr+':',square_numbers[squarenr]);
      if(!missed[i])missed[i]=1
      else missed[i]++
      return false;
    }
    try_index = Math.floor(Math.random()*field_possible_numbers.length)
    try_number = field_possible_numbers[try_index]
    sudoku.push(try_number)
    row_numbers[row].push(try_number)
    col_numbers[col].push(try_number)
    square_numbers[squarenr].push(try_number)
  }

  return sudoku
}

var missed = {}

function build_sudokus(max_sudokus, max_number){
  let badattempts = 0
  let sudokus = []
  let max = max_sudokus
  let maxnr = max_number || 9
  for(let i=0;i<max;i++){
          // console.log("sudoku")
      let sudoku = create_sudoku(maxnr)
      if(sudoku){
          sudokus.push(sudoku)
          // print_sudoku(sudoku)
      }else{
          badattempts++
      }
  }

  console.log('created', sudokus.length, 'sudokus, failed',badattempts,'times')
  // console.log(missed);
  // console.log(sudokus);
  return sudokus
}


function print_sudoku(sudokuarr){
  let row_max = Math.sqrt(sudokuarr.length)
  let root = Math.floor(Math.sqrt(row_max))
  let line = '------------------------------------'.substring(0,row_max+root+1)+'\n'
  let text = line

  for(let i=0;i<sudokuarr.length;i++){
    if(i%root==0)text+='|'
    if(i%row_max==0 && i>0){
      text+='\n'
      if(Math.floor(i/row_max)%root==0)text+=line+'|'
      else text+='|'
    }
    text+=sudokuarr[i]
  }
  text+='|\n'+line
  console.log(text);
}

const checks = {
  simple: function(sudoku, check_field){
    let pos_numbers = []
    let field = check_field || sudoku.check_field
    for(let i=1;i<=sudoku.max_number;i++){
      if(!sudoku.rows[field.row] || !sudoku.cols[field.col] || !sudoku.squares[field.square]){
        console.log('field',field);
        continue
      }
      if(sudoku.rows[field.row].indexOf(i)==-1 &&
      sudoku.cols[field.col].indexOf(i)==-1 &&
      sudoku.squares[field.square].indexOf(i)==-1){
        pos_numbers.push(i)
      }
    }
    return pos_numbers
  },
  extended_simple: function(target_sudoku){
    let sudoku = JSON.parse(JSON.stringify(target_sudoku))
    let missing_fields = []
    let i=0
    let num=-1
    let check_field = {}
    let pos_numbers = []
    for(i=0;i<sudoku.solved_list.length;i++){
      if(sudoku.solved_list[i]==0)missing_fields.push(i)
    }
    for(let rounds = 0;rounds<10;rounds++){
      for(i=missing_fields.length-1;i>=0;i--){
        check_field = create_target_field_object(sudoku, missing_fields[i])
        pos_numbers = this.simple(sudoku, check_field)
        if(pos_numbers.length==1){
          if(target_sudoku.check_field.nr == missing_fields[i]){
            return pos_numbers
          }
          num=pos_numbers[0]
          sudoku.rows[check_field.row][check_field.col]=num
          sudoku.cols[check_field.col][check_field.row]=num
          sudoku.squares[check_field.square].push(num)
          sudoku.solved_list[missing_fields[i]]=num
        }
      }
    }
    return false
  },
  single_possible_in_line: function(target_sudoku){
    let sudoku = JSON.parse(JSON.stringify(target_sudoku))
    let missing_fields = []
    let rows = []
    let cols = []

    let i=0
    let num=-1
    let check_field = {}
    let pos_numbers = []
    for(i=0;i<sudoku.solved_list.length;i++){
      if(sudoku.solved_list[i]==0)missing_fields.push(i)
    }
    for(i=0;i<missing_fields.length;i++){
      check_field = create_target_field_object(sudoku, missing_fields[i])
      pos_numbers = this.simple(sudoku, check_field)
      if(!rows[check_field.row])rows[check_field.row]=[]
      rows[check_field.row][check_field.col]=pos_numbers
      if(!cols[check_field.col])cols[check_field.col]=[]
      cols[check_field.col][check_field.row]=pos_numbers
    }
    uniques = []
    count_in_row = 0
    let last_col=0
    let last_row=0
    for(i=0;i<9;i++){
      for(num=1;num<=9;num++){
        count_in_row=0
        count_in_col=0
        last_col=-1
        last_row=-1
        for(ii=0;ii<9;ii++){
          if(rows[i] && rows[i][ii] && rows[i][ii].indexOf(num)>-1){
            count_in_row++
            last_col=ii
          }
          if(cols[i] && cols[i][ii] && cols[i][ii].indexOf(num)>-1){
            count_in_col++
            last_row=ii
          }
        }
        if(count_in_row==1)uniques.push({
          row:i, col:last_col, num:num, index: i*9 + last_col,
        })
        if(count_in_col==1)uniques.push({
          col:i, row:last_row, num:num, index: last_row*9 + i,
        })
      }
    }
    return uniques
    // if(uniques.length==0)return false
    //
    // for(i=0;i<uniques.length;i++){
    //   if(uniques[i].row == target_sudoku.check_field.row &&
    //     uniques[i].col == target_sudoku.check_field.col){
    //       return uniques[i].num
    //     }
    //   sudoku.solved_list[uniques[i].row*9 + uniques[i].col]=uniques[i].num
    // }
    // return this.single_possible_in_line(sudoku)
  },
}

function solve_sudoku(sudoku_array, target_field_nr){
  let missing_fields = []
  let i=0
  for(i=0;i<81;i++)if(sudoku_array[i]==0)missing_fields.push(i)
  let target_field_number = target_field_nr || missing_fields[0]
  let solving_object = create_solving_object(sudoku_array,target_field_number)
  let missing_fields_before = missing_fields.length;

  for(i=missing_fields.length-1;i>=0;i--){
    let check_field = create_target_field_object(solving_object, missing_fields[i])
    let simple = checks.simple(solving_object,check_field)
    if(simple.length==1){
      solving_object.solved_list[missing_fields[i]]=simple[0]
      missing_fields.splice(i,1)
      continue
    }
  }
  let uniques = checks.single_possible_in_line(solving_object)
  console.log('uniques:',uniques);
  for(i=0;i<uniques.length;i++){
    solving_object.solved_list[uniques[i].index]=uniques[i].num
    console.log('solved index',uniques[i].index,'with',uniques[i].num);
    let mis_ind = missing_fields.indexOf(uniques[i].num)
    if(mis_ind>-1)missing_fields.splice(mis_ind,1)
  }
  if(missing_fields.length==0)return solving_object.solved_list
  if(missing_fields_before == missing_fields.length){
    console.log('cant solve anymore:');
    print_sudoku(solving_object.solved_list)
    return false
  }
  return solve_sudoku(solving_object.solved_list, target_field_number)
}

function try_to_solve_field(sudoku_array, fieldnr){
  let sudoku = create_solving_object(sudoku_array, fieldnr)
  // console.log();
  // console.log('solving-object',sudoku);
  let pos_numbers = checks.simple(sudoku)
  if(pos_numbers.length==1){
    // console.log('number found',pos_numbers[0]);
    return pos_numbers[0]
  }
  // else if(pos_numbers.length==0){
  //   // console.log('not solvable');
  //   return false
  // }
  pos_numbers = checks.extended_simple(sudoku)
  if(pos_numbers.length==1)return pos_numbers[0]
  //return number for field
}
function create_target_field_object(sudoku, fieldnr){
  //expects a sudoku-solving-object and returns check_field
  let field = {
    nr: fieldnr,
    col: fieldnr % sudoku.max_number,
    row: Math.floor(fieldnr / sudoku.max_number),
  }
  field.square = Math.floor(field.col/sudoku.square_height) + (Math.floor(field.row / sudoku.square_height)*sudoku.square_height)
  return field
}
function create_solving_object(sudoku_array, fieldnr){
  let rows = []
  let cols = []
  let squares = []
  let row = 0
  let col = 0
  let square_number = 0
  let max_number = Math.sqrt(sudoku_array.length)
  let square_height = Math.sqrt(max_number)
  let i = 0
  for(i=0;i<max_number;i++){
    rows.push([])
    cols.push([])
    squares.push([])
  }
  for(i=0;i<sudoku_array.length;i++){
    row = Math.floor(i/max_number)
    col = i % max_number
    square_number = Math.floor(col/square_height) + (Math.floor(row / square_height)*square_height)
    // console.log('square_number',square_number, 'col/row',col,row,'sqh',square_height,'maxnr',max_number);
    if(!rows[row]||!cols[col]){
      console.log('???',rows[row],row,cols[col],col,i, max_number, sudoku_array.length)
      console.log(sudoku_array);
    }
    rows[row][col]=sudoku_array[i]
    cols[col][row]=sudoku_array[i]
    squares[square_number].push(sudoku_array[i])
  }
  let result = {
    rows:rows,
    cols:cols,
    squares:squares,
    max_number:max_number,
    square_height:square_height,
    solved_list: sudoku_array,
    check_field:{
      nr:fieldnr,
      col: fieldnr % max_number,
      row: Math.floor(fieldnr/max_number),
      expected_result: sudoku_array[fieldnr],
    },
  }
  result.check_field.square = Math.floor(result.check_field.col/square_height) + (Math.floor(result.check_field.row / square_height)*square_height)

  return result
}

function masquerade_sudoku(sudoku_array){
  let try_array=[]
  for(let i=0;i<sudoku_array.length;i++){
    try_array.push(sudoku_array[i])
  }

  //masq one:
  let ind = Math.floor(Math.random()*try_array.length)
  let old_value = try_array[ind]
  try_array[ind]=0
  // console.log('try mask field nr',ind,'with value',old_value);

  let try_nr = try_to_solve_field(try_array, ind)
  let masked_fields = 1
  for(let i=0;i<500 && masked_fields < 70 ;i++){
    while (try_array[ind]==0) {
        ind = Math.floor(Math.random()*try_array.length)
    }
    old_value=try_array[ind]
    try_array[ind]=0
    try_nr = try_to_solve_field(try_array, ind)
    if(try_nr!=old_value){
      try_array[ind]=old_value
      ind = Math.floor(Math.random()*try_array.length)
      // console.log('masqueradet',i+1,'fields');
      // print_sudoku(try_array)
      // return try_array
    }else{
      masked_fields++
    }
  }
  console.log('masqueradet',masked_fields,'fields');
  print_sudoku(try_array)
  return try_array
  // if(try_nr==old_value){
  //   console.log('yeah');
  //   print_sudoku(try_array)
  // }
}

//some checks:
let created_sudokus = []
let start = Date.now()

created_sudokus = build_sudokus(5000,9)
console.log('solving',created_sudokus[0]);
// let solver_obj = create_solving_object(created_sudokus[0])
// let solver_obj = create_solving_object(created_sudokus[0],17)
let masked_sudokus = []
for(let m=0;m<created_sudokus.length;m++){
  let s = Date.now()
  masked_sudokus.push(masquerade_sudoku(created_sudokus[m]))
  console.log('time needed', Date.now()-s,'ms');
}
console.log('masquerated',masked_sudokus.length,'sudokus');
// console.log(masked_sudokus);
let avr=0
for(let av=0;av<masked_sudokus.length;av++){
  // console.log(masked_sudokus[av].length);
  for(let avv=0;avv<masked_sudokus[av].length;avv++){
    if(masked_sudokus[av][avv]==0)avr++
  }
}
avr = Math.floor(avr/masked_sudokus.length)
console.log('average masking_fields:',avr);
console.log('total time needed', Date.now()-start,'ms');

// const fs = require('fs')
// fs.writeFileSync('./sudokus.json',JSON.stringify(masked_sudokus),'utf8')
// masquerade_sudoku(created_sudokus[0])
// console.log(solver_obj);

let created = 0
let repeat = 10
let trys_per_build = 20000
s = Date.now()
console.log('solving sudoku');
print_sudoku(masked_sudokus[0])
console.log('.................');
let solved = solve_sudoku(masked_sudokus[0])
if(solved){
  console.log('solved sudoku');
  print_sudoku(solved)
}else {
  console.log('could not solve sudoku');
}
// for(let x=0;x<repeat;x++){
  // created_sudokus = build_sudokus(trys_per_build,9)
//   created+=created_sudokus.length
//   if(created_sudokus[0])print_sudoku(created_sudokus[0])
//
// }
// console.log('total time:', Date.now()-start, 'ms')
// console.log('total build:',created);
// console.log('ratio: 1:', Math.floor(trys_per_build*repeat/created*100)/100);
// console.log('average time per sudoku', Math.floor((Date.now()-start)/created),'ms');
// console.log('average time per build', Math.floor((Date.now()-start)/repeat),'ms');
// console.log('average sudokus per build', Math.floor(created/repeat));
