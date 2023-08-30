let finishedgames = [
{title:'anlaute', url:'anlaute'},
{title:'anlaute memory', url:'anlautememory'},
{title:'anlaute keyboard', url:'anlautekeyboard'},
{title:'anlaute paare suchen', url:'anlauteverbinden'},
{title:'fischerboot', url:'fisherboat'},
{title:'mengen zuordnen', url:'mengen-zuordnen'},
{title:'spacetux', url:'spacetuxwords'},
{title:'skatertux', url:'skatertux'},
]

for (var i = 0; i < finishedgames.length; i++) {
  let fg = finishedgames[i]
  let link = document.createElement('a')
  link.href='spielegui.html?'+fg.url
  link.innerText=fg.title
  allgames.appendChild(link)
}
