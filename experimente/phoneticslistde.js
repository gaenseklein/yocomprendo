const phoneticslist = {
  giveList: function(type){
    if(type=='all' || !type){
      let keys = Object.keys(phoneticslist)
      let all = []
      for(let x=0;x<keys.length;x++){
        // if(keys[x]=='giveList')continue
        if(!Array.isArray(phoneticslist[keys[x]]))continue
        all = all.concat(phoneticslist[keys[x]])
      }
      return all
    }
    if(!Array.isArray(phoneticslist[type]))return []
    return phoneticslist[type]
  },
  givePairList: function(type, resulttype){
    let list = this.giveList(type)
    let res = {}
    for(let x=0;x<list.length;x++){
        if(!res[list[x].key])res[list[x].key]=[list[x]]
        else res[list[x].key].push(list[x])
    }
    let keys = Object.keys(res)
    if(resulttype=='list' || !resulttype){
      let listres = []
      for(x=0;x<keys.length;x++){
        listres.push(res[keys[x]])
      }
      return listres
    }
    res.keys = keys
    return res
  },
  animals: [
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
  ],
  fruits: [
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
  ],
  instruments: [
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
  ],

}
