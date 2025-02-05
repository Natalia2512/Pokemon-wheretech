const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})

let draggle
let emby
let renderedSprites
let battleAnimationId
let queue

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()

  draggle = new Monster(monsters.Draggle)
  emby = new Monster(monsters.Emby)
  renderedSprites = [draggle, emby]
  queue = []

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#attacksBox').append(button)
  })
  
  const catchButton = document.createElement('button')
  catchButton.innerHTML = 'Catch'
  document.querySelector('#attacksBox').append(catchButton)

  // Event listener per il bottone "Catch"
  catchButton.addEventListener('click', () => {
    attemptCatch()
  })
   const attackTypeElement = document.querySelector('#attackType')
  if (attackTypeElement) attackTypeElement.style.display = 'none'
  // our event listeners for our buttons (attack)
  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites
      })

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint()
        })
        queue.push(() => {
          // fade back to black
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId)
              animate()
              document.querySelector('#userInterface').style.display = 'none'

              gsap.to('#overlappingDiv', {
                opacity: 0
              })

              battle.initiated = false
              audio.Map.play()
            }
          })
        })
      }

      // draggle or enemy attacks right here
      const randomAttack =
        draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites
        })

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint()
          })

          queue.push(() => {
            // fade back to black
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId)
                animate()
                document.querySelector('#userInterface').style.display = 'none'

                gsap.to('#overlappingDiv', {
                  opacity: 0
                })

                battle.initiated = false
                audio.Map.play()
              }
            })
          })
        }
      })
    })

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector('#attackType').innerHTML = selectedAttack.type
      document.querySelector('#attackType').style.color = selectedAttack.color
    })
  })
}

let caughtPokemons = []; // Array per salvare i Pokémon catturati

function attemptCatch() {
  const catchChance = Math.random(); // Probabilità casuale di cattura
  const successThreshold = 0.5; // Soglia per la cattura (50%)

  if (catchChance <= successThreshold) {
    console.log('Pokémon catturato!');
    alert('Congratulazioni! Hai catturato il Pokémon!');

    // Aggiungi il Pokémon catturato all'array
    caughtPokemons.push(draggle.name); // Aggiungi il nome del Pokémon catturato
    console.log(caughtPokemons); // Verifica se il Pokémon è stato aggiunto correttamente

    // Chiudi la finestra della battaglia
    gsap.to('#overlappingDiv', {
      opacity: 1,
      onComplete: () => {
        cancelAnimationFrame(battleAnimationId);
        animate();
        document.querySelector('#userInterface').style.display = 'none';

        gsap.to('#overlappingDiv', {
          opacity: 0
        });

        battle.initiated = false;
        audio.Map.play(); // Riprendi la musica della mappa
      }
    });
  } else {
    console.log('La cattura è fallita.');
    alert('Oh no, la cattura è fallita! Riprova!');
  }
}

document.querySelector('#pokedexButton').addEventListener('click', () => {
  console.log('Pulsante Pokedex cliccato'); // Log per il debug

  const pokedexDiv = document.querySelector('#pokedex');
  const pokedexList = document.querySelector('#pokedexList');

  // Verifica se gli elementi sono stati selezionati correttamente
  if (!pokedexDiv || !pokedexList) {
    console.error('Elementi Pokedex non trovati nel DOM.');
    return;
  }

  // Mostra il Pokedex
  pokedexDiv.style.display = 'block';

  // Pulisci la lista dei Pokémon catturati
  pokedexList.innerHTML = '';

  // Mostra solo i primi 6 Pokémon
  const displayPokemons = caughtPokemons.slice(0, 6);

  const battlePokemonElement = document.createElement('div');
  battlePokemonElement.textContent = `${emby.name}`;
  pokedexList.appendChild(battlePokemonElement);

  // Aggiungi ogni Pokémon catturato alla lista
  displayPokemons.forEach(pokemonName => {
    const pokemonElement = document.createElement('div');
    pokemonElement.textContent = pokemonName; // Mostra solo il nome del Pokémon
    pokedexList.appendChild(pokemonElement);
  });
});



document.querySelector('#pokedex').addEventListener('click', (e) => {
  if (e.target === document.querySelector('#pokedex')) {
    e.currentTarget.style.display = 'none'; // Nascondi il Pokedex se si clicca fuori
    
  }
});
document.querySelector('#overlappingDiv').addEventListener('click', () => {
  document.querySelector('#pokedex').style.display = 'none'; // Nascondi il Pokedex
});



function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  console.log(battleAnimationId)

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

animate()
// initBattle()
// animateBattle()

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = 'none'
})
