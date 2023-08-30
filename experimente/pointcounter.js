class Pointcounter{
  constructor(max, idcount){
    this.max = max;
    this.wrapper = document.createElement('div')
    this.wrapper.classList.add('pointcounter')
    if(idcount)this.wrapper.id='pointcounter'+idcount
    else this.wrapper.id='pointcounter'
    for(x=0;x<max;x++){
            
    }
  }

}
