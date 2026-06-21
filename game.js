document.addEventListener('DOMContentLoaded', () => {

  // Etat du jeu
  let board = ['', '', '', '', '', '', '', '', '']
  let currentPlayer = 'X'
  let gameActive = true
  let modeIA = false
  let joueurHumain = 'X'
  let sessionScore = { v: 0, d: 0, nul: 0 } // Score session reset au F5
  let simulationEtape = 0

  // Selecteurs Dom
  const accueil = document.getElementById('accueil')
  const toggleMode = document.getElementById('toggleMode')
  const choixPion = document.getElementById('choixPion')
  const jeu = document.getElementById('jeu')
  const boardEl = document.getElementById('board')
  const info = document.getElementById('info')
  const btnRetournChoix = document.getElementById('btnRetournChoix')
  const btnResetScore = document.getElementById('btnResetScore')
  const simulationBoard = document.getElementById('simulationBoard')
  const btnRetourSimulation = document.getElementById('btnRetourSimulation')
  const choixX = document.getElementById('choixX')
  const choixO = document.getElementById('choixO')
  const sessionX = document.getElementById('sessionX')
  const sessionO = document.getElementById('sessionO')
  const sessionNul = document.getElementById('sessionNul')
  const aideSection = document.getElementById('aideSection')
  const btnRetourAide = document.getElementById('btnRetourAide')
  const btnSimulation = document.getElementById('btnSimulation')
  const simulationSection = document.getElementById('simulationSection')
  const simulationText = document.getElementById('simulationText')
  const scoreSection = document.getElementById('scoreSection')
  const btnRetourScore = document.getElementById('btnRetourScore')
  const btnRetour = document.getElementById('btnRetour')
  const btnRejouer = document.getElementById('btnRejouer')
  const btnSettings = document.getElementById('btnSettings')
  const settingsSection = document.getElementById('settingsSection')
  const btnRetourSettings = document.getElementById('btnRetourSettings')
  const radiosTheme = document.querySelectorAll('input[name = "theme"]')
  const radiosMode = document.querySelectorAll('input[name = "mode"]')
  // Bouton menu
  const btnPVP = document.getElementById('btnPVP')
  const btnPVE = document.getElementById('btnPVE')
  const btnScore = document.getElementById('btnScore')
  const btnAide = document.getElementById('btnAide')
  
  // Score Perso LocalStorage - reste après F5
  let score = JSON.parse(localStorage.getItem('morpionScorePerso')) || {
    v: 0,
    d: 0,
    nul: 0
  }

  // Charger les paramètres de thèmes au demarrage
  let themeActuel = localStorage.getItem('morpionTheme') || 'theme-classic'
  let modeActuel = localStorage.getItem('morpionMode') || 'light'

  if (modeActuel==='system') {
    toggleMode.checked = window.matchMedia('(prefers-color-sheme: dark)').matches
  } else {
    toggleMode.checked = modeActuel === 'dark'
  }

  appliquerTheme(themeActuel, modeActuel)

  const radioTheme = document.querySelector(`input[name = "theme"][value = "${themeActuel}"]`
  )
  if (radioTheme) {
    radioTheme.checked = true
  }

  const radioMode = document.querySelector(`input[name = "mode"][value = "${modeActuel}"]`
  )
  if (radioMode) {
    radioMode.checked = true
  }


  const scoreV = document.getElementById('scoreV')
  const scoreD = document.getElementById('scoreD')
  const scoreNul = document.getElementById('scoreNul')

  if (scoreV) scoreV.textContent = score.v
  if (scoreD) scoreD.textContent = score.d
  if (scoreNul) scoreNul.textContent = score.nul

  // Reset score session à chaque chargement
  sessionX.textContent = 0
  sessionO.textContent = 0
  sessionNul.textContent = 0

  // Joueur vs Joueur et Joueur vs IA
  btnPVP.addEventListener('click', () => {
    resetScoreSession()
    modeIA = false
    accueil.style.display = 'none'
    jeu.style.display = 'block'
    resetGame()
  })

  // Toggle mode
  toggleMode.addEventListener('click', () => {
    modeActuel = toggleMode.checked ? 'dark' : 'light'

    localStorage.setItem(
      'morpionMode',
      modeActuel
    )

    appliquerTheme(
      themeActuel,
      modeActuel
    )
  })

  btnPVE.addEventListener('click', () => {
    resetScoreSession()
    modeIA = true
    accueil.style.display = 'none'
    choixPion.style.display = 'block'
  })

  btnRetournChoix.addEventListener('click', () => {
    accueil.style.display = 'block'
    choixPion.style.display = 'none'
  })

  // Bouton SCORE
  if (btnScore) {
    btnScore.addEventListener('click', () => {

      score = JSON.parse(localStorage.getItem('morpionScorePerso')) || {
        v: 0,
        d: 0,
        nul: 0
      }

      if (scoreV) scoreV.textContent = score.v
      if (scoreD) scoreD.textContent = score.d
      if (scoreNul) scoreNul.textContent = score.nul

      accueil.style.display = 'none'
      scoreSection.style.display = 'block'
    })
  }

  if (btnRetourScore) {
    btnRetourScore.addEventListener('click', () => {
      scoreSection.style.display = 'none'
      accueil.style.display = 'block'
    })
  }

  if (btnResetScore) {
    btnResetScore.addEventListener('click', () => {
        score = {
            v:0,
            d:0,
            nul:0
        }
        localStorage.setItem(
            'morpionScorePerso',
            JSON.stringify(score)
        )

        scoreV.textContent = 0
        scoreD.textContent = 0
        scoreNul.textContent = 0
    })
  }

  // choix pion X ou O
  choixX.addEventListener('click', () => lancerJeu('X'))
  choixO.addEventListener('click', () => lancerJeu('O'))

  // Bouton Menu retour
  btnRetour.addEventListener('click', () => {
    resetScoreSession()
    resetGame()
    jeu.style.display = 'none'
    accueil.style.display = 'block'
  })

  function lancerJeu(pionChoisi) {
    joueurHumain = pionChoisi
    choixPion.style.display = 'none'
    jeu.style.display = 'block'
    resetGame() // reset grille mais garde sessionScore
  }

  // Bouton Rejouer Jeu
  btnRejouer.addEventListener('click', () => {
    resetGame()
  })

  // Création de la grille de jeu
  function startGame() {

    boardEl.innerHTML = '' // vider la grille

    board = ['', '', '', '', '', '', '', '', ''] // 9 cases

    currentPlayer = 'X'
    gameActive = true

    info.textContent = `Tour : ${currentPlayer}`

    for (let i = 0; i < 9; i++) {

      const cell = document.createElement('div')

      cell.classList.add('cell')
      cell.dataset.index = i // on stocke la position de 0 à 8

      cell.addEventListener('click', handleCellClick)

      boardEl.appendChild(cell)
    }

    // Si mode IA choisi et joueur prend O alors IA commence
    if (modeIA && joueurHumain === 'O') {

      info.textContent = 'Tour : IA'

      setTimeout(iaJoue, 400)
    }
  }

  // Quand on clique une case
  function handleCellClick(e) {

    const index = e.target.dataset.index

    // si une case est deja prise ou jeu fini on fait rien
    if (board[index] !== '' || !gameActive) return

    // l'humain peut pas jouer pendant le tour de l'IA
    if (modeIA && currentPlayer !== joueurHumain) return

    // On place X ou O
    board[index] = currentPlayer
    e.target.textContent = currentPlayer

    // On vérifie victoire
    const combinaisonGagnante = checkWin() 
    if (combinaisonGagnante) {

      const gagnant = currentPlayer

      info.textContent = `Victoire de ${currentPlayer}`

      updateScore(gagnant)

      combinaisonGagnante.forEach(index => {
        boardEl.children[index].classList.add('winner')
      })

      gameActive = false
      return
    }

    // Si match nul
    if (!board.includes('')) {

      info.textContent = 'Match nul'

      updateScore('nul')

      gameActive = false
      return
    }

    // Changement de joueur
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X'

    info.textContent = `Tour : ${currentPlayer}`

    if (modeIA && currentPlayer !== joueurHumain && gameActive) {

      setTimeout(iaJoue, 400)
    }
  }

  // Ia joue Mode
  function iaJoue() {

    const IA = currentPlayer
    const HUMAIN = joueurHumain

    // Essayer de gagner
    let coup = trouverCoupGagnant(IA)
    if (coup !== -1) return jouerCoup(coup)

    // Bloquer l'humain
    coup = trouverCoupGagnant(HUMAIN)
    if (coup !== -1) return jouerCoup(coup)

    // Centre
    if (board[4] === '') return jouerCoup(4)

    // Coin
    const coins = [0, 2, 6, 8].filter(i => board[i] === '')
    if (coins.length > 0) {
      return jouerCoup(
        coins[Math.floor(Math.random() * coins.length)])
    }

    const casesVides = board
      .map ((v, i) => v === '' ? i : null)
      .filter(v => v !== null)

    if (casesVides.length > 0) {
      return jouerCoup(casesVides[Math.floor(Math.random() * casesVides.length)])
    }
  }
  function trouverCoupGagnant (joueur) {
    const combinaisons = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]

    for (let combo of combinaisons) {
      const valeurs = combo.map(i => board[i])

      const countJoueur = valeurs.filter(v => v === joueur).length

      const countVide = valeurs.filter(v => v === '').length

      if (countJoueur === 2 && countVide === 1) {
        return combo.find(i => board[i] === '')
      }
    }
    return -1
  }

  // JouerCoup
  function jouerCoup(index) {
    board[index] = currentPlayer
    boardEl.children[index].textContent = currentPlayer

    const combinaisonGagnante = checkWin() 
    if (combinaisonGagnante) {

      info.textContent = `Victoire de ${currentPlayer}`

      updateScore(currentPlayer)

      combinaisonGagnante.forEach(index => {
        boardEl.children[index].classList.add('winner')
      })

      gameActive = false
      return
    }

    if (!board.includes('')) {

      info.textContent = 'Match nul'

      updateScore('nul')

      gameActive = false
      return
    }

    currentPlayer = joueurHumain

    info.textContent = `Tour : ${currentPlayer}`


  }
  // Vérifier si victoire
  function checkWin() {

    const combos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]

    for (let combo of combos) {
      if (combo.every(i => board[i] === currentPlayer)) {
        return combo
      }
    }
    return null
  }

  // Bouton Aide
  btnAide.addEventListener('click', () => {
    aideSection.style.display = 'block'
    accueil.style.display = 'none'
  })

  btnRetourAide.addEventListener('click', () => {
    aideSection.style.display = 'none'
    accueil.style.display = 'block'
  })

  // Creation de la grille de simulation
  function creerSimulationBoard() {
    simulationBoard.innerHTML = ''

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div')
      cell.classList.add('cell')
      simulationBoard.appendChild(cell)
    }
  }

  // Bouton Simulation
  btnSimulation.addEventListener('click', () => {
    aideSection.style.display = 'none'
    simulationSection.style.display = 'block'

    lancerSimulation()
  })
  // Lancer simulation
  function lancerSimulation() {
    creerSimulationBoard()
    btnRetourSimulation.style.display = 'none'

    simulationText.textContent = 'Le joueur X commence toujours'

    const coups = [
      {index: '0', symbole: 'X', texte: 'X joue dans un coin.'},
      {index: '4', symbole: 'O', texte: 'O répond au centre.'},
      {index: '1', symbole: 'X', texte: 'X prépare une ligne.'},
      {index: '5', symbole: 'O', texte: 'O tente de le bloquer.'},
      {index: '2', symbole: 'X', texte: 'X complète sa ligne.'}
    ]

    let etape = 0

    const interval = setInterval(()  => {
      const coup = coups[etape]

      simulationBoard.children[coup.index].textContent = coup.symbole
      simulationText.textContent = coup.texte
      etape++

      if (etape >= coups.length) {
        clearInterval(interval)
        setTimeout(() => {
          simulationBoard.children[0].classList.add('winner')
          simulationBoard.children[1].classList.add('winner')
          simulationBoard.children[2].classList.add('winner')
          simulationText.textContent = 'Simulation terminé : X gagne en alignant 3 symboles.'

          btnRetourSimulation.style.display = 'inline-block'
        }, 800)
      }

    }, 800)
  }

  btnRetourSimulation.addEventListener('click', () => {
    simulationSection.style.display = 'none'
    accueil.style.display = 'block'
  })

  // Bouton Paramètre
  btnSettings.addEventListener('click', () => {
    accueil.style.display = 'none'
    settingsSection.style.display = 'block'
  })

  btnRetourSettings.addEventListener('click', () => {
    settingsSection.style.display = 'none'
    accueil.style.display = 'block'
  })

  // Afficher les thèmes
  function appliquerTheme(theme, mode) {
    document.body.className = ''
    document.body.classList.add(theme)
    document.body.classList.add(mode)
  }
  // Gestions des thèmes
  radiosTheme.forEach(radio => {
    radio.addEventListener('change', () => {
      themeActuel = radio.value

      localStorage.setItem(
        'morpionTheme',
        themeActuel
      )

      appliquerTheme (
        themeActuel,
        modeActuel
      )
    })
  })

  // Gestions des modes
  radiosMode.forEach(radio => {
    radio.addEventListener('change', () => {
      modeActuel = radio.value

      localStorage.setItem(
        'morpionMode',
        modeActuel
      )

      if (modeActuel === 'system') {
        const prefereSombre = window.matchMedia('(prefers-color-scheme : dark)').matches

        appliquerTheme(
          themeActuel,
          prefereSombre ? 'dark' : 'light'
        )
      } else {
          appliquerTheme (
          themeActuel,
          modeActuel
      )
      }
    })
  })

  // Reset la partie - reset grille seulement, sessionScore garde ses valeurs
  function resetGame() {
    startGame()
  }
  // Reset score session
  function resetScoreSession() {
    sessionScore = {
        v: 0,
        d: 0,
        nul: 0
    }

    sessionX.textContent = 0
    sessionO.textContent = 0
    sessionNul.textContent = 0
  }
  // Mettre à jour les scores
  function updateScore(gagnant) {

    // Update score session - disparait au F5
    if (gagnant === 'nul') sessionScore.nul++
    else if (gagnant === joueurHumain) sessionScore.v++
    else sessionScore.d++

    sessionX.textContent = sessionScore.v
    sessionO.textContent = sessionScore.d
    sessionNul.textContent = sessionScore.nul

    // Update score total localStorage - reste à vie
    if (gagnant === 'nul') score.nul++
    else if (gagnant === joueurHumain) score.v++
    else score.d++

    localStorage.setItem(
      'morpionScorePerso',
      JSON.stringify(score)
    )

    if (scoreV) scoreV.textContent = score.v
    if (scoreD) scoreD.textContent = score.d
    if (scoreNul) scoreNul.textContent = score.nul
  }

})